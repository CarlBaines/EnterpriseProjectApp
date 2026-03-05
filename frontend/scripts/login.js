// DOM elements
var loginContainer = document.querySelector('.container');
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var loginBtn = document.getElementById('login-btn');
var dynamicModal = document.getElementById('dynamic-modal');
var dynamicModalTitle = document.getElementById('dynamic-modal-title');
var dynamicModalMessage = document.getElementById('dynamic-modal-message');
var dynamicModalBtn = document.getElementById('dm-nav-btn');

function validateLogin(){
    let modalFlag = false;
    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Check if username and password are not empty
    if(username === '' || password === ''){
        alert('Username and password cannot be empty');
        usernameInput.value = '';
        passwordInput.value = '';
        return false;
    }

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
            // alert("Login successful!");
            modalFlag = true;
            determineModalContent(modalFlag);
        }
        else{
            // alert("Invalid username or password!");
            modalFlag = false;
            determineModalContent(modalFlag);
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

function determineModalContent(modalFlag){
    // Set modal content based on the modalFlag value
    if(modalFlag){
        loginContainer.style.display = "none";
        dynamicModal.style.display = "flex";
        dynamicModalTitle.textContent = "Login Successful!";
        dynamicModalMessage.textContent = "Welcome, " + usernameInput.value.trim() + "!";
        dynamicModalBtn.addEventListener('click', () => {
            window.location.href = "homepage.html";
        });
    }
    else{
        loginContainer.style.display = "none";  
        dynamicModal.style.display = "flex";
        dynamicModalTitle.textContent = "Login Failed!";
        dynamicModalMessage.textContent = "Invalid username or password. Please try again!";
        dynamicModalBtn.addEventListener('click', () => {
            dynamicModal.style.display = "none";
            usernameInput.value = '';
            passwordInput.value = '';
            loginContainer.style.display = "flex";
        });
    }
}

if(loginBtn){
    loginBtn.addEventListener('click', (event) => {
        event.preventDefault();
        validateLogin();
    })
}
