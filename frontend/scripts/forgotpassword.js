// DOM elements
const usernameInput = document.getElementById('username');
const initiateResetBtn = document.getElementById('initiate-reset-btn');
const recoveryKeyLabel = document.getElementById('recovery-key-label');
const recoveryKeyInput = document.getElementById('recovery-key');
const newPasswordLabel = document.getElementById('new-password-label');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordLabel = document.getElementById('confirm-new-password-label');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');

let buttonState = 'username';

async function promptRecoveryKeyInput() {

    var username = usernameInput.value.trim();
    if (username === '') {
        alert('Username cannot be empty. Please enter your username to reset your password.');
        return;
    }

    const response = await fetch('http://localhost:3000/users/forgotpasswordusernamecheck', {
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
        alert("Username does not exist. Please enter a valid username.");
        usernameInput.value = '';
        return false;
    }
}

async function submitRecoveryKey() {
    var username = usernameInput.value.trim();
    var recoveryKey = recoveryKeyInput.value.trim();

    if (username === '' || recoveryKey === '') {
        alert('Username and recovery key cannot be empty. Please enter both fields to reset your password.');
        return;
    }

    const response = await fetch('http://localhost:3000/users/recoverykeycheck', {
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
        alert("Recovery key is valid! You can now reset your password.");
        newPasswordLabel.style.display = 'block';
        newPasswordInput.style.display = 'block';
        confirmNewPasswordLabel.style.display = 'block';
        confirmNewPasswordInput.style.display = 'block';

        initiateResetBtn.textContent = 'Confirm Password Reset';
        buttonState = 'newPassword';
        recoveryKeyInput.disabled = true;
    }
    else {
        alert("Invalid recovery key. Please check your recovery key and try again.");
        recoveryKeyInput.value = '';
    }
}

async function submitNewPassword() {
    var username = usernameInput.value.trim();
    var password = newPasswordInput.value.trim();
    var confirmPassword = confirmNewPasswordInput.value.trim();

    if(password === '' || confirmPassword === ''){
        alert("Password fields cannot be empty. Please enter and confirm your new password.");
        return;
    }

    if(password !== confirmPassword){
        alert("Passwords do not match. Please ensure both password fields match.");
        return;
    }

    const response = await fetch('http://localhost:3000/users/forgotpassword', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username, confirmPassword: confirmPassword })
    })

    const data = await response.json();

    if(response.ok && data.success){
        window.location.href = "./login.html";
        alert("Password reset successful! You can now log in with your new password.");
        // window.location.replace('./login.html');
    } else {
        alert("An error occurred while resetting your password. Please try again.");
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
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