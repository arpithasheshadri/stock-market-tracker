const API_BASE_URL = 'http://127.0.0.1:5000'; // Flask backend URL

function toggleForms() {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    signupForm.classList.toggle('hidden');
    loginForm.classList.toggle('hidden');
}


// Signup function
async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if (!username || !password) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            toggleForms(); // Switch to login form after signup
        } else {
            alert(data.error || 'Signup failed.');
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('Something went wrong.');
    }
}

// Login function
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Please fill in all fields.');
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            window.location.href = '/dashboard'; // Redirect to dashboard
        } else {
            alert(data.error);
        }
    })
    .catch(err => alert(err));
}
