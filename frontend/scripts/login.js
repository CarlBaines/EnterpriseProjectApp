// DOM elements
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var loginBtn = document.getElementById('login-btn');

function validateLogin(){
    // Load existing users from localStorage
    var existingUsers = JSON.parse(localStorage.getItem("signedUpUsers")) || [];
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Check if username and password are not empty
    if(username === '' || password === ''){
        alert('Username and password cannot be empty');
        return false;
    }

    // Check if username and password match an existing user
    var userFound = existingUsers.some(user => user.username === username && user.password === password);
    if(userFound){
        alert('Login successful!');
        // Navigate user to the home page after successful login
        window.location.href = "homepage.html";
    }
    else{
        alert('Invalid username or password');
        usernameInput.value = '';
        passwordInput.value = '';
    }
}

if(loginBtn){
    loginBtn.addEventListener('click', (event) => {
        event.preventDefault();
        validateLogin();
    })
}