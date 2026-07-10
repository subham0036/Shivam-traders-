# Quick Setup Guide (Mac / MacBook M4)

Follow these steps after cloning the repo.

## 1. Clone the repository

```bash
git clone https://github.com/subham0036/Shivam-traders-.git
cd Shivam-traders-
```

## 2. Backend setup

```bash
cd server
cp .env.example .env
```

Open `server/.env` and set your own values:

- `MONGODB_URI` — from MongoDB Atlas (Database → Connect)
- `JWT_SECRET` — a long random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for the admin account created by seed

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
```

Set your store contact details and maps link in `client/.env`.

```bash
npm install
npm run dev     # Website runs at http://localhost:5173
```

## 4. Admin panel

After seeding, open http://localhost:5173/admin and sign in with the admin email and password from `server/.env`.

---

## MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and copy the connection string into `MONGODB_URI`
3. Network Access → allow your IP (or `0.0.0.0/0` for development)

---

## Mac M4 notes

- If backend says **port in use**, keep `PORT=5002` in `server/.env`
- If MongoDB connection fails, check Atlas → Network Access → allow your IP
- Restart both terminals after changing `.env` files

## Security

- **Never commit** `server/.env` or `client/.env` — they are in `.gitignore`
- Use strong admin and database passwords
- Rotate JWT secret and API keys if they were ever exposed
