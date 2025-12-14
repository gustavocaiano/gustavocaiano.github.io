// Enhanced JavaScript for modern portfolio site

document.addEventListener('DOMContentLoaded', () => {
    // EmailJS Configuration
    const EMAILJS_CONFIG = {
        publicKey: 'sAyrLoQJ3thC7v3qZ', // Your actual public key
        serviceId: 'service_z2pbjvh', // Replace with the service ID from step 1
        templateId: 'template_gun7e0j' // Replace with the template ID from step 2
    };
    
    // Initialize EmailJS if configured
    let isEmailJSConfigured = false;
    if (EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY' && typeof emailjs !== 'undefined') {
        try {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            isEmailJSConfigured = true;
            console.log('✅ EmailJS initialized successfully');
        } catch (error) {
            console.error('❌ EmailJS initialization failed:', error);
        }
    }
    // Add a subtle fade-in effect on page load
    document.body.classList.add('opacity-100');
    
    // Initialize language system
    initializeLanguage();
    
    // Add current year to footer copyright
    const yearElement = document.querySelector('.copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Enhanced animation for skill cards with staggered timing
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('opacity-100');
            card.classList.remove('opacity-0', 'translate-y-4');
        }, 200 * index);
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced hover effects for contact buttons
    const contactButtons = document.querySelectorAll('a[href^="mailto:"], a[href^="https://github.com"]');
    contactButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Enhanced parallax effect for background particles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const particlesDown = document.querySelectorAll('.particle-down');
        const particlesUp = document.querySelectorAll('.particle-up');
        
        // Original particles move down with scroll
        particlesDown.forEach((particle, index) => {
            const speed = 0.3 + (index * 0.15);
            particle.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        // New side particles move up with scroll (negative direction)
        particlesUp.forEach((particle, index) => {
            const speed = 0.4 + (index * 0.1);
            particle.style.transform = `translateY(${scrolled * -speed}px)`;
        });
    });

    // Add typing effect to the main title (optional enhancement)
    const title = document.querySelector('h1');
    if (title) {
        const originalText = title.textContent;
        title.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < originalText.length) {
                title.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 1000);
    }

    // Add click ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    // Apply ripple effect to contact buttons
    contactButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(94, 234, 212, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Performance optimization: Throttle scroll events
    let ticking = false;
    
    function updateScrollEffects() {
        // Add scroll-based effects here
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const submitText = document.querySelector('.submit-text');
    const loadingText = document.querySelector('.loading-text');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Always prevent default form submission
            
            // Show loading state
            submitBtn.disabled = true;
            submitText.classList.add('hidden');
            loadingText.classList.remove('hidden');
            statusMessage.classList.add('hidden');
            
            // Get form data
            const formData = new FormData(contactForm);
            const templateParams = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                to_name: 'Gustavo Caiano'
            };
            
            // Check if EmailJS is configured
            if (!isEmailJSConfigured) {
                console.error('EmailJS is not configured properly');
                
                // Show configuration error message
                statusMessage.classList.remove('hidden');
                errorMessage.classList.remove('hidden');
                successMessage.classList.add('hidden');
                errorMessage.querySelector('span').textContent = 'EmailJS is not configured yet. Please check the console for setup instructions.';
                
                // Log setup instructions
                console.log(`
🔧 EmailJS Setup Instructions:
1. Go to https://www.emailjs.com/ and create account
2. Set up email service (Gmail, Outlook, etc.)
3. Create email template with variables: firstName, lastName, email, subject, message
4. In EmailJS dashboard → Account → Security:
   - Add allowed domain: gustavocaiano.github.io
   - This prevents unauthorized use of your key
5. Replace in EMAILJS_CONFIG object in script.js:
   - YOUR_PUBLIC_KEY with your public key
   - YOUR_SERVICE_ID with your service ID
   - YOUR_TEMPLATE_ID with your template ID

✅ Security: Public keys are safe in public repos when domain-restricted

Form data for testing:
`, templateParams);
                
                // Reset button state
                submitBtn.disabled = false;
                submitText.classList.remove('hidden');
                loadingText.classList.add('hidden');
                return;
            }
            
            try {
                // Send email using configured EmailJS settings
                await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams);
                
                // Show success message
                statusMessage.classList.remove('hidden');
                successMessage.classList.remove('hidden');
                errorMessage.classList.add('hidden');
                
                // Reset form
                contactForm.reset();
                
                // Hide success message after 8 seconds
                setTimeout(() => {
                    statusMessage.classList.add('hidden');
                }, 8000);
                
            } catch (error) {
                console.error('EmailJS error:', error);
                
                // Show error message
                statusMessage.classList.remove('hidden');
                errorMessage.classList.remove('hidden');  
                successMessage.classList.add('hidden');
                errorMessage.querySelector('span').textContent = 'Failed to send message. Please check EmailJS configuration or try again later.';
                
                // Hide error message after 8 seconds
                setTimeout(() => {
                    statusMessage.classList.add('hidden');
                }, 8000);
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitText.classList.remove('hidden');
                loadingText.classList.add('hidden');
            }
        });
    }
}); 