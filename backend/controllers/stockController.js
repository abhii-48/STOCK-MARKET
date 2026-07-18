const asyncHandler = require('../middleware/asyncHandler');

// Simple in-memory cache
const cache = {
    quotes: {},
    candles: {},
    indices: null,
    indicesTimestamp: 0
};
const CACHE_TTL = 60 * 1000; // 1 minute

// yahoo-finance2 v3+ requires instantiation with `new YahooFinance()`
let yf;
const getYF = async () => {
    if (!yf) {
        const YahooFinance = (await import('yahoo-finance2')).default;
        yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
    }
    return yf;
};

// Map a plain NSE ticker (e.g. "RELIANCE") to Yahoo Finance format (e.g. "RELIANCE.NS")
// If it already has a suffix (.NS / .BO) or is an index (^) keep it as-is
const toYahooSymbol = (symbol) => {
    if (!symbol) return symbol;
    const s = symbol.toUpperCase();
    if (s.startsWith('^') || s.includes('.')) return s;
    return `${s}.NS`;
};

// Convert Yahoo Finance quote to our standard shape
const normalizeQuote = (q, originalSymbol) => {
    const price = q.regularMarketPrice ?? 0;
    const prevClose = q.regularMarketPreviousClose ?? price;
    const change = q.regularMarketChange ?? (price - prevClose);
    const changePercent = q.regularMarketChangePercent ?? (prevClose ? (change / prevClose) * 100 : 0);

    return {
        symbol: originalSymbol.toUpperCase(),
        name: q.longName || q.shortName || originalSymbol.toUpperCase(),
        price,
        high: q.regularMarketDayHigh ?? price,
        low: q.regularMarketDayLow ?? price,
        open: q.regularMarketOpen ?? price,
        prevClose,
        change,
        changePercent
    };
};

// @desc    Get stock quote
// @route   GET /api/stocks/quote/:symbol
// @access  Private
const getStockQuote = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    const yahooSym = toYahooSymbol(upperSymbol);

    // Check cache
    if (cache.quotes[upperSymbol] && (Date.now() - cache.quotes[upperSymbol].timestamp < CACHE_TTL)) {
        return res.json(cache.quotes[upperSymbol].data);
    }

    try {
        const yahooFinance = await getYF();
        const quote = await yahooFinance.quote(yahooSym);

        if (!quote || !quote.regularMarketPrice) {
            return res.status(404).json({ message: 'Stock not found or data unavailable' });
        }

        const result = normalizeQuote(quote, upperSymbol);

        // Update cache
        cache.quotes[upperSymbol] = { timestamp: Date.now(), data: result };

        res.json(result);
    } catch (error) {
        console.error(`Error fetching quote for ${yahooSym}:`, error.message);
        res.status(500).json({ message: 'Error fetching stock data' });
    }
});

// @desc    Get stock candles for chart
// @route   GET /api/stocks/candles/:symbol
// @access  Private
const getStockCandles = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    const yahooSym = toYahooSymbol(upperSymbol);

    // Check cache
    if (cache.candles[upperSymbol] && (Date.now() - cache.candles[upperSymbol].timestamp < CACHE_TTL)) {
        return res.json(cache.candles[upperSymbol].data);
    }

    try {
        const yahooFinance = await getYF();

        const to = new Date();
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        let candles = [];

        try {
            const historical = await yahooFinance.historical(yahooSym, {
                period1: from.toISOString().split('T')[0],
                period2: to.toISOString().split('T')[0],
                interval: '1d'
            });

            if (historical && historical.length > 0) {
                candles = historical.map(row => ({
                    date: row.date.toISOString().split('T')[0],
                    price: row.close ?? row.adjClose ?? 0
                }));
            }
        } catch (histErr) {
            console.log(`Historical data failed for ${yahooSym}, generating mock data.`);

            // Fallback: generate realistic mock data anchored to live price
            let currentPrice = 100;
            try {
                const quoteData = await yahooFinance.quote(yahooSym);
                currentPrice = quoteData.regularMarketPrice || 100;
            } catch (_) {}

            let mockPrice = currentPrice * 0.9;
            candles = [];
            for (let i = 30; i >= 0; i--) {
                const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                mockPrice = mockPrice + (Math.random() - 0.45) * (currentPrice * 0.05);
                candles.push({ date, price: Math.max(mockPrice, 1) });
            }
            if (candles.length > 0) candles[candles.length - 1].price = currentPrice;
        }

        // Update cache
        cache.candles[upperSymbol] = { timestamp: Date.now(), data: candles };
        res.json(candles);
    } catch (error) {
        console.error(`Error for ${yahooSym} candles:`, error.message);
        res.status(500).json({ message: 'Error generating historical data' });
    }
});

// @desc    Get market indices (NIFTY 50 & SENSEX via Yahoo Finance)
// @route   GET /api/stocks/indices
// @access  Private
const getMarketIndices = asyncHandler(async (req, res) => {
    // Check cache
    if (cache.indices && (Date.now() - cache.indicesTimestamp < CACHE_TTL)) {
        return res.json(cache.indices);
    }

    const indices = [
        { name: 'NIFTY 50', symbol: '^NSEI' },
        { name: 'SENSEX', symbol: '^BSESN' },
        { name: 'BANK NIFTY', symbol: '^NSEBANK' },
        { name: 'NIFTY IT', symbol: '^CNXIT' }
    ];

    try {
        const yahooFinance = await getYF();

        const results = await Promise.all(indices.map(async (index) => {
            try {
                const quote = await yahooFinance.quote(index.symbol);

                if (!quote || !quote.regularMarketPrice) {
                    throw new Error('No data');
                }

                const price = quote.regularMarketPrice;
                const change = quote.regularMarketChange ?? 0;
                const changePercent = quote.regularMarketChangePercent ?? 0;

                return { name: index.name, symbol: index.symbol, price, change, changePercent };
            } catch (err) {
                console.error(`Error fetching index ${index.name}:`, err.message);
                return null;
            }
        }));

        const validResults = results.filter(r => r !== null);

        // Update cache
        cache.indices = validResults;
        cache.indicesTimestamp = Date.now();

        res.json(validResults);
    } catch (error) {
        console.error('Error fetching indices:', error.message);
        res.status(500).json({ message: 'Error fetching market indices' });
    }
});

// @desc    Get market commodities (Gold, Silver, Crude Oil, Natural Gas, Copper via futures)
// @route   GET /api/stocks/commodities
// @access  Private
const getCommodities = asyncHandler(async (req, res) => {
    const list = [
        { name: 'Gold', symbol: 'GC=F' },
        { name: 'Silver', symbol: 'SI=F' },
        { name: 'Crude Oil', symbol: 'CL=F' },
        { name: 'Natural Gas', symbol: 'NG=F' },
        { name: 'Copper', symbol: 'HG=F' }
    ];

    try {
        const yahooFinance = await getYF();
        const results = await Promise.all(list.map(async (item) => {
            try {
                const quote = await yahooFinance.quote(item.symbol);
                if (!quote || !quote.regularMarketPrice) throw new Error('No data');
                return {
                    name: item.name,
                    symbol: item.symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange ?? 0,
                    changePercent: quote.regularMarketChangePercent ?? 0
                };
            } catch (err) {
                console.error(`Error fetching commodity ${item.name}:`, err.message);
                return null;
            }
        }));

        res.json(results.filter(r => r !== null));
    } catch (error) {
        console.error('Error fetching commodities:', error.message);
        res.status(500).json({ message: 'Error fetching commodities' });
    }
});

// @desc    Get market/global news feed from Yahoo Finance search news
// @route   GET /api/stocks/news
// @access  Private
const getMarketNews = asyncHandler(async (req, res) => {
    try {
        const yahooFinance = await getYF();
        // Use a generic query term to search for broad financial news
        const searchResult = await yahooFinance.search('economy');
        
        const articles = (searchResult.news || []).map(article => ({
            uuid: article.uuid,
            title: article.title,
            publisher: article.publisher,
            link: article.link,
            publishedAt: article.providerPublishTime,
            thumbnailUrl: article.thumbnail?.resolutions?.[0]?.url || ''
        }));

        res.json(articles);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ message: 'Error fetching news' });
    }
});

module.exports = { getStockQuote, getStockCandles, getMarketIndices, getCommodities, getMarketNews };
