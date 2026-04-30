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
    if (!response.ok) {
        console.error(data);
        return;
    }

    // Update number of notifications
    const notifications = Array.isArray(data.notifications) ? data.notifications : [];
    const unreadCount = notifications.filter(n => !n.is_read).length;
    countEl.textContent = `${unreadCount} new notification(s)`;

    // Render clone of template for each notification
    notifications.forEach((notification, index) => {
        const clone = template.content.cloneNode(true);

        const imgEl = clone.querySelector('.notifications-placeholder');
        changePlaceholderImg(notification.title, imgEl);

        const checkbox = clone.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateActionsFooter);

        const label = clone.querySelector('label');

        // Make checkbox id unique per clone
        const checkboxId = `notification-${index}`;
        checkbox.id = checkboxId;
        checkbox.checked = !!notification.is_read;
        label.htmlFor = checkboxId;

        // Render content
        label.textContent = notification.title ?? "Notification";
        clone.querySelector('#n-priority').textContent = notification.priority ?? "";

        // Style the priority text based on its value
        const priorityEl = clone.querySelector('#n-priority');
        decideNotificationPriorityStyle(notification.priority, priorityEl);

        clone.querySelector('#n-description').textContent = notification.description ?? "";
        clone.querySelector('#n-time').textContent = formatNotificationTime(notification);

        notificationsList.insertBefore(clone, template);

    });

    filterNotifications();
}

function updateActionsFooter() {
    const anyChecked = document.querySelectorAll('.notifications-list input[type="checkbox"]:checked').length > 0;
    actionsFooter.style.display = anyChecked ? "flex" : "none";
}

function decideNotificationPriorityStyle(notificationPriority, priorityEl) {
    switch (notificationPriority) {
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

function filterNotifications() {
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
        if (show) {
            visible++;
        }
    })
}

function changePlaceholderImg(notificationTitle, imgEl) {
    if (!imgEl) return;
    switch (notificationTitle) {
        case "Watering Reminder":
            imgEl.src = "../assets/images/watering-can.png";
            imgEl.alt = "Watering Reminder";
            break;
        case "Fertiliser Alert":
            imgEl.src = "../assets/images/fertiliser-icon.png";
            imgEl.alt = "Fertiliser Alert";
            break;
        default:
            imgEl.src = "../assets/images/user.png";
            imgEl.alt = "Notifications Placeholder";
    }
}

async function refreshNotifications(){
    // Remove all currently rendered notifications from the DOM
    document.querySelectorAll('.notifications-list .garden-notifications').forEach(el => el.remove());
    await displayNotifications();
    updateActionsFooter();
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
    markAsReadBtn.addEventListener('click', async () => {
        const response = await fetch('/notifications/markread', {
            method: 'PUT',
            credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));
        if(!response.ok){
            console.error(data);
            return;
        }

        await refreshNotifications();
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
        const response = await fetch('/notifications/clearall', {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));
        if(!response.ok){
            console.error(data);
            return;
        }

        await refreshNotifications();
    });
}

function formatTimeOnly(value) {
    // matches "09:00:00" or "09:00"
    const match = String(value).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);

    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;

    // if you want "9am" instead of "9:00am" when minutes are 0:
    return minutes === 0
        ? `${hours}${ampm}`
        : `${hours}:${String(minutes).padStart(2, "0")}${ampm}`;
}

function parseSqliteDateTime(value) {
    // "2024-06-01 09:00:00"
    const match = String(value).match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
    );
    if (!match) return null;

    const [, y, mo, d, h, mi, s] = match.map(Number);
    return new Date(y, mo - 1, d, h, mi, s || 0);
}

function formatDMYAndAmPm(date) {
    const datePart = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;

    const timePart = minutes === 0
        ? `${hours}${ampm}`
        : `${hours}:${String(minutes).padStart(2, "0")}${ampm}`;

    return `${datePart} ${timePart}`;
}

function formatNotificationTime(notification) {
    // Prefer a full datetime if available:
    const dt = parseSqliteDateTime(notification.created_at ?? notification.time);
    if (dt) return formatDMYAndAmPm(dt);

    // If it’s time-only like "09:00:00":
    const t = formatTimeOnly(notification.time);
    if (t) return t;

    // Otherwise leave as-is ("2 hours ago", etc.)
    return notification.time ?? "";
}

document.addEventListener("DOMContentLoaded", () => {
    displayNotifications();
    updateActionsFooter();
    
    const searchBar = document.getElementById('search-input');
    if (searchBar) {
        searchBar.value = "";
        searchBar.addEventListener('input', filterNotifications);
    }
});