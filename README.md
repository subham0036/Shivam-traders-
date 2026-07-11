# Shivam Traders

Premium MERN Stack eCommerce website for Hindu God Murtis (Idols).

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Context API, Framer Motion, React Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** JWT, bcrypt
- **Payments:** Razorpay
- **File Upload:** Multer, Cloudinary
- **Email:** Nodemailer

## Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   └── styles/
│   └── public/
└── server/          # Express backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    └── utils/
```

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/subham0036/Shivam-traders-.git
cd Shivam-traders-
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env — replace YOUR_DB_PASSWORD with MongoDB password (see SETUP.md)
npm install
npm run seed    # Seed database with sample products
npm run dev     # Start server on port 5002
```

> **Mac users:** Port 5002 is used because macOS AirPlay occupies port 5000.

### 3. Frontend Setup

```bash
cd client
cp .env.example .env
# Edit .env with your API URL and Razorpay key
npm install
npm run dev     # Start on port 5173
```

## Environment Variables

### Server (.env) - NEVER commit this file

| Variable | Description |
|----------|-------------|
| MONGODB_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT tokens |
| CLOUDINARY_* | Cloudinary credentials |
| RAZORPAY_* | Razorpay payment keys |
| SMTP_* | Email service credentials |
| CLIENT_URL | Frontend URL for CORS |

### Client (.env) - NEVER commit this file

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |
| VITE_RAZORPAY_KEY_ID | Razorpay public key |
| VITE_WHATSAPP_NUMBER | WhatsApp contact number |
| VITE_PHONE_NUMBER | Store phone number |
| VITE_EMAIL | Store email |
| VITE_MAPS_LINK | Google Maps link to your shop |
| VITE_MAPS_EMBED | Google Maps embed URL for contact page |

## Admin account

After `npm run seed`, log in with the **ADMIN_EMAIL** and **ADMIN_PASSWORD** you set in `server/.env`.

Never commit real credentials to GitHub. Use strong passwords and change them after first login in production.

## Deployment (Vercel + Render)

Recommended setup: **Vercel** for the React site, **Render** for the API, **MongoDB Atlas** for the database.

### Step 1 — MongoDB Atlas (already set up locally)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → your cluster
2. **Network Access** → **Add IP Address** → `0.0.0.0/0` (allow cloud servers)
3. Copy your `MONGODB_URI` from Atlas → you will paste it on Render

### Step 2 — Deploy backend (Render)

1. Go to [render.com](https://render.com) → sign up with GitHub
2. **New** → **Blueprint** → connect your private repo `Shivam-traders-`
3. Render reads `render.yaml` and creates the API service
4. Add these **Environment Variables** in Render (copy from your local `server/.env`, never commit them):

| Variable | Example / notes |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Long random string |
| `CLIENT_URL` | Your Vercel URL (set after Step 3) |
| `SERVER_URL` | `https://shivam-traders-api.onrender.com` (your Render URL) |
| `ADMIN_EMAIL` | Your admin login email |
| `ADMIN_PASSWORD` | Strong admin password |

5. Click **Deploy** — wait until status is **Live**
6. Open `https://YOUR-RENDER-URL.onrender.com/api/health` — should show `"database": "connected"`
7. In Render **Shell**, run once: `npm run update-admin`

> **Images in production:** Without Cloudinary, uploads are stored on Render disk and may reset on redeploy. For a permanent store, add real `CLOUDINARY_*` keys in Render env vars.

### Step 3 — Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New Project** → import `Shivam-traders-`
3. Set **Root Directory** to `client`
4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |
| `VITE_SITE_URL` | `https://your-site.vercel.app` (Vercel shows this after deploy) |
| `VITE_WHATSAPP_NUMBER` | `919065414511` |
| `VITE_PHONE_NUMBER` | `+91 9065414511` |
| `VITE_EMAIL` | Your store email |
| `VITE_INSTAGRAM_URL` | Your Instagram URL |
| `VITE_MAPS_LINK` | Google Maps link |
| `VITE_MAPS_EMBED` | Google Maps embed URL |

5. Click **Deploy**
6. Copy your live Vercel URL (e.g. `https://shivam-traders.vercel.app`)
7. Go back to **Render** → update `CLIENT_URL` to your Vercel URL → **Manual Deploy**

### Step 4 — Test live site

- Customer site: `https://your-site.vercel.app`
- Admin login: `https://your-site.vercel.app/admin`
- Add a product with photo → image should load from Render `/uploads`
- Place a test UPI order end-to-end

### Free tier notes

- **Render free** sleeps after ~15 min idle — first visit may take 30–60 seconds to wake up
- **Vercel** frontend is always fast
- Upgrade Render to a paid plan later to avoid sleep and keep uploads persistent

### Database (MongoDB Atlas)
1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP (0.0.0.0/0 for cloud deployment)
4. Copy connection string to MONGODB_URI

## Features

- Premium responsive UI with saffron & gold theme
- Product catalog with advanced filters
- Shopping cart, wishlist, checkout
- Razorpay & COD payments
- JWT authentication with role-based access
- Admin dashboard with analytics
- Staff panel (limited access)
- Inventory management
- Order tracking
- Coupon system
- Newsletter subscription
- SEO optimized (meta tags, schema, sitemap)
- Security (Helmet, rate limiting, XSS protection)

## User Roles

| Role | Access |
|------|--------|
| Customer | Shop, cart, orders, profile |
| Staff | Orders, inventory, view products/customers |
| Admin | Full access including revenue, coupons, delete products |

## License

Private - Shivam Traders © 2026
