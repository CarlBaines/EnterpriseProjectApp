// DOM elements
const backArrow = document.querySelector('.back-arrow');
const searchIcon = document.querySelector('.search-icon');
const accountIcon = document.querySelector('.account-icon');
const searchBar = document.getElementById('search-input');
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
        return;
    }

    // Update number of notifications
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    countEl.textContent = `${notifications.length} new notification(s)`;

    // Render clone of template for each notification
    notifications.forEach((notification, index) => {
        const clone = template.content.cloneNode(true);

        const checkbox = clone.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateActionsFooter);

        const label = clone.querySelector('label');

        // Make checkbox id unique per clone
        const checkboxId = `notification-${index}`;
        checkbox.id = checkboxId;
        checkbox.checked = !!notification.read;
        label.htmlFor = checkboxId;

        // Render content
        label.textContent = notification.title ?? "Notification";
        clone.querySelector('#n-priority').textContent = notification.priority ?? "";

        // Style the priority text based on its value
        const priorityEl = clone.querySelector('#n-priority');
        decideNotificationPriorityStyle(notification.priority, priorityEl);

        clone.querySelector('#n-description').textContent = notification.description ?? "";
        clone.querySelector('#n-time').textContent = notification.time ?? "";

        notificationsList.insertBefore(clone, template);

    });

    filterNotifications();
}

function updateActionsFooter() {
    const anyChecked = document.querySelectorAll('.notifications-list input[type="checkbox"]:checked').length > 0;
    actionsFooter.style.display = anyChecked ? "flex" : "none";
}

function decideNotificationPriorityStyle(notificationPriority, priorityEl){
    switch(notificationPriority){
        case "High":
            priorityEl.style.backgroundColor = "#F4CDC6";
            break;
        case "Medium":
            priorityEl.style.backgroundColor = "orange";
            break;
        case "Low":
            priorityEl.style.backgroundColor = "#7EBC89";
            break;
    }
}

function filterNotifications(){
    const input = document.getElementById('search-input');
    const query = (input?.value || "").toLowerCase().trim();
    const items = document.querySelectorAll(
        ".notifications-list .garden-notifications"
    );

    // Number of visible notifications
    let visible = 0;

    items.forEach((item) => {
        const title = item.querySelector(".notification-content label")?.textContent || "";
        const priority = item.querySelector("#n-priority")?.textContent || "";
        const description = item.querySelector("#n-description")?.textContent || "";

        const searchableText = `${title} ${priority} ${description}`.toLowerCase();
        const show = query === "" || searchableText.includes(query);

        item.style.display = show ? "" : "none";
        if(show){
            visible++;
        }
    })
}

// Event listeners
if (backArrow) {
    backArrow.addEventListener('click', () => {
        window.location.href = 'homepage.html';
    });
}

if (searchIcon) {
    searchIcon.addEventListener('click', () => {
        searchBar.style.display = "block";
        searchBar.focus();
        filterNotifications();
    });
}

if (accountIcon) {
    accountIcon.addEventListener('click', () => {
        window.location.href = 'account.html';
    });
}

if (addIcon) {
    addIcon.addEventListener('click', () => {
        window.location.href = 'addgarden.html';
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

    const searchBar = document.getElementById('search-input');
    if(searchBar){
        searchBar.value = "";
        searchBar.addEventListener('input', filterNotifications);
    }
});