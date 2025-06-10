# 🧠 XGameForge Backend

This is the backend API server for **XGameForge**, a cloud-deployed gaming center management platform. Built with **Node.js**, **Express**, and **MongoDB**, the backend powers dynamic e-commerce, bookings, and administrative functionalities.

> 🔗 Frontend Repo: [XGameForge Frontend](https://github.com/AhmadMasri0/xgameforge)  
> 🌐 Live Site: [https://xgameforge.com](https://xgameforge.com)  
> 🌍 API Base URL: [https://api.xgameforge.com](https://api.xgameforge.com)

---

## ⚙️ Features

### 🛒 E-Commerce
- Manage products (games, accessories, merch, etc.)
- Cart handling and secure Stripe checkout
- Order creation, payment status tracking, and delivery management

### 🕹 Booking System
- Schedule sessions for VR, console, PC, and more
- Prevent double bookings with slot validation
- Admin view for all reservations with filters

### 🔐 User & Admin
- JWT-based auth with role-based access
- Admin can:
  - Add/edit/delete products and menu items
  - Manage all bookings and orders
  - Mark orders as delivered or cancel reservations

### 📧 Email Notifications
- Confirmation emails sent on:
  - Successful order
  - Delivery status update
  - Cancellation and refund

---

## 📁 Project Structure

```bash
xgameforge-backend/
├── controllers/         
├── models/              
├── routes/              
├── middlewares/         
├── utils/               
├── uploads/             
├── index.js             
└── package.json
```

## 🧑‍💻 Tech Stack
- Node.js + Express
- MongoDB Atlas via Mongoose
- Stripe (PaymentIntent API)
- AWS S3 for image uploads
- AWS Elastic Beanstalk for deployment
- JWT & bcrypt for auth

## .env file example

PORT=4242

MONGO_URI=<your_mongodb_atlas_uri>

JWT_SECRET=your_jwt_secret

SESSION_SECRET=your_session_secret

AWS_BUCKET_NAME=your_s3_bucket_name

AWS_REGION=us-east-1

AWS_ACCESS_KEY_ID=***

AWS_SECRET_ACCESS_KEY=***

STRIPE_SECRET_KEY=***

CLIENT_URL=https://xgameforge.com


## 🧑‍🔧 Development

git clone https://github.com/AhmadMasri0/xgameforge-BE.git

npm install

npm run dev
