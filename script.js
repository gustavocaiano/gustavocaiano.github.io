// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    // Add a subtle fade-in effect on page load
    document.body.classList.add('opacity-100');
    
    // Add current year to footer copyright
    const yearElement = document.querySelector('.copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Simple animation for skill cards
    const cards = document.querySelectorAll('.bg-gray-900');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('opacity-100');
            card.classList.remove('opacity-0', 'translate-y-4');
        }, 100 * index);
    });
}); 