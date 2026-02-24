// DOM elements
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var confirmPasswordInput = document.getElementById('confirm-password');
var signUpBtn = document.getElementById('sign-up-btn');

// Load existing users from localStorage
var signedUpUsers = JSON.parse(localStorage.getItem("signedUpUsers")) || [];

// Functions
function validateForm(){
    // Check if username is not empty
    var username = usernameInput.value.trim();
    if(username === ''){
        alert('Username cannot be empty');
        return false;
    }

    // Check if username is at least 3 characters long
    if(username.length < 3){
        alert('Username must be at least 3 characters long');
        usernameInput.value = '';
        return false;
    }

    // Check if username doesnt already exist
    var userExists = signedUpUsers.some(user => user.username === username);
    console.log("User exists: " + userExists);
    if(userExists){
        alert("Username already exists");
        usernameInput.value = '';
        return false;
    }

    var password = passwordInput.value.trim();
    var confirmPassword = confirmPasswordInput.value.trim();
    // Check if password meets requirements
    if(password === ''){
        alert('Password cannot be empty');
        passwordInput.value = '';
        return false;
    }

    if(password.length < 12){
        alert('Password must be at least 12 characters long');
        passwordInput.value = '';
        return false;
    }

    // Check if password and confirm password match
    if(password !== confirmPassword){
        alert('Passwords do not match');
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        return false;
    }

    saveUser(username, password);
}

function saveUser(username, password){
    console.log("Saving user...");
    // Very barebones (localStorage + zero hashing)
    signedUpUsers.push({
        username: username,
        password: password
    });

    localStorage.setItem("signedUpUsers", JSON.stringify(signedUpUsers));
    console.log("User saved: " + username);

    alert("User registered successfully!");
    // Navigate user to login page after successful sign up
    window.location.href = "login.html";
}

// Event Listeners
if(signUpBtn){
    signUpBtn.addEventListener('click', (event) => {
        event.preventDefault();
        validateForm();
    })
}