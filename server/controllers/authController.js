import User from '../models/User.js';
import { generateToken, generateResetToken } from '../utils/helpers.js';
import { sendEmail, resetPasswordEmail } from '../services/emailService.js';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, phone, password });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account blocked' });

  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user._id);

  res.json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token },
  });
};

// @desc    Get profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  if (req.body.email) user.email = req.body.email;
  const updated = await user.save();
  res.json({ success: true, data: updated });
};

// @desc    Change password
// @route   PUT /api/auth/password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link has been sent' });
  }
  const { resetToken, hashedToken } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const emailData = resetPasswordEmail(resetUrl);
  await sendEmail({ to: user.email, ...emailData });
  res.json({ success: true, message: 'Reset link sent to email' });
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  const crypto = await import('crypto');
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful' });
};

// @desc    Add address
// @route   POST /api/auth/addresses
export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
export const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);
  if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
  Object.assign(address, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
    address.isDefault = true;
  }
  await user.save();
  res.json({ success: true, data: user.addresses });
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.id);
  await user.save();
  res.json({ success: true, data: user.addresses });
};
