const express = require('express');

const router = express.Router();

// GET / - Loan Origination System Landing Page
router.get('/', (req, res) => {
  res.json({
    title: 'Oktawave Loan Origination System',
    tagline: 'Your trusted partner for fast and reliable loan applications',
    branding: {
      colors: {
        primary: '#003366',
        secondary: '#0066CC',
        accent: '#FF6600',
        background: '#F5F5F5',
        text: '#333333'
      },
      typography: {
        primaryFont: 'Open Sans, sans-serif',
        headingFont: 'Roboto, sans-serif'
      }
    },
    sections: [
      {
        id: 'hero',
        type: 'hero',
        heading: 'Get Your Loan Approved in Minutes',
        subheading: 'Fast, secure, and transparent loan processing',
        callToAction: {
          text: 'Start Your Application',
          link: '/api/loan/apply',
          buttonStyle: 'primary'
        }
      },
      {
        id: 'features',
        type: 'features',
        heading: 'Why Choose Oktawave?',
        items: [
          {
            icon: 'speed',
            title: 'Quick Approval',
            description: 'Get loan decisions in as fast as 24 hours'
          },
          {
            icon: 'security',
            title: 'Secure & Safe',
            description: 'Bank-grade encryption protects your data'
          },
          {
            icon: 'transparency',
            title: 'Transparent Terms',
            description: 'No hidden fees, clear terms and conditions'
          },
          {
            icon: 'support',
            title: '24/7 Support',
            description: 'Expert assistance whenever you need it'
          }
        ]
      },
      {
        id: 'how-it-works',
        type: 'process',
        heading: 'How It Works',
        steps: [
          {
            step: 1,
            title: 'Create Account',
            description: 'Sign up in seconds with your basic information'
          },
          {
            step: 2,
            title: 'Complete Application',
            description: 'Fill out our simple loan application form'
          },
          {
            step: 3,
            title: 'Get Approved',
            description: 'Receive instant decision on your loan request'
          },
          {
            step: 4,
            title: 'Receive Funds',
            description: 'Get your funds deposited directly to your account'
          }
        ]
      },
      {
        id: 'cta-secondary',
        type: 'cta',
        heading: 'Ready to Get Started?',
        description: 'Join thousands of satisfied customers who trust Oktawave for their financing needs',
        buttons: [
          {
            text: 'Apply Now',
            link: '/api/loan/apply',
            style: 'primary'
          },
          {
            text: 'Learn More',
            link: '/api/loan/info',
            style: 'secondary'
          }
        ]
      }
    ],
    footer: {
      companyName: 'Oktawave Financial Services',
      tagline: 'Empowering your financial future',
      links: [
        { text: 'About Us', link: '/api/about' },
        { text: 'Contact', link: '/api/contact' },
        { text: 'Terms & Conditions', link: '/api/terms' },
        { text: 'Privacy Policy', link: '/api/privacy' }
      ],
      copyright: `© ${new Date().getFullYear()} Oktawave. All rights reserved.`
    },
    meta: {
      description: 'Oktawave Loan Origination System - Fast, secure, and transparent loan processing',
      keywords: 'loan, origination, financing, personal loan, business loan, Oktawave',
      apiVersion: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// GET /content - Get specific landing page content sections
router.get('/content/:section', (req, res) => {
  const { section } = req.params;

  const sections = {
    branding: {
      colors: {
        primary: '#003366',
        secondary: '#0066CC',
        accent: '#FF6600',
        background: '#F5F5F5',
        text: '#333333'
      },
      typography: {
        primaryFont: 'Open Sans, sans-serif',
        headingFont: 'Roboto, sans-serif'
      },
      logo: {
        primary: '/assets/logo-oktawave.svg',
        white: '/assets/logo-oktawave-white.svg',
        icon: '/assets/icon-oktawave.svg'
      }
    },
    testimonials: [
      {
        id: 1,
        name: 'John Doe',
        role: 'Small Business Owner',
        rating: 5,
        text: 'Oktawave made the loan process incredibly easy. I got approved in less than 24 hours!'
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'Entrepreneur',
        rating: 5,
        text: 'Fast, professional, and transparent. Highly recommend Oktawave for business financing.'
      }
    ],
    faq: [
      {
        question: 'How long does the approval process take?',
        answer: 'Most applications are reviewed within 24-48 hours. You will receive an email notification once a decision is made.'
      },
      {
        question: 'What documents do I need?',
        answer: 'You will need a valid ID, proof of income, and bank statements for the last 3 months.'
      },
      {
        question: 'What are the interest rates?',
        answer: 'Interest rates vary based on your credit score and loan amount. Rates start from 5.99% APR.'
      }
    ]
  };

  if (sections[section]) {
    res.json(sections[section]);
  } else {
    res.status(404).json({ message: 'Section not found' });
  }
});

module.exports = router;
