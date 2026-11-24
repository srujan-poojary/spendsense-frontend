# 💳 SpendSense — Frontend

A sleek, dark-themed personal finance web app and receipt scanner.

> **Live Application:** [spendsense-frontend.vercel.app](https://your-app.vercel.app)  
> **Backend API:** [spendsense-backend.onrender.com](https://your-api.onrender.com)

---

## 📸 What is SpendSense?

SpendSense makes expense tracking effortless. Drop in any receipt, and it automatically extracts the store name, date, total amount, and itemized breakdown. It tracks your monthly budget in real time with visual pacing meters, category charts, and spending insights.

---

## ✨ Features

- **Receipt Scanner:** Upload or drag-and-drop receipt images to extract line items instantly.
- **Budget Pacing & Overview:** Live tracking of monthly limit, active spend, daily runway cap, and budget velocity.
- **Spending Analytics:** Interactive doughnut and trend charts powered by Chart.js.
- **Transaction History:** Searchable and filterable expense ledger with item details and editing.
- **Instant Demo Mode:** Test all features immediately with realistic sample receipts — no sign-up needed.
- **Account & Profile:** Customizable profile with persistent display name and monthly budget limits.

---

## 🛠️ Tech Stack

- **UI / Frontend:** HTML5, Modern CSS (Obsidian Fintech Dark), Vanilla JavaScript
- **Charts:** Chart.js
- **Icons:** Bootstrap Icons
- **Authentication:** Supabase Auth (Google OAuth & Email/Password)

---

## 💻 Running Locally

Simply serve the folder using any static file server:

```bash
# Using npx serve
npx serve .

# Or using Python
python3 -m http.server 5500
```

Open `http://localhost:5500` in your browser.

---

## ⚙️ Configuration

API and database settings are located in `js/config.js`:
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase connection.
- `API_URL` — Points to `http://localhost:3000` locally, or your deployed backend URL in production.
