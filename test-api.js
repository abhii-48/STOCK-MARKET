const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const apiKey = process.env.STOCK_API_KEY;

async function testIndices() {
    const symbols = ['AAPL', 'GOOGL', 'TSLA', 'IBM']; // Major stocks instead of indices to be safe
    const indices = ['NQ=F', 'ES=F', 'YM=F']; // E-mini futures often work on free tiers or similar
    // Actually, let's just use what's likely to work
    const testSymbols = ['USD/INR', 'BTC/USD', 'AAPL']; 
    
    for (const symbol of [...testSymbols, '^NSEI', '^BSESN']) {
        try {
            const response = await axios.get(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`);
            console.log(`${symbol}:`, response.data.status === 'error' ? 'ERROR: ' + response.data.message : 'OK - Price: ' + response.data.close);
        } catch (error) {
            console.log(`${symbol}: FAILED`, error.message);
        }
    }
}

testIndices();
