// Oktawave Loan Origination System - Landing Page JavaScript

(function() {
    'use strict';

    // API Base URL
    const API_BASE = '/api';

    // DOM Elements
    const elements = {
        startApplicationBtn: document.getElementById('startApplicationBtn'),
        applyNowBtn: document.getElementById('applyNowBtn'),
        learnMoreBtn: document.getElementById('learnMoreBtn'),
        loginBtn: document.getElementById('loginBtn'),
        faqContainer: document.querySelector('.faq-container'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        currentYear: document.getElementById('currentYear')
    };

    // Initialize
    function init() {
        setCurrentYear();
        setupEventListeners();
        loadFAQs();
        setupSmoothScrolling();
        setupAccessibility();
    }

    // Set current year in footer
    function setCurrentYear() {
        if (elements.currentYear) {
            elements.currentYear.textContent = new Date().getFullYear();
        }
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Application buttons
        if (elements.startApplicationBtn) {
            elements.startApplicationBtn.addEventListener('click', handleStartApplication);
        }

        if (elements.applyNowBtn) {
            elements.applyNowBtn.addEventListener('click', handleStartApplication);
        }

        // Learn more button
        if (elements.learnMoreBtn) {
            elements.learnMoreBtn.addEventListener('click', handleLearnMore);
        }

        // Login button
        if (elements.loginBtn) {
            elements.loginBtn.addEventListener('click', handleLogin);
        }
    }

    // Handle Start Application
    function handleStartApplication(e) {
        e.preventDefault();

        // Check if user is authenticated
        const token = localStorage.getItem('authToken');

        if (token) {
            // User is logged in, redirect to application
            window.location.href = '/api/loan/apply';
        } else {
            // User not logged in, show registration prompt
            const shouldRegister = confirm(
                'To start your loan application, you need to create an account or login.\n\n' +
                'Click OK to register, or Cancel to login with an existing account.'
            );

            if (shouldRegister) {
                window.location.href = '/register.html';
            } else {
                window.location.href = '/login.html';
            }
        }
    }

    // Handle Learn More
    function handleLearnMore(e) {
        e.preventDefault();
        // Smooth scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Handle Login
    function handleLogin(e) {
        e.preventDefault();
        window.location.href = '/login.html';
    }

    // Load FAQs from API
    async function loadFAQs() {
        try {
            showLoading();

            const response = await fetch(`${API_BASE}/landing/content/faq`);

            if (!response.ok) {
                throw new Error('Failed to load FAQs');
            }

            const faqs = await response.json();
            renderFAQs(faqs);

        } catch (error) {
            console.error('Error loading FAQs:', error);
            renderFallbackFAQs();
        } finally {
            hideLoading();
        }
    }

    // Render FAQs
    function renderFAQs(faqs) {
        if (!elements.faqContainer || !Array.isArray(faqs)) {
            return;
        }

        elements.faqContainer.innerHTML = '';

        faqs.forEach((faq, index) => {
            const faqItem = createFAQItem(faq, index);
            elements.faqContainer.appendChild(faqItem);
        });
    }

    // Create FAQ Item
    function createFAQItem(faq, index) {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.setAttribute('role', 'listitem');

        const question = document.createElement('button');
        question.className = 'faq-question';
        question.textContent = faq.question;
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('aria-controls', `faq-answer-${index}`);
        question.id = `faq-question-${index}`;

        const answer = document.createElement('div');
        answer.className = 'faq-answer';
        answer.id = `faq-answer-${index}`;
        answer.setAttribute('aria-labelledby', `faq-question-${index}`);
        answer.textContent = faq.answer;

        // Toggle FAQ
        question.addEventListener('click', function() {
            const isExpanded = this.classList.toggle('active');
            answer.classList.toggle('show');
            this.setAttribute('aria-expanded', isExpanded);
        });

        item.appendChild(question);
        item.appendChild(answer);

        return item;
    }

    // Render Fallback FAQs
    function renderFallbackFAQs() {
        const fallbackFAQs = [
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
        ];

        renderFAQs(fallbackFAQs);
    }

    // Setup Smooth Scrolling
    function setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#"
                if (href === '#') {
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    }

    // Setup Accessibility
    function setupAccessibility() {
        // Keyboard navigation for buttons
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Add skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.setAttribute('tabindex', '-1');
                    mainContent.focus();
                }
            });
        }
    }

    // Show Loading Indicator
    function showLoading() {
        if (elements.loadingIndicator) {
            elements.loadingIndicator.classList.add('show');
            elements.loadingIndicator.setAttribute('aria-hidden', 'false');
        }
    }

    // Hide Loading Indicator
    function hideLoading() {
        if (elements.loadingIndicator) {
            elements.loadingIndicator.classList.remove('show');
            elements.loadingIndicator.setAttribute('aria-hidden', 'true');
        }
    }

    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Performance: Lazy load images (if any are added later)
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img.lazy');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Track user interactions (for analytics)
    function trackInteraction(action, label) {
        // This would integrate with analytics service (Google Analytics, Mixpanel, etc.)
        console.log('Track:', action, label);

        // Example: Send to analytics
        // if (window.gtag) {
        //     gtag('event', action, { event_label: label });
        // }
    }

    // Error boundary
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        // Could send to error tracking service (Sentry, Rollbar, etc.)
    });

    // Handle online/offline status
    window.addEventListener('online', function() {
        console.log('Connection restored');
    });

    window.addEventListener('offline', function() {
        console.log('Connection lost');
        alert('You are currently offline. Some features may not be available.');
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
