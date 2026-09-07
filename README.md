# CuraNet - Healthcare Management & Community Platform

**CuraNet** is a modern, full-stack web application designed for healthcare tracking, community interaction, emergency locator services, and secure user authentication.

---

## 🌟 Key Features

- 🔐 **User Authentication**: Secure register and login flows powered by **Passport.js** and **bcrypt** password encryption.
- 💬 **Community Health Forum**: Share experiences, read inspiring stories, and manage blog posts (`/community`, `/create`, `/post/:id`).
- 📊 **Health Tracker**: Monitor personal health metrics and wellness activities (`/tracker`).
- 📍 **Emergency & Service Locator**: Locate nearby hospitals and medical centers (`/locator`).
- 🗄️ **Flexible Hybrid Database Adapter**: Support for **PostgreSQL** with zero-config automatic **SQLite fallback** when local PostgreSQL servers are unavailable.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend / Templating**: HTML5, CSS3, EJS (Embedded JavaScript)
- **Authentication**: Passport.js (Local Strategy), Express-Session, Bcrypt
- **Database**: PostgreSQL (`pg`), SQLite (`sqlite3`)

---

## 📁 Directory Structure

```text
CuraNet-main/
└── project_healthcare/
    └── 9.1+Authentication+Lv.1/
        ├── index.js             # Main Express server entry point
        ├── db.js                # Database adapter (PostgreSQL + SQLite fallback)
        ├── .env                 # Environment variables configuration
        ├── queries.sql          # Database schema definition
        ├── views/               # EJS templates (UI pages)
        │   ├── home.ejs         # Landing & Login page
        │   ├── register.ejs     # User registration
        │   ├── open.ejs         # Authenticated user dashboard
        │   ├── community.ejs    # Community stories feed
        │   ├── create.ejs       # Post creation page
        │   ├── post.ejs         # Story detail view
        │   ├── tracker.ejs      # Health metrics tracker
        │   └── locator.ejs      # Hospital locator map
        └── public/              # Static assets (CSS, images, JS)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- Optional: [PostgreSQL](https://www.postgresql.org/) (if running a PostgreSQL server)

### Installation

1. Navigate to the project directory:
   ```bash
   cd "project_healthcare/9.1+Authentication+Lv.1"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the Node.js server:
```bash
node index.js
```

Or run with live reload using nodemon:
```bash
npx nodemon index.js
```

Live : https://curanet-mj06.onrender.com/
---

## ⚙️ Environment Variables (.env)

The application includes sensible default configurations out-of-the-box. You can customize `.env` in `project_healthcare/9.1+Authentication+Lv.1/.env`:

```env
SESSION_SECRET=healthcare_project_secret_987654
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=curanet
PG_PASSWORD=postgres123
PG_PORT=5432
```

> **Note**: If PostgreSQL is not installed or running, CuraNet will automatically fall back to an embedded SQLite database (`curanet.sqlite`) and auto-generate the necessary tables.

---

## 📄 License

This project is developed for educational and healthcare management purposes.
