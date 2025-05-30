const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require('path');

require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const barRoutes = require("./routes/barRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const stripeRoutes = require('./routes/stripeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bar", barRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, process.env.SERVER_IP_ADDRESS, () =>
            console.log(`Server running on http://${process.env.SERVER_IP_ADDRESS}:${process.env.PORT}`)
        );
    })
    .catch(err => console.error("DB connection failed:", err));
