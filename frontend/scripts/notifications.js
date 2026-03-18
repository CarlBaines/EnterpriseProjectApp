// DOM elements
const backArrow = document.querySelector('.back-arrow');
const searchIcon = document.querySelector('.search-icon');
const accountIcon = document.querySelector('.account-icon');
const addIcon = document.querySelector('.add-icon');
const settingsIcon = document.querySelector('.settings-icon');

const actionsFooter = document.querySelector('.actions-footer');
const markAsReadBtn = document.getElementById('mark-as-read-btn');
const clearBtn = document.getElementById('clear-btn');

async function displayNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    const template = document.getElementById('notification-template');
    const countEl = document.getElementById('notifications-num');

    if (!notificationsList || !template || !countEl) return;

    const response = await fetch(`/notifications/all`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await response.json();
    if(!response.ok){
        console.error(data);
        // window.location.href = 'login.html';
        return;
    }

    // Update number of notifications
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    countEl.textContent = `${notifications.length} new notification(s)`;

    // Clear existing notifications
    notificationsList.querySelectorAll(".garden-notifications")
        .forEach(el => el.remove());

    // Render clone of template for each notification
    notifications.forEach((notification, index) => {
        const clone = template.content.cloneNode(true);

        const checkbox = clone.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateActionsFooter);

        clone.querySelector('#garden-name').textContent =
            notification.gardenName ?? "Garden";

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

function updateActionsFooter() {
    const anyChecked = document.querySelectorAll('.notifications-list input[type="checkbox"]:checked').length > 0;
    actionsFooter.style.display = anyChecked ? "flex" : "none";
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

if (markAsReadBtn) {
    markAsReadBtn.addEventListener('click', () => {
        alert("Mark as read functionality is not implemented yet.");
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        alert("Clear notifications functionality is not implemented yet.");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    displayNotifications();
    updateActionsFooter();
});