# Quick Setup Guide (Mac / MacBook M4)

Follow these steps after cloning the repo.

## 1. Clone the repository

```bash
git clone https://github.com/shivamtraders1138-oss/Shivam-traders.git
cd Shivam-traders
```

## 2. Backend setup

```bash
cd server
cp .env.example .env
```

Open `server/.env` and replace `YOUR_DB_PASSWORD` with the MongoDB password shared by Shivam.

> **Note:** Port is set to **5002** (not 5000) because macOS AirPlay uses port 5000 on Mac.

```bash
npm install
npm run seed    # Creates admin user + sample products in MongoDB
npm run dev     # API runs at http://localhost:5002
```

## 3. Frontend setup (new terminal)

```bash
cd client
cp .env.example .env
npm install
npm run dev     # Website runs at http://localhost:5173
```

## 4. Login credentials (after seeding)

| Role  | Email                     | Password      |
|-------|---------------------------|---------------|
| Admin | your_admin@example.com   | ***REMOVED***  |

Admin panel: http://localhost:5173/admin

---

## MongoDB Atlas details

| Field    | Value |
|----------|-------|
| Cluster  | `YOUR_CLUSTER.mongodb.net` |
| Database | `shivam_traders` |
| Username | `YOUR_DB_USER` |
| Password | *(shared privately by Shivam)* |

Connection string format:
```
mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_CLUSTER.mongodb.net/shivam_traders?retryWrites=true&w=majority&appName=Cluster0
```

---

## Mac M4 notes

- If backend says **port in use**, keep `PORT=5002` in `server/.env`
- If MongoDB connection fails, check Atlas → Network Access → allow `0.0.0.0/0`
- Restart both terminals after changing `.env` files
