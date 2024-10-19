const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual API key
const stockInput = document.getElementById('stock-symbol');
const searchButton = document.getElementById('search-stock');
const stockTableBody = document.getElementById('stock-table-body');
const stockChartCtx = document.getElementById('stock-chart').getContext('2d');

let stockChart;

const fetchStockData = async (symbol) => {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`);
        const data = await response.json();

        // Check if the response contains an error
        if (data['Error Message']) {
            throw new Error('Invalid stock symbol.');
        }
        if (!data['Time Series (Daily)']) {
            throw new Error('API limit exceeded or no data available.');
        }

        return data;
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        alert(error.message);
    }
};

const updateStockTable = (symbol, price, volume, change) => {
    stockTableBody.innerHTML = `
        <tr>
            <td>${symbol}</td>
            <td>${price}</td>
            <td>${volume}</td>
            <td>${change}</td>
        </tr>
    `;
};

const updateStockGraph = (historicalData) => {
    const labels = Object.keys(historicalData).reverse();
    const prices = labels.map(label => historicalData[label]['4. close']);

    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(stockChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Price',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        }
    });
};

searchButton.addEventListener('click', async () => {
    const symbol = stockInput.value.toUpperCase();
    const data = await fetchStockData(symbol);

    if (!data) return; // Exit if there was an error

    const timeSeries = data['Time Series (Daily)'];
    const latestData = timeSeries[Object.keys(timeSeries)[0]];

    const price = latestData['4. close'];
    const volume = latestData['5. volume'];
    const previousPrice = timeSeries[Object.keys(timeSeries)[1]]['4. close'];
    const change = (price - previousPrice).toFixed(2);

    updateStockTable(symbol, price, volume, change);
    updateStockGraph(timeSeries);
});
