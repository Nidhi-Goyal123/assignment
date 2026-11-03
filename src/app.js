const express = require("express");
const app = express();

// Import routes
const slotRoutes = require("./routes/slot.routes");

// Middlewares
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Interview Slot Booking API is running"
    });
});

// Slot routes
app.use("/slots", slotRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        code: err.code || "INTERNAL_SERVER_ERROR",
        message: err.message || "Internal server error"
    });
});

module.exports = app;
