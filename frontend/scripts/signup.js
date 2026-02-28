// DOM elements
var signUpContainer = document.getElementById('sign-up-container')
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var confirmPasswordInput = document.getElementById('confirm-password');
var signUpBtn = document.getElementById('sign-up-btn');
var recoveryKeyModal = document.getElementById('recovery-key-modal');
var recoveryKeyDisplay = document.getElementById('recovery-key');
var continueBtn = document.getElementById('continue-btn');

// Functions
async function validateForm() {
    // Check if username is not empty
    var username = usernameInput.value.trim();
    if (username === '') {
        alert('Username cannot be empty');
        return false;
    }

    // Check if username is at least 3 characters long
    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        usernameInput.value = '';
        return false;
    }

    try {
        const response = await fetch('http://localhost:3000/users/usernamecheck', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (!response.ok) {
            alert("Error occurred when checking username: " + data.message);
            console.log("Error occurred during username check:", data.error);
            return false;
        }

        if (data.exists) {
            alert("Username already exists");
            usernameInput.value = '';
            return false;
        }
    }
    catch (error) {
        alert("A backend error occurred when checking username: " + error.message);
        console.log("Backend error during username check:", error);
    }

    var password = passwordInput.value.trim();
    var confirmPassword = confirmPasswordInput.value.trim();
    // Check if password meets requirements
    if (password === '') {
        alert('Password cannot be empty');
        passwordInput.value = '';
        return false;
    }

    if (password.length < 12) {
        alert('Password must be at least 12 characters long');
        passwordInput.value = '';
        return false;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        return false;
    }

    await saveUser(username, password);
}

async function saveUser(username, password) {
    console.log("Username passed to saveUser function:", username);
    console.log("Password passed to saveUser function:", password);
    try {
        const response = await fetch('http://localhost:3000/users/signup', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("User Sign Up Successful!");
            await displayRecoveryKeyModal(username);
            // window.location.href = 'login.html';
            return;
        }

        alert("Error occurred during signup: " + data.message);
        console.log("Error occurred during signup:", data.error);
    }
    catch (error) {
        alert("A backend error occurred during signup: " + error.message);
        console.log("Backend error during signup:", error);
    }
}

async function displayRecoveryKeyModal(username){
    console.log("Attempting to fetch recovery key for username:", username);
    // Fetch the recovery key from the backend and display it in the modal
    try{
        const response = await fetch('http://localhost:3000/users/recoverykey', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();
        if(response.ok && data.success){
            // Add the recovery key to the modal content
            recoveryKeyDisplay.textContent = data.recoveryKey;
            // Hide the sign up container
            signUpContainer.style.display = 'none';
            // Display the recovery key modal
            recoveryKeyModal.style.display = 'flex';
            return;
        }    

        alert("Error occurred when fetching recovery key: " + data.message);
        console.log("Error occurred when fetching recovery key:", data.error);
    }
    catch(error){
        alert("A backend error occurred when fetching recovery key: " + error.message);
        console.log("Backend error when fetching recovery key:", error);
    }
}

// Event Listeners
if (signUpBtn) {
    signUpBtn.addEventListener('click', (event) => {
        event.preventDefault();
        validateForm();
    })
}

if(continueBtn){
    continueBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    })
}