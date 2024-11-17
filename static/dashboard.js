const API_BASE_URL = 'http://127.0.0.1:5000';
console.log('Script loaded successfully!');

document.addEventListener('DOMContentLoaded', ()=>{
    const token = localStorage.getItem('access_token'); 
    console.log("Token from localStorage:", token); // Save token during login
    if (!token) {
        alert('Please login first!');
        window.location.href = '/'; // Redirect to login page
    }
    console.log("Fetching dashboard data...");
    fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            alert(data.error);
            window.location.href = '/'; // Redirect to login page if token is invalid
        } else {
            document.getElementById('welcome-message').innerText = data.message;
            updatePortfolio(data.portfolio);
            updateMetrics(data.metrics);
        }
    })
    .catch(err => {
        console.error('Error in fetching dashboard:', err); // Log errors if any
    });
})



function updatePortfolio(portfolio) {
    const container = document.getElementById('portfolio-container');
    portfolio.forEach(stock => {
        const stockDiv = document.createElement('div');
        stockDiv.innerHTML = `
            <h3>${stock.symbol}</h3>
            <p>Quantity: ${stock.quantity}</p>
            <p>Purchase Price: ${stock.purchase_price}</p>
        `;
        container.appendChild(stockDiv);
    });
}

function updateMetrics(metrics) {
    const container = document.getElementById('metrics-container');
    container.innerHTML = `
        <p>Total Stocks: ${metrics.total_stocks}</p>
        <p>Most Tracked Stock: ${metrics.most_tracked_stock}</p>
    `;
}
