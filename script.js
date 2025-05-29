document.addEventListener('DOMContentLoaded', () => {
    // ... (keep all existing JS code from previous version) ...
    const nav = document.querySelector('nav');
    const navLinksContainer = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    const form = document.getElementById('issue-form');
    const formStatus = document.getElementById('form-status');
    const fileNameDisplay = document.getElementById('file-name-display');
    const attachmentInput = document.getElementById('attachment');
    const themeToggle = document.getElementById('theme-toggle'); // Get the theme toggle checkbox

    // --- THEME SWITCHER LOGIC ---
    const currentTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;

    if (currentTheme) {
        htmlElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeToggle.checked = false; // Dark theme means toggle is "off" (moon visible)
        } else {
            themeToggle.checked = true; // Light theme means toggle is "on" (sun visible)
        }
    } else { // Default to light if no preference stored
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', function() {
        if (this.checked) { // Light mode
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else { // Dark mode
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });


    // --- Navbar Scroll & Mobile Toggle ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    burger.addEventListener('click', () => {
        navLinksContainer.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        if (navLinksContainer.classList.contains('nav-active')) {
            document.querySelectorAll('.nav-links li').forEach((li, index) => {
                li.style.opacity = '0';
                li.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.2}s`;
            });
        } else {
            document.querySelectorAll('.nav-links li').forEach(li => {
                li.style.animation = '';
            });
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('nav-active')) {
                navLinksContainer.classList.remove('nav-active');
                burger.classList.remove('toggle');
                 document.querySelectorAll('.nav-links li').forEach(li => {
                    li.style.animation = '';
                });
            }
        });
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    async function loadContent() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const featuresGrid = document.querySelector('.features-grid');
            if (featuresGrid && data.features) {
                featuresGrid.innerHTML = '';
                data.features.forEach((feature, index) => {
                    const card = document.createElement('div');
                    card.classList.add('feature-card', 'fade-in', 'animated-border');
                    card.style.transitionDelay = `${index * 0.1}s`;
                    card.innerHTML = `
                        <div class="icon"><i class="${feature.icon}"></i></div>
                        <h3>${feature.title}</h3>
                        <p class="text-to-reveal-dynamic">${feature.description}</p>
                    `;
                    featuresGrid.appendChild(card);
                });
            }

            const issueTypeSelect = document.getElementById('issue-type');
            if (issueTypeSelect && data.issueTypes) {
                while (issueTypeSelect.options.length > 1) issueTypeSelect.remove(1);
                data.issueTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.toLowerCase().replace(/\s+/g, '-');
                    option.textContent = type;
                    issueTypeSelect.appendChild(option);
                });
            }

            const testimonialsSlider = document.querySelector('.testimonials-slider');
            if (testimonialsSlider && data.testimonials) {
                testimonialsSlider.innerHTML = '';
                data.testimonials.forEach((testimonial, index) => {
                    const card = document.createElement('div');
                    card.classList.add('testimonial-card', 'fade-in');
                    card.style.transitionDelay = `${index * 0.15}s`;
                    card.innerHTML = `
                        <p class="text-to-reveal-dynamic">"${testimonial.quote}"</p>
                        <p>- ${testimonial.author}</p>
                    `;
                    testimonialsSlider.appendChild(card);
                });
            }
            
            setupIntersectionObserver();

        } catch (error) {
            console.error("Could not load dynamic content:", error);
        }
    }
    loadContent();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Submitting...';
            formStatus.className = 'form-status-message';
            await new Promise(resolve => setTimeout(resolve, 1500));
            formStatus.textContent = 'Report submitted successfully! We will be in touch.';
            formStatus.classList.add('success');
            form.reset();
            fileNameDisplay.textContent = '';
            setTimeout(() => { formStatus.textContent = ''; }, 5000);
        });
    }

    if (attachmentInput) {
        attachmentInput.addEventListener('change', function() {
            fileNameDisplay.textContent = this.files && this.files.length > 0 ? this.files[0].name : '';
        });
    }

    function applyTextReveal(element) {
        if (element.dataset.revealed) return;
        const text = element.textContent.trim();
        element.innerHTML = '';
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.className = 'text-reveal-char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${index * 0.025}s`;
            element.appendChild(span);
        });
        element.dataset.revealed = true;
    }

    function setupIntersectionObserver() {
        const elementsToObserve = document.querySelectorAll('.fade-in, h2, .text-to-reveal-static, .text-to-reveal-dynamic, .hero-h1-glow'); // Added hero h1 to observer
        
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (entry.target.classList.contains('text-to-reveal-static') || entry.target.classList.contains('text-to-reveal-dynamic')) {
                        applyTextReveal(entry.target);
                    }
                    if (!entry.target.classList.contains('text-to-reveal-static') && !entry.target.classList.contains('text-to-reveal-dynamic') || entry.target.dataset.revealed || entry.target.classList.contains('hero-h1-glow')) {
                        obs.unobserve(entry.target);
                    } else if (entry.target.dataset.revealed) {
                        obs.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.1 });

        elementsToObserve.forEach(el => observer.observe(el));
    }
});