// shared.js - Shared functionality for all pages

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu (Hamburger) Logic ---
    const hamburgerButton = document.getElementById('hamburger-button');
    const hamburgerOpenIcon = document.getElementById('hamburger-open-icon');
    const hamburgerCloseIcon = document.getElementById('hamburger-close-icon');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            hamburgerOpenIcon.classList.toggle('hidden');
            hamburgerCloseIcon.classList.toggle('hidden');
        });
    }
});

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => { console.log('Service Worker registered with scope:', registration.scope); })
            .catch(error => { console.error('Service Worker registration failed:', error); });
    });
}
