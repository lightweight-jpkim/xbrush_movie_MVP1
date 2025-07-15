/**
 * Mobile Progress Indicator Handler
 * Manages compact progress display for narrow devices
 */

(function() {
    const STEP_LABELS = {
        1: '출연자 선택',
        2: '기본 정보',
        3: '추가 설정',
        4: '톤 & 스타일',
        5: '미리보기',
        6: '이미지 생성',
        7: '결과 확인'
    };
    
    function initializeMobileProgress() {
        const mobileProgress = document.getElementById('mobileProgress');
        const progressSteps = document.getElementById('progress-steps');
        
        if (!mobileProgress || !progressSteps) return;
        
        // Check if mobile view on load
        checkMobileView();
        
        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(checkMobileView, 250);
        });
        
        // Listen for step changes
        observeStepChanges();
    }
    
    function checkMobileView() {
        const mobileProgress = document.getElementById('mobileProgress');
        const progressSteps = document.getElementById('progress-steps');
        
        if (window.innerWidth <= 480) {
            mobileProgress.style.display = 'flex';
            progressSteps.style.display = 'none';
        } else {
            mobileProgress.style.display = 'none';
            progressSteps.style.display = 'flex';
        }
    }
    
    function updateMobileProgress(stepNumber) {
        const currentStepElement = document.getElementById('mobileCurrentStep');
        const stepLabelElement = document.getElementById('mobileStepLabel');
        
        if (currentStepElement) {
            currentStepElement.textContent = stepNumber;
        }
        
        if (stepLabelElement && STEP_LABELS[stepNumber]) {
            stepLabelElement.textContent = STEP_LABELS[stepNumber];
        }
    }
    
    function observeStepChanges() {
        // Watch for active step changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const activeStep = document.querySelector('.step.active');
                    if (activeStep) {
                        const stepNumber = parseInt(activeStep.getAttribute('data-step'));
                        updateMobileProgress(stepNumber);
                    }
                }
            });
        });
        
        // Observe all steps
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            observer.observe(step, { attributes: true });
        });
        
        // Set initial state
        const activeStep = document.querySelector('.step.active');
        if (activeStep) {
            const stepNumber = parseInt(activeStep.getAttribute('data-step'));
            updateMobileProgress(stepNumber);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMobileProgress);
    } else {
        initializeMobileProgress();
    }
})();