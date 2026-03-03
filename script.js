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

    // Ensure project links keep visual classes in production caches
    const projectLinks = document.querySelectorAll('.projects-showcase-grid a');
    projectLinks.forEach(link => {
        link.classList.add('projects-showcase-item', 'themed-link', 'themed-link-card', 'is-external');
        if (link.target === '_blank') {
            link.rel = 'noopener noreferrer';
        }
    });

    // Subtle starfield background with no dependency
    const starfieldCanvas = document.getElementById('starfield');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (starfieldCanvas) {
        const context = starfieldCanvas.getContext('2d');
        if (context) {
            const stars = [];
            let animationFrameId;
            let width = 0;
            let height = 0;
            let pixelRatio = 1;

            const random = (min, max) => Math.random() * (max - min) + min;

            const resetStar = (star) => {
                star.x = random(0, width);
                star.y = random(0, height);
                star.radius = random(0.5, 1.6);
                star.alpha = random(0.22, 0.78);
                star.velocity = random(0.02, 0.08);
                star.phase = random(0, Math.PI * 2);
            };

            const populateStars = () => {
                stars.length = 0;
                const starCount = Math.min(180, Math.max(70, Math.floor((width * height) / 14500)));

                for (let index = 0; index < starCount; index += 1) {
                    const star = {};
                    resetStar(star);
                    stars.push(star);
                }
            };

            const resizeStarfield = () => {
                pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                width = window.innerWidth;
                height = window.innerHeight;

                starfieldCanvas.width = Math.floor(width * pixelRatio);
                starfieldCanvas.height = Math.floor(height * pixelRatio);
                starfieldCanvas.style.width = `${width}px`;
                starfieldCanvas.style.height = `${height}px`;
                context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

                populateStars();
            };

            const drawStarfield = (time = 0) => {
                context.clearRect(0, 0, width, height);

                stars.forEach(star => {
                    if (!prefersReducedMotion) {
                        star.y += star.velocity;
                        if (star.y > height + 2) {
                            star.y = -2;
                            star.x = random(0, width);
                        }
                    }

                    const pulse = 0.68 + Math.sin(time * 0.0007 + star.phase) * 0.2;
                    const alpha = Math.max(0.12, Math.min(0.88, star.alpha * pulse));
                    context.beginPath();
                    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                    context.fillStyle = `rgba(127, 208, 255, ${alpha.toFixed(3)})`;
                    context.fill();
                });

                if (!prefersReducedMotion) {
                    animationFrameId = requestAnimationFrame(drawStarfield);
                }
            };

            resizeStarfield();
            drawStarfield();

            window.addEventListener('resize', () => {
                cancelAnimationFrame(animationFrameId);
                resizeStarfield();
                drawStarfield();
            });
        }
    }
    
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

    // Sticky Contact Button Logic
    const stickyBtn = document.getElementById('stickyContactBtn');
    const contactSection = document.getElementById('contactSection');
    
    if (stickyBtn && contactSection) {
        const contactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Hide button when contact section is in view
                    stickyBtn.classList.remove('visible');
                } else {
                    // Show button when scrolled past header but not at contact section
                    if (window.scrollY > 300) {
                        stickyBtn.classList.add('visible');
                    }
                }
            });
        }, { threshold: 0.1 });

        contactObserver.observe(contactSection);

        window.addEventListener('scroll', () => {
            if (window.scrollY <= 300) {
                stickyBtn.classList.remove('visible');
                return;
            }

            const rect = contactSection.getBoundingClientRect();
            const contactIsVisible = rect.top < window.innerHeight && rect.bottom > 0;
            stickyBtn.classList.toggle('visible', !contactIsVisible);
        });
    }

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

    // Subtle hover effects for contact buttons
    const contactButtons = document.querySelectorAll('.social-button, a[href^="mailto:"]');
    contactButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Enhanced parallax effect for background particles
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const particlesDown = document.querySelectorAll('.particle-down');
            const particlesUp = document.querySelectorAll('.particle-up');

            particlesDown.forEach((particle, index) => {
                const speed = 0.12 + (index * 0.08);
                particle.style.transform = `translateY(${scrolled * speed}px)`;
            });

            particlesUp.forEach((particle, index) => {
                const speed = 0.14 + (index * 0.06);
                particle.style.transform = `translateY(${scrolled * -speed}px)`;
            });
        });
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
