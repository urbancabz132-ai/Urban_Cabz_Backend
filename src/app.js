const express = require('express');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// API versioning prefix
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.get('/health', (req, res) => res.send({ ok: true }));

module.exports = app;
