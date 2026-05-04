const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/loan/landing - Landing page data
router.get('/landing', (req, res) => {
  res.json({
    title: 'Oktawave Loan Origination System',
    description: 'Welcome to our loan application system. Get started with your loan application today.',
    branding: {
      primaryColor: '#2DB5DA',
      secondaryColor: '#939598',
      typography: {
        primary: 'Proxima Nova',
        secondary: 'Montserrat',
      },
    },
    callToAction: {
      text: 'Start Your Application',
      endpoint: '/api/loan/customer-details',
    },
  });
});

// POST /api/loan/customer-details - Submit customer details form
router.post(
  '/customer-details',
  authMiddleware,
  [
    body('dateOfBirth')
      .notEmpty()
      .withMessage('Date of birth is required')
      .isISO8601()
      .withMessage('Valid date is required'),
    body('fatherName')
      .trim()
      .notEmpty()
      .withMessage("Father's name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Father's name must be between 2 and 100 characters"),
    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('address.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('address.state')
      .trim()
      .notEmpty()
      .withMessage('State is required'),
    body('address.zipCode')
      .trim()
      .notEmpty()
      .withMessage('Zip code is required')
      .matches(/^[0-9]{5,6}$/)
      .withMessage('Valid zip code is required'),
    body('address.country')
      .trim()
      .notEmpty()
      .withMessage('Country is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { dateOfBirth, fatherName, address } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.customerDetails = {
        dateOfBirth: new Date(dateOfBirth),
        fatherName,
        address,
        customerDetailsCompleted: true,
      };
      user.loanApplicationStatus = 'customer_details_submitted';

      await user.save();

      res.status(200).json({
        message: 'Customer details submitted successfully',
        nextStep: {
          action: 'proceed_to_income_details',
          endpoint: '/api/loan/income-details',
          description: 'Please provide your income details to continue',
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          loanApplicationStatus: user.loanApplicationStatus,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// POST /api/loan/income-details - Submit income details form
router.post(
  '/income-details',
  authMiddleware,
  [
    body('employmentType')
      .notEmpty()
      .withMessage('Employment type is required')
      .isIn(['employed', 'self-employed', 'unemployed', 'retired'])
      .withMessage('Valid employment type is required'),
    body('employer')
      .if(body('employmentType').isIn(['employed', 'self-employed']))
      .trim()
      .notEmpty()
      .withMessage('Employer is required for employed/self-employed'),
    body('monthlyIncome')
      .notEmpty()
      .withMessage('Monthly income is required')
      .isFloat({ min: 0 })
      .withMessage('Monthly income must be a positive number'),
    body('additionalIncome')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Additional income must be a positive number'),
    body('yearsEmployed')
      .if(body('employmentType').isIn(['employed', 'self-employed']))
      .notEmpty()
      .withMessage('Years employed is required')
      .isFloat({ min: 0 })
      .withMessage('Years employed must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { employmentType, employer, monthlyIncome, additionalIncome, yearsEmployed } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.customerDetails?.customerDetailsCompleted) {
        return res.status(400).json({
          message: 'Please complete customer details first',
          nextStep: '/api/loan/customer-details',
        });
      }

      user.incomeDetails = {
        employmentType,
        employer: employer || '',
        monthlyIncome: parseFloat(monthlyIncome),
        additionalIncome: additionalIncome ? parseFloat(additionalIncome) : 0,
        yearsEmployed: yearsEmployed ? parseFloat(yearsEmployed) : 0,
        incomeDetailsCompleted: true,
      };
      user.loanApplicationStatus = 'income_details_submitted';

      await user.save();

      const totalIncome = user.incomeDetails.monthlyIncome + user.incomeDetails.additionalIncome;
      const loanDecision = determineLoanDecision(totalIncome, user.incomeDetails.yearsEmployed);

      if (loanDecision.approved) {
        user.loanApplicationStatus = 'approved';
        await user.save();
      } else {
        user.loanApplicationStatus = 'under_review';
        await user.save();
      }

      res.status(200).json({
        message: 'Income details submitted successfully',
        loanDecision,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          loanApplicationStatus: user.loanApplicationStatus,
        },
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// GET /api/loan/application-status - Get current application status
router.get('/application-status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const response = {
      loanApplicationStatus: user.loanApplicationStatus,
      customerDetailsCompleted: user.customerDetails?.customerDetailsCompleted || false,
      incomeDetailsCompleted: user.incomeDetails?.incomeDetailsCompleted || false,
    };

    if (!response.customerDetailsCompleted) {
      response.nextStep = {
        action: 'complete_customer_details',
        endpoint: '/api/loan/customer-details',
      };
    } else if (!response.incomeDetailsCompleted) {
      response.nextStep = {
        action: 'complete_income_details',
        endpoint: '/api/loan/income-details',
      };
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

function determineLoanDecision(totalIncome, yearsEmployed) {
  const minimumIncome = 3000;
  const minimumYearsEmployed = 1;

  if (totalIncome >= minimumIncome && yearsEmployed >= minimumYearsEmployed) {
    return {
      approved: true,
      message: 'Congratulations! Your loan application has been approved.',
      approvedAmount: Math.min(totalIncome * 10, 50000),
      interestRate: 5.5,
    };
  }

  return {
    approved: false,
    message: 'Your loan application is under review. We will contact you shortly.',
    reason: totalIncome < minimumIncome
      ? 'Income below minimum requirement'
      : 'Employment duration below minimum requirement',
  };
}

module.exports = router;
