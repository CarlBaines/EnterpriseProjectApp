// DOM elements
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var loginBtn = document.getElementById('login-btn');

function validateLogin(){
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Check if username and password are not empty
    if(username === '' || password === ''){
        alert('Username and password cannot be empty');
        return false;
    }

    // Check if username and password match an existing user
    // var userFound = existingUsers.some(user => user.username === username && user.password === password);
    // if(userFound){
    //     alert('Login successful!');
    //     // Navigate user to the home page after successful login
    //     window.location.href = "homepage.html";
    // }
    // else{
    //     alert('Invalid username or password');
    //     usernameInput.value = '';
    //     passwordInput.value = '';
    // }

    // Use fetch API to send login request to the backend
    fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then((response) => response.json())
    .then((account) => {
        // Handle the response from the backend (account details match)
        if(account.exists){
            alert("Login successful!");
            // Navigate user to the home page after successful login
            window.location.href = "homepage.html";
        }
        else{
            alert("Invalid username or password!");
            console.log("Login failed:", account.message);
            usernameInput.value = '';
            passwordInput.value = '';
        }
    })
    .catch((err) => {
        alert("An error occurred during login. Please try again later.");
        console.error("Login error:", err);
    });
}

if(loginBtn){
    loginBtn.addEventListener('click', (event) => {
        event.preventDefault();
        validateLogin();
    })
}