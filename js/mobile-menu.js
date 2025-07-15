/**
 * Mobile Menu Handler
 * Manages hamburger menu functionality for narrow devices
 */

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const headerNav = document.getElementById('headerNav');
    const body = document.body;
    
    if (!mobileMenuToggle || !headerNav) return;
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
        const isActive = headerNav.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!headerNav.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking on a nav link
    const navLinks = headerNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }, 250);
    });
    
    function openMobileMenu() {
        headerNav.classList.add('active');
        mobileMenuToggle.classList.add('active');
        mobileMenuToggle.setAttribute('aria-label', '메뉴 닫기');
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.addEventListener('click', closeMobileMenu);
        body.appendChild(overlay);
        
        // Prevent body scroll
        body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        headerNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-label', '메뉴 열기');
        
        // Remove overlay
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Restore body scroll
        body.style.overflow = '';
    }
});