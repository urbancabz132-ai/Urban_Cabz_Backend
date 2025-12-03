// src/controllers/auth.controller.js
const { validationResult } = require('express-validator');
const authService = require('../services/auth.services');
const passwordResetService = require('../services/password-reset.service');

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name, phone } = req.body;
    const result = await authService.register({ email, password, name, phone, roleName: 'customer' });
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

async function getProfile(req, res) {
  try {
    const result = await authService.getProfile(req.user.id);
    return res.json(result);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

async function updateProfile(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, phone, email } = req.body;
    const result = await authService.updateProfile(req.user.id, { name, phone, email });
    return res.json(result);
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

async function requestPasswordReset(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, phone } = req.body;
    console.log('🔔 requestPasswordReset called with:', { email, phone });
    const result = await passwordResetService.requestPasswordReset({ email, phone });
    return res.json({
      message: 'OTP sent to your WhatsApp number',
      ...result,
    });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

async function resetPasswordWithOtp(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { resetId, otp, newPassword } = req.body;
    await passwordResetService.completePasswordReset({ resetId, otp, newPassword });
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    return res.status(status).json({ message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPasswordWithOtp,
};
