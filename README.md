# Project Bellossom
## **A Proof of Concept by Rooted Devs**

Project Bellossom is a gardening manager application designed with the vision of helping beginner gardeners. Developed as a Proof of Concept (PoC) for the Enterprise Project module, the application makes use of a secure, lightweight architecture for garden management whilst actively supporting user well-being.

---

## Tech Stack

### **Frontend**
* **Vanilla HTML/CSS**
* **JavaScript**

### **Backend & Desktop Integration**
* **Node.js & Express:** Handles server-side logic and API management.
* **Electron.js:** Wraps the application into a dedicated cross-platform desktop experience.

### **Database & Security**
* **SQLite3:** Relational database for local data persistence.
* **better-sqlite3:** Utilised for superior performance and simplified synchronous syntax.
* **bcrypt:** Implementation of industry-standard salt-based password hashing.

---

## Key Features

* **Secure Authentication**
    A robust sign-up and login flow featuring unique username constraints at the database level and secure credential storage.

* **Garden Management**
    The ability to create, customise, and track multiple distinct garden plots within a single interface.

* **Mental Health Modal**
    A unique, integrated feature that prompts users to log their mood (1-5) upon login. This promotes mental health awareness and highlights the therapeutic benefits of consistent gardening.

---

## Standards & Compliance
This project was designed and developed with a focus on professional industry standards:
* **Data Integrity:** Input validation and unique constraints within the SQLite schema.
* **Security:** Middleware-protected routes and hashed passwords.
* **Accessibility:** Intuitive navigation and consistent design to lower the barrier to entry for new users.
