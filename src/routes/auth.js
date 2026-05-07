const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      const user = await User.create({ name, email, password, role });
      const token = signToken({ id: user._id, role: user.role });

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = signToken({ id: user._id, role: user.role });

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/customer-details (protected) - Submit customer details and trigger income form
router.post(
  '/customer-details',
  authMiddleware,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('zipCode').trim().notEmpty().withMessage('Zip code is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('ssn').trim().notEmpty().withMessage('SSN is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { fullName, phoneNumber, address, city, state, zipCode, dateOfBirth, ssn } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.customerDetails = {
        fullName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        dateOfBirth: new Date(dateOfBirth),
        ssn,
      };
      user.formProgress.customerDetailsCompleted = true;
      user.loanApplicationStatus = 'in-progress';

      await user.save();

      res.status(200).json({
        message: 'Customer details saved successfully',
        nextStep: 'income-details',
        triggerIncomeForm: true,
        formProgress: user.formProgress,
        branding: {
          colors: {
            primary: '#2DB5DA',
            secondary: '#939598',
          },
          typography: {
            primaryFont: 'Proxima Nova, sans-serif',
            secondaryFont: 'Montserrat, sans-serif',
          },
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/auth/income-details (protected) - Submit income details
router.post(
  '/income-details',
  authMiddleware,
  [
    body('employmentType')
      .isIn(['employed', 'self-employed', 'unemployed', 'retired'])
      .withMessage('Valid employment type is required'),
    body('annualIncome')
      .isNumeric()
      .withMessage('Annual income must be a number'),
    body('monthlyIncome')
      .isNumeric()
      .withMessage('Monthly income must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      employmentType,
      employerName,
      jobTitle,
      annualIncome,
      monthlyIncome,
      additionalIncome,
      incomeSource,
    } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.formProgress.customerDetailsCompleted) {
        return res.status(400).json({
          message: 'Customer details must be completed first',
          nextStep: 'customer-details',
        });
      }

      user.incomeDetails = {
        employmentType,
        employerName,
        jobTitle,
        annualIncome: Number(annualIncome),
        monthlyIncome: Number(monthlyIncome),
        additionalIncome: additionalIncome ? Number(additionalIncome) : 0,
        incomeSource,
      };
      user.formProgress.incomeDetailsCompleted = true;
      user.loanApplicationStatus = 'submitted';

      await user.save();

      res.status(200).json({
        message: 'Income details saved successfully',
        nextStep: 'document-upload',
        formProgress: user.formProgress,
        applicationStatus: user.loanApplicationStatus,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/auth/form-status (protected) - Get current form completion status
router.get('/form-status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      formProgress: user.formProgress,
      loanApplicationStatus: user.loanApplicationStatus,
      nextStep: !user.formProgress.customerDetailsCompleted
        ? 'customer-details'
        : !user.formProgress.incomeDetailsCompleted
        ? 'income-details'
        : 'document-upload',
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
