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
            
            // Initialize current image comparison
            setTimeout(() => {
                initializeCurrentImageComparison();
            }, 100);
            
            // Check initial button states
            this.stepManager.checkNextButton();
            
            // Removed startup toast notification for cleaner UX
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
            
            // Prevent direct access to step 8 - it should only be accessed through advanced menu
            if (stepNumber === 8) {
                showToast('⚠️ 영상 컷 선택은 고급 편집 모드를 통해서만 접근할 수 있습니다.', 'warning');
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
            selectedVideoCuts: {},
            termsAgreed: false,
            termsAgreements: null,
            termsAgreedAt: null
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
     * Getter for direct data access
     */
    get data() {
        return this.selectedData;
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

    /**
     * Update image selection for a specific cut
     */
    updateImageSelection(cutId, value) {
        try {
            if (this.selectedData.selectedImages.hasOwnProperty(cutId)) {
                this.selectedData.selectedImages[cutId] = value;
                console.log(`Updated image selection for ${cutId}:`, value);
            } else {
                console.warn(`Unknown cut ID: ${cutId}`);
            }
        } catch (error) {
            handleError(error, 'Image selection update');
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
    goToStep(step, updateURL = true) {
        try {
            // Validate step number
            if (step < 1 || step > STEPS.TOTAL) {
                console.warn(`Invalid step number: ${step}`);
                return;
            }

            // Check restriction: can't go back after VIDEO_CREATION (step 6)
            if (this.currentStep >= STEPS.VIDEO_CREATION && step < this.currentStep) {
                showToast('⚠️ 이미지 생성 이후에는 이전 단계로 돌아갈 수 없습니다.', 'warning');
                // If this was triggered by browser back, we need to update URL to current step
                if (!updateURL && window.urlStateManager) {
                    window.urlStateManager.updateState({ step: this.currentStep }, true);
                }
                return;
            }
            
            // Check if trying to access step 8 without proper flow
            if (step === 8 && !window.isFromAdvancedEditMode) {
                console.warn('Step 8 can only be accessed through advanced edit mode');
                showToast('⚠️ 영상 컷 선택은 고급 편집 모드를 통해서만 접근할 수 있습니다.', 'warning');
                return;
            }

            // Check if previous steps are completed
            if (step > 1 && !this.dataService.isStepCompleted(step - 1)) {
                showToast('이전 단계를 먼저 완료해주세요.', 'warning');
                return;
            }

            // Update URL state
            if (updateURL && window.urlStateManager) {
                window.urlStateManager.updateState({ step: step });
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
                    // Initialize current image comparison when entering step 6
                    setTimeout(() => {
                        initializeCurrentImageComparison();
                        initializeEnhancedImageSelection();
                    }, 100);
                    
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
                    
                    // Debug logging
                    console.log('Step 7 Entry - Flag states:', {
                        videoRegenerationCompleted: window.videoRegenerationCompleted,
                        advancedEditAlreadyHidden: window.advancedEditAlreadyHidden,
                        cameFromImageSelection: window.cameFromImageSelection
                    });
                    
                    // Always ensure Advanced Edit Mode is visible in Step 7
                    // This fixes the issue where Advanced Mode box disappears after video workflows
                    const advancedEditSection = document.getElementById('advancedEditSection');
                    if (advancedEditSection) {
                        advancedEditSection.style.display = 'block';
                        console.log('Advanced Edit Mode ensured visible in Step 7');
                    }
                    
                    // Only show completion message if video regeneration was completed
                    if (window.videoRegenerationCompleted && !window.advancedEditAlreadyHidden) {
                        showToast('영상 제작이 완료되었습니다! 다운로드하거나 새 광고를 만들어보세요.', 'success');
                        window.advancedEditAlreadyHidden = true;
                    }
                    break;
                case STEPS.VIDEO_CUT_SELECTION:
                    // Add navigation guard to prevent recursive loop after video regeneration
                    if (window.preventStep8Navigation || 
                        (window.videoRegenerationCompleted && Date.now() - window.videoCompletionTime < 3000)) {
                        console.log('Navigation guard: Preventing recursive entry to Step 8 after video regeneration');
                        showToast('영상 제작이 완료되었습니다. 결과를 확인해주세요.', 'info');
                        // Return to Step 7 instead
                        setTimeout(() => {
                            this.goToStep(7);
                        }, 500);
                        return;
                    }
                    
                    // Initialize enhanced video cuts when entering step 8
                    setTimeout(() => {
                        initializeEnhancedVideoCuts();
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
                // Also update the fixed button if it exists
                const fixedButton = safeGetElement(`step${this.currentStep}NextFixed`);
                if (fixedButton) {
                    this.uiController.updateButtonState(`step${this.currentStep}NextFixed`, isCompleted);
                }
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
            // Update step description for final video creation
            const progressText = document.querySelector('#step6 .progress-text');
            if (progressText) {
                progressText.textContent = '6/8 단계 - 최종 영상 제작';
            }
            
            // Update main heading for final video creation
            const mainHeading = document.querySelector('#step6 .heading');
            if (mainHeading) {
                mainHeading.innerHTML = '🎬 최종 영상 제작 중...';
            }
            
            // Update description for final video creation
            const description = document.querySelector('#step6 p');
            if (description) {
                description.textContent = '선택하신 시나리오와 설정으로 최종 광고 영상을 제작하고 있습니다.';
            }
            
            // Ensure progress bar color is blue for final video creation
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(90deg, #3182ce, #2c5aa0)';
            }
            
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            // Custom status messages for final video creation
            const finalVideoStatuses = [
                '시나리오 분석 중...',
                'AI 모델 준비 중...',
                '첫 번째 장면 생성 중...',
                '두 번째 장면 생성 중...',
                '세 번째 장면 생성 중...',
                '장면들 연결 중...',
                '오디오 추가 중...',
                '최종 편집 중...',
                '최종 영상 완성!'
            ];
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * VIDEO_CONFIG.MAX_PROGRESS_STEP + VIDEO_CONFIG.MIN_PROGRESS_STEP;
                if (progress > 100) progress = 100;
                
                this.uiController.updateProgress(progress, finalVideoStatuses[statusIndex]);
                
                if (statusIndex < finalVideoStatuses.length - 1) {
                    statusIndex++;
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    this.dataService.updateField('videoCreated', true);
                    
                    // Send Slack notification for movie creation
                    if (window.slackNotifier) {
                        const movieData = {
                            projectName: this.dataService.selectedData.productName || 'Untitled',
                            modelName: this.dataService.selectedData.modelName || 'Unknown Model',
                            videoType: this.dataService.selectedData.format || 'Unknown Format',
                            style: this.dataService.selectedData.style || 'Unknown Style',
                            targetAudience: this.dataService.selectedData.targetAudience || 'Unknown'
                        };
                        
                        window.slackNotifier.notifyMovieCreation(movieData)
                            .then(result => {
                                if (result.success) {
                                    console.log('Movie creation notification sent to Slack');
                                }
                            })
                            .catch(error => {
                                console.error('Failed to send Slack notification:', error);
                            });
                    }
                    
                    setTimeout(() => {
                        showToast('최종 영상 제작이 완료되었습니다! 🎬', 'success');
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
            
            // Update step description for final video creation
            const progressText = document.querySelector('#step6 .progress-text');
            if (progressText) {
                progressText.textContent = '6/8 단계 - 최종 영상 제작';
            }
            
            // Update main heading for final video creation
            const mainHeading = document.querySelector('#step6 .heading');
            if (mainHeading) {
                mainHeading.innerHTML = '🎬 최종 영상 제작 중...';
            }
            
            // Update description for final video creation
            const description = document.querySelector('#step6 p');
            if (description) {
                description.textContent = '선택하신 영상 컷으로 최종 광고 영상을 제작하고 있습니다. 완성된 영상을 확인하실 수 있습니다.';
            }
            
            // Change progress bar color to blue for final video creation
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(90deg, #3182ce, #2c5aa0)';
            }
            
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation for regeneration
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            // Custom status messages for final video creation
            const regenerationStatuses = [
                '선택된 컷 분석 중...',
                '최종 영상 스타일 적용 중...',
                '첫 번째 컷 최종 편집 중...',
                '두 번째 컷 최종 편집 중...',
                '세 번째 컷 최종 편집 중...',
                '컷들 연결 및 시퀀싱 중...',
                '오디오 동기화 및 믹싱 중...',
                '최종 광고 영상 완성 중...',
                '최종 영상 제작 완료!'
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
                    window.videoCompletionTime = Date.now(); // Track completion time
                    // Reset image to video flag since regeneration is complete
                    window.imageToVideoInProgress = false;
                    
                    setTimeout(() => {
                        showToast('최종 영상 제작이 완료되었습니다! 🎬', 'success');
                        // Navigate to Step 7 (Results) and set navigation guard
                        window.preventStep8Navigation = true;
                        this.goToStep(7);
                        
                        // Clear the navigation guard after a delay
                        setTimeout(() => {
                            window.preventStep8Navigation = false;
                        }, 5000);
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
            
            // Update step description for video cut generation
            const progressText = document.querySelector('#step6 .progress-text');
            if (progressText) {
                progressText.textContent = '6/8 단계 - 영상 컷 생성';
            }
            
            // Update main heading for video cut generation
            const mainHeading = document.querySelector('#step6 .heading');
            if (mainHeading) {
                mainHeading.innerHTML = '✂️ 영상 컷 생성 중...';
            }
            
            // Update description for video cut generation
            const description = document.querySelector('#step6 p');
            if (description) {
                description.textContent = '선택하신 이미지로 개별 영상 컷을 생성하고 있습니다. 생성된 컷들 중에서 선택할 수 있습니다.';
            }
            
            // Change progress bar color to orange for video cut generation
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(90deg, #ed8936, #f56500)';
            }
            
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation for image-to-video generation
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            // Custom status messages for video cut generation
            const imageToVideoStatuses = [
                '선택된 이미지 분석 중...',
                '이미지 품질 최적화 중...',
                '첫 번째 영상 컷 생성 중...',
                '두 번째 영상 컷 생성 중...',
                '세 번째 영상 컷 생성 중...',
                '개별 컷 후처리 중...',
                '컷 선택지 준비 중...',
                '영상 컷 최적화 중...',
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
                        showToast('영상 제작이 완료되었습니다! 🎬', 'success');
                        // Navigate to Step 7 (Results) - NOT Step 8
                        this.goToStep(7);
                    }, VIDEO_CONFIG.COMPLETION_DELAY);
                }
            }, VIDEO_CONFIG.PROGRESS_INTERVAL);
            
        } catch (error) {
            handleError(error, 'Image-to-video generation process');
        }
    }

    /**
     * Start partial video regeneration progress for mixed scenarios
     */
    startPartialVideoRegenerationProgress() {
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
            
            // Get current cut configuration
            const cutConfiguration = window.currentCutConfiguration || {};
            const regeneratingCuts = Object.keys(cutConfiguration).filter(cut => cutConfiguration[cut] === 'regenerate');
            
            // Update step description for partial regeneration
            const progressText = document.querySelector('#step6 .progress-text');
            if (progressText) {
                progressText.textContent = '6/8 단계 - 부분 영상 재생성';
            }
            
            // Update main heading for partial regeneration
            const mainHeading = document.querySelector('#step6 .heading');
            if (mainHeading) {
                mainHeading.innerHTML = '🔄 선택 컷 재생성 중...';
            }
            
            // Update description for partial regeneration
            const description = document.querySelector('#step6 p');
            if (description) {
                description.textContent = `${regeneratingCuts.length}개의 컷을 새로 생성하고 기존 컷과 결합하여 최종 영상을 제작하고 있습니다.`;
            }
            
            // Change progress bar color to orange for partial regeneration
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(90deg, #ed8936, #f56500)';
            }
            
            // Hide step 6 action buttons
            this.uiController.toggleElement('step6Actions', false);
            
            // Start progress simulation for partial regeneration
            let progress = VIDEO_CONFIG.INITIAL_PROGRESS;
            let statusIndex = 0;
            
            // Custom status messages for partial regeneration
            const partialRegenerationStatuses = [
                '선택된 컷 분석 중...',
                '기존 컷 보존 처리 중...',
                '새로 생성할 컷 준비 중...',
                '부분 재생성 시작 중...',
                '재생성된 컷 품질 확인 중...',
                '기존 컷과 결합 중...',
                '최종 영상 편집 중...',
                '부분 재생성 완료!'
            ];
            
            const progressInterval = setInterval(() => {
                progress += Math.random() * VIDEO_CONFIG.MAX_PROGRESS_STEP + VIDEO_CONFIG.MIN_PROGRESS_STEP;
                if (progress > 100) progress = 100;
                
                this.uiController.updateProgress(progress, partialRegenerationStatuses[statusIndex]);
                
                if (statusIndex < partialRegenerationStatuses.length - 1) {
                    statusIndex++;
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Reset the regeneration flags and mark as completed
                    window.videoRegenerationInProgress = false;
                    window.partialRegenerationInProgress = false;
                    window.videoRegenerationCompleted = true;
                    window.videoCompletionTime = Date.now();
                    
                    setTimeout(() => {
                        showToast('부분 영상 재생성이 완료되었습니다! 🎬', 'success');
                        // Navigate to Step 7 (Results) and set navigation guard
                        window.preventStep8Navigation = true;
                        this.goToStep(7);
                        
                        // Clear the navigation guard after a delay
                        setTimeout(() => {
                            window.preventStep8Navigation = false;
                        }, 5000);
                    }, VIDEO_CONFIG.COMPLETION_DELAY);
                }
            }, VIDEO_CONFIG.PROGRESS_INTERVAL);
            
        } catch (error) {
            handleError(error, 'Partial video regeneration process');
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
     * Handle video regeneration completion (deprecated - Advanced Edit Mode should always be visible)
     */
    hideAdvancedEditAfterCompletion() {
        try {
            // Advanced Edit Mode should always remain visible in Step 7
            // This method is now deprecated but kept for backwards compatibility
            const advancedEditSection = document.getElementById('advancedEditSection');
            if (advancedEditSection) {
                // Instead of hiding, ensure it's visible
                advancedEditSection.style.display = 'block';
                console.log('Advanced Edit Mode kept visible (hideAdvancedEditAfterCompletion called)');
            }
            
            // Show completion message
            showToast('영상 제작이 완료되었습니다! 다운로드하거나 새 광고를 만들어보세요.', 'success');
            
            // Reset the completion flag
            setTimeout(() => {
                window.videoRegenerationCompleted = false;
                window.advancedEditAlreadyHidden = false;
                // Only reset cameFromImageSelection if we're not in image selection workflow
                // This prevents issues with flag timing
                if (window.cameFromImageSelection) {
                    console.log('Preserving cameFromImageSelection flag');
                } else {
                    window.cameFromImageSelection = false;
                }
            }, 1500);
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
        
        // Set up URL state management for steps
        if (window.urlStateManager) {
            // Listen for step changes from URL (browser back/forward)
            window.urlStateManager.addListener('step', function(step) {
                if (step && app && app.stepManager) {
                    const stepNumber = parseInt(step, 10);
                    if (!isNaN(stepNumber) && stepNumber !== app.stepManager.currentStep) {
                        // Use goToStep with updateURL=false to prevent infinite loop
                        app.stepManager.goToStep(stepNumber, false);
                    }
                }
            });
            
            // Check initial URL state
            const initialStep = window.urlStateManager.getState('step');
            if (initialStep && app && app.stepManager) {
                const stepNumber = parseInt(initialStep, 10);
                if (!isNaN(stepNumber) && stepNumber > 1 && stepNumber <= STEPS.TOTAL) {
                    // Navigate to the step from URL (if valid and not step 1)
                    setTimeout(() => {
                        app.stepManager.goToStep(stepNumber, false);
                    }, 100);
                }
            }
        }
        
        // Check if we're coming from model showcase with a selected model
        const skipToStep2 = sessionStorage.getItem('skipToStep2');
        const selectedModelId = sessionStorage.getItem('selectedModelForMovie');
        
        if (skipToStep2 === 'true' && selectedModelId) {
            // Clear the flags
            sessionStorage.removeItem('skipToStep2');
            sessionStorage.removeItem('selectedModelForMovie');
            
            // Wait for app to be fully initialized and models to load
            setTimeout(async () => {
                console.log('[App] Looking for model:', selectedModelId);
                
                // First, directly set the model in data service
                app.dataService.updateField('model', selectedModelId);
                
                // Try to get model tier from any loaded model
                let modelTier = 'basic';
                
                // Check all possible model containers
                const allCards = document.querySelectorAll('.featured-model-card, .premium-model-card, .card[data-model-id]');
                let modelFound = false;
                
                allCards.forEach(card => {
                    const onclick = card.getAttribute('onclick') || '';
                    const dataId = card.getAttribute('data-model-id') || '';
                    
                    if (onclick.includes(selectedModelId) || dataId === selectedModelId) {
                        // Extract tier from onclick if possible
                        const tierMatch = onclick.match(/['"](\w+)['"]\s*\)$/);
                        if (tierMatch) {
                            modelTier = tierMatch[1];
                        }
                        
                        // Mark the card as selected
                        card.classList.add('selected');
                        modelFound = true;
                    }
                });
                
                // Set the tier
                app.dataService.updateField('modelTier', modelTier);
                
                // Verify the model is actually set in dataService
                const modelIsSet = app.dataService.selectedData.model !== null;
                console.log('[App] Model selection status:', {
                    modelFound,
                    selectedModelId,
                    modelIsSet,
                    dataServiceModel: app.dataService.selectedData.model
                });
                
                // Now we can safely go to step 2
                if (modelIsSet) {
                    console.log('[App] Model successfully set, moving to step 2');
                    // Force update the UI to show model as selected
                    app.stepManager.checkNextButton();
                    
                    // Small delay to ensure UI updates
                    setTimeout(() => {
                        app.stepManager.goToStep(2);
                        showToast('선택한 모델로 동영상 제작을 시작합니다.', 'info');
                    }, 100);
                } else {
                    console.log('[App] Model not properly set, staying on step 1');
                    showToast('모델을 다시 선택해주세요.', 'warning');
                    // Ensure we stay on step 1
                    app.stepManager.goToStep(1);
                }
            }, 1500);
        }
        
        // Featured models will be loaded when Firebase is ready
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
        
        // Stop premium carousel auto-scroll if it exists (for ANY model selection)
        if (window.premiumManager && window.premiumManager.autoScrollAnimation) {
            window.premiumManager.stopAutoScroll();
        }
        
        // If this is a premium model in carousel, center it
        if (element.closest('.premium-models-carousel')) {
            // Center the selected model
            const carousel = element.closest('.premium-models-carousel');
            const cardRect = element.getBoundingClientRect();
            const carouselRect = carousel.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const carouselCenter = carouselRect.left + carouselRect.width / 2;
            const scrollOffset = cardCenter - carouselCenter;
            
            carousel.scrollTo({
                left: carousel.scrollLeft + scrollOffset,
                behavior: 'smooth'
            });
        }
        
        if (tier === 'premium') {
            showToast('🎬 프리미엄 배우가 선택되었습니다! 100 크레딧이 차감됩니다.', 'info');
        } else if (tier === 'vip') {
            showToast('💎 VIP 모델이 선택되었습니다!', 'info');
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
        
        // Update current image comparison area
        updateCurrentImageComparison(cut, element);
        
        app.stepManager.checkNextButton();
        updateImageSelectionButton();
    } catch (error) {
        handleError(error, 'Image selection');
    }
}

/**
 * Update current image comparison area
 */
function updateCurrentImageComparison(cut, selectedElement) {
    try {
        const currentImageElement = document.getElementById(`${cut}CurrentImage`);
        const placeholderElement = document.getElementById(`${cut}CurrentPlaceholder`);
        const containerElement = currentImageElement?.parentElement;
        
        if (!currentImageElement || !placeholderElement || !containerElement) {
            console.warn(`Current image comparison elements not found for ${cut}`);
            return;
        }
        
        if (selectedElement) {
            // Get the selected image source
            const selectedImg = selectedElement.querySelector('img');
            if (selectedImg && selectedImg.src) {
                // Update current image
                currentImageElement.src = selectedImg.src;
                currentImageElement.alt = `현재 ${cut} 이미지`;
                currentImageElement.style.display = 'block';
                
                // Hide placeholder
                placeholderElement.style.display = 'none';
                
                // Add visual indicator
                containerElement.classList.add('has-image');
                
                console.log(`Updated current image for ${cut}`);
            }
        } else {
            // Clear current image
            currentImageElement.src = '';
            currentImageElement.style.display = 'none';
            
            // Show placeholder
            placeholderElement.style.display = 'flex';
            
            // Remove visual indicator
            containerElement.classList.remove('has-image');
            
            console.log(`Cleared current image for ${cut}`);
        }
    } catch (error) {
        console.error('Error updating current image comparison:', error);
    }
}

/**
 * Initialize current image comparison on page load
 */
function initializeCurrentImageComparison() {
    try {
        const data = app?.dataService?.getData();
        if (!data || !data.selectedImages) return;
        
        const cuts = ['cut1', 'cut2', 'cut3'];
        
        cuts.forEach(cutId => {
            const selectedImageId = data.selectedImages[cutId];
            if (selectedImageId) {
                // Find the selected image element
                const selectedElement = document.querySelector(
                    `.image-grid[data-cut-section="${cutId}"] .image-option.selected`
                );
                
                if (selectedElement) {
                    updateCurrentImageComparison(cutId, selectedElement);
                }
            }
        });
    } catch (error) {
        console.error('Error initializing current image comparison:', error);
    }
}

/**
 * Navigation functions
 */
function nextStep() {
    console.log('nextStep called', {
        app: !!app,
        currentStep: app?.stepManager?.currentStep,
        TermsPopup: !!window.TermsPopup,
        termsAgreed: app?.dataService?.selectedData?.termsAgreed,
        model: app?.dataService?.selectedData?.model
    });
    
    // Show terms popup when moving from step 1 to step 2 (after model selection)
    if (app && app.stepManager.currentStep === 1 && window.TermsPopup && !app.dataService.selectedData.termsAgreed) {
        // Check if model is selected first
        if (!app.dataService.selectedData.model) {
            showToast('먼저 모델을 선택해주세요.', 'warning');
            return;
        }
        
        console.log('Showing terms popup for movie maker');
        const termsPopup = new TermsPopup({
            context: 'movie-maker',
            onAgree: (agreements) => {
                console.log('Terms agreed', agreements);
                // Store agreements in app data
                if (app.dataService) {
                    app.dataService.selectedData.termsAgreements = agreements;
                    app.dataService.selectedData.termsAgreedAt = new Date().toISOString();
                    app.dataService.selectedData.termsAgreed = true;
                }
                
                showToast('약관에 동의하셨습니다. 동영상 제작을 시작합니다!', 'success');
                app.stepManager.nextStep();
            },
            onCancel: () => {
                console.log('Terms cancelled');
                showToast('약관 동의가 필요합니다.', 'warning');
            }
        });
        termsPopup.show();
    } else if (app) {
        console.log('Proceeding to next step without terms popup');
        app.stepManager.nextStep();
    }
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
        
        showToast('시나리오가 승인되었습니다! 영상 제작을 시작합니다.', 'success');
        
        // Directly go to next step without showing the redundant button
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
        showToast('모델 등록 페이지로 이동합니다! 🌟', 'info');
        // Navigate to model registration page
        setTimeout(() => {
            window.location.href = URLS.MODEL_REGISTRATION;
        }, 1000);
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
            // Make sure it's visible (in case it was hidden after completion)
            advancedEditSection.style.display = 'block';
            
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
                // Add navigation guard to prevent immediate re-navigation after completion
                if (window.videoRegenerationCompleted && Date.now() - window.videoCompletionTime < 5000) {
                    showToast('영상 제작이 방금 완료되었습니다. 잠시 후 다시 시도해주세요.', 'warning');
                    return;
                }
                
                showToast(`영상 컷 선택 화면으로 이동합니다.`, 'info');
                
                // Reset the image selection flag since this is video-only regeneration
                window.cameFromImageSelection = false;
                
                // Navigate to Step 8 (Video Cut Selection)
                setTimeout(() => {
                    if (app && app.stepManager) {
                        // Set flag to allow access to step 8
                        window.isFromAdvancedEditMode = true;
                        app.stepManager.goToStep(8);
                        // Initialize video cuts after navigation
                        setTimeout(() => {
                            initializeEnhancedVideoCuts();
                            // Reset flag after navigation
                            window.isFromAdvancedEditMode = false;
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
            
            // Initialize current image comparison when image preview section becomes visible
            setTimeout(() => {
                initializeCurrentImageComparison();
            }, 100);
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
            updateImageSelectionButton();
            
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
                button.textContent = '선택된 이미지로 영상 컷 생성';
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
        
        // Get current image selection configuration
        const imageConfig = getImageSelectionConfiguration();
        console.log('Image selection configuration:', imageConfig);
        
        // Check if all cuts are ready (either selected images or keep original)
        const cuts = ['cut1', 'cut2', 'cut3'];
        let allReady = true;
        
        for (const cutId of cuts) {
            if (imageConfig[cutId] === 'keep') {
                // Cut is keeping original, so it's ready
                continue;
            } else if (imageConfig[cutId] === 'new') {
                // Cut needs new image selection
                if (!data.selectedImages[cutId]) {
                    allReady = false;
                    break;
                }
            }
        }
        
        if (!allReady) {
            showToast('모든 컷의 이미지를 선택하거나 원본 유지를 선택해주세요.', 'warning');
            return;
        }
        
        // Store image configuration for use during processing
        window.currentImageConfiguration = imageConfig;
        
        // Set flag BEFORE navigation starts to prevent race condition
        window.cameFromImageSelection = true;
        console.log('Setting cameFromImageSelection flag to true');
        
        // Show appropriate message based on configuration
        const keepCount = cuts.filter(cutId => imageConfig[cutId] === 'keep').length;
        const newCount = 3 - keepCount;
        
        if (keepCount === 0) {
            showToast('선택된 이미지로 영상 컷을 생성하고 있습니다...', 'info');
        } else if (newCount === 0) {
            showToast('원본 영상을 그대로 사용합니다.', 'info');
        } else {
            showToast(`${newCount}개 컷을 새로 생성하고 ${keepCount}개 원본을 유지합니다...`, 'info');
        }
        
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
        // Mark all cuts as NOT selected initially
        const cuts = ['cut1', 'cut2', 'cut3'];
        cuts.forEach(cut => {
            const button = document.querySelector(`[data-cut="${cut}"]`);
            if (button) {
                button.classList.remove('selected');
                button.classList.remove('btn-selected');
                button.classList.add('btn-success');
                button.innerHTML = '이 컷 사용';
            }
        });
        
        // Update proceed button state (should be disabled initially)
        updateProceedButton();
        
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
                // Deselect
                button.classList.remove('selected');
                button.classList.remove('btn-selected');
                button.classList.add('btn-success');
                button.innerHTML = '이 컷 사용';
            } else {
                // Select
                button.classList.add('selected');
                button.classList.remove('btn-success');
                button.classList.add('btn-selected');
                button.innerHTML = '✓ 선택됨';
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
        const selectedCuts = document.querySelectorAll('[data-cut].selected, [data-cut].btn-selected');
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
        // Get current cut configuration
        const cutConfiguration = getCurrentCutConfiguration();
        const { regenerationCount, totalCost } = updateCostCalculation();
        
        console.log('Cut configuration:', cutConfiguration);
        console.log('Regeneration count:', regenerationCount, 'Total cost:', totalCost);
        
        // Store configuration for use during processing
        window.currentCutConfiguration = cutConfiguration;
        
        // Show appropriate message based on configuration
        if (regenerationCount === 0) {
            showToast('기존 영상을 그대로 사용합니다.', 'info');
            
            // Skip regeneration and go directly to results
            // Set completion flags to prevent navigation loop
            window.videoRegenerationCompleted = true;
            window.videoCompletionTime = Date.now();
            window.preventStep8Navigation = true;
            
            setTimeout(() => {
                if (app && app.stepManager) {
                    app.stepManager.goToStep(7);
                    showToast('영상 제작이 완료되었습니다! 🎬', 'success');
                    
                    // Clear the navigation guard after a delay
                    setTimeout(() => {
                        window.preventStep8Navigation = false;
                    }, 5000);
                }
            }, 1000);
            
        } else if (regenerationCount === 3) {
            showToast(`전체 컷을 새로 생성합니다... (${totalCost} 토큰 소모)`, 'info');
            
            // Navigate to Step 6 for full regeneration
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
            
        } else {
            showToast(`${regenerationCount}개 컷을 새로 생성합니다... (${totalCost} 토큰 소모)`, 'info');
            
            // Navigate to Step 6 for partial regeneration
            setTimeout(() => {
                if (app && app.stepManager) {
                    app.stepManager.goToStep(6);
                    
                    // Set flag to trigger partial video regeneration progress
                    window.videoRegenerationInProgress = true;
                    window.partialRegenerationInProgress = true;
                    
                    // Start the video regeneration progress
                    setTimeout(() => {
                        startPartialVideoRegenerationProgress();
                    }, 500);
                }
            }, 1000);
        }
        
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
// Enhanced Video Cut Selection Functions
// ========================================

/**
 * Handle cut option change (keep vs regenerate)
 */
function handleCutOptionChange(cutId, option) {
    try {
        console.log(`Cut ${cutId} option changed to: ${option}`);
        
        // Update cut status display
        const statusElement = document.getElementById(`${cutId}Status`);
        const container = document.querySelector(`[data-cut="${cutId}"]`);
        
        if (statusElement && container) {
            if (option === 'keep') {
                statusElement.textContent = '기존 컷 유지';
                statusElement.className = 'cut-status';
                container.className = 'video-cut-container keeping';
            } else {
                statusElement.textContent = '새로 생성';
                statusElement.className = 'cut-status regenerating';
                container.className = 'video-cut-container regenerating';
            }
        }
        
        // Update cost calculation
        updateCostCalculation();
        
        // Update proceed button text
        updateProceedButton();
        
    } catch (error) {
        console.error('Error in handleCutOptionChange:', error);
    }
}

/**
 * Update cost calculation based on selected options
 */
function updateCostCalculation() {
    try {
        const cuts = ['cut1', 'cut2', 'cut3'];
        let regenerationCount = 0;
        
        cuts.forEach(cutId => {
            const regenerateRadio = document.querySelector(`input[name="${cutId}Option"][value="regenerate"]`);
            if (regenerateRadio && regenerateRadio.checked) {
                regenerationCount++;
            }
        });
        
        const costPerCut = 5;
        const totalCost = regenerationCount * costPerCut;
        
        // Update UI
        const regenerationCountElement = document.getElementById('regenerationCount');
        const totalCostElement = document.getElementById('totalCost');
        
        if (regenerationCountElement) {
            regenerationCountElement.textContent = regenerationCount;
        }
        
        if (totalCostElement) {
            totalCostElement.textContent = totalCost;
        }
        
        return { regenerationCount, totalCost };
        
    } catch (error) {
        console.error('Error in updateCostCalculation:', error);
        return { regenerationCount: 0, totalCost: 0 };
    }
}

/**
 * Update proceed button text based on selections
 */
function updateProceedButton() {
    try {
        const { regenerationCount, totalCost } = updateCostCalculation();
        
        const proceedButtonText = document.getElementById('proceedButtonText');
        const proceedButtonCost = document.getElementById('proceedButtonCost');
        
        if (proceedButtonText && proceedButtonCost) {
            if (regenerationCount === 0) {
                proceedButtonText.textContent = '기존 영상 그대로 사용';
                proceedButtonCost.textContent = '(무료)';
            } else if (regenerationCount === 3) {
                proceedButtonText.textContent = '전체 컷 새로 생성';
                proceedButtonCost.textContent = `(${totalCost} 토큰)`;
            } else {
                proceedButtonText.textContent = `${regenerationCount}개 컷 새로 생성`;
                proceedButtonCost.textContent = `(${totalCost} 토큰)`;
            }
        }
        
    } catch (error) {
        console.error('Error in updateProceedButton:', error);
    }
}

/**
 * Initialize enhanced video cut selection
 */
function initializeEnhancedVideoCuts() {
    try {
        // Initialize all cuts to "keep" state
        const cuts = ['cut1', 'cut2', 'cut3'];
        
        cuts.forEach(cutId => {
            const keepRadio = document.querySelector(`input[name="${cutId}Option"][value="keep"]`);
            if (keepRadio) {
                keepRadio.checked = true;
                handleCutOptionChange(cutId, 'keep');
            }
        });
        
        // Initialize video loading and error handling
        initializeVideoElements();
        
        // Initialize cost calculation
        updateCostCalculation();
        updateProceedButton();
        
        console.log('Enhanced video cut selection initialized');
        
    } catch (error) {
        console.error('Error in initializeEnhancedVideoCuts:', error);
    }
}

/**
 * Initialize video elements with loading and error handling
 */
function initializeVideoElements() {
    try {
        console.log('Starting video initialization...');
        const containers = document.querySelectorAll('.video-cut-container');
        
        containers.forEach((container) => {
            const cutData = container.getAttribute('data-cut');
            const video = container.querySelector('.cut-video');
            const placeholder = container.querySelector('.video-placeholder');
            
            if (!video || !placeholder || !cutData) {
                console.warn(`Missing elements for container:`, container);
                return;
            }
            
            console.log(`Initializing video for ${cutData}`, { video, placeholder });
            
            // Show loading state initially
            showVideoLoadingState(container, cutData);
            
            // Handle successful video load
            video.addEventListener('loadedmetadata', () => {
                console.log(`Video ${cutData} metadata loaded successfully`);
                hideVideoLoadingState(container, cutData);
                container.classList.add('video-loaded');
                
                // Try to play the video
                video.play().catch(error => {
                    console.warn(`Video ${cutData} autoplay failed:`, error);
                    // Show play button if autoplay fails
                    showVideoPlayButton(container, cutData);
                });
            });
            
            // Handle video load errors
            video.addEventListener('error', (e) => {
                console.error(`Video ${cutData} loading error:`, e);
                showVideoErrorState(container, cutData);
            });
            
            // Handle video loading start
            video.addEventListener('loadstart', () => {
                console.log(`Video ${cutData} loading started`);
                showVideoLoadingState(container, cutData);
            });
            
            // Handle video ready to play
            video.addEventListener('canplay', () => {
                console.log(`Video ${cutData} ready to play`);
                hideVideoLoadingState(container, cutData);
                container.classList.add('video-loaded');
            });
            
            // Handle video loading
            video.addEventListener('canplaythrough', () => {
                console.log(`Video ${cutData} can play through`);
                hideVideoLoadingState(container, cutData);
                container.classList.add('video-loaded');
            });
            
            // Force video to load
            video.load();
            
            // Set timeout to handle stuck loading
            setTimeout(() => {
                if (!container.classList.contains('video-loaded') && 
                    !container.classList.contains('video-error')) {
                    console.warn(`Video ${cutData} loading timeout`);
                    showVideoErrorState(container, cutData);
                }
            }, 8000); // 8 second timeout
        });
        
        console.log('Video elements initialized');
        
    } catch (error) {
        console.error('Error in initializeVideoElements:', error);
    }
}

/**
 * Show video loading state
 */
function showVideoLoadingState(container, cutId) {
    try {
        const placeholder = container.querySelector('.video-placeholder');
        const video = container.querySelector('.cut-video');
        
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <div class="loading-spinner"></div>
                <p>비디오 로딩 중...</p>
            `;
        }
        
        if (video) {
            video.style.display = 'none';
        }
        
        container.classList.add('video-loading');
        console.log(`Showing loading state for ${cutId}`);
    } catch (error) {
        console.error('Error in showVideoLoadingState:', error);
    }
}

/**
 * Hide video loading state
 */
function hideVideoLoadingState(container, cutId) {
    try {
        const placeholder = container.querySelector('.video-placeholder');
        const video = container.querySelector('.cut-video');
        
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        if (video) {
            video.style.display = 'block';
        }
        
        container.classList.remove('video-loading');
        console.log(`Hiding loading state for ${cutId}`);
    } catch (error) {
        console.error('Error in hideVideoLoadingState:', error);
    }
}

/**
 * Show video error state
 */
function showVideoErrorState(container, cutId) {
    try {
        const placeholder = container.querySelector('.video-placeholder');
        const video = container.querySelector('.cut-video');
        
        // Hide the video element
        if (video) {
            video.style.display = 'none';
        }
        
        // Show error message in placeholder
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <div class="error-content">
                    <div class="error-icon">⚠️</div>
                    <p>비디오를 로드할 수 없습니다</p>
                    <button class="btn btn-outline" onclick="retryVideoLoad('${cutId}')">다시 시도</button>
                </div>
            `;
        }
        
        container.classList.add('video-error');
        container.classList.remove('video-loading');
        console.log(`Showing error state for ${cutId}`);
        
    } catch (error) {
        console.error('Error in showVideoErrorState:', error);
    }
}

/**
 * Retry video loading
 */
function retryVideoLoad(cutId) {
    try {
        const container = document.querySelector(`[data-cut="${cutId}"]`);
        const video = container.querySelector('.cut-video');
        const placeholder = container.querySelector('.video-placeholder');
        
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <div class="loading-spinner"></div>
                <p>비디오 재로딩 중...</p>
            `;
        }
        
        container.classList.remove('video-error');
        container.classList.add('video-loading');
        
        if (video) {
            video.style.display = 'none';
            video.load();
        }
        
        console.log(`Retrying video load for ${cutId}`);
        
    } catch (error) {
        console.error('Error in retryVideoLoad:', error);
    }
}

/**
 * Show video play button when autoplay fails
 */
function showVideoPlayButton(container, cutId) {
    try {
        const video = container.querySelector('.cut-video');
        const placeholder = container.querySelector('.video-placeholder');
        
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <div class="play-button" onclick="playVideo('${cutId}')">
                    <div class="play-icon">▶️</div>
                    <p>클릭하여 재생</p>
                </div>
            `;
        }
        
        // Add click event to video as well
        if (video) {
            video.addEventListener('click', () => playVideo(cutId));
        }
        
    } catch (error) {
        console.error('Error in showVideoPlayButton:', error);
    }
}

/**
 * Play video manually
 */
function playVideo(cutId) {
    try {
        const container = document.querySelector(`[data-cut="${cutId}"]`);
        const video = container.querySelector('.cut-video');
        const placeholder = container.querySelector('.video-placeholder');
        
        if (video) {
            video.play().then(() => {
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                video.style.display = 'block';
            }).catch(error => {
                console.error(`Failed to play video ${cutId}:`, error);
                showVideoErrorState(container, cutId);
            });
        }
        
    } catch (error) {
        console.error('Error in playVideo:', error);
    }
}

/**
 * Set all cuts to regenerate
 */
function regenerateAllCuts() {
    try {
        const confirmed = confirm('모든 컷을 다시 제작하시겠습니까?\n\n비용: 15 토큰\n시간: 약 5-8분');
        
        if (confirmed) {
            const cuts = ['cut1', 'cut2', 'cut3'];
            
            cuts.forEach(cutId => {
                const regenerateRadio = document.querySelector(`input[name="${cutId}Option"][value="regenerate"]`);
                if (regenerateRadio) {
                    regenerateRadio.checked = true;
                    handleCutOptionChange(cutId, 'regenerate');
                }
            });
            
            showToast('모든 컷이 재생성으로 설정되었습니다.', 'success');
        }
        
    } catch (error) {
        console.error('Error in regenerateAllCuts:', error);
        showToast('설정 변경에 실패했습니다.', 'error');
    }
}

/**
 * Get current cut selection configuration
 */
function getCurrentCutConfiguration() {
    try {
        const cuts = ['cut1', 'cut2', 'cut3'];
        const configuration = {};
        
        cuts.forEach(cutId => {
            const keepRadio = document.querySelector(`input[name="${cutId}Option"][value="keep"]`);
            const regenerateRadio = document.querySelector(`input[name="${cutId}Option"][value="regenerate"]`);
            
            if (keepRadio && keepRadio.checked) {
                configuration[cutId] = 'keep';
            } else if (regenerateRadio && regenerateRadio.checked) {
                configuration[cutId] = 'regenerate';
            } else {
                configuration[cutId] = 'keep'; // Default to keep
            }
        });
        
        return configuration;
        
    } catch (error) {
        console.error('Error in getCurrentCutConfiguration:', error);
        return { cut1: 'keep', cut2: 'keep', cut3: 'keep' };
    }
}

/**
 * Start partial video regeneration progress for mixed scenarios
 */
function startPartialVideoRegenerationProgress() {
    try {
        if (app && app.stepManager) {
            app.stepManager.startPartialVideoRegenerationProgress();
        }
    } catch (error) {
        console.error('Error in startPartialVideoRegenerationProgress:', error);
        showToast('부분 영상 재생성 시작에 실패했습니다.', 'error');
    }
}

// ========================================
// Enhanced Image Selection Functions
// ========================================

/**
 * Toggle between new image selection and keep original cut
 */
function toggleCutMode(cutId, mode) {
    try {
        console.log(`Cut ${cutId} mode changed to: ${mode}`);
        
        const selectionArea = document.getElementById(`${cutId}Selection`);
        const originalInfo = document.getElementById(`${cutId}OriginalInfo`);
        
        if (mode === 'keep') {
            // Hide image selection area and show original cut info
            if (selectionArea) {
                selectionArea.style.display = 'none';
            }
            if (originalInfo) {
                originalInfo.style.display = 'block';
            }
            
            // Update current image comparison to show original placeholder
            updateCurrentImageComparison(cutId, null);
            
            // Update placeholder text to indicate keeping original
            const placeholderElement = document.getElementById(`${cutId}CurrentPlaceholder`);
            const comparisonElement = document.getElementById(`${cutId}CurrentComparison`);
            if (placeholderElement) {
                const textElement = placeholderElement.querySelector('.placeholder-text');
                if (textElement) {
                    textElement.textContent = '원본 컷을 유지합니다';
                }
            }
            
            // Add visual styling for keeping original
            if (comparisonElement) {
                comparisonElement.classList.add('keeping-original');
            }
            
            // Mark this cut as using original
            if (app && app.dataService) {
                app.dataService.updateImageSelection(cutId, 'original');
            }
            
        } else {
            // Show image selection area and hide original cut info
            if (selectionArea) {
                selectionArea.style.display = 'block';
            }
            if (originalInfo) {
                originalInfo.style.display = 'none';
            }
            
            // Check if there's already a selected image and update current comparison
            const selectedElement = document.querySelector(
                `.image-grid[data-cut-section="${cutId}"] .image-option.selected`
            );
            if (selectedElement) {
                updateCurrentImageComparison(cutId, selectedElement);
            } else {
                updateCurrentImageComparison(cutId, null);
                
                // Reset placeholder text to default
                const placeholderElement = document.getElementById(`${cutId}CurrentPlaceholder`);
                const comparisonElement = document.getElementById(`${cutId}CurrentComparison`);
                if (placeholderElement) {
                    const textElement = placeholderElement.querySelector('.placeholder-text');
                    if (textElement) {
                        const cutNumber = cutId.replace('cut', '');
                        textElement.textContent = `컷 ${cutNumber} 이미지가 선택되지 않았습니다`;
                    }
                }
                
                // Remove keeping-original styling
                if (comparisonElement) {
                    comparisonElement.classList.remove('keeping-original');
                }
            }
            
            // Clear original selection
            if (app && app.dataService) {
                app.dataService.updateImageSelection(cutId, null);
            }
        }
        
        // Update proceed button state
        updateImageSelectionButton();
        
    } catch (error) {
        console.error('Error in toggleCutMode:', error);
        showToast('컷 모드 변경에 실패했습니다.', 'error');
    }
}

/**
 * Update the proceed button state based on image selections
 */
function updateImageSelectionButton() {
    try {
        const proceedButton = document.getElementById('step6ImageNext');
        if (!proceedButton) return;
        
        const cuts = ['cut1', 'cut2', 'cut3'];
        let allCutsReady = true;
        
        for (const cutId of cuts) {
            const keepRadio = document.querySelector(`input[name="${cutId}Mode"][value="keep"]`);
            const newRadio = document.querySelector(`input[name="${cutId}Mode"][value="new"]`);
            
            if (keepRadio && keepRadio.checked) {
                // This cut is keeping original, so it's ready
                continue;
            } else if (newRadio && newRadio.checked) {
                // This cut needs new image selection
                const data = app ? app.dataService.getData() : null;
                if (!data || !data.selectedImages || !data.selectedImages[cutId]) {
                    allCutsReady = false;
                    break;
                }
            }
        }
        
        proceedButton.disabled = !allCutsReady;
        
        // Update button styling based on enabled/disabled state
        if (allCutsReady) {
            proceedButton.classList.remove('btn-disabled');
            proceedButton.classList.add('btn-primary');
        } else {
            proceedButton.classList.add('btn-disabled');
            proceedButton.classList.remove('btn-primary');
        }
        
        // Update button text based on selections
        const keepCount = cuts.filter(cutId => {
            const keepRadio = document.querySelector(`input[name="${cutId}Mode"][value="keep"]`);
            return keepRadio && keepRadio.checked;
        }).length;
        
        const newCount = 3 - keepCount;
        
        if (keepCount === 0) {
            proceedButton.textContent = '선택된 이미지로 영상 컷 생성';
        } else if (newCount === 0) {
            proceedButton.textContent = '원본 영상 그대로 사용';
        } else {
            proceedButton.textContent = `${newCount}개 컷 새로 생성 (${keepCount}개 원본 유지)`;
        }
        
    } catch (error) {
        console.error('Error in updateImageSelectionButton:', error);
    }
}

/**
 * Get current image selection configuration
 */
function getImageSelectionConfiguration() {
    try {
        const cuts = ['cut1', 'cut2', 'cut3'];
        const configuration = {};
        
        cuts.forEach(cutId => {
            const keepRadio = document.querySelector(`input[name="${cutId}Mode"][value="keep"]`);
            const newRadio = document.querySelector(`input[name="${cutId}Mode"][value="new"]`);
            
            if (keepRadio && keepRadio.checked) {
                configuration[cutId] = 'keep';
            } else if (newRadio && newRadio.checked) {
                configuration[cutId] = 'new';
            } else {
                configuration[cutId] = 'new'; // Default to new
            }
        });
        
        return configuration;
        
    } catch (error) {
        console.error('Error in getImageSelectionConfiguration:', error);
        return { cut1: 'new', cut2: 'new', cut3: 'new' };
    }
}

/**
 * Initialize enhanced image selection
 */
function initializeEnhancedImageSelection() {
    try {
        // Initialize all cuts to "new" mode
        const cuts = ['cut1', 'cut2', 'cut3'];
        
        cuts.forEach(cutId => {
            const newRadio = document.querySelector(`input[name="${cutId}Mode"][value="new"]`);
            if (newRadio) {
                newRadio.checked = true;
                toggleCutMode(cutId, 'new');
            }
        });
        
        // Initialize button state
        updateImageSelectionButton();
        
        console.log('Enhanced image selection initialized');
        
    } catch (error) {
        console.error('Error in initializeEnhancedImageSelection:', error);
    }
}

// ========================================
// Featured Models Display
// ========================================

/**
 * Load and display featured models on the main page
 */
async function loadFeaturedModels() {
    const featuredModelsGrid = document.getElementById('featuredModelsGrid');
    const modelCount = document.getElementById('modelCount');
    
    if (!featuredModelsGrid) {
        console.error('featuredModelsGrid not found!');
        return;
    }
    
    // Show loading state (no sample models)
    featuredModelsGrid.innerHTML = '<div class="loading-placeholder"><p>모델을 불러오는 중...</p></div>';
    
    try {
        // Wait for Firebase to be ready
        console.log('[Featured Models] Waiting for Firebase...');
        await waitForFirebase();
        console.log('[Featured Models] Firebase ready!');
        
        // Get active models from Firebase
        console.log('[Featured Models] Fetching models from Firebase...');
        const allModels = await window.modelStorageAdapter.getActiveModels();
        console.log('[Featured Models] Got all models:', allModels.length);
        
        // Filter out premium models (only show basic models)
        const models = allModels.filter(model => 
            !model.tier || model.tier === 'basic'
        );
        console.log('[Featured Models] After filtering premium, basic models:', models.length);
        
        // Update count (show only basic models count)
        modelCount.textContent = `총 ${models.length}개`;
        
        if (models.length === 0) {
            featuredModelsGrid.innerHTML = '<div class="loading-placeholder"><p>등록된 모델이 없습니다.</p></div>';
            return;
        }
        
        // Randomly select 4 models
        const shuffled = [...models].sort(() => Math.random() - 0.5);
        const featuredModels = shuffled.slice(0, 4);
        
        // Debug: log first model structure
        if (featuredModels.length > 0) {
            console.log('[Featured Models] First model structure:', featuredModels[0]);
            console.log('[Featured Models] Portfolio:', featuredModels[0].portfolio);
            console.log('[Featured Models] PersonalInfo:', featuredModels[0].personalInfo);
        }
        
        // Create model cards HTML
        const modelsHTML = featuredModels.map(model => {
            // Try multiple possible locations for thumbnail
            const thumbnailUrl = model.portfolio?.thumbnailUrl || 
                                model.personalInfo?.thumbnailUrl || 
                                model.thumbnailUrl ||
                                model.photos?.[0] ||
                                model.profileImage ||
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTJFOEYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0EwQUVDMCIvPgo8cGF0aCBkPSJNNzAgMTMwQzcwIDExMy40MzEgODMuNDMxNSAxMDAgMTAwIDEwMEMxMTYuNTY5IDEwMCAxMzAgMTEzLjQzMSAxMzAgMTMwVjE2MEg3MFYxMzBaIiBmaWxsPSIjQTBBRUMwIi8+Cjwvc3ZnPg==';
            
            const tier = model.tier || 'basic';
            const name = model.personalInfo?.name || '이름 없음';
            
            return `
            <div class="featured-model-card card" onclick="selectModel(this, '${model.id}', '${tier}')" role="button" tabindex="0"
                 onkeydown="if(event.key==='Enter') selectModel(this, '${model.id}', '${tier}')"
                 aria-label="${name} 선택">
                <img src="${thumbnailUrl}" 
                     alt="${name}" 
                     class="featured-model-image"
                     loading="lazy"
                     onload="this.classList.add('loaded');"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTJFOEYwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iI0E0QUVDMCIvPgo8cGF0aCBkPSJNNzAgMTMwQzcwIDExMy40MzEgODMuNDMxNSAxMDAgMTAwIDEwMEMxMTYuNTY5IDEwMCAxMzAgMTEzLjQzMSAxMzAgMTMwVjE2MEg3MFYxMzBaIiBmaWxsPSIjQTBBRUMwIi8+Cjwvc3ZnPg=='">
                <div class="featured-model-info">
                    <div class="featured-model-name">${name}</div>
                    <div class="featured-model-intro">${model.personalInfo?.intro || '소개 없음'}</div>
                    ${model.personalInfo?.categories?.length > 0 ? `
                        <div class="featured-model-categories">
                            ${model.personalInfo.categories.slice(0, 2).map(cat => 
                                `<span class="featured-model-category">${cat}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `}).join('');
        
        featuredModelsGrid.innerHTML = modelsHTML;
        
        // Optimize image loading by deferring large base64 images
        setTimeout(() => {
            const images = featuredModelsGrid.querySelectorAll('img');
            images.forEach((img, index) => {
                // If the image src is a large base64 string, load it progressively
                if (img.src && img.src.startsWith('data:image') && img.src.length > 10000) {
                    const originalSrc = img.src;
                    // Show placeholder first
                    img.style.filter = 'blur(10px)';
                    img.style.transition = 'filter 0.3s ease';
                    
                    // Load the image after a small delay
                    setTimeout(() => {
                        img.onload = () => {
                            img.style.filter = 'none';
                        };
                        // Force reload to trigger the transition
                        img.src = '';
                        img.src = originalSrc;
                    }, index * 100); // Stagger loading
                }
            });
        }, 100);
        
    } catch (error) {
        console.error('Error loading featured models:', error);
        // Show sample models as fallback
        featuredModelsGrid.innerHTML = `
            <div class="featured-model-card" style="background: white; border: 1px solid #ddd;">
                <div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 48px;">👤</span>
                </div>
                <div class="featured-model-info">
                    <div class="featured-model-name">샘플 모델</div>
                    <div class="featured-model-intro">테스트 모델입니다</div>
                </div>
            </div>
        `;
    }
}

/**
 * Wait for Firebase to be ready
 */
async function waitForFirebase() {
    let retries = 100; // 10 seconds total with 100ms intervals
    while (retries > 0 && (!window.firebaseDB || !window.modelStorageAdapter)) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 500ms to 100ms
        retries--;
    }
    if (!window.modelStorageAdapter) {
        console.error('[Featured Models] Firebase failed to initialize after 10 seconds');
        throw new Error('Firebase initialization timeout');
    }
}

/**
 * Load and display celebrity models
 */
async function loadCelebrityModels() {
    const celebritySection = document.getElementById('celebrityModelsSection');
    const celebrityGrid = document.getElementById('celebrityModelsGrid');
    
    if (!celebritySection || !celebrityGrid) {
        console.log('[Celebrity Models] Section not found, skipping...');
        return;
    }
    
    try {
        console.log('[Celebrity Models] Loading celebrity models...');
        
        // Wait for Firebase
        await waitForFirebase();
        
        // Query for celebrity models - simplified to avoid index requirement
        const celebrityQuery = window.firebaseDB
            .collection('models')
            .where('isCelebrity', '==', true);
            
        const snapshot = await celebrityQuery.get();
        
        // Filter for featured models in memory
        const celebrityDocs = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.featured === true) {
                celebrityDocs.push({ id: doc.id, ...data });
            }
        });
        
        // Sort by name in memory
        celebrityDocs.sort((a, b) => {
            const nameA = a.personalInfo?.name || '';
            const nameB = b.personalInfo?.name || '';
            return nameA.localeCompare(nameB);
        });
        
        if (celebrityDocs.length === 0) {
            console.log('[Celebrity Models] No featured celebrity models found');
            celebritySection.style.display = 'none';
            return;
        }
        
        console.log(`[Celebrity Models] Found ${celebrityDocs.length} featured celebrity models`);
        
        // Create celebrity model cards
        const celebrityHTML = [];
        
        celebrityDocs.forEach(model => {
            const modelId = model.id;
            
            // Get model details
            const name = model.personalInfo?.name || 'Unknown';
            const description = model.portfolio?.description || '';
            const image = model.portfolio?.mainImage || 'https://via.placeholder.com/300x400';
            const tier = model.pricing?.tier || 'premium';
            const price = model.pricing?.basePrice || 100;
            
            celebrityHTML.push(`
                <div class="card" onclick="selectModel(this, '${modelId}', '${tier}')" role="button" tabindex="0"
                     onkeydown="if(event.key==='Enter') selectModel(this, '${modelId}', '${tier}')"
                     aria-label="${name} 모델 선택"
                     data-model-id="${modelId}">
                    <div class="model-image" style="background-image: url('${image}'); background-size: cover; background-position: center;">
                        <div class="badge ${tier === 'vip' ? 'vip-badge' : 'premium-badge'}">${price}💎</div>
                    </div>
                    <h3>${name}</h3>
                    <p>${description}</p>
                </div>
            `);
        });
        
        // Update grid
        celebrityGrid.innerHTML = celebrityHTML.join('');
        
        // Show section
        celebritySection.style.display = 'block';
        
        console.log('[Celebrity Models] Celebrity models loaded successfully');
        
    } catch (error) {
        console.error('[Celebrity Models] Error loading celebrity models:', error);
        celebritySection.style.display = 'none';
    }
}

/**
 * Handle featured model selection
 */
function selectFeaturedModel(modelId, modelName) {
    // Select the model in step 1
    const registeredRadio = document.querySelector('input[value="registered"][name="modelType"]');
    if (registeredRadio) {
        registeredRadio.checked = true;
        toggleModelType('registered');
        
        // Set the selected model
        const registeredSelect = document.getElementById('registeredModelSelect');
        if (registeredSelect) {
            // Add option if not exists
            if (!registeredSelect.querySelector(`option[value="${modelId}"]`)) {
                const option = new Option(modelName, modelId);
                registeredSelect.add(option);
            }
            registeredSelect.value = modelId;
        }
        
        // Show toast
        showToast(`${modelName} 모델이 선택되었습니다.`, 'success');
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