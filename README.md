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
git clone https://github.com/shivamtraders1138-oss/Shivam_traders.git
cd Shivam_traders
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

## Default Admin Credentials (after seeding)

- **Email:** your_admin@example.com
- **Password:** ***REMOVED***

> Change these immediately after first login in production!

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory to `client`
3. Add environment variables from `client/.env.example`
4. Deploy

### Backend (Render)
1. Create new Web Service
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `server/.env.example`

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
