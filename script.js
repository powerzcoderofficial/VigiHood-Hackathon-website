// === script.js ===

document.addEventListener('DOMContentLoaded', function() {
    // --- Global Elements ---
    const body = document.body;
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const nav = document.getElementById('main-nav');
    const signoutLink = document.getElementById('signout-link');
    const toastElement = document.getElementById('toast');
    const toastTitleEl = document.getElementById('toast-title');
    const toastMessageEl = document.getElementById('toast-message');
    const toastIconEl = toastElement ? toastElement.querySelector('i') : null;

    // --- Update Current Year ---
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // --- Mobile Menu Toggle ---
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = nav.classList.toggle('mobile-menu-open');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
            body.classList.toggle('no-scroll', isOpen);
            mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('mobile-menu-open')) {
                    nav.classList.remove('mobile-menu-open');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    body.classList.remove('no-scroll');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }

    // --- Global Toast Notification Function ---
    window.showToast = function(title, message, type = 'success') { // 'success', 'error', 'info'
        if (!toastElement || !toastTitleEl || !toastMessageEl || !toastIconEl) return;

        toastTitleEl.textContent = title;
        toastMessageEl.textContent = message;
        toastElement.classList.remove('success', 'error', 'info'); // Clear previous types

        let iconClass = 'fa-check-circle';
        let borderColor = '#22c55e'; // Success green

        if (type === 'error') {
            iconClass = 'fa-exclamation-circle';
            borderColor = 'var(--accent)'; // Your accent color for error
        } else if (type === 'info') {
            iconClass = 'fa-info-circle';
            borderColor = 'var(--primary-light)'; // A blue for info
        }
        
        toastIconEl.className = `fas ${iconClass}`;
        toastElement.style.borderColor = borderColor;
        toastIconEl.style.color = borderColor;


        toastElement.classList.add('show', type);
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 5000);
    }


    // --- Simulated Authentication ---
    function isLoggedIn() {
        return !!localStorage.getItem('currentUserToken');
    }

    window.updateAuthUI = function() {
        if (isLoggedIn()) {
            body.classList.remove('logged-out');
            body.classList.add('logged-in');
        } else {
            body.classList.remove('logged-in');
            body.classList.add('logged-out');
        }
        // Dispatch a custom event that other page-specific scripts can listen to
        document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: isLoggedIn() } }));
    }

    function signOut() {
        localStorage.removeItem('currentUserToken');
        localStorage.removeItem('currentUser');
        updateAuthUI();
        showToast('Signed Out', 'You have been successfully signed out.', 'info');
        // Redirect to home or signin page after a short delay
        setTimeout(() => {
            if (body.classList.contains('protected-page')) {
                 window.location.href = 'signin.html'; // If on protected, redirect to signin
            } else {
                 window.location.href = 'index.html'; // Else, redirect to home
            }
        }, 1000);
    }

    if (signoutLink) {
        signoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            signOut();
        });
    }

    // --- Protected Route Handling (Frontend Simulation) ---
    function protectRoute() {
        if (body.classList.contains('protected-page') && !isLoggedIn()) {
            // Store the intended destination to redirect after login
            localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
            showToast('Access Denied', 'Please sign in to view this page.', 'error');
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 1500);
        } else if ( (window.location.pathname.includes('signin.html') || window.location.pathname.includes('signup.html')) && isLoggedIn()) {
            // If logged in and on signin/signup, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }
    
    // --- Active Nav Link ---
    function setActiveNavLink() {
        const currentLocation = window.location.pathname;
        nav.querySelectorAll('ul li a').forEach(link => {
            link.classList.remove('active');
            // Handle index.html specifically
            if (currentLocation === '/' || currentLocation.endsWith('index.html')) {
                if (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === './') {
                    link.classList.add('active');
                }
            } else if (link.getAttribute('href').endsWith(currentLocation.substring(currentLocation.lastIndexOf('/') + 1))) {
                 link.classList.add('active');
            }
        });
    }


    // --- Initial Calls ---
    updateAuthUI();   // Set initial auth state on UI
    protectRoute();   // Check if current page needs protection
    setActiveNavLink(); // Set active nav link based on current page
    
    // Optional: Redirect after login if 'redirectAfterLogin' is set
    const redirectTarget = localStorage.getItem('redirectAfterLogin');
    if (isLoggedIn() && redirectTarget) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectTarget;
    }

});