// DOM elements
var signUpContainer = document.getElementById('sign-up-container')
var usernameInput = document.getElementById('username');
var passwordInput = document.getElementById('password');
var confirmPasswordInput = document.getElementById('confirm-password');
var signUpBtn = document.getElementById('sign-up-btn');
var recoveryKeyModal = document.getElementById('recovery-key-modal');
var recoveryKeyDisplay = document.getElementById('recovery-key');
var continueBtn = document.getElementById('continue-btn');
var dynamicModal = document.getElementById('dynamic-modal');
var dynamicModalTitle = document.getElementById('dynamic-modal-title');
var dynamicModalMessage = document.getElementById('dynamic-modal-message');
var dynamicModalBtn = document.getElementById('dm-nav-btn');

let modalState = null;
let pendingRecoveryUsername = null;
let showRecoveryAfterDynamic = false;

// Functions
async function validateForm() {
    // Check if username is not empty
    var username = usernameInput.value.trim();
    if (username === '') {
        modalState = 'u1';
        // alert('Username cannot be empty');
        await determineModalContent(modalState);
        await clearModalInputs();
        return false;
    }

    // Check if username is between 3 and 32 characters long
    if (username.length <= 3 && username.length >= 32) {
        // alert('Username must be at least 3 characters long');
        modalState = 'u2';
        await determineModalContent(modalState)
        await clearModalInputs();
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
            // alert("Error occurred when checking username: " + data.message);
            console.log("Error occurred during username check:", data.message);
            modalState = 'u3';
            await determineModalContent(modalState);
            await clearModalInputs();
            return false;
        }

        if (data.exists) {
            // alert("Username already exists");
            modalState = 'u4';
            await determineModalContent(modalState);
            await clearModalInputs();
            return false;
        }
    }
    catch (error) {
        // alert("A backend error occurred when checking username: " + error.message);
        console.log("Backend error during username check:", error);
        modalState = 'u3';
        await determineModalContent(modalState);
        await clearModalInputs();
        return false;
    }

    var password = passwordInput.value.trim();
    var confirmPassword = confirmPasswordInput.value.trim();
    // Check if password meets requirements
    if (password === '') {
        // alert('Password cannot be empty');
        modalState = 'p1';
        await determineModalContent(modalState);
        await clearModalInputs();
        return false;
    }

    if (password.length <= 12 && password.length >= 64) {
        // alert('Password must be at least 12 characters long');
        modalState = 'p2';
        await determineModalContent(modalState);
        await clearModalInputs();
        return false;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        // alert('Passwords do not match');
        modalState = 'p3';
        await determineModalContent(modalState);
        await clearModalInputs();
        return false;
    }

    await saveUser(username, password);
}

async function saveUser(username, password) {
    // console.log("Username passed to saveUser function:", username);
    // console.log("Password passed to saveUser function:", password);
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
            // 1) Show success modal first
            pendingRecoveryUsername = username;
            showRecoveryAfterDynamic = true;

            modalState = 'success';
            await determineModalContent(modalState);
            return;
        } else {
            console.log("Error occurred during signup:", data.error);
            // On error, just show the error modal (no recovery modal)
            showRecoveryAfterDynamic = false;
            pendingRecoveryUsername = null;

            modalState = 'su';
            await determineModalContent(modalState);
            return;
        }
    }
    catch (error) {
        console.log("Backend error during signup:", error);
        showRecoveryAfterDynamic = false;
        pendingRecoveryUsername = null;

        modalState = 'su';
        await determineModalContent(modalState);
        return;
    }
}

async function displayRecoveryKeyModal(username) {
    // console.log("Attempting to fetch recovery key for username:", username);
    // Fetch the recovery key from the backend and display it in the modal
    try {
        const response = await fetch('http://localhost:3000/users/recoverykey', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username })
        });

        const data = await response.json();
        if (response.ok && data.success) {
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
    catch (error) {
        alert("A backend error occurred when fetching recovery key: " + error.message);
        console.log("Backend error when fetching recovery key:", error);
    }
}

async function determineModalContent(description) {
    signUpContainer.style.display = "none";
    dynamicModal.style.display = "flex";
    dynamicModalBtn.onclick = null;

    switch (description) {
        case 'u1':
            dynamicModalTitle.textContent = "Invalid Username!";
            dynamicModalMessage.textContent = "Username cannot be empty. Please enter a valid username!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'u2':
            dynamicModalTitle.textContent = "Invalid Username!";
            dynamicModalMessage.textContent = "Username must be between 3 characters and 32 characters long. Please enter a valid username!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'u3':
            dynamicModalTitle.textContent = "Username Check Error!";
            dynamicModalMessage.textContent = "An error occurred when checking the username. Please try again!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'u4':
            dynamicModalTitle.textContent = "Username Already Exists!";
            dynamicModalMessage.textContent = "The username you entered already exists. Please choose a different username!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'p1':
            dynamicModalTitle.textContent = "Invalid Password!";
            dynamicModalMessage.textContent = "Password cannot be empty. Please enter a valid password!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'p2':
            dynamicModalTitle.textContent = "Invalid Password!";
            dynamicModalMessage.textContent = "Password must be between 12 characters and 64 characters long. Please enter a valid password!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'p3':
            dynamicModalTitle.textContent = "Password Mismatch!";
            dynamicModalMessage.textContent = "Password and confirm password do not match. Please ensure both fields match!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'su':
            dynamicModalTitle.textContent = "Signup Error!";
            dynamicModalMessage.textContent = "An error occurred during signup. Please try again!";
            dynamicModalBtn.textContent = "Try Again!";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                signUpContainer.style.display = "flex";
            };
            break;

        case 'success':
            dynamicModalTitle.textContent = "Signup Successful!";
            dynamicModalMessage.textContent = "Your account has been created successfully!";
            dynamicModalBtn.textContent = "Continue!";
            dynamicModalBtn.onclick = async () => {
                dynamicModal.style.display = "none";

                // 2) Then show recovery key modal
                if (showRecoveryAfterDynamic && pendingRecoveryUsername) {
                    await displayRecoveryKeyModal(pendingRecoveryUsername);
                }
            };
            break;
    }
}

async function clearModalInputs(){
    usernameInput.value = '';
    // passwordInput.value = '';
    confirmPasswordInput.value = '';
}

// Event Listeners
if (signUpBtn) {
    signUpBtn.addEventListener('click', (event) => {
        event.preventDefault();
        validateForm();
    })
}

if (continueBtn) {
    continueBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    })
}