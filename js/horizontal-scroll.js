/**
 * Horizontal Scroll Enhancement for Mobile
 * Adds smooth scrolling and touch gestures to model grids
 */

(function() {
    function initializeHorizontalScroll() {
        // Only apply on mobile
        if (window.innerWidth > 480) return;
        
        const scrollContainers = [
            document.querySelector('.featured-models-grid'),
            document.getElementById('celebrityModelsGrid'),
            ...document.querySelectorAll('.card-grid')
        ];
        
        scrollContainers.forEach(container => {
            if (!container) return;
            
            let isDown = false;
            let startX;
            let scrollLeft;
            
            // Mouse events for testing on desktop
            container.addEventListener('mousedown', (e) => {
                isDown = true;
                container.style.cursor = 'grabbing';
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            });
            
            container.addEventListener('mouseleave', () => {
                isDown = false;
                container.style.cursor = 'grab';
            });
            
            container.addEventListener('mouseup', () => {
                isDown = false;
                container.style.cursor = 'grab';
            });
            
            container.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed
                container.scrollLeft = scrollLeft - walk;
            });
            
            // Touch events for mobile
            let touchStartX = 0;
            let touchScrollLeft = 0;
            
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].pageX;
                touchScrollLeft = container.scrollLeft;
            }, { passive: true });
            
            container.addEventListener('touchmove', (e) => {
                const touchX = e.touches[0].pageX;
                const walk = (touchStartX - touchX) * 1.5;
                container.scrollLeft = touchScrollLeft + walk;
            }, { passive: true });
            
            // Add momentum scrolling
            let velocity = 0;
            let lastScrollLeft = container.scrollLeft;
            let rafId;
            
            function momentumScroll() {
                velocity *= 0.95; // Friction
                
                if (Math.abs(velocity) > 0.5) {
                    container.scrollLeft += velocity;
                    rafId = requestAnimationFrame(momentumScroll);
                }
            }
            
            container.addEventListener('touchend', () => {
                velocity = container.scrollLeft - lastScrollLeft;
                lastScrollLeft = container.scrollLeft;
                
                cancelAnimationFrame(rafId);
                momentumScroll();
            });
            
            // Update scroll position on scroll
            container.addEventListener('scroll', () => {
                lastScrollLeft = container.scrollLeft;
            });
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHorizontalScroll);
    } else {
        initializeHorizontalScroll();
    }
    
    // Reinitialize on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initializeHorizontalScroll, 250);
    });
})();