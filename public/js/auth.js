// Authentication JavaScript

(function() {
    'use strict';

    const API_BASE = '/api';

    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Initialize
    function init() {
        if (loginForm) {
            setupLoginForm();
        }

        if (registerForm) {
            setupRegisterForm();
        }
    }

    // Setup Login Form
    function setupLoginForm() {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                remember: document.getElementById('remember').checked
            };

            try {
                showLoading(loginForm);
                clearError();

                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Store token
                if (data.token) {
                    localStorage.setItem('authToken', data.token);

                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }

                    // Redirect to dashboard or loan application
                    window.location.href = '/dashboard.html';
                } else {
                    throw new Error('No token received');
                }

            } catch (error) {
                showError(error.message);
            } finally {
                hideLoading(loginForm);
            }
        });
    }

    // Setup Register Form
    function setupRegisterForm() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        // Password validation
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });

        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            const formData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                password: password
            };

            try {
                showLoading(registerForm);
                clearError();

                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                // Store token
                if (data.token) {
                    localStorage.setItem('authToken', data.token);

                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }

                    // Redirect to dashboard or onboarding
                    window.location.href = '/dashboard.html';
                } else {
                    throw new Error('Registration successful but no token received');
                }

            } catch (error) {
                showError(error.message);
            } finally {
                hideLoading(registerForm);
            }
        });
    }

    // Show Error
    function showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    // Clear Error
    function clearError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    // Show Loading
    function showLoading(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Please wait...';
        }
    }

    // Hide Loading
    function hideLoading(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;

            // Restore original text
            if (loginForm && form === loginForm) {
                submitButton.textContent = 'Login';
            } else if (registerForm && form === registerForm) {
                submitButton.textContent = 'Create Account';
            }
        }
    }

    // Check if already authenticated
    function checkAuth() {
        const token = localStorage.getItem('authToken');

        if (token) {
            // User is already logged in, redirect to dashboard
            window.location.href = '/dashboard.html';
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Optional: Check auth on page load (commented out to allow testing)
    // checkAuth();

})();
