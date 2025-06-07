const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
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

app.enable('trust proxy');
// app.use((req, res, next) => {
//     if (!req.secure) {
//         return res.redirect('https://' + req.headers.host + req.url);
//     }
//     next();
// });

const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.1.5:3000",
    "https://xgameforge.com",
    "https://www.xgameforge.com"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.ALLOW_ALL_CORS === "true") {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("XGameForge backend is running.");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bar", barRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);


const PORT = process.env.PORT || 4242;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error("DB connection failed:", err));
