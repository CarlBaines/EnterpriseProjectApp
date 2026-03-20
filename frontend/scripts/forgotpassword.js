// DOM elements
const forgotPasswordContainer = document.querySelector('.container');
const usernameInput = document.getElementById('username');
const initiateResetBtn = document.getElementById('initiate-reset-btn');
const recoveryKeyLabel = document.getElementById('recovery-key-label');
const recoveryKeyInput = document.getElementById('recovery-key');
const newPasswordLabel = document.getElementById('new-password-label');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordLabel = document.getElementById('confirm-new-password-label');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');

var dynamicModal = document.getElementById('dynamic-modal');
var dynamicModalTitle = document.getElementById('dynamic-modal-title');
var dynamicModalMessage = document.getElementById('dynamic-modal-message');
var dynamicModalBtn = document.getElementById('dm-nav-btn');

let buttonState = 'username';
let modalState = null;

async function promptRecoveryKeyInput() {

    var username = usernameInput.value.trim();
    if (username === '') {
        // alert('Username cannot be empty. Please enter your username to reset your password.');
        modalState = 'u1';
        await determineModalContent(modalState);
        return;
    }

    const response = await fetch('/users/forgotpasswordusernamecheck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username })
    })

    const data = await response.json();

    if (response.ok && data.exists) {
        // Show the recovery key input field and label
        recoveryKeyLabel.style.display = 'block';
        recoveryKeyInput.style.display = 'block';
        usernameInput.disabled = true;

        initiateResetBtn.textContent = 'Submit Recovery Key';
        buttonState = 'recoveryKey';
        return true;
    }
    else {
        // alert("Username does not exist. Please enter a valid username.");
        modalState = 'u2';
        await determineModalContent(modalState);
        return false;
    }
}

async function submitRecoveryKey() {
    var username = usernameInput.value.trim();
    var recoveryKey = recoveryKeyInput.value.trim();

    if (username === '' || recoveryKey === '') {
        // alert('Username and recovery key cannot be empty. Please enter both fields to reset your password.');
        modalState = 'rk1';
        await determineModalContent(modalState);
        return;
    }

    const response = await fetch('/users/recoverykeycheck', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            recoveryKey: recoveryKey
        })
    })

    const data = await response.json();

    if (response.ok && data.valid) {
        // Display change password and confirm password input fields.
        // alert("Recovery key is valid! You can now reset your password.");
        modalState = 'rkvalid';
        await determineModalContent(modalState);
        newPasswordLabel.style.display = 'block';
        newPasswordInput.style.display = 'block';
        confirmNewPasswordLabel.style.display = 'block';
        confirmNewPasswordInput.style.display = 'block';

        initiateResetBtn.textContent = 'Confirm Password Reset';
        buttonState = 'newPassword';
        recoveryKeyInput.disabled = true;
    }
    else {
        // alert("Invalid recovery key. Please check your recovery key and try again.");
        modalState = 'rkinvalid';
        await determineModalContent(modalState);
    }
}

async function submitNewPassword() {
    var username = usernameInput.value.trim();
    var password = newPasswordInput.value.trim();
    var confirmPassword = confirmNewPasswordInput.value.trim();

    if(password === '' || confirmPassword === ''){
        // alert("Password fields cannot be empty. Please enter and confirm your new password.");
        modalState = 'np1';
        await determineModalContent(modalState);
        return;
    }

    if(password !== confirmPassword){
        // alert("Passwords do not match. Please ensure both password fields match.");
        modalState = 'np2';
        await determineModalContent(modalState);
        return;
    }

    const response = await fetch('/users/forgotpassword', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, confirmPassword: confirmPassword })
    })

    const data = await response.json();

    if(response.ok && data.success){
        // alert("Password reset successful! You can now log in with your new password.");
        modalState = 'npvalid';
        await determineModalContent(modalState);
    } else {
        // alert("An error occurred while resetting your password. Please try again.");
        modalState = 'npinvalid';
        await determineModalContent(modalState);    
    }
}

async function determineModalContent(description){
    forgotPasswordContainer.style.display = "none";
    dynamicModal.style.display = "flex";
    dynamicModalBtn.onclick = null;
    switch(description){
        case 'u1':
            dynamicModalTitle.textContent = "Username Required";
            dynamicModalMessage.textContent = "Please enter your username to reset your password.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                usernameInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
        case 'u2':
            dynamicModalTitle.textContent = "Username Not Found";
            dynamicModalMessage.textContent = "The username you entered does not exist. Please enter a valid username.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                usernameInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
        case 'rk1':
            dynamicModalTitle.textContent = "Recovery Key Required";
            dynamicModalMessage.textContent = "Please enter your recovery key to reset your password.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                recoveryKeyInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
        case 'rkvalid':
            dynamicModalTitle.textContent = "Recovery Key Validated";
            dynamicModalMessage.textContent = "Your recovery key was valid! Please enter and confirm your new password.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                forgotPasswordContainer.style.display = "flex";
            };  
            break;
        case 'rkinvalid':
            dynamicModalTitle.textContent = "Invalid Recovery Key";
            dynamicModalMessage.textContent = "The recovery key you entered is invalid! Please check your recovery key and try again.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                recoveryKeyInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
        case 'np1':
            dynamicModalTitle.textContent = "Password Required";
            dynamicModalMessage.textContent = "Password fields cannot be empty! Please enter and confirm your new password.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
        case 'np2':
            dynamicModalTitle.textContent = "Password Mismatch";
            dynamicModalMessage.textContent = "Passwords do not match! Please ensure both password fields match.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
        case 'npvalid':
            dynamicModalTitle.textContent = "Password Reset Successful";
            dynamicModalMessage.textContent = "Your password has been reset successfully! You can now log in with your new password.";
            dynamicModalBtn.textContent = "Go to Login";
            dynamicModalBtn.onclick = () => {
                window.location.href = "login.html";
            };
            break;
        case 'npinvalid':
            dynamicModalTitle.textContent = "Password Reset Failed";
            dynamicModalMessage.textContent = "An error occurred while resetting your password! Please try again.";
            dynamicModalBtn.textContent = "OK";
            dynamicModalBtn.onclick = () => {
                dynamicModal.style.display = "none";
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
                forgotPasswordContainer.style.display = "flex";
            };
            break;
    }
}

if (initiateResetBtn) {
    initiateResetBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        if(buttonState === 'username'){
            await promptRecoveryKeyInput();
        }
        else if(buttonState === 'recoveryKey'){
            await submitRecoveryKey();
        }
        else if(buttonState === 'newPassword'){
            await submitNewPassword();
        }    
    })
}