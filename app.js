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
                    // Check if this is video regeneration from cut selection
                    if (window.videoRegenerationInProgress) {
                        // Don't auto-start, let startVideoRegenerationProgress handle it
                        console.log('Video regeneration in progress, skipping auto-start');
                    } else if (window.imageToVideoInProgress) {
                        // Don't auto-start, let startImageToVideoProgress handle it
                        console.log('Image-to-video generation in progress, skipping auto-start');
                    } else if (window.skipAutoVideoCreation) {
                        // Reset the flag and don't auto-start
                        window.skipAutoVideoCreation = false;
                        console.log('Skipped automatic video creation for image regeneration');
                    } else {
                        // Normal video creation flow
                        setTimeout(() => {
                            this.startAutomaticVideoCreation();
                        }, 500);
                    }
                    break;
                case STEPS.RESULTS:
                    this.updateFinalInfo();
                    // Hide advanced edit mode if video regeneration was just completed
                    if (window.videoRegenerationCompleted) {
                        this.hideAdvancedEditAfterCompletion();
                    }
                    break;
                case STEPS.VIDEO_CUT_SELECTION:
                    // Initialize video cuts when entering step 8
                    setTimeout(() => {
                        initializeVideoCuts();
                    }, 300);
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
     * Start video regeneration progress (after cut selection)
     */
    startVideoRegenerationProgress() {
        try {
            // Show video creation progress section
            const videoCreationProgress = document.getElementById('videoCreationProgress');
            const imagePreviewSection = document.getElementById('imagePreviewSection');
            
            if (videoCreationProgress) {
                videoCreationProgress.style.display = 'block';
            }
            if (imagePreviewSection) {
                imagePreviewSection.style.display = 'none';
            }
            
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation for regeneration
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            // Custom status messages for regeneration
            const regenerationStatuses = [
                '선택된 컷 분석 중...',
                '영상 스타일 적용 중...',
                '첫 번째 컷 재생성 중...',
                '두 번째 컷 재생성 중...',
                '세 번째 컷 재생성 중...',
                '컷들 연결 중...',
                '오디오 동기화 중...',
                '최종 편집 중...',
                '영상 재생성 완료!'
            ];
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * VIDEO_CONFIG.MAX_PROGRESS_STEP + VIDEO_CONFIG.MIN_PROGRESS_STEP;
                if (progress > 100) progress = 100;
                
                this.uiController.updateProgress(progress, regenerationStatuses[statusIndex]);
                
                if (statusIndex < regenerationStatuses.length - 1) {
                    statusIndex++;
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Reset the regeneration flag and mark as completed
                    window.videoRegenerationInProgress = false;
                    window.videoRegenerationCompleted = true;
                    
                    setTimeout(() => {
                        showToast('영상 재생성이 완료되었습니다! 🎉', 'success');
                        // Navigate to Step 7 (Results)
                        this.goToStep(7);
                    }, VIDEO_CONFIG.COMPLETION_DELAY);
                }
            }, VIDEO_CONFIG.PROGRESS_INTERVAL);
            
        } catch (error) {
            handleError(error, 'Video regeneration process');
        }
    }

    /**
     * Start image-to-video generation progress (after image selection)
     */
    startImageToVideoProgress() {
        try {
            // Show video creation progress section
            const videoCreationProgress = document.getElementById('videoCreationProgress');
            const imagePreviewSection = document.getElementById('imagePreviewSection');
            
            if (videoCreationProgress) {
                videoCreationProgress.style.display = 'block';
            }
            if (imagePreviewSection) {
                imagePreviewSection.style.display = 'none';
            }
            
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation for image-to-video generation
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            // Custom status messages for image-to-video generation
            const imageToVideoStatuses = [
                '선택된 이미지 분석 중...',
                '이미지 품질 최적화 중...',
                '첫 번째 컷 영상 생성 중...',
                '두 번째 컷 영상 생성 중...',
                '세 번째 컷 영상 생성 중...',
                '컷들 연결 및 시퀀싱 중...',
                '오디오 트랙 생성 중...',
                '최종 영상 편집 중...',
                '영상 컷 준비 완료!'
            ];
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * VIDEO_CONFIG.MAX_PROGRESS_STEP + VIDEO_CONFIG.MIN_PROGRESS_STEP;
                if (progress > 100) progress = 100;
                
                this.uiController.updateProgress(progress, imageToVideoStatuses[statusIndex]);
                
                if (statusIndex < imageToVideoStatuses.length - 1) {
                    statusIndex++;
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Reset the image-to-video flag
                    window.imageToVideoInProgress = false;
                    
                    setTimeout(() => {
                        showToast('영상 생성이 완료되었습니다! 컷을 선택해주세요. 🎬', 'success');
                        // Navigate to Step 8 (Video Cut Selection)
                        this.goToStep(8);
                        
                        // Initialize video cuts after navigation
                        setTimeout(() => {
                            initializeVideoCuts();
                        }, 300);
                    }, VIDEO_CONFIG.COMPLETION_DELAY);
                }
            }, VIDEO_CONFIG.PROGRESS_INTERVAL);
            
        } catch (error) {
            handleError(error, 'Image-to-video generation process');
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
     * Hide advanced edit mode after video regeneration completion
     */
    hideAdvancedEditAfterCompletion() {
        try {
            const advancedEditSection = document.getElementById('advancedEditSection');
            if (advancedEditSection) {
                advancedEditSection.style.display = 'none';
            }
            
            // Show completion message
            showToast('영상 제작이 완료되었습니다! 다운로드하거나 새 광고를 만들어보세요.', 'success');
            
            // Reset the completion flag after a delay
            setTimeout(() => {
                window.videoRegenerationCompleted = false;
                // Show advanced edit section again for next time
                if (advancedEditSection) {
                    advancedEditSection.style.display = 'block';
                }
            }, 5000);
        } catch (error) {
            handleError(error, 'Advanced edit completion handling');
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
 * Video regeneration function
 */
function startVideoRegenerationProgress() {
    if (app && app.stepManager) {
        app.stepManager.startVideoRegenerationProgress();
    }
}

/**
 * Image-to-video generation function
 */
function startImageToVideoProgress() {
    if (app && app.stepManager) {
        app.stepManager.startImageToVideoProgress();
    }
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
    // Advanced Edit Mode is now always visible, so just scroll to it
    try {
        const advancedEditSection = document.getElementById('advancedEditSection');
        if (advancedEditSection) {
            advancedEditSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            showToast('고급 편집 옵션을 확인해보세요!', 'info');
        }
    } catch (error) {
        console.error('Error in showAdvancedEdit:', error);
    }
}

function hideAdvancedEdit() {
    // Since Advanced Edit Mode is always visible, just scroll back to video
    try {
        const videoSection = document.querySelector('.video-info-grid');
        if (videoSection) {
            videoSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        showToast('고급 편집을 취소했습니다.', 'info');
    } catch (error) {
        console.error('Error in hideAdvancedEdit:', error);
    }
}

function showVideoRegenerationProgress() {
    // Show a visual indication that video is being regenerated
    try {
        const videoSection = document.querySelector('.video-info-grid video');
        if (videoSection) {
            // Add a loading overlay
            const overlay = document.createElement('div');
            overlay.id = 'regeneration-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(49, 130, 206, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                border-radius: 12px;
                z-index: 10;
            `;
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎬</div>
                    <div>영상 재생성 중...</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;">잠시만 기다려주세요</div>
                </div>
            `;
            
            const videoContainer = videoSection.parentElement;
            if (videoContainer) {
                videoContainer.style.position = 'relative';
                videoContainer.appendChild(overlay);
                
                // Remove overlay after regeneration
                setTimeout(() => {
                    if (overlay && overlay.parentElement) {
                        overlay.parentElement.removeChild(overlay);
                    }
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Error showing regeneration progress:', error);
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
                showToast(`영상 컷 선택 화면으로 이동합니다.`, 'info');
                
                // Navigate to Step 8 (Video Cut Selection)
                setTimeout(() => {
                    if (app && app.stepManager) {
                        app.stepManager.goToStep(8);
                        // Initialize video cuts after navigation
                        setTimeout(() => {
                            initializeVideoCuts();
                        }, 300);
                    }
                }, 500);
                break;
                
            case 'regenerate-image':
                showToast(`새 이미지로 제작을 시작합니다. (${cost} 토큰 소모)`, 'info');
                
                // Set a flag to prevent automatic video creation
                window.skipAutoVideoCreation = true;
                
                // Navigate back to step 6 for image selection
                setTimeout(() => {
                    // Use direct step manager navigation to avoid auto-triggers
                    if (app && app.stepManager) {
                        app.stepManager.goToStep(6);
                        
                        // After navigation, force show image preview section
                        setTimeout(() => {
                            const videoCreationProgress = document.getElementById('videoCreationProgress');
                            const imagePreviewSection = document.getElementById('imagePreviewSection');
                            
                            if (videoCreationProgress) {
                                videoCreationProgress.style.display = 'none';
                            }
                            
                            // Force trigger image preview
                            if (typeof showImagePreviewOption === 'function') {
                                showImagePreviewOption();
                            }
                            
                            showToast('이미지를 선택해주세요.', 'info');
                        }, 300);
                    } else {
                        console.error('App stepManager not found');
                        showToast('오류가 발생했습니다. 페이지를 새로고침 해주세요.', 'error');
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

// Image Selection and Management Functions
function showImagePreviewOption() {
    try {
        const imagePreviewSection = document.getElementById('imagePreviewSection');
        const videoCreationProgress = document.getElementById('videoCreationProgress');
        
        if (videoCreationProgress) {
            videoCreationProgress.style.display = 'none';
        }
        if (imagePreviewSection) {
            imagePreviewSection.style.display = 'block';
        } else {
            // If imagePreviewSection doesn't exist, show a placeholder
            showToast('이미지 선택 인터페이스를 로드하고 있습니다...', 'info');
        }
    } catch (error) {
        console.error('Error in showImagePreviewOption:', error);
        showToast('이미지 선택 화면을 불러오는데 실패했습니다.', 'error');
    }
}

function regenerateImages(cut) {
    try {
        console.log(`Regenerating images for cut: ${cut}`); // Debug log
        showToast(`${cut} 이미지를 다시 생성합니다. (3 토큰)`, 'info');
        
        // Try multiple methods to find the image grid
        let imageGrid = document.querySelector(`[data-cut-section="${cut}"]`);
        
        // Fallback: if data-cut-section doesn't work, try direct selection
        if (!imageGrid) {
            console.warn(`Primary selector failed, trying fallback for ${cut}`);
            // Try to find by the structure pattern
            const allImageGrids = document.querySelectorAll('.image-grid');
            if (cut === 'cut1' && allImageGrids[0]) {
                imageGrid = allImageGrids[0];
            } else if (cut === 'cut2' && allImageGrids[1]) {
                imageGrid = allImageGrids[1];
            } else if (cut === 'cut3' && allImageGrids[2]) {
                imageGrid = allImageGrids[2];
            }
        }
        
        console.log(`Image grid found:`, imageGrid); // Debug log
        
        if (!imageGrid) {
            console.error(`Image grid for ${cut} not found with any method`);
            showToast(`${cut} 이미지 그리드를 찾을 수 없습니다.`, 'error');
            return;
        }
        
        // Show loading state
        imageGrid.style.opacity = '0.5';
        imageGrid.style.pointerEvents = 'none';
        
        // Generate new random image URLs for this cut
        setTimeout(() => {
            const imageOptions = imageGrid.querySelectorAll('.image-option');
            console.log(`Found ${imageOptions.length} image options`); // Debug log
            
            imageOptions.forEach((option, index) => {
                // Clear previous selection
                option.classList.remove('selected');
                
                // Generate new random image with higher randomness
                const randomId = Math.floor(Math.random() * 10000) + Date.now() + Math.floor(Math.random() * 1000);
                const img = option.querySelector('img');
                
                if (img) {
                    // Force browser to reload image by adding cache-busting parameter
                    const newImageUrl = `https://picsum.photos/400/225?random=${randomId}_${index}&t=${Date.now()}`;
                    console.log(`Setting new image URL: ${newImageUrl}`); // Debug log
                    
                    // Clear the current src first to force reload
                    img.src = '';
                    
                    // Set new src after a brief delay
                    setTimeout(() => {
                        img.src = newImageUrl;
                        
                        // Add onload event to verify image loads
                        img.onload = () => {
                            console.log(`Image ${index + 1} loaded successfully`);
                        };
                        
                        img.onerror = () => {
                            console.error(`Failed to load image ${index + 1}`);
                            // Fallback to different image service if picsum fails
                            img.src = `https://source.unsplash.com/400x225/?random&sig=${randomId}_${index}`;
                        };
                    }, 50);
                }
                
                // Update onclick to use new image ID
                const newImageId = `${cut}_img${index + 1}_${randomId}`;
                option.setAttribute('onclick', `selectImage(this, '${cut}', '${newImageId}')`);
                option.setAttribute('onkeydown', `if(event.key==='Enter') selectImage(this, '${cut}', '${newImageId}')`);
            });
            
            // Restore interaction
            imageGrid.style.opacity = '1';
            imageGrid.style.pointerEvents = 'auto';
            
            // Update selection status
            checkImageSelectionButton();
            
            showToast(`${cut} 이미지가 새로 생성되었습니다!`, 'success');
        }, 2000);
        
    } catch (error) {
        console.error('Error in regenerateImages:', error);
        showToast('이미지 재생성에 실패했습니다.', 'error');
    }
}

function checkImageSelectionButton() {
    try {
        // Check if all cuts have selected images
        const data = app ? app.dataService.getData() : null;
        if (!data) return;
        
        const allSelected = data.selectedImages.cut1 && 
                           data.selectedImages.cut2 && 
                           data.selectedImages.cut3;
        
        const button = document.getElementById('step6ImageNext');
        if (button) {
            button.disabled = !allSelected;
            if (allSelected) {
                button.classList.remove('btn-disabled');
                button.classList.add('btn-primary');
                button.textContent = '선택된 이미지로 제작';
            } else {
                button.classList.add('btn-disabled');
                button.classList.remove('btn-primary');
                button.textContent = '모든 컷 선택 필요';
            }
        }
    } catch (error) {
        console.error('Error in checkImageSelectionButton:', error);
    }
}

function startVideoWithSelectedImages() {
    try {
        showToast('선택된 이미지로 영상을 제작합니다!', 'info');
        if (app && app.stepManager) {
            app.stepManager.nextStep();
        } else {
            // Fallback
            goToStep(7);
        }
    } catch (error) {
        console.error('Error in startVideoWithSelectedImages:', error);
        showToast('영상 제작을 시작하는데 실패했습니다.', 'error');
    }
}

function proceedToVideoCutSelection() {
    try {
        const data = app ? app.dataService.getData() : null;
        if (!data) {
            showToast('데이터를 불러올 수 없습니다.', 'error');
            return;
        }
        
        // Check if all cuts have selected images
        const allSelected = data.selectedImages.cut1 && 
                           data.selectedImages.cut2 && 
                           data.selectedImages.cut3;
        
        if (!allSelected) {
            showToast('모든 컷의 이미지를 선택해주세요.', 'warning');
            return;
        }
        
        showToast('선택된 이미지로 영상을 생성하고 있습니다...', 'info');
        
        // Navigate to Step 6 to show progress for video generation from selected images
        setTimeout(() => {
            if (app && app.stepManager) {
                app.stepManager.goToStep(6);
                
                // Set flag to trigger image-to-video generation progress
                window.imageToVideoInProgress = true;
                
                // Start the image-to-video generation progress
                setTimeout(() => {
                    startImageToVideoProgress();
                }, 500);
            }
        }, 1000);
    } catch (error) {
        console.error('Error in proceedToVideoCutSelection:', error);
        showToast('영상 생성으로 이동하는데 실패했습니다.', 'error');
    }
}

// Scenario Management Functions  
function cancelReplace() {
    try {
        const replaceMode = document.getElementById('replaceMode');
        if (replaceMode) {
            replaceMode.style.display = 'none';
        }
        showToast('수정을 취소했습니다.', 'info');
    } catch (error) {
        console.error('Error in cancelReplace:', error);
    }
}

function generateNewScenario() {
    try {
        showToast('새 시나리오를 생성하고 있습니다... (5 토큰)', 'info');
        
        // Simulate scenario generation
        setTimeout(() => {
            showToast('새 시나리오가 생성되었습니다!', 'success');
            // In real app, this would update the scenario content
        }, 2000);
    } catch (error) {
        console.error('Error in generateNewScenario:', error);
        showToast('시나리오 생성에 실패했습니다.', 'error');
    }
}

function backToVideoOptions() {
    try {
        const imagePreviewSection = document.getElementById('imagePreviewSection');
        const videoCreationProgress = document.getElementById('videoCreationProgress');
        
        if (imagePreviewSection) {
            imagePreviewSection.style.display = 'none';
        }
        if (videoCreationProgress) {
            videoCreationProgress.style.display = 'block';
        }
        
        showToast('영상 제작 옵션으로 돌아갑니다.', 'info');
    } catch (error) {
        console.error('Error in backToVideoOptions:', error);
    }
}

// Video Cut Selection Functions (Step 8)

function initializeVideoCuts() {
    try {
        // Mark all cuts as selected initially
        const cuts = ['cut1', 'cut2', 'cut3'];
        cuts.forEach(cut => {
            const button = document.querySelector(`[data-cut="${cut}"]`);
            if (button) {
                button.classList.add('selected');
                button.innerHTML = '✅ 선택됨';
            }
        });
        
        // Enable proceed button
        const proceedButton = document.getElementById('proceedWithCuts');
        if (proceedButton) {
            proceedButton.disabled = false;
            proceedButton.classList.remove('btn-disabled');
        }
        
        // Auto-play videos
        const videos = document.querySelectorAll('.cut-video');
        videos.forEach(video => {
            video.play().catch(e => console.log('Video autoplay prevented:', e));
        });
    } catch (error) {
        console.error('Error in initializeVideoCuts:', error);
    }
}

function selectVideoCut(cutId) {
    try {
        const button = document.querySelector(`[data-cut="${cutId}"]`);
        if (button) {
            // Toggle selection
            if (button.classList.contains('selected')) {
                button.classList.remove('selected');
                button.innerHTML = '✅ 이 컷 사용';
            } else {
                button.classList.add('selected');
                button.innerHTML = '✅ 선택됨';
            }
            
            // Check if at least one cut is selected
            updateProceedButton();
            showToast(`${cutId}이(가) ${button.classList.contains('selected') ? '선택' : '선택 해제'}되었습니다.`, 'info');
        }
    } catch (error) {
        console.error('Error in selectVideoCut:', error);
    }
}

function regenerateVideoCut(cutId) {
    try {
        const confirmed = confirm(`${cutId}를 다시 생성하시겠습니까?\n\n비용: 5 토큰\n시간: 약 2-3분`);
        
        if (confirmed) {
            showToast(`${cutId}를 다시 생성합니다... (5 토큰 소모)`, 'info');
            
            // Find the video element and show loading
            const cutContainer = document.querySelector(`[data-cut="${cutId}"]`).closest('.video-cut-container');
            const videoPreview = cutContainer.querySelector('.video-cut-preview');
            
            if (videoPreview) {
                // Create loading overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(49, 130, 206, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    border-radius: 8px;
                    z-index: 10;
                `;
                overlay.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 12px;">🎬</div>
                        <div>${cutId} 재생성 중...</div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 8px;">잠시만 기다려주세요</div>
                    </div>
                `;
                
                videoPreview.style.position = 'relative';
                videoPreview.appendChild(overlay);
                
                // Simulate regeneration
                setTimeout(() => {
                    if (overlay && overlay.parentElement) {
                        overlay.parentElement.removeChild(overlay);
                    }
                    showToast(`${cutId}가 새로 생성되었습니다! 🎬`, 'success');
                    
                    // Auto-select the regenerated cut
                    selectVideoCut(cutId);
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Error in regenerateVideoCut:', error);
        showToast('영상 컷 재생성에 실패했습니다.', 'error');
    }
}

function updateProceedButton() {
    try {
        const selectedCuts = document.querySelectorAll('[data-cut].selected');
        const proceedButton = document.getElementById('proceedWithCuts');
        
        console.log('Selected cuts:', selectedCuts.length); // Debug log
        
        if (proceedButton) {
            if (selectedCuts.length > 0) {
                proceedButton.disabled = false;
                proceedButton.classList.remove('btn-disabled');
                proceedButton.classList.add('btn-primary');
                proceedButton.textContent = `선택된 ${selectedCuts.length}개 컷으로 최종 영상 제작`;
            } else {
                proceedButton.disabled = true;
                proceedButton.classList.add('btn-disabled');
                proceedButton.classList.remove('btn-primary');
                proceedButton.textContent = '최소 1개 컷을 선택해주세요';
            }
        }
    } catch (error) {
        console.error('Error in updateProceedButton:', error);
    }
}

function proceedWithSelectedCuts() {
    try {
        const selectedCuts = document.querySelectorAll('[data-cut].selected');
        
        console.log('Proceeding with selected cuts:', selectedCuts.length); // Debug log
        
        if (selectedCuts.length === 0) {
            showToast('최소 하나의 컷을 선택해주세요.', 'warning');
            return;
        }
        
        showToast(`선택된 ${selectedCuts.length}개 컷으로 최종 영상을 제작합니다!`, 'success');
        
        // Navigate to Step 6 to show progress bar for video regeneration
        setTimeout(() => {
            if (app && app.stepManager) {
                app.stepManager.goToStep(6);
                
                // Set flag to trigger video regeneration progress
                window.videoRegenerationInProgress = true;
                
                // Start the video regeneration progress
                setTimeout(() => {
                    startVideoRegenerationProgress();
                }, 500);
            }
        }, 1000);
    } catch (error) {
        console.error('Error in proceedWithSelectedCuts:', error);
        showToast('영상 제작에 실패했습니다.', 'error');
    }
}

function regenerateEntireVideo() {
    try {
        const confirmed = confirm('전체 영상을 다시 제작하시겠습니까?\n\n비용: 15 토큰\n시간: 약 5-8분\n\n모든 컷이 새로 생성됩니다.');
        
        if (confirmed) {
            showToast('전체 영상을 다시 제작합니다... (15 토큰 소모)', 'info');
            
            // Navigate to Step 6 to show progress bar for full regeneration
            setTimeout(() => {
                if (app && app.stepManager) {
                    app.stepManager.goToStep(6);
                    
                    // Set flag to trigger video regeneration progress
                    window.videoRegenerationInProgress = true;
                    
                    // Start the video regeneration progress
                    setTimeout(() => {
                        startVideoRegenerationProgress();
                    }, 500);
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Error in regenerateEntireVideo:', error);
        showToast('전체 영상 재생성에 실패했습니다.', 'error');
    }
}

// ========================================
// Application Entry Point
// ========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}