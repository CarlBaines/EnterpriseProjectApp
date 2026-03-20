(() => {
    async function getCurrentUser() {
        const response = await fetch("/users/me", {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();

        if (!response.ok || !data.loggedIn || !data.username) {
            throw new Error(data?.message || "Failed to fetch logged in user.");
        }

        return data;
    }

    function setupPage(username) {
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
            userNameElement.textContent = username;
        }

        const profilePicture = document.getElementById("profile-picture");
        if (profilePicture) {
            profilePicture.onerror = () => {
                profilePicture.src = "../assets/images/user.png";
            };
        }
    }

    window.onload = async () => {
        try {
            const userData = await getCurrentUser();
            setupPage(userData.username);
        } catch (err) {
            console.error("Error fetching user data:", err);
            window.location.href = "login.html";
        }
        };
})();