// DOM elements
const backArrow = document.querySelector('.back-arrow');
const searchIcon = document.querySelector('.search-icon');
const accountIcon = document.querySelector('.account-icon');
const addIcon = document.querySelector('.add-icon');
const settingsIcon = document.querySelector('.settings-icon');


function displayNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    const template = document.getElementById('notification-template');
    const countEl = document.getElementById('notifications-num');

    if (!notificationsList || !template || !countEl) return;

    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];

    // const notifications = [
    //     {
    //         gardenName: "Rose Garden",
    //         title: "Watering Reminder",
    //         description: "Don't forget to water your roses today!",
    //         priority: "High",
    //         time: "2 hours ago",
    //         read: false
    //     }
    // ]

    // Update number of notifications
    const n = notifications.length;
    countEl.textContent = `${n} new notification(s)`;

    // Clear existing notifications
    notificationsList.querySelectorAll(".garden-notifications")
        .forEach(el => el.remove());

    // Render clone of template for each notification
    notifications.forEach((notification, index) => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('#garden-name').textContent =
            notification.gardenName ?? "Garden";

        const checkbox = clone.querySelector('input[type="checkbox"]');
        const label = clone.querySelector('label');

        // Make checkbox id unique per clone
        const checkboxId = `notification-${index}`;
        checkbox.id = checkboxId;
        checkbox.checked = !!notification.read;
        label.htmlFor = checkboxId;

        // Render content
        label.textContent = notification.title ?? "Notification";
        clone.querySelector('#n-priority').textContent = notification.priority ?? "";
        clone.querySelector('#n-description').textContent = notification.description ?? "";
        clone.querySelector('#n-time').textContent = notification.time ?? "";

        notificationsList.insertBefore(clone, template);

    });
}

// Event listeners
if (backArrow) {
    backArrow.addEventListener('click', () => {
        window.location.href = 'homepage.html';
    });
}

if (searchIcon) {
    searchIcon.addEventListener('click', () => {
        alert("Search functionality is not implemented yet.");
    });
}

if (accountIcon) {
    accountIcon.addEventListener('click', () => {
        window.location.href = 'account.html';
    });
}

if (addIcon) {
    addIcon.addEventListener('click', () => {
        alert("Add functionality is not implemented yet.");
    });
}

if (settingsIcon) {
    settingsIcon.addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    displayNotifications();
});