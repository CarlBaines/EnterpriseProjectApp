# Project Bellossom
## A Proof of Concept by Rooted Devs

Project Bellossom is a gardening manager application designed with the vision of helping beginner gardeners overcome the daunting hurdles of plant care. Developed as a Proof of Concept (PoC) for the Enterprise Project module, the application utilises a secure, lightweight architecture for garden management whilst actively supporting user well-being.

---

## Tech Stack

### **Frontend**
* **Vanilla HTML/CSS**: Used for a lightweight and responsive user interface.
* **JavaScript**: Manages client-side logic and asynchronous requests.

### **Backend and Desktop Integration**
* **Node.js and Express**: Handles server-side logic and API management.
* **Electron.js**: Wraps the application into a dedicated, cross-platform desktop experience.

### **Database and Security**
* **SQLite3**: A relational database used for local data persistence.
* **better-sqlite3**: Utilised for superior performance and simplified synchronous syntax.
* **bcrypt**: Implementation of industry-standard salt-based password hashing for secure credential storage.

---

## Key Features

* **Secure Authentication**
    A robust sign-up and login flow featuring unique username constraints at the database level and secure credential storage.

* **Garden Management**
    The ability to create, customise, and track multiple distinct garden plots, such as home gardens and allotments, within a single interface.

* **Mental Health Modal**
    A unique, integrated feature that prompts users to log their mood (1-5) upon login. This promotes mental health awareness and highlights the therapeutic benefits of consistent gardening.

---

## Installation and Setup

Project Bellossom requires **Node.js** to be installed on your local machine to manage the environment and dependencies.

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/CarlBaines/EnterpriseProjectApp.git](https://github.com/CarlBaines/EnterpriseProjectApp.git)
    ```
2.  **Install necessary modules**:
    Run the following command to install all required dependencies, including **better-sqlite3** for database performance, **Electron** for the desktop wrapper, **Express** for the server framework, and **bcrypt** for security:
    ```bash
    npm install
    ```
3.  **Launch the application**:
    ```bash
    npm start
    ```

---

## Standards and Compliance
This project was designed and developed with a focus on professional industry standards:
* **Data Integrity**: Input validation and unique constraints within the SQLite schema to ensure clean data entry.
* **Security**: Middleware-protected routes and hashed passwords to maintain user privacy.
* **Accessibility**: Intuitive navigation, adjustable text/icon sizes, and high-contrast UI themes to lower the barrier to entry for all users.
