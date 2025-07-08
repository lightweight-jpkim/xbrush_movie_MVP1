// ========================================
// xBrush Video Creation Application
// ========================================

/**
 * Main application class for video creation workflow
 */
class VideoCreationApp {
    constructor() {
        this.dataService = new DataService();
        this.uiController = new UIController();
        this.stepManager = new StepManager(this.dataService, this.uiController);
        this.domCache = new DOMCache();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            this.setupEventListeners();
            this.stepManager.updateProgressLine();
            this.loadModelImages();
            this.setupFormValidation();
            
            showToast('애플리케이션이 시작되었습니다.', 'success');
        } catch (error) {
            handleError(error, 'Application initialization');
        }
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        try {
            // Step navigation click events
            const steps = this.domCache.get('progress-steps', () => 
                safeGetElements('.step')
            );
            
            steps.forEach(step => {
                safeAddEventListener(step, 'click', (e) => {
                    const stepNumber = parseInt(step.getAttribute('data-step'));
                    this.handleStepClick(stepNumber);
                });
            });

            // Window resize handler
            safeAddEventListener(window, 'resize', 
                throttle(() => this.handleResize(), 300)
            );

        } catch (error) {
            handleError(error, 'Event listener setup');
        }
    }

    /**
     * Handle step navigation clicks
     */
    handleStepClick(stepNumber) {
        try {
            const currentStep = this.stepManager.getCurrentStep();
            
            // Prevent going back after image generation (step 6)
            if (currentStep >= STEPS.VIDEO_CREATION && stepNumber < currentStep) {
                showToast('⚠️ 이미지 생성 이후에는 이전 단계로 돌아갈 수 없습니다.', 'warning');
                return;
            }
            
            this.stepManager.goToStep(stepNumber);
        } catch (error) {
            handleError(error, 'Step navigation');
        }
    }

    /**
     * Set up form validation for input fields
     */
    setupFormValidation() {
        try {
            const inputs = ['productName', 'targetAudience', 'coreMessage', 'tone'];
            
            inputs.forEach(inputId => {
                const element = safeGetElement(inputId);
                if (element) {
                    const debouncedHandler = debounce((e) => {
                        const value = sanitizeInput(e.target.value);
                        this.dataService.updateField(inputId, value);
                        this.stepManager.checkNextButton();
                    }, 300);

                    safeAddEventListener(element, 'input', debouncedHandler);
                    safeAddEventListener(element, 'change', debouncedHandler);
                }
            });
        } catch (error) {
            handleError(error, 'Form validation setup');
        }
    }

    /**
     * Load model images from configuration
     */
    loadModelImages() {
        try {
            const modelElements = this.domCache.get('model-images', () => 
                safeGetElements('.model-image')
            );
            
            modelElements.forEach(element => {
                const modelId = element.getAttribute('data-model');
                if (MODEL_IMAGES[modelId] && isValidUrl(MODEL_IMAGES[modelId])) {
                    element.style.backgroundImage = `url('${MODEL_IMAGES[modelId]}')`;
                } else {
                    console.warn(`Invalid or missing image for model: ${modelId}`);
                }
            });
        } catch (error) {
            handleError(error, 'Model image loading');
        }
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        try {
            // Clear DOM cache on resize to ensure responsive behavior
            this.domCache.clear();
            this.stepManager.updateProgressLine();
        } catch (error) {
            handleError(error, 'Window resize handling');
        }
    }
}

/**
 * Data service class for managing application state
 */
class DataService {
    constructor() {
        this.selectedData = {
            model: null,
            modelTier: null,
            productName: '',
            targetAudience: '',
            coreMessage: '',
            tone: '',
            format: null,
            duration: null,
            style: null,
            scenarioApproved: false,
            selectedImages: {
                cut1: null,
                cut2: null,
                cut3: null
            },
            videoCreated: false,
            hasChosenImagePreview: false,
            skipImagePreview: false,
            selectedVideoCuts: {}
        };
    }

    /**
     * Update a field in the selected data
     */
    updateField(field, value) {
        try {
            if (this.selectedData.hasOwnProperty(field)) {
                this.selectedData[field] = value;
            } else {
                console.warn(`Unknown field: ${field}`);
            }
        } catch (error) {
            handleError(error, 'Data field update');
        }
    }

    /**
     * Get the current data
     */
    getData() {
        return { ...this.selectedData }; // Return a copy
    }

    /**
     * Check if a step is completed
     */
    isStepCompleted(step) {
        try {
            switch(step) {
                case STEPS.MODEL_SELECTION: 
                    return this.selectedData.model !== null;
                case STEPS.BASIC_INFO: 
                    return this.selectedData.productName !== '' && 
                           this.selectedData.targetAudience !== '' && 
                           this.selectedData.coreMessage !== '' && 
                           this.selectedData.tone !== '';
                case STEPS.FORMAT_SELECTION: 
                    return this.selectedData.format !== null && 
                           this.selectedData.duration !== null;
                case STEPS.STYLE_SELECTION: 
                    return this.selectedData.style !== null;
                case STEPS.SCENARIO_REVIEW: 
                    return this.selectedData.scenarioApproved === true;
                case STEPS.VIDEO_CREATION: 
                    return this.selectedData.videoCreated === true;
                case STEPS.RESULTS: 
                    return true;
                default: 
                    return false;
            }
        } catch (error) {
            handleError(error, 'Step completion check');
            return false;
        }
    }

    /**
     * Reset all data to initial state
     */
    reset() {
        try {
            this.selectedData = {
                model: null,
                modelTier: null,
                productName: '',
                targetAudience: '',
                coreMessage: '',
                tone: '',
                format: null,
                duration: null,
                style: null,
                scenarioApproved: false,
                selectedImages: {
                    cut1: null,
                    cut2: null,
                    cut3: null
                },
                videoCreated: false,
                hasChosenImagePreview: false,
                skipImagePreview: false,
                selectedVideoCuts: {}
            };
        } catch (error) {
            handleError(error, 'Data reset');
        }
    }
}

/**
 * UI Controller class for DOM manipulation
 */
class UIController {
    constructor() {
        this.domCache = new DOMCache();
    }

    /**
     * Safely update element content
     */
    updateElement(elementId, content, isHTML = false) {
        try {
            const element = safeGetElement(elementId);
            safeUpdateElement(element, content, isHTML);
        } catch (error) {
            handleError(error, 'Element update');
        }
    }

    /**
     * Show or hide an element
     */
    toggleElement(elementId, show) {
        try {
            const element = safeGetElement(elementId);
            if (element) {
                element.style.display = show ? 'block' : 'none';
            }
        } catch (error) {
            handleError(error, 'Element toggle');
        }
    }

    /**
     * Add or remove CSS classes safely
     */
    toggleClass(elementId, className, add) {
        try {
            const element = safeGetElement(elementId);
            if (element) {
                if (add) {
                    element.classList.add(className);
                } else {
                    element.classList.remove(className);
                }
            }
        } catch (error) {
            handleError(error, 'Class toggle');
        }
    }

    /**
     * Clear selections in a container
     */
    clearSelections(containerSelector) {
        try {
            const cards = safeGetElements(`${containerSelector} .card`);
            cards.forEach(card => {
                card.classList.remove('selected');
            });
        } catch (error) {
            handleError(error, 'Selection clearing');
        }
    }

    /**
     * Update button state
     */
    updateButtonState(buttonId, enabled) {
        try {
            const button = safeGetElement(buttonId);
            if (button) {
                button.disabled = !enabled;
                
                if (enabled) {
                    button.classList.remove('btn-disabled');
                    button.classList.add('btn-primary');
                } else {
                    button.classList.add('btn-disabled');
                    button.classList.remove('btn-primary');
                }
            }
        } catch (error) {
            handleError(error, 'Button state update');
        }
    }

    /**
     * Update progress bar
     */
    updateProgress(percentage, status = '') {
        try {
            const progressBar = safeGetElement('progressBar');
            const progressPercentage = safeGetElement('progressPercentage');
            const progressStatus = safeGetElement('progressStatus');

            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(percentage)}%`;
            }
            if (progressStatus && status) {
                progressStatus.textContent = status;
            }
        } catch (error) {
            handleError(error, 'Progress update');
        }
    }
}

/**
 * Step Manager class for handling navigation and flow
 */
class StepManager {
    constructor(dataService, uiController) {
        this.dataService = dataService;
        this.uiController = uiController;
        this.currentStep = 1;
    }

    /**
     * Navigate to a specific step
     */
    goToStep(step) {
        try {
            // Validate step number
            if (step < 1 || step > STEPS.TOTAL) {
                console.warn(`Invalid step number: ${step}`);
                return;
            }

            // Check if previous steps are completed
            if (step > 1 && !this.dataService.isStepCompleted(step - 1)) {
                showToast('이전 단계를 먼저 완료해주세요.', 'warning');
                return;
            }

            // Deactivate current step
            this.uiController.toggleClass(`step${this.currentStep}`, 'active', false);
            this.uiController.toggleClass(`[data-step="${this.currentStep}"]`, 'active', false);

            // Activate new step
            this.currentStep = step;
            this.uiController.toggleClass(`step${this.currentStep}`, 'active', true);
            
            const stepNav = document.querySelector(`[data-step="${this.currentStep}"]`);
            if (stepNav) {
                stepNav.classList.add('active');
            }

            // Mark completed steps
            for (let i = 1; i < this.currentStep; i++) {
                const stepNav = document.querySelector(`[data-step="${i}"]`);
                if (stepNav) {
                    stepNav.classList.add('completed');
                    stepNav.classList.remove('active');
                }
            }

            // Update progress line
            this.updateProgressLine();

            // Handle step-specific actions
            this.handleStepEntry(step);

        } catch (error) {
            handleError(error, 'Step navigation');
        }
    }

    /**
     * Handle step-specific entry actions
     */
    handleStepEntry(step) {
        try {
            switch(step) {
                case STEPS.VIDEO_CREATION:
                    // Auto-start video creation
                    setTimeout(() => {
                        this.startAutomaticVideoCreation();
                    }, 500);
                    break;
                case STEPS.RESULTS:
                    this.updateFinalInfo();
                    break;
            }

            // Update previous button state
            this.updatePrevButtonState();
        } catch (error) {
            handleError(error, 'Step entry handling');
        }
    }

    /**
     * Move to next step
     */
    nextStep() {
        try {
            if (this.currentStep < STEPS.TOTAL) {
                this.goToStep(this.currentStep + 1);
            }
        } catch (error) {
            handleError(error, 'Next step navigation');
        }
    }

    /**
     * Move to previous step
     */
    prevStep() {
        try {
            // Restrict going back after step 6
            if (this.currentStep >= STEPS.VIDEO_CREATION) {
                showToast('⚠️ 이미지 생성 이후에는 이전 단계로 돌아갈 수 없습니다.', 'warning');
                return;
            }

            if (this.currentStep > 1) {
                this.goToStep(this.currentStep - 1);
            }
        } catch (error) {
            handleError(error, 'Previous step navigation');
        }
    }

    /**
     * Get current step number
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * Update progress line visual
     */
    updateProgressLine() {
        try {
            const progressLine = safeGetElement('progressLine');
            if (progressLine) {
                const progress = ((this.currentStep - 1) / (STEPS.TOTAL - 1)) * 100;
                progressLine.style.width = `${progress}%`;
            }
        } catch (error) {
            handleError(error, 'Progress line update');
        }
    }

    /**
     * Check and update next button state
     */
    checkNextButton() {
        try {
            const isCompleted = this.dataService.isStepCompleted(this.currentStep);
            const nextButton = safeGetElement(`step${this.currentStep}Next`);
            
            if (nextButton) {
                this.uiController.updateButtonState(`step${this.currentStep}Next`, isCompleted);
            }
        } catch (error) {
            handleError(error, 'Next button check');
        }
    }

    /**
     * Update previous button state
     */
    updatePrevButtonState() {
        try {
            const prevButtons = safeGetElements('.action-buttons .btn-outline');
            prevButtons.forEach(button => {
                if (button.textContent.includes('이전 단계')) {
                    const shouldDisable = this.currentStep >= STEPS.VIDEO_CREATION;
                    button.disabled = shouldDisable;
                    
                    if (shouldDisable) {
                        button.classList.add('btn-disabled');
                        button.title = '이미지 생성 이후에는 이전 단계로 돌아갈 수 없습니다';
                    } else {
                        button.classList.remove('btn-disabled');
                        button.title = '';
                    }
                }
            });
        } catch (error) {
            handleError(error, 'Previous button state update');
        }
    }

    /**
     * Start automatic video creation process
     */
    startAutomaticVideoCreation() {
        try {
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * VIDEO_CONFIG.MAX_PROGRESS_STEP + VIDEO_CONFIG.MIN_PROGRESS_STEP;
                if (progress > 100) progress = 100;
                
                this.uiController.updateProgress(progress, PROGRESS_STATUSES[statusIndex]);
                
                if (statusIndex < PROGRESS_STATUSES.length - 1) {
                    statusIndex++;
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    this.dataService.updateField('videoCreated', true);
                    
                    setTimeout(() => {
                        showToast('영상 제작이 완료되었습니다! 🎉', 'success');
                        this.nextStep();
                    }, VIDEO_CONFIG.COMPLETION_DELAY);
                }
            }, VIDEO_CONFIG.PROGRESS_INTERVAL);
            
        } catch (error) {
            handleError(error, 'Video creation process');
        }
    }

    /**
     * Update final information display
     */
    updateFinalInfo() {
        try {
            const data = this.dataService.getData();
            
            this.uiController.updateElement('finalProduct', data.productName || '-');
            this.uiController.updateElement('finalTarget', this.getTargetText(data.targetAudience));
            this.uiController.updateElement('finalStyle', this.getStyleText(data.style));
            this.uiController.updateElement('finalFormat', this.getFormatText(data.format));
            this.uiController.updateElement('finalDuration', data.duration || '-');
        } catch (error) {
            handleError(error, 'Final info update');
        }
    }

    /**
     * Get human-readable target audience text
     */
    getTargetText(target) {
        const targets = {
            'teens': '10대 (13-19세)',
            'twenties': '20대 (20-29세)',
            'thirties': '30대 (30-39세)',
            'forties': '40대 (40-49세)',
            'fifties': '50대 이상',
            'all': '전 연령대'
        };
        return targets[target] || '-';
    }

    /**
     * Get human-readable style text
     */
    getStyleText(style) {
        const styles = {
            'action': '액션 스타일',
            'romance': '멜로드라마 스타일',
            'thriller': '스릴러 스타일',
            'comedy': '코미디 스타일',
            'documentary': '다큐멘터리 스타일'
        };
        return styles[style] || '-';
    }

    /**
     * Get human-readable format text
     */
    getFormatText(format) {
        const formats = {
            'youtube': '유튜브 광고',
            'instagram': '인스타그램 피드',
            'reels': '인스타그램 릴스',
            'shorts': '유튜브 쇼츠'
        };
        return formats[format] || '-';
    }
}

/**
 * DOM Cache class for performance optimization
 */
class DOMCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get element(s) from cache or create new entry
     */
    get(key, factory) {
        if (!this.cache.has(key)) {
            this.cache.set(key, factory());
        }
        return this.cache.get(key);
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Remove specific key from cache
     */
    delete(key) {
        this.cache.delete(key);
    }
}

// ========================================
// Global Functions (for backward compatibility)
// ========================================

let app; // Global app instance

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        app = new VideoCreationApp();
    } catch (error) {
        handleError(error, 'Application initialization');
    }
}

/**
 * Model selection handler
 */
function selectModel(element, modelId, tier) {
    try {
        app.uiController.clearSelections('#step1');
        element.classList.add('selected');
        
        app.dataService.updateField('model', modelId);
        app.dataService.updateField('modelTier', tier);
        
        if (tier === 'premium') {
            showToast('🎬 프리미엄 배우가 선택되었습니다! 100 크레딧이 차감됩니다.', 'info');
        }
        
        app.stepManager.checkNextButton();
    } catch (error) {
        handleError(error, 'Model selection');
    }
}

/**
 * Format selection handler
 */
function selectFormat(element, formatId) {
    try {
        app.uiController.clearSelections('#step3');
        element.classList.add('selected');
        
        app.dataService.updateField('format', formatId);
        app.stepManager.checkNextButton();
    } catch (error) {
        handleError(error, 'Format selection');
    }
}

/**
 * Duration selection handler
 */
function selectDuration(element, duration) {
    try {
        const parent = element.parentElement;
        if (parent) {
            const cards = parent.querySelectorAll('.card');
            cards.forEach(card => card.classList.remove('selected'));
        }
        
        element.classList.add('selected');
        app.dataService.updateField('duration', duration);
        app.stepManager.checkNextButton();
    } catch (error) {
        handleError(error, 'Duration selection');
    }
}

/**
 * Style selection handler
 */
function selectStyle(element, styleId) {
    try {
        app.uiController.clearSelections('#step4');
        element.classList.add('selected');
        
        app.dataService.updateField('style', styleId);
        app.stepManager.checkNextButton();
    } catch (error) {
        handleError(error, 'Style selection');
    }
}

/**
 * Image selection handler
 */
function selectImage(element, cut, imageId) {
    try {
        const parent = element.parentElement;
        if (parent) {
            const options = parent.querySelectorAll('.image-option');
            options.forEach(option => option.classList.remove('selected'));
        }
        
        element.classList.add('selected');
        
        const data = app.dataService.getData();
        data.selectedImages[cut] = imageId;
        app.dataService.updateField('selectedImages', data.selectedImages);
        
        app.stepManager.checkNextButton();
        checkImageSelectionButton();
    } catch (error) {
        handleError(error, 'Image selection');
    }
}

/**
 * Navigation functions
 */
function nextStep() {
    if (app) app.stepManager.nextStep();
}

function prevStep() {
    if (app) app.stepManager.prevStep();
}

function goToStep(step) {
    if (app) app.stepManager.goToStep(step);
}

/**
 * Scenario functions
 */
function approveScenario() {
    try {
        app.dataService.updateField('scenarioApproved', true);
        app.stepManager.checkNextButton();
        
        const nextButton = safeGetElement('step5Next');
        if (nextButton) {
            nextButton.style.display = 'block';
        }
        
        showToast('시나리오가 승인되었습니다! 영상 제작을 시작할 수 있습니다.', 'success');
        
        setTimeout(() => {
            nextStep();
        }, 1000);
    } catch (error) {
        handleError(error, 'Scenario approval');
    }
}

function modifyScenario() {
    try {
        app.uiController.toggleElement('editMode', true);
        app.uiController.toggleElement('replaceMode', false);
    } catch (error) {
        handleError(error, 'Scenario modification');
    }
}

function replaceScenario() {
    try {
        app.uiController.toggleElement('replaceMode', true);
        app.uiController.toggleElement('editMode', false);
    } catch (error) {
        handleError(error, 'Scenario replacement');
    }
}

function cancelEdit() {
    try {
        app.uiController.toggleElement('editMode', false);
    } catch (error) {
        handleError(error, 'Edit cancellation');
    }
}

function saveEdit() {
    try {
        const scene1 = safeGetElement('editScene1');
        const scene2 = safeGetElement('editScene2');
        const scene3 = safeGetElement('editScene3');
        
        if (scene1 && scene2 && scene3) {
            app.uiController.updateElement('scene1Text', sanitizeInput(scene1.value));
            app.uiController.updateElement('scene2Text', sanitizeInput(scene2.value));
            app.uiController.updateElement('scene3Text', sanitizeInput(scene3.value));
        }
        
        app.uiController.toggleElement('editMode', false);
        showToast('시나리오가 수정되었습니다!', 'success');
    } catch (error) {
        handleError(error, 'Edit saving');
    }
}

/**
 * Final step functions
 */
function downloadVideo() {
    try {
        showToast('영상을 다운로드합니다!', 'info');
        // Actual download logic would go here
    } catch (error) {
        handleError(error, 'Video download');
    }
}

function shareVideo() {
    try {
        showToast('영상을 공유합니다!', 'info');
        // Actual sharing logic would go here
    } catch (error) {
        handleError(error, 'Video sharing');
    }
}

function startOver() {
    try {
        if (app) {
            app.dataService.reset();
            app.stepManager.goToStep(1);
            
            // Clear all selections
            const selectedCards = safeGetElements('.card.selected');
            selectedCards.forEach(card => card.classList.remove('selected'));
            
            // Clear form inputs
            const inputs = safeGetElements('.form-input, .form-select');
            inputs.forEach(input => {
                input.value = '';
            });
            
            // Reset step indicators
            const steps = safeGetElements('.step');
            steps.forEach(step => {
                step.classList.remove('completed', 'active');
            });
            
            showToast('새로운 광고 제작을 시작합니다!', 'success');
        }
    } catch (error) {
        handleError(error, 'Application reset');
    }
}

function goToLibrary() {
    try {
        showToast('광고 보관함으로 이동합니다!', 'info');
        // Actual navigation logic would go here
    } catch (error) {
        handleError(error, 'Library navigation');
    }
}

function applyAsModel() {
    try {
        showToast('모델 신청 페이지로 이동합니다! 🌟', 'info');
        // Actual navigation logic would go here
    } catch (error) {
        handleError(error, 'Model application');
    }
}

/**
 * Advanced Edit Mode Functions
 */
function showAdvancedEdit() {
    console.log('showAdvancedEdit called'); // Debug log
    try {
        const advancedEditSection = document.getElementById('advancedEditSection');
        console.log('Advanced edit section:', advancedEditSection); // Debug log
        
        if (advancedEditSection) {
            advancedEditSection.classList.remove('hidden');
            
            // Smooth scroll to the advanced edit section
            setTimeout(() => {
                advancedEditSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
            
            // Try to show toast, but don't fail if it doesn't work
            try {
                showToast('고급 편집 모드가 활성화되었습니다.', 'info');
            } catch (toastError) {
                console.log('Toast failed, but continuing...');
            }
        } else {
            console.error('Advanced edit section not found');
            alert('고급 편집 모드를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('Error in showAdvancedEdit:', error);
        alert('오류가 발생했습니다: ' + error.message);
    }
}

function hideAdvancedEdit() {
    console.log('hideAdvancedEdit called'); // Debug log
    try {
        const advancedEditSection = document.getElementById('advancedEditSection');
        if (advancedEditSection) {
            advancedEditSection.classList.add('hidden');
            try {
                showToast('고급 편집 모드가 비활성화되었습니다.', 'info');
            } catch (toastError) {
                console.log('Toast failed, but continuing...');
            }
        }
    } catch (error) {
        console.error('Error in hideAdvancedEdit:', error);
        alert('오류가 발생했습니다: ' + error.message);
    }
}

function selectEditOption(option) {
    try {
        let message = '';
        let confirmMessage = '';
        let cost = 0;
        
        switch(option) {
            case 'regenerate-video':
                message = '영상만 다시 제작하시겠습니까?';
                confirmMessage = '같은 이미지로 영상 스타일이나 편집을 변경합니다.';
                cost = 5;
                break;
            case 'regenerate-image':
                message = '새 이미지로 제작하시겠습니까?';
                confirmMessage = '이미지 선택부터 다시 시작합니다.';
                cost = 10;
                break;
            default:
                console.warn(`Unknown edit option: ${option}`);
                return;
        }
        
        const confirmed = confirm(`${message}\n\n${confirmMessage}\n\n비용: ${cost} 토큰이 소모됩니다.`);
        
        if (confirmed) {
            executeEditOption(option, cost);
        }
    } catch (error) {
        handleError(error, 'Edit option selection');
    }
}

function executeEditOption(option, cost) {
    try {
        switch(option) {
            case 'regenerate-video':
                showToast(`영상 재생성을 시작합니다. (${cost} 토큰 소모)`, 'info');
                
                // Hide advanced edit mode
                hideAdvancedEdit();
                
                // Simulate video regeneration
                setTimeout(() => {
                    showToast('영상이 재생성되었습니다! 🎬', 'success');
                    
                    // Refresh the video (in a real app, this would load the new video)
                    const video = document.querySelector('.video-preview');
                    if (video) {
                        video.currentTime = 0;
                        video.play();
                    }
                }, 3000);
                break;
                
            case 'regenerate-image':
                showToast(`새 이미지로 제작을 시작합니다. (${cost} 토큰 소모)`, 'info');
                
                // Hide advanced edit mode
                hideAdvancedEdit();
                
                // Navigate back to step 6 (image selection)
                setTimeout(() => {
                    if (app && app.stepManager) {
                        app.stepManager.goToStep(STEPS.VIDEO_CREATION);
                        
                        // Show image preview section
                        const imagePreviewSection = safeGetElement('imagePreviewSection');
                        const videoCreationProgress = safeGetElement('videoCreationProgress');
                        
                        if (imagePreviewSection && videoCreationProgress) {
                            imagePreviewSection.classList.remove('hidden');
                            videoCreationProgress.classList.add('hidden');
                        }
                        
                        showToast('이미지 선택 단계로 돌아갑니다.', 'info');
                    }
                }, 1000);
                break;
        }
    } catch (error) {
        handleError(error, 'Edit option execution');
    }
}

function satisfiedWithVideo() {
    try {
        showToast('영상이 마음에 드신다니 기쁩니다! 🎉', 'success');
        
        // You could add additional logic here, such as:
        // - Saving the video to user's library
        // - Updating user preferences
        // - Showing download/share options
        
        setTimeout(() => {
            showToast('영상을 다운로드하거나 공유해보세요!', 'info');
        }, 2000);
    } catch (error) {
        handleError(error, 'Video satisfaction');
    }
}

// Placeholder functions for advanced features
function regenerateImages(cut) { /* Implementation would go here */ }
function checkImageSelectionButton() { /* Implementation would go here */ }
function startVideoWithSelectedImages() { /* Implementation would go here */ }

// ========================================
// Application Entry Point
// ========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}