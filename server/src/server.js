const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./configs/dbConfig");
const { connectRedis } = require("./configs/redisConfig");
const cookieParser = require("cookie-parser");
// Khai báo routes
const student = require("./routes/studentRoute");
const parent = require("./routes/parentRoute");
const account = require("./routes/accountRoute");
const teacher = require("./routes/teacherRoute");

const auth = require("./routes/authRoute");
const enrollSchool = require("./routes/enrollSchoolRoute");
const weeklyMenu = require("./routes/menuRoute");

const classRoute = require("./routes/classRoute");
const roomRoute = require("./routes/roomRoute");
const curriculum = require("./routes/curriculumRoute");
const adminRoute = require("./routes/adminRoute");

const schedule = require("./routes/scheduleRoute");
const holidayRoute = require("./routes/holidayRoute");
// Khai báo dotenv
dotenv.config();

// Khai báo app
const app = express();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Connect Redis
connectRedis();

// Sử dụng đường dẫn
app.use("/api/student", student);
app.use("/api/parent", parent);
app.use("/api/account", account);
app.use("/api/auth", auth);
app.use("/api/teacher", teacher);
app.use("/api/weeklyMenu", weeklyMenu);
app.use("/api/enrollSchool", enrollSchool);
app.use("/api/class", classRoute);
app.use("/api/room", roomRoute);

app.use("/api/curriculum", curriculum);
app.use("/api/admin", adminRoute);

app.use("/api/schedule", schedule);
app.use("/api/holiday", holidayRoute);

// route test
app.get("/", (req, res) => {
    res.send("👋 Welcome to the Kindergarten Management API");
});

// Start server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
