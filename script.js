// Enhanced JavaScript for modern portfolio site

document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key
    // Add a subtle fade-in effect on page load
    document.body.classList.add('opacity-100');
    
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

    // Parallax effect for background particles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const particles = document.querySelectorAll('.fixed .absolute');
        
        particles.forEach((particle, index) => {
            const speed = 0.5 + (index * 0.2);
            particle.style.transform = `translateY(${scrolled * speed}px)`;
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
            e.preventDefault();
            
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
            
            try {
                // Replace with your actual EmailJS service ID and template ID
                await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
                
                // Show success message
                statusMessage.classList.remove('hidden');
                successMessage.classList.remove('hidden');
                errorMessage.classList.add('hidden');
                
                // Reset form
                contactForm.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    statusMessage.classList.add('hidden');
                }, 5000);
                
            } catch (error) {
                console.error('EmailJS error:', error);
                
                // Show error message
                statusMessage.classList.remove('hidden');
                errorMessage.classList.remove('hidden');
                successMessage.classList.add('hidden');
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    statusMessage.classList.add('hidden');
                }, 5000);
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitText.classList.remove('hidden');
                loadingText.classList.add('hidden');
            }
        });
    }
}); 