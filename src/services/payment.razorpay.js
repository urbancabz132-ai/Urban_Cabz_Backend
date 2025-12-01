const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createOrder({ amount, currency = 'INR', receipt }) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // rupees → paise
    currency,
    receipt
  });
}

module.exports = { createOrder };