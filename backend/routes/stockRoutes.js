const express = require('express');
const router = express.Router();
const { getStockQuote, getStockCandles, getMarketIndices, getCommodities, getMarketNews } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');
const axios = require('axios');

router.get('/quote/:symbol', protect, getStockQuote);
router.get('/candles/:symbol', protect, getStockCandles);
router.get('/indices', protect, getMarketIndices);
router.get('/commodities', protect, getCommodities);
router.get('/news', protect, getMarketNews);


// Diagnostic route
router.get('/health', async (req, res) => {
    const apiKey = process.env.STOCK_API_KEY;
    try {
        const response = await axios.get(`https://api.twelvedata.com/quote?symbol=AAPL&apikey=${apiKey}`);
        res.json({
            status: 'ok',
            apiConnected: !!response.data.symbol,
            keyLoaded: !!apiKey,
            keyLength: apiKey ? apiKey.length : 0,
            hasError: !!response.data.status && response.data.status === 'error'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            statusCode: error.response?.status,
            keyLoaded: !!apiKey
        });
    }
});

module.exports = router;
