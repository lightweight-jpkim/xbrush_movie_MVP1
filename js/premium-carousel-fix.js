// Premium Carousel Arrow Fix
// This ensures arrow buttons work immediately on page load

document.addEventListener('DOMContentLoaded', function() {
    // Function to attach arrow button handlers
    function attachArrowHandlers() {
        const prevBtn = document.querySelector('.premium-carousel-nav.prev');
        const nextBtn = document.querySelector('.premium-carousel-nav.next');
        
        if (prevBtn && !prevBtn.hasAttribute('data-listener-attached')) {
            prevBtn.setAttribute('data-listener-attached', 'true');
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Premium carousel: Previous button clicked');
                
                const carousel = document.getElementById('premiumModelsCarousel');
                if (carousel) {
                    const scrollAmount = 240 * 3; // 3 cards width
                    carousel.scrollTo({
                        left: carousel.scrollLeft - scrollAmount,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
        if (nextBtn && !nextBtn.hasAttribute('data-listener-attached')) {
            nextBtn.setAttribute('data-listener-attached', 'true');
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Premium carousel: Next button clicked');
                
                const carousel = document.getElementById('premiumModelsCarousel');
                if (carousel) {
                    const scrollAmount = 240 * 3; // 3 cards width
                    carousel.scrollTo({
                        left: carousel.scrollLeft + scrollAmount,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }
    
    // Try to attach handlers immediately
    attachArrowHandlers();
    
    // Also try after a delay in case elements are added dynamically
    setTimeout(attachArrowHandlers, 500);
    setTimeout(attachArrowHandlers, 1000);
    setTimeout(attachArrowHandlers, 2000);
    
    // Watch for changes to the DOM in case buttons are added later
    const observer = new MutationObserver(function(mutations) {
        if (document.querySelector('.premium-carousel-nav')) {
            attachArrowHandlers();
        }
    });
    
    // Start observing
    const premiumSection = document.getElementById('premiumModelsSection');
    if (premiumSection) {
        observer.observe(premiumSection, {
            childList: true,
            subtree: true
        });
    }
});