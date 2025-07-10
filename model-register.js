/**
 * xBrush Model Registration System
 * Handles the complete model registration workflow
 */

class ModelRegistrationApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.registrationData = {};
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.signatureCanvas = null;
        this.uploadedImages = [];
        this.kycAttempts = 0;
        this.maxKycAttempts = 3;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            this.setupEventListeners();
            this.updateProgressIndicator();
            this.initializeSignatureCanvas();
            this.setupPortfolioUpload();
            
            console.log('Model Registration App initialized');
        } catch (error) {
            console.error('Error initializing Model Registration App:', error);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Step navigation
        document.querySelectorAll('.step[data-step]').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(step.getAttribute('data-step'));
                this.goToStep(stepNumber);
            });
        });

        // Step 0 - Entry
        document.getElementById('startModelRegistration')?.addEventListener('click', () => {
            this.startRegistration();
        });

        // Step 1 - KYC
        this.setupKYCEventListeners();

        // Step 2 - Contract
        this.setupContractEventListeners();

        // Step 3 - Portfolio
        this.setupPortfolioEventListeners();

        // Step 5 - Product Registration
        this.setupProductRegistrationEventListeners();
    }

    /**
     * Set up KYC event listeners
     */
    setupKYCEventListeners() {
        // ID Upload
        const idUploadArea = document.getElementById('idUploadArea');
        const idUpload = document.getElementById('idUpload');
        
        idUploadArea?.addEventListener('click', () => idUpload.click());
        idUpload?.addEventListener('change', (e) => this.handleIdUpload(e));

        // Face capture
        document.getElementById('startCamera')?.addEventListener('click', () => this.startCamera());
        document.getElementById('capturePhoto')?.addEventListener('click', () => this.capturePhoto());
        document.getElementById('retakePhoto')?.addEventListener('click', () => this.retakePhoto());

        // Video recording
        document.getElementById('generateCode')?.addEventListener('click', () => this.generateRandomCode());
        document.getElementById('startRecording')?.addEventListener('click', () => this.startRecording());
        document.getElementById('stopRecording')?.addEventListener('click', () => this.stopRecording());
        document.getElementById('retakeVideo')?.addEventListener('click', () => this.retakeVideo());

        // Generate initial random code
        this.generateRandomCode();
    }

    /**
     * Set up contract event listeners
     */
    setupContractEventListeners() {
        // Pricing type change
        document.querySelectorAll('input[name="pricingType"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateContractSummary());
        });

        // Period change
        document.querySelectorAll('input[name="contractPeriod"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateContractSummary());
        });

        // Scope changes
        document.querySelectorAll('input[name="highRiskScope"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateContractSummary());
        });

        // 2nd confirmation toggle
        document.getElementById('secondConfirm')?.addEventListener('change', () => this.updateContractSummary());

        // Price inputs
        document.getElementById('flatRate')?.addEventListener('input', () => this.updateContractSummary());
        document.getElementById('shareRate')?.addEventListener('input', () => this.updateContractSummary());
        document.getElementById('customPeriod')?.addEventListener('input', () => this.updateContractSummary());

        // Signature canvas
        document.getElementById('clearSignature')?.addEventListener('click', () => this.clearSignature());

        // Initial contract summary update
        this.updateContractSummary();
    }

    /**
     * Set up portfolio event listeners
     */
    setupPortfolioEventListeners() {
        const dropzone = document.getElementById('portfolioDropzone');
        const fileInput = document.getElementById('portfolioFiles');

        // Dropzone events
        dropzone?.addEventListener('click', () => fileInput.click());
        dropzone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone?.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        dropzone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            this.handlePortfolioUpload(e.dataTransfer.files);
        });

        // File input change
        fileInput?.addEventListener('change', (e) => {
            this.handlePortfolioUpload(e.target.files);
        });

        // Gallery controls
        document.getElementById('selectAllImages')?.addEventListener('click', () => this.selectAllImages());
        document.getElementById('deleteSelectedImages')?.addEventListener('click', () => this.deleteSelectedImages());
    }

    /**
     * Set up product registration event listeners
     */
    setupProductRegistrationEventListeners() {
        // Model name input
        const modelNameInput = document.getElementById('modelName');
        modelNameInput?.addEventListener('input', () => this.checkProductRegistrationCompletion());
        
        // Model intro input
        const modelIntroInput = document.getElementById('modelIntro');
        modelIntroInput?.addEventListener('input', () => this.checkProductRegistrationCompletion());
        
        // Model description input
        const modelDescInput = document.getElementById('modelDescription');
        modelDescInput?.addEventListener('input', () => this.checkProductRegistrationCompletion());
        
        // Category checkboxes
        const categoryCheckboxes = document.querySelectorAll('input[name="modelCategory"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.checkProductRegistrationCompletion());
        });
        
        // Initial check for form completion
        setTimeout(() => {
            this.checkProductRegistrationCompletion();
        }, 100);
    }

    /**
     * Go to specific step
     */
    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        // Validate step progression
        if (stepNumber > this.currentStep + 1) {
            this.showToast('이전 단계를 먼저 완료해주세요.', 'warning');
            return;
        }

        // Hide current step
        document.getElementById(`modelStep${this.currentStep}`)?.classList.remove('active');
        document.querySelector(`.step[data-step="${this.currentStep}"]`)?.classList.remove('active');

        // Show new step
        this.currentStep = stepNumber;
        document.getElementById(`modelStep${this.currentStep}`)?.classList.add('active');
        document.querySelector(`.step[data-step="${this.currentStep}"]`)?.classList.add('active');

        // Update progress indicators
        this.updateProgressIndicator();
        
        // Scroll to top of page for better user experience
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Handle step-specific actions
        this.handleStepEntry(stepNumber);
    }

    /**
     * Handle step entry actions
     */
    handleStepEntry(stepNumber) {
        switch(stepNumber) {
            case 2:
                this.resetKYCState();
                break;
            case 3:
                this.updateContractSummary();
                break;
            case 4:
                this.updateImageCount();
                break;
            case 5:
                this.setupProductRegistration();
                break;
            case 6:
                // Enable the review start button instead of auto-starting
                const reviewButton = document.getElementById('step6Next');
                if (reviewButton) {
                    reviewButton.disabled = false;
                    reviewButton.textContent = '검수 신청';
                }
                break;
            case 7:
                // Update final step with model information
                this.updateFinalStep();
                break;
        }
    }

    /**
     * Update progress indicator
     */
    updateProgressIndicator() {
        // Update step indicator
        document.querySelector('.current-step').textContent = this.currentStep;
        
        // Update progress line
        const progressPercentage = (this.currentStep / this.totalSteps) * 100;
        const progressLine = document.getElementById('modelProgressLine');
        if (progressLine) {
            progressLine.style.width = `${progressPercentage}%`;
        }

        // Update step buttons
        document.querySelectorAll('.step[data-step]').forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    /**
     * Start registration process
     */
    startRegistration() {
        this.showToast('모델 등록을 시작합니다!', 'success');
        this.goToStep(2);
    }

    /**
     * Navigate to next step
     */
    nextModelStep() {
        if (this.validateCurrentStep()) {
            // Special handling for completing step 6 (review)
            if (this.currentStep === 6) {
                this.completeRegistration();
            }
            this.goToStep(this.currentStep + 1);
        }
    }

    /**
     * Navigate to previous step
     */
    prevModelStep() {
        this.goToStep(this.currentStep - 1);
    }

    /**
     * Validate current step
     */
    validateCurrentStep() {
        switch(this.currentStep) {
            case 2:
                return this.validateKYC();
            case 3:
                return this.validateContract();
            case 4:
                return this.validatePortfolio();
            case 5:
                return this.validateProductRegistration();
            case 6:
                return this.validateReview();
            default:
                return true;
        }
    }

    // ==========================================
    // KYC FUNCTIONALITY
    // ==========================================

    /**
     * Handle ID upload
     */
    async handleIdUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('이미지 파일만 업로드 가능합니다.', 'error');
            return;
        }

        try {
            // Show loading state
            this.updateKYCStatus('kycAStatus', 'processing', '신분증 분석 중...');
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const uploadArea = document.getElementById('idUploadArea');
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                    <p>신분증이 업로드되었습니다</p>
                    <button class="btn btn-outline" onclick="this.closest('#idUploadArea').querySelector('input').click()">다시 선택</button>
                `;
            };
            reader.readAsDataURL(file);

            // Simulate OCR processing
            await this.simulateOCRProcessing(file);
            
            this.registrationData.idDocument = file;
            this.updateKYCStatus('kycAStatus', 'success', '신분증 확인 완료');
            
        } catch (error) {
            this.updateKYCStatus('kycAStatus', 'error', '신분증 분석 실패');
            console.error('ID upload error:', error);
        }
    }

    /**
     * Start camera for face capture
     */
    async startCamera() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            
            const video = document.getElementById('faceVideo');
            video.srcObject = this.mediaStream;
            
            document.getElementById('startCamera').classList.add('hidden');
            document.getElementById('capturePhoto').classList.remove('hidden');
            
        } catch (error) {
            this.showToast('카메라 접근 권한이 필요합니다.', 'error');
            console.error('Camera access error:', error);
        }
    }

    /**
     * Capture photo from video stream
     */
    capturePhoto() {
        const video = document.getElementById('faceVideo');
        const canvas = document.getElementById('faceCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob and store
        canvas.toBlob((blob) => {
            this.registrationData.facePhoto = blob;
            this.showToast('얼굴 사진이 촬영되었습니다.', 'success');
            
            document.getElementById('capturePhoto').classList.add('hidden');
            document.getElementById('retakePhoto').classList.remove('hidden');
            
            // Enable KYC step B
            this.enableKYCStepB();
        });
        
        // Stop camera
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
    }

    /**
     * Retake photo
     */
    retakePhoto() {
        document.getElementById('startCamera').classList.remove('hidden');
        document.getElementById('capturePhoto').classList.add('hidden');
        document.getElementById('retakePhoto').classList.add('hidden');
        
        delete this.registrationData.facePhoto;
        this.disableKYCStepB();
    }

    /**
     * Enable KYC Step B
     */
    enableKYCStepB() {
        const stepB = document.getElementById('kycStepB');
        stepB.classList.remove('disabled');
        this.updateKYCStatus('kycBStatus', '', '준비 완료');
    }

    /**
     * Disable KYC Step B
     */
    disableKYCStepB() {
        const stepB = document.getElementById('kycStepB');
        stepB.classList.add('disabled');
        this.updateKYCStatus('kycBStatus', '', '대기 중');
    }

    /**
     * Generate random 6-digit code
     */
    generateRandomCode() {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        document.getElementById('randomCode').textContent = code;
        this.registrationData.randomCode = code;
    }

    /**
     * Start video recording
     */
    async startRecording() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            const video = document.getElementById('recordingVideo');
            video.srcObject = this.mediaStream;
            
            // Start recording
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            const chunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                this.registrationData.verificationVideo = blob;
                this.processVerificationVideo();
            };
            
            this.mediaRecorder.start();
            
            // Update UI
            document.getElementById('startRecording').classList.add('hidden');
            document.getElementById('stopRecording').classList.remove('hidden');
            document.getElementById('recordingStatus').textContent = '녹화 중';
            document.getElementById('recordingStatus').classList.add('recording');
            
            // Start timer
            this.startRecordingTimer();
            
        } catch (error) {
            this.showToast('카메라/마이크 접근 권한이 필요합니다.', 'error');
            console.error('Recording start error:', error);
        }
    }

    /**
     * Stop video recording
     */
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        
        // Update UI
        document.getElementById('stopRecording').classList.add('hidden');
        document.getElementById('retakeVideo').classList.remove('hidden');
        document.getElementById('recordingStatus').textContent = '녹화 완료';
        document.getElementById('recordingStatus').classList.remove('recording');
        
        this.stopRecordingTimer();
    }

    /**
     * Retake video
     */
    retakeVideo() {
        document.getElementById('startRecording').classList.remove('hidden');
        document.getElementById('stopRecording').classList.add('hidden');
        document.getElementById('retakeVideo').classList.add('hidden');
        document.getElementById('recordingStatus').textContent = '준비';
        document.getElementById('recordingTimer').textContent = '00:00';
        
        delete this.registrationData.verificationVideo;
    }

    /**
     * Start recording timer
     */
    startRecordingTimer() {
        let seconds = 0;
        this.recordingInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('recordingTimer').textContent = 
                `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    /**
     * Stop recording timer
     */
    stopRecordingTimer() {
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
        }
    }

    /**
     * Process verification video
     */
    async processVerificationVideo() {
        try {
            this.updateKYCStatus('kycBStatus', 'processing', '영상 분석 중...');
            
            // Simulate video analysis (STT, deepfake detection, etc.)
            await this.simulateVideoAnalysis();
            
            this.updateKYCStatus('kycBStatus', 'success', '영상 인증 완료');
            this.enableNextStep(1);
            
        } catch (error) {
            this.updateKYCStatus('kycBStatus', 'error', '영상 인증 실패');
            this.handleKYCFailure();
        }
    }

    /**
     * Update KYC status
     */
    updateKYCStatus(elementId, status, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.className = `kyc-status ${status}`;
        }
    }

    /**
     * Reset KYC state
     */
    resetKYCState() {
        this.updateKYCStatus('kycAStatus', '', '대기 중');
        this.updateKYCStatus('kycBStatus', '', '대기 중');
        this.disableKYCStepB();
    }

    /**
     * Validate KYC completion
     */
    validateKYC() {
        const hasIdDocument = this.registrationData.idDocument;
        const hasFacePhoto = this.registrationData.facePhoto;
        const hasVerificationVideo = this.registrationData.verificationVideo;
        
        if (!hasIdDocument || !hasFacePhoto || !hasVerificationVideo) {
            this.showToast('모든 인증 단계를 완료해주세요.', 'warning');
            return false;
        }
        
        return true;
    }

    /**
     * Handle KYC failure
     */
    handleKYCFailure() {
        this.kycAttempts++;
        document.getElementById('kycAttempts').textContent = this.kycAttempts;
        
        if (this.kycAttempts >= this.maxKycAttempts) {
            this.showToast('인증 시도 횟수가 초과되었습니다. 24시간 후 다시 시도해주세요.', 'error');
            // Disable KYC for 24 hours (in real implementation)
        } else {
            this.showToast(`인증에 실패했습니다. ${this.maxKycAttempts - this.kycAttempts}회 더 시도할 수 있습니다.`, 'warning');
        }
    }

    // ==========================================
    // CONTRACT FUNCTIONALITY
    // ==========================================

    /**
     * Update contract summary
     */
    updateContractSummary() {
        // Pricing
        const pricingType = document.querySelector('input[name="pricingType"]:checked')?.value;
        let pricingText = '';
        
        if (pricingType === 'flat') {
            const rate = document.getElementById('flatRate')?.value || '100000';
            pricingText = `정액 ${parseInt(rate).toLocaleString()}원/컷`;
        } else {
            const rate = document.getElementById('shareRate')?.value || '30';
            pricingText = `수익 쉐어 ${rate}%`;
        }
        
        document.getElementById('summaryPricing').textContent = pricingText;

        // Period
        const period = document.querySelector('input[name="contractPeriod"]:checked')?.value;
        let periodText = '';
        
        if (period === 'custom') {
            const customPeriod = document.getElementById('customPeriod')?.value || '12';
            periodText = `${customPeriod}개월`;
        } else {
            periodText = `${period}개월`;
        }
        
        document.getElementById('summaryPeriod').textContent = periodText;

        // High-risk scope
        const highRiskScopes = Array.from(document.querySelectorAll('input[name="highRiskScope"]:checked'))
            .map(cb => cb.value);
        
        const highRiskText = highRiskScopes.length > 0 ? 
            this.getHighRiskScopeNames(highRiskScopes).join(', ') : 
            '선택 안함';
        
        document.getElementById('summaryHighRisk').textContent = highRiskText;

        // 2nd confirmation
        const secondConfirm = document.getElementById('secondConfirm')?.checked;
        document.getElementById('summaryConfirm').textContent = secondConfirm ? '활성화' : '비활성화';

        // Enable/disable next button based on signature
        this.checkContractCompletion();
    }

    /**
     * Get high-risk scope names
     */
    getHighRiskScopeNames(scopes) {
        const names = {
            medical: '의료 광고',
            alcohol: '주류 및 유흥',
            political: '정치 및 선거'
        };
        return scopes.map(scope => names[scope]);
    }

    /**
     * Initialize signature canvas
     */
    initializeSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;
        
        this.signatureCanvas = {
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            isDrawing: false,
            hasSignature: false
        };
        
        // Set up drawing events
        canvas.addEventListener('mousedown', (e) => this.startSignature(e));
        canvas.addEventListener('mousemove', (e) => this.drawSignature(e));
        canvas.addEventListener('mouseup', () => this.endSignature());
        canvas.addEventListener('touchstart', (e) => this.startSignature(e.touches[0]));
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drawSignature(e.touches[0]);
        });
        canvas.addEventListener('touchend', () => this.endSignature());
        
        // Configure canvas
        this.signatureCanvas.ctx.strokeStyle = '#2d3748';
        this.signatureCanvas.ctx.lineWidth = 2;
        this.signatureCanvas.ctx.lineCap = 'round';
    }

    /**
     * Start signature drawing
     */
    startSignature(e) {
        this.signatureCanvas.isDrawing = true;
        const rect = this.signatureCanvas.canvas.getBoundingClientRect();
        this.signatureCanvas.ctx.beginPath();
        this.signatureCanvas.ctx.moveTo(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
    }

    /**
     * Draw signature
     */
    drawSignature(e) {
        if (!this.signatureCanvas.isDrawing) return;
        
        const rect = this.signatureCanvas.canvas.getBoundingClientRect();
        this.signatureCanvas.ctx.lineTo(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        this.signatureCanvas.ctx.stroke();
    }

    /**
     * End signature drawing
     */
    endSignature() {
        if (this.signatureCanvas.isDrawing) {
            this.signatureCanvas.isDrawing = false;
            this.signatureCanvas.hasSignature = true;
            this.checkContractCompletion();
        }
    }

    /**
     * Clear signature
     */
    clearSignature() {
        const canvas = this.signatureCanvas.canvas;
        this.signatureCanvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.signatureCanvas.hasSignature = false;
        this.checkContractCompletion();
    }

    /**
     * Check contract completion
     */
    checkContractCompletion() {
        const isComplete = this.signatureCanvas && this.signatureCanvas.hasSignature;
        const nextButton = document.getElementById('step2Next');
        if (nextButton) {
            nextButton.disabled = !isComplete;
        }
    }

    /**
     * Validate contract completion
     */
    validateContract() {
        if (!this.signatureCanvas || !this.signatureCanvas.hasSignature) {
            this.showToast('전자 서명을 완료해주세요.', 'warning');
            return false;
        }
        
        // Save contract data
        this.saveContractData();
        return true;
    }

    /**
     * Save contract data
     */
    saveContractData() {
        const pricingType = document.querySelector('input[name="pricingType"]:checked')?.value;
        const period = document.querySelector('input[name="contractPeriod"]:checked')?.value;
        const highRiskScopes = Array.from(document.querySelectorAll('input[name="highRiskScope"]:checked'))
            .map(cb => cb.value);
        const secondConfirm = document.getElementById('secondConfirm')?.checked;
        
        this.registrationData.contract = {
            pricingType,
            flatRate: document.getElementById('flatRate')?.value,
            shareRate: document.getElementById('shareRate')?.value,
            period: period === 'custom' ? document.getElementById('customPeriod')?.value : period,
            highRiskScopes,
            secondConfirm,
            signature: this.signatureCanvas.canvas.toDataURL(),
            signedAt: new Date().toISOString()
        };
    }

    // ==========================================
    // PORTFOLIO FUNCTIONALITY
    // ==========================================

    /**
     * Set up portfolio upload
     */
    setupPortfolioUpload() {
        // Don't reset uploadedImages here as it may be called when navigating between steps
        console.log(`setupPortfolioUpload called. Current images: ${this.uploadedImages.length}`);
    }

    /**
     * Handle portfolio upload
     */
    async handlePortfolioUpload(files) {
        const fileArray = Array.from(files);
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showToast('이미지 파일만 업로드 가능합니다.', 'error');
            return;
        }
        
        if (this.uploadedImages.length + imageFiles.length > 50) {
            this.showToast('최대 50장까지 업로드 가능합니다.', 'warning');
            return;
        }
        
        // Show progress
        this.showUploadProgress(true);
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            
            try {
                // Validate image
                await this.validateImageFile(file);
                
                // Create image object
                const imageData = {
                    id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    file: file,
                    name: file.name,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    selected: false
                };
                
                this.uploadedImages.push(imageData);
                console.log(`Portfolio image uploaded: ID=${imageData.id}, Total images: ${this.uploadedImages.length}`);
                this.addImageToGallery(imageData);
                
                // Update progress
                const progress = ((i + 1) / imageFiles.length) * 100;
                this.updateUploadProgress(progress);
                
            } catch (error) {
                console.error('Image upload error:', error);
                this.showToast(`${file.name} 업로드 실패: ${error.message}`, 'error');
            }
        }
        
        this.showUploadProgress(false);
        this.updateImageCount();
        this.checkPortfolioCompletion();
    }

    /**
     * Validate image file
     */
    async validateImageFile(file) {
        return new Promise((resolve, reject) => {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('파일 크기는 10MB 이하여야 합니다.'));
                return;
            }
            
            // Check image dimensions
            const img = new Image();
            img.onload = () => {
                if (img.width < 512 || img.height < 512) {
                    reject(new Error('이미지 크기는 최소 512x512px 이상이어야 합니다.'));
                } else {
                    resolve();
                }
            };
            img.onerror = () => {
                reject(new Error('유효하지 않은 이미지 파일입니다.'));
            };
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Add image to gallery
     */
    addImageToGallery(imageData) {
        const galleryGrid = document.getElementById('galleryGrid');
        const imageElement = document.createElement('div');
        imageElement.className = 'gallery-item';
        imageElement.dataset.imageId = imageData.id;
        
        imageElement.innerHTML = `
            <img src="${imageData.url}" alt="${imageData.name}">
            <div class="gallery-item-overlay">
                <div class="gallery-item-controls">
                    <button class="btn btn-primary" onclick="modelApp.selectImage('${imageData.id}')">선택</button>
                    <button class="btn btn-danger" onclick="modelApp.deleteImage('${imageData.id}')">삭제</button>
                </div>
            </div>
        `;
        
        imageElement.addEventListener('click', () => this.toggleImageSelection(imageData.id));
        
        galleryGrid.appendChild(imageElement);
    }

    /**
     * Toggle image selection
     */
    toggleImageSelection(imageId) {
        const image = this.uploadedImages.find(img => img.id == imageId);
        const element = document.querySelector(`[data-image-id="${imageId}"]`);
        
        if (image && element) {
            image.selected = !image.selected;
            element.classList.toggle('selected', image.selected);
        }
    }

    /**
     * Select all images
     */
    selectAllImages() {
        this.uploadedImages.forEach(image => {
            image.selected = true;
            const element = document.querySelector(`[data-image-id="${image.id}"]`);
            element?.classList.add('selected');
        });
    }

    /**
     * Delete selected images
     */
    deleteSelectedImages() {
        const selectedImages = this.uploadedImages.filter(img => img.selected);
        
        if (selectedImages.length === 0) {
            this.showToast('삭제할 이미지를 선택해주세요.', 'warning');
            return;
        }
        
        if (confirm(`선택된 ${selectedImages.length}장의 이미지를 삭제하시겠습니까?`)) {
            selectedImages.forEach(image => {
                this.deleteImage(image.id);
            });
        }
    }

    /**
     * Delete single image
     */
    deleteImage(imageId) {
        const index = this.uploadedImages.findIndex(img => img.id == imageId);
        
        if (index > -1) {
            // Revoke object URL to free memory
            URL.revokeObjectURL(this.uploadedImages[index].url);
            
            // Remove from array
            this.uploadedImages.splice(index, 1);
            
            // Remove from DOM
            const element = document.querySelector(`[data-image-id="${imageId}"]`);
            element?.remove();
            
            this.updateImageCount();
            this.checkPortfolioCompletion();
        }
    }

    /**
     * Show/hide upload progress
     */
    showUploadProgress(show) {
        const progressElement = document.getElementById('uploadProgress');
        if (progressElement) {
            progressElement.style.display = show ? 'block' : 'none';
        }
        
        if (show) {
            this.updateUploadProgress(0);
        }
    }

    /**
     * Update upload progress
     */
    updateUploadProgress(percentage) {
        const progressFill = document.getElementById('uploadProgressFill');
        const progressText = document.getElementById('uploadProgressText');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}% 완료`;
        }
    }

    /**
     * Update image count
     */
    updateImageCount() {
        const countElement = document.getElementById('imageCount');
        if (countElement) {
            countElement.textContent = this.uploadedImages.length;
        }
    }

    /**
     * Check portfolio completion
     */
    checkPortfolioCompletion() {
        // Enable next button regardless of image count for testing
        const nextButton = document.getElementById('step4Next');
        if (nextButton) {
            nextButton.disabled = false;
        }
    }

    /**
     * Validate portfolio completion
     */
    validatePortfolio() {
        // Allow any number of images for testing
        this.registrationData.portfolio = this.uploadedImages;
        return true;
    }

    // ==========================================
    // PRODUCT REGISTRATION FUNCTIONALITY
    // ==========================================

    /**
     * Setup product registration step
     */
    setupProductRegistration() {
        // Enable thumbnail selection
        this.setupThumbnailSelection();
        
        // Check if step is complete
        this.checkProductRegistrationCompletion();
    }

    /**
     * Setup thumbnail selection
     */
    setupThumbnailSelection() {
        const thumbnailInput = document.getElementById('thumbnailInput');
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        const thumbnailPlaceholder = document.getElementById('thumbnailPlaceholder');
        const resetBtn = document.getElementById('resetThumbnailBtn');

        if (thumbnailInput) {
            thumbnailInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        thumbnailPreview.src = e.target.result;
                        thumbnailPreview.style.display = 'block';
                        thumbnailPlaceholder.style.display = 'none';
                        resetBtn.style.display = 'inline-block';
                        
                        this.registrationData.thumbnail = file;
                        this.checkProductRegistrationCompletion();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    /**
     * Open thumbnail selector modal
     */
    openThumbnailSelector() {
        console.log('=== Opening thumbnail selector ===');
        console.log('Current step:', this.currentStep);
        console.log('Uploaded images count:', this.uploadedImages ? this.uploadedImages.length : 0);
        console.log('Uploaded images:', this.uploadedImages);
        
        // Check if there are any uploaded images
        if (!this.uploadedImages || this.uploadedImages.length === 0) {
            console.warn('No uploaded images found. User needs to upload portfolio images first.');
            this.showToast('먼저 포트폴리오 이미지를 업로드해주세요.', 'warning');
            // Navigate to portfolio step
            this.goToStep(4);
            return;
        }
        
        // Reset selection state
        this.selectedThumbnailId = null;
        
        // Load thumbnails first
        this.loadPortfolioThumbnails();
        
        const modal = document.getElementById('thumbnailModal');
        console.log('Modal element found:', !!modal);
        
        if (modal) {
            // Clear any previous styles
            modal.removeAttribute('style');
            
            // Set modal to visible
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '10000';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            
            console.log('Modal display set to:', modal.style.display);
            console.log('Modal computed display:', window.getComputedStyle(modal).display);
            
            // Add diagnostic click handler to the modal
            const modalClickHandler = (e) => {
                console.log('Modal clicked, target:', e.target);
                console.log('Target classes:', e.target.className);
                console.log('Event phase:', e.eventPhase);
            };
            modal.removeEventListener('click', modal._diagnosticHandler);
            modal._diagnosticHandler = modalClickHandler;
            modal.addEventListener('click', modalClickHandler, true);
            
            // Focus on the modal for accessibility
            const modalContent = modal.querySelector('.thumbnail-modal-content');
            if (modalContent) {
                modalContent.focus();
            }
            
            // Update confirm button state
            this.updateThumbnailConfirmButton();
        } else {
            console.error('Thumbnail modal element not found');
            this.showToast('썸네일 선택 모달을 열 수 없습니다.', 'error');
        }
    }

    /**
     * Close thumbnail selector modal
     */
    closeThumbnailSelector() {
        document.getElementById('thumbnailModal').style.display = 'none';
        this.selectedThumbnailId = null;
        this.updateThumbnailConfirmButton();
    }

    /**
     * Load portfolio images for thumbnail selection
     */
    loadPortfolioThumbnails() {
        console.log('Loading portfolio thumbnails...');
        const grid = document.getElementById('portfolioThumbnailGrid');
        
        if (!grid) {
            console.error('Portfolio thumbnail grid element not found');
            return;
        }
        
        console.log('Found grid element, uploaded images count:', this.uploadedImages.length);
        
        if (this.uploadedImages.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #718096;">
                    <p>포트폴리오에 업로드된 이미지가 없습니다.</p>
                    <p>먼저 포트폴리오 단계에서 이미지를 업로드해주세요.</p>
                </div>
            `;
            console.log('No images found, showing empty message');
            return;
        }

        // Clear existing content
        grid.innerHTML = '';
        
        // Create thumbnails
        this.uploadedImages.forEach(image => {
            if (!image.id || !image.url) {
                console.warn('Invalid image data:', image);
                return;
            }
            
            const thumbnailItem = document.createElement('div');
            thumbnailItem.className = 'portfolio-thumbnail-item';
            thumbnailItem.setAttribute('data-image-id', image.id);
            thumbnailItem.setAttribute('role', 'button');
            thumbnailItem.setAttribute('tabindex', '0');
            // Ensure relative positioning for absolute child
            thumbnailItem.style.position = 'relative';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = 'Portfolio image';
            
            const indicator = document.createElement('div');
            indicator.className = 'selection-indicator';
            indicator.textContent = '✓';
            // Remove the opacity from initial styles
            indicator.style.cssText = `
                position: absolute !important;
                top: 5px !important;
                right: 5px !important;
                width: 30px !important;
                height: 30px !important;
                background: #667eea !important;
                border-radius: 50% !important;
                display: none !important;
                align-items: center !important;
                justify-content: center !important;
                color: white !important;
                font-size: 18px !important;
                font-weight: bold !important;
                z-index: 999 !important;
                border: 3px solid white !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
            `;
            
            thumbnailItem.appendChild(img);
            thumbnailItem.appendChild(indicator);
            
            grid.appendChild(thumbnailItem);
        });
        
        // Add a single event listener on the grid using event delegation
        const handleClick = (e) => {
            const item = e.target.closest('.portfolio-thumbnail-item');
            if (item && item.parentElement === grid) {
                const imageId = item.getAttribute('data-image-id');
                console.log('Thumbnail clicked via delegation, ID:', imageId);
                if (imageId) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectPortfolioThumbnail(imageId);
                }
            }
        };
        
        // Remove any existing listeners first
        grid.removeEventListener('click', grid._thumbnailClickHandler);
        grid.removeEventListener('touchend', grid._thumbnailTouchHandler);
        
        // Store references to handlers so we can remove them later
        grid._thumbnailClickHandler = handleClick;
        grid._thumbnailTouchHandler = handleClick;
        
        // Add event listeners
        grid.addEventListener('click', handleClick);
        grid.addEventListener('touchend', handleClick);
        
        // Handle keyboard navigation
        grid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleClick(e);
            }
        });
        
        console.log('Portfolio thumbnails loaded successfully');
    }

    /**
     * Select portfolio image as thumbnail
     */
    selectPortfolioThumbnail(imageId) {
        console.log('selectPortfolioThumbnail called with:', imageId);
        console.log('Available uploaded images:', this.uploadedImages.map(img => img.id));
        
        // Validate that the image exists
        const imageExists = this.uploadedImages.find(img => img.id === imageId);
        if (!imageExists) {
            console.error('Image with ID not found in uploadedImages:', imageId);
            return;
        }
        
        // Remove previous selection
        document.querySelectorAll('.portfolio-thumbnail-item').forEach(item => {
            item.classList.remove('selected');
            // Clear inline styles
            item.style.borderColor = '';
            item.style.borderWidth = '';
            item.style.transform = '';
            item.style.boxShadow = '';
            
            // Hide selection indicator
            const indicator = item.querySelector('.selection-indicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
            
            console.log('Removed selection from item:', item.getAttribute('data-image-id'));
        });
        
        // Add selection to clicked item
        const selectedItem = document.querySelector(`[data-image-id="${imageId}"]`);
        console.log('Selected item found:', !!selectedItem);
        console.log('Selected item element:', selectedItem);
        
        if (selectedItem) {
            selectedItem.classList.add('selected');
            
            // Force visual feedback with inline styles
            selectedItem.style.borderColor = '#667eea';
            selectedItem.style.borderWidth = '3px';
            selectedItem.style.transform = 'scale(1.02)';
            selectedItem.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.3)';
            
            // Make selection indicator visible
            const indicator = selectedItem.querySelector('.selection-indicator');
            if (indicator) {
                // Use display flex to show the checkmark
                indicator.style.display = 'flex';
                console.log('Selection indicator made visible');
                console.log('Indicator element:', indicator);
                console.log('Indicator display:', window.getComputedStyle(indicator).display);
            } else {
                console.error('Selection indicator not found in selected item');
            }
            
            this.selectedThumbnailId = imageId;
            console.log('Selected thumbnail ID set to:', this.selectedThumbnailId);
            console.log('Classes after selection:', selectedItem.classList.toString());
            this.updateThumbnailConfirmButton();
            
            // Add toast notification for feedback
            this.showToast('이미지가 선택되었습니다', 'success');
        } else {
            console.error('Could not find thumbnail item with ID:', imageId);
            console.log('All thumbnail items:', document.querySelectorAll('.portfolio-thumbnail-item'));
        }
    }

    /**
     * Update confirm button state
     */
    updateThumbnailConfirmButton() {
        const confirmBtn = document.getElementById('confirmThumbnailBtn');
        console.log('Updating confirm button, selectedThumbnailId:', this.selectedThumbnailId);
        console.log('Confirm button found:', !!confirmBtn);
        console.log('Confirm button element:', confirmBtn);
        
        if (confirmBtn) {
            const shouldDisable = !this.selectedThumbnailId;
            confirmBtn.disabled = shouldDisable;
            
            // Visual feedback
            if (shouldDisable) {
                confirmBtn.style.opacity = '0.5';
                confirmBtn.style.cursor = 'not-allowed';
            } else {
                confirmBtn.style.opacity = '1';
                confirmBtn.style.cursor = 'pointer';
            }
            
            console.log('Confirm button disabled:', confirmBtn.disabled);
            console.log('Confirm button styles updated');
        } else {
            console.error('Confirm button element not found in DOM');
        }
    }

    /**
     * Confirm thumbnail selection
     */
    confirmThumbnailSelection() {
        if (!this.selectedThumbnailId) return;
        
        const selectedImage = this.uploadedImages.find(img => img.id === this.selectedThumbnailId);
        if (selectedImage) {
            // Update thumbnail preview
            const thumbnailPreview = document.getElementById('thumbnailPreview');
            const thumbnailPlaceholder = document.getElementById('thumbnailPlaceholder');
            const resetBtn = document.getElementById('resetThumbnailBtn');
            const previewContainer = document.querySelector('.thumbnail-preview-container');
            
            thumbnailPreview.src = selectedImage.url;
            thumbnailPreview.style.display = 'block';
            thumbnailPlaceholder.style.display = 'none';
            resetBtn.style.display = 'inline-block';
            previewContainer.classList.add('has-image');
            
            // Add success animation
            previewContainer.style.animation = 'thumbnailSuccess 0.5s ease';
            setTimeout(() => {
                previewContainer.style.animation = '';
            }, 500);
            
            // Store thumbnail data
            this.registrationData.thumbnail = {
                id: selectedImage.id,
                url: selectedImage.url,
                file: selectedImage.file
            };
            
            console.log('Thumbnail data stored:', this.registrationData.thumbnail);
            
            // Store the data in registrationData for persistence
            this.registrationData.productInfo = this.registrationData.productInfo || {};
            this.registrationData.productInfo.thumbnail = this.registrationData.thumbnail;
            
            this.checkProductRegistrationCompletion();
        }
        
        this.closeThumbnailSelector();
    }

    /**
     * Reset thumbnail selection
     */
    resetThumbnail() {
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        const thumbnailPlaceholder = document.getElementById('thumbnailPlaceholder');
        const resetBtn = document.getElementById('resetThumbnailBtn');
        const previewContainer = document.querySelector('.thumbnail-preview-container');

        thumbnailPreview.style.display = 'none';
        thumbnailPlaceholder.style.display = 'flex';
        resetBtn.style.display = 'none';
        previewContainer.classList.remove('has-image');
        
        this.selectedThumbnailId = null;
        delete this.registrationData.thumbnail;
        this.checkProductRegistrationCompletion();
    }

    /**
     * Check product registration completion
     */
    checkProductRegistrationCompletion() {
        const modelName = document.getElementById('modelName')?.value.trim();
        const modelIntro = document.getElementById('modelIntro')?.value.trim();
        const categories = document.querySelectorAll('input[name="modelCategory"]:checked');
        const hasThumbnail = !!this.registrationData.thumbnail;
        
        console.log('Checking product registration completion:');
        console.log('- Model name:', modelName);
        console.log('- Model intro:', modelIntro);
        console.log('- Categories selected:', categories.length);
        console.log('- Has thumbnail:', hasThumbnail);
        console.log('- Thumbnail data:', this.registrationData.thumbnail);
        
        const isComplete = modelName && modelIntro && categories.length > 0 && hasThumbnail;
        console.log('- Form is complete:', isComplete);
        
        const nextButton = document.getElementById('step5Next');
        if (nextButton) {
            nextButton.disabled = !isComplete;
            console.log('- Next button disabled:', nextButton.disabled);
            
            // Also save the form data if complete
            if (isComplete) {
                this.registrationData.productInfo = {
                    name: modelName,
                    intro: modelIntro,
                    description: document.getElementById('modelDescription')?.value.trim() || '',
                    categories: Array.from(categories).map(cb => cb.value),
                    thumbnail: this.registrationData.thumbnail
                };
                console.log('Product info saved:', this.registrationData.productInfo);
            }
        } else {
            console.error('Step 5 next button not found');
        }
    }

    /**
     * Validate product registration
     */
    validateProductRegistration() {
        const modelName = document.getElementById('modelName')?.value.trim();
        const modelIntro = document.getElementById('modelIntro')?.value.trim();
        const categories = document.querySelectorAll('input[name="modelCategory"]:checked');
        
        if (!this.registrationData.thumbnail) {
            this.showToast('썸네일 이미지를 선택해주세요.', 'warning');
            return false;
        }
        
        if (!modelName) {
            this.showToast('모델명을 입력해주세요.', 'warning');
            return false;
        }
        
        if (!modelIntro) {
            this.showToast('한 줄 소개를 입력해주세요.', 'warning');
            return false;
        }
        
        if (categories.length === 0) {
            this.showToast('최소 하나의 카테고리를 선택해주세요.', 'warning');
            return false;
        }
        
        // Save product registration data
        this.registrationData.productInfo = {
            name: modelName,
            intro: modelIntro,
            description: document.getElementById('modelDescription')?.value.trim() || '',
            categories: Array.from(categories).map(cb => cb.value),
            thumbnail: this.registrationData.thumbnail || null
        };
        
        return true;
    }

    // ==========================================
    // REVIEW FUNCTIONALITY
    // ==========================================

    /**
     * Start review process
     */
    startReviewProcess() {
        console.log('Starting review process...');
        
        // Disable the button to prevent multiple clicks
        const startButton = document.getElementById('step6Next');
        if (startButton) {
            startButton.disabled = true;
            startButton.textContent = '검수 진행 중...';
        }
        
        // Simulate review process
        this.simulateReviewProcess();
        
        // After review simulation, show waiting status but DON'T enable next button
        setTimeout(() => {
            // Update status to waiting for approval
            const statusIcon = document.getElementById('reviewStatusIcon');
            const statusTitle = document.getElementById('reviewStatusTitle');
            const statusDesc = document.getElementById('reviewStatusDescription');
            
            if (statusIcon) statusIcon.textContent = '⏳';
            if (statusTitle) statusTitle.textContent = '검수 대기 중';
            if (statusDesc) statusDesc.textContent = '검수가 완료되었습니다. 관리자 승인을 기다리고 있습니다.';
            
            // Keep the button disabled - only admin approval can enable it
            const nextButton = document.getElementById('step6Next');
            if (nextButton) {
                nextButton.disabled = true;
                nextButton.textContent = '승인 대기 중';
            }
            
            this.showToast('검수 신청이 완료되었습니다. 관리자 승인을 기다려주세요.', 'info');
        }, 5000);
    }

    /**
     * Simulate review process
     */
    simulateReviewProcess() {
        const steps = ['reviewStep2', 'reviewStep3', 'reviewStep4'];
        const checklist = ['checkProduct', 'checkFinal'];
        
        let currentStep = 0;
        let currentCheck = 0;
        
        const processStep = () => {
            if (currentStep < steps.length) {
                const stepEl = document.getElementById(steps[currentStep]);
                if (stepEl) {
                    stepEl.classList.remove('active');
                    stepEl.classList.add('completed');
                    stepEl.querySelector('.step-icon').textContent = '✅';
                }
                
                if (currentStep + 1 < steps.length) {
                    const nextStepEl = document.getElementById(steps[currentStep + 1]);
                    if (nextStepEl) {
                        nextStepEl.classList.add('active');
                    }
                }
                
                currentStep++;
                setTimeout(processStep, 1000);
            } else {
                // Complete checklist items
                const processChecklist = () => {
                    if (currentCheck < checklist.length) {
                        const checkEl = document.getElementById(checklist[currentCheck]);
                        if (checkEl) {
                            checkEl.classList.remove('active');
                            checkEl.classList.add('completed');
                            checkEl.querySelector('.check-icon').textContent = '✅';
                        }
                        
                        if (currentCheck + 1 < checklist.length) {
                            const nextCheckEl = document.getElementById(checklist[currentCheck + 1]);
                            if (nextCheckEl) {
                                nextCheckEl.classList.add('active');
                            }
                        }
                        
                        currentCheck++;
                        setTimeout(processChecklist, 800);
                    } else {
                        // Complete review
                        document.getElementById('reviewStatusIcon').textContent = '✅';
                        document.getElementById('reviewStatusTitle').textContent = '검수 완료';
                        document.getElementById('reviewStatusDescription').textContent = '모든 검수가 완료되었습니다. 승인이 완료되었습니다!';
                    }
                };
                
                setTimeout(processChecklist, 500);
            }
        };
        
        setTimeout(processStep, 1000);
    }

    /**
     * Validate review completion
     */
    validateReview() {
        return true; // Review is automatically completed
    }

    // ==========================================
    // REGISTRATION COMPLETION
    // ==========================================

    /**
     * Complete the registration process
     */
    completeRegistration() {
        try {
            // Save all registration data
            const registrationSummary = {
                submittedAt: new Date().toISOString(),
                kycData: this.registrationData.ocrData || {},
                facePhoto: !!this.registrationData.facePhoto,
                verificationVideo: !!this.registrationData.verificationVideo,
                contract: this.registrationData.contract || {},
                portfolio: {
                    imageCount: this.uploadedImages.length,
                    images: this.uploadedImages.map(img => ({
                        name: img.name,
                        size: img.size
                    }))
                },
                status: 'submitted'
            };
            
            // Save to localStorage for demonstration
            localStorage.setItem('modelRegistration', JSON.stringify(registrationSummary));
            
            this.showToast('모델 등록이 성공적으로 완료되었습니다! 🎉', 'success');
            
            console.log('Registration completed:', registrationSummary);
            
        } catch (error) {
            console.error('Error completing registration:', error);
            this.showToast('등록 완료 중 오류가 발생했습니다.', 'error');
        }
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Enable next step button
     */
    enableNextStep(stepNumber) {
        const nextButton = document.getElementById(`step${stepNumber}Next`);
        if (nextButton) {
            nextButton.disabled = false;
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getToastColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }

    /**
     * Get toast color based on type
     */
    getToastColor(type) {
        const colors = {
            success: '#38a169',
            error: '#e53e3e',
            warning: '#dd6b20',
            info: '#3182ce'
        };
        return colors[type] || colors.info;
    }

    /**
     * Simulate OCR processing
     */
    async simulateOCRProcessing(file) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Simulate successful OCR
                this.registrationData.ocrData = {
                    name: '홍길동',
                    idNumber: '123456-*******',
                    issueDate: '2023-01-01'
                };
                resolve();
            }, 2000);
        });
    }

    /**
     * Simulate video analysis
     */
    async simulateVideoAnalysis() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate analysis results
                const analysisSuccess = Math.random() > 0.2; // 80% success rate
                
                if (analysisSuccess) {
                    this.registrationData.videoAnalysis = {
                        speechText: this.registrationData.randomCode,
                        faceMatches: true,
                        deepfakeDetected: false,
                        audioQuality: 'good'
                    };
                    resolve();
                } else {
                    reject(new Error('Video analysis failed'));
                }
            }, 3000);
        });
    }

    /**
     * Go back to main application
     */
    goBack() {
        if (confirm('모델 등록을 취소하고 메인 페이지로 돌아가시겠습니까?')) {
            window.location.href = 'index.html';
        }
    }

    /**
     * Debug thumbnail selection
     */
    debugThumbnailSelection() {
        console.log('=== Debugging Thumbnail Selection ===');
        console.log('Uploaded images:', this.uploadedImages);
        
        const modal = document.getElementById('thumbnailModal');
        console.log('Modal found:', !!modal);
        if (modal) {
            console.log('Modal display:', window.getComputedStyle(modal).display);
            console.log('Modal z-index:', window.getComputedStyle(modal).zIndex);
        }
        
        const grid = document.getElementById('portfolioThumbnailGrid');
        console.log('Grid found:', !!grid);
        
        const thumbnails = document.querySelectorAll('.portfolio-thumbnail-item');
        console.log('Thumbnail items found:', thumbnails.length);
        
        thumbnails.forEach((thumb, index) => {
            const imageId = thumb.getAttribute('data-image-id');
            const computedStyle = window.getComputedStyle(thumb);
            console.log(`Thumbnail ${index} (ID: ${imageId}):`, {
                cursor: computedStyle.cursor,
                pointerEvents: computedStyle.pointerEvents,
                zIndex: computedStyle.zIndex,
                hasOnclick: !!thumb.onclick,
                eventListeners: thumb._listeners || 'Not accessible'
            });
        });
        
        console.log('Selected thumbnail ID:', this.selectedThumbnailId);
        console.log('=== End Debug ===');
        
        // Test clicking the first thumbnail
        console.log('=== Testing Click on First Thumbnail ===');
        const firstThumbnail = document.querySelector('.portfolio-thumbnail-item');
        if (firstThumbnail) {
            console.log('Simulating click on first thumbnail...');
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            firstThumbnail.dispatchEvent(clickEvent);
            console.log('Click event dispatched');
        }
    }
    
    /**
     * Test thumbnail selection
     */
    testThumbnailSelection(imageId) {
        console.log('=== Testing Thumbnail Selection ===');
        if (!imageId && this.uploadedImages.length > 0) {
            imageId = this.uploadedImages[0].id;
        }
        console.log('Testing with image ID:', imageId);
        this.selectPortfolioThumbnail(imageId);
    }

    /**
     * Admin bypass for KYC-A (ID + Face)
     */
    adminBypassKYCA() {
        console.log('Admin bypassing KYC-A verification');
        
        // Simulate successful verification
        this.registrationData.idCardImage = 'admin-bypass';
        this.registrationData.faceImage = 'admin-bypass';
        this.registrationData.ocrData = {
            name: '테스트 사용자',
            idNumber: '000000-0000000',
            issueDate: '2024-01-01'
        };
        
        // Update UI
        this.updateKYCStatus('kycAStatus', 'success', '인증 완료 (관리자)');
        
        const resultDiv = document.getElementById('verificationAResult');
        const icon = document.getElementById('resultAIcon');
        const text = document.getElementById('resultAText');
        const details = document.getElementById('resultADetails');
        
        if (resultDiv) {
            resultDiv.style.display = 'block';
            icon.textContent = '✅';
            text.textContent = '관리자 승인 완료';
            details.textContent = '테스트용 관리자 승인';
        }
        
        // Enable next step
        this.enableKYCStepB();
        
        this.showToast('KYC-A 관리자 승인 완료', 'success');
    }

    /**
     * Admin bypass for KYC-B (Video)
     */
    adminBypassKYCB() {
        console.log('Admin bypassing KYC-B verification');
        
        // Simulate successful verification
        this.registrationData.verificationVideo = 'admin-bypass';
        this.registrationData.randomCode = '000000';
        this.registrationData.videoAnalysis = {
            speechText: '000000',
            faceMatches: true,
            deepfakeDetected: false,
            audioQuality: 'good'
        };
        
        // Update UI
        this.updateKYCStatus('kycBStatus', 'success', '인증 완료 (관리자)');
        
        const resultDiv = document.getElementById('verificationBResult');
        const icon = document.getElementById('resultBIcon');
        const text = document.getElementById('resultBText');
        const details = document.getElementById('resultBDetails');
        
        if (resultDiv) {
            resultDiv.style.display = 'block';
            icon.textContent = '✅';
            text.textContent = '관리자 승인 완료';
            details.textContent = '테스트용 관리자 승인';
        }
        
        // Mark KYC as complete
        this.registrationData.kycComplete = true;
        
        // Enable next button
        this.enableNextStep(this.currentStep);
        
        this.showToast('KYC-B 관리자 승인 완료', 'success');
    }

    /**
     * Admin approve registration
     */
    adminApproveRegistration() {
        console.log('Admin approving registration...');
        
        // Update all review steps to completed
        const reviewSteps = ['reviewStep2', 'reviewStep3', 'reviewStep4'];
        reviewSteps.forEach(stepId => {
            const step = document.getElementById(stepId);
            if (step) {
                step.classList.remove('active');
                step.classList.add('completed');
                step.querySelector('.step-icon').textContent = '✅';
            }
        });
        
        // Update checklist items
        const checklistItems = ['checkProduct', 'checkFinal'];
        checklistItems.forEach(itemId => {
            const item = document.getElementById(itemId);
            if (item) {
                item.classList.remove('active');
                item.classList.add('completed');
                item.querySelector('.check-icon').textContent = '✅';
            }
        });
        
        // Update status
        const statusIcon = document.getElementById('reviewStatusIcon');
        const statusTitle = document.getElementById('reviewStatusTitle');
        const statusDesc = document.getElementById('reviewStatusDescription');
        
        if (statusIcon) statusIcon.textContent = '✅';
        if (statusTitle) statusTitle.textContent = '관리자 승인 완료';
        if (statusDesc) statusDesc.textContent = '관리자 권한으로 모든 검수가 승인되었습니다.';
        
        // Enable next button
        const nextButton = document.getElementById('step6Next');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.textContent = '최종 단계로 이동';
            // Remove any existing onclick handler and use the default one
            nextButton.onclick = () => {
                console.log('Moving to final step from admin approval');
                this.nextModelStep();
            };
        }
        
        // Show success message
        this.showToast('관리자 권한으로 승인이 완료되었습니다!', 'success');
        
        // Automatically move to next step after a short delay
        setTimeout(() => {
            this.nextModelStep();
        }, 1500);
    }

    /**
     * Update final step with model information
     */
    updateFinalStep() {
        // Update model name
        const modelName = this.registrationData.productInfo?.name || '모델명 없음';
        const finalModelNameEl = document.getElementById('finalModelName');
        if (finalModelNameEl) {
            finalModelNameEl.textContent = modelName;
        }
        
        // Update categories
        const categories = this.registrationData.productInfo?.categories || [];
        const categoryNames = categories.map(cat => {
            const categoryMap = {
                'fashion': '패션 모델',
                'beauty': '뷰티 모델',
                'lifestyle': '라이프스타일 모델',
                'food': '푸드 모델',
                'tech': '테크 모델'
            };
            return categoryMap[cat] || cat;
        }).join(', ');
        
        const finalCategoriesEl = document.getElementById('finalCategories');
        if (finalCategoriesEl) {
            finalCategoriesEl.textContent = categoryNames || '카테고리 없음';
        }
        
        // Update registration date
        const registrationDateEl = document.getElementById('registrationDate');
        if (registrationDateEl) {
            const now = new Date();
            const dateString = now.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            registrationDateEl.textContent = dateString;
        }
    }

    /**
     * Activate model and add to model list
     */
    activateModel() {
        console.log('Activating model...');
        console.log('Registration data:', this.registrationData);
        
        // Show loading state
        const activateBtn = document.querySelector('.activate-model-btn');
        if (activateBtn) {
            activateBtn.disabled = true;
            activateBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">활성화 중...</span>';
        }
        
        // Simulate activation process
        setTimeout(() => {
            // Prepare complete model data
            const modelData = {
                // Basic info
                id: `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                registrationDate: new Date().toISOString(),
                status: 'active',
                
                // Personal info from Step 5
                personalInfo: {
                    name: this.registrationData.productInfo?.name || '모델명 없음',
                    intro: this.registrationData.productInfo?.intro || '',
                    description: this.registrationData.productInfo?.description || '',
                    categories: this.registrationData.productInfo?.categories || []
                },
                
                // Portfolio from Step 4
                portfolio: {
                    thumbnailUrl: this.registrationData.productInfo?.thumbnailUrl || '',
                    thumbnailId: this.registrationData.productInfo?.thumbnailId || '',
                    images: this.uploadedImages || []
                },
                
                // Contract info from Step 3
                contract: {
                    pricingType: this.registrationData.contractInfo?.pricingType || 'perProject',
                    basePrice: this.registrationData.contractInfo?.basePrice || 0,
                    hourlyRate: this.registrationData.contractInfo?.hourlyRate || 0,
                    usageRights: this.registrationData.contractInfo?.usageRights || [],
                    contractPeriod: this.registrationData.contractInfo?.contractPeriod || 12,
                    signature: this.registrationData.contractInfo?.signature || ''
                },
                
                // KYC info from Step 2
                kyc: {
                    verified: true,
                    verificationDate: new Date().toISOString(),
                    idImage: this.registrationData.kycInfo?.idImage || '',
                    faceImage: this.registrationData.kycInfo?.faceImage || '',
                    videoVerified: this.registrationData.kycInfo?.videoCompleted || false
                }
            };
            
            // Save using ModelStorage
            try {
                if (window.modelStorage) {
                    const modelId = window.modelStorage.saveModel(modelData);
                    console.log('Model saved with ID:', modelId);
                    
                    // Show success
                    this.showToast('모델 등록이 완료되었습니다!', 'success');
                } else {
                    // Fallback to direct localStorage if ModelStorage not loaded
                    const existingModels = JSON.parse(localStorage.getItem('xbrush_registered_models') || '[]');
                    existingModels.push(modelData);
                    localStorage.setItem('xbrush_registered_models', JSON.stringify(existingModels));
                    console.log('Model saved using fallback method');
                }
            } catch (error) {
                console.error('Error saving model:', error);
                this.showToast('모델 저장 중 오류가 발생했습니다.', 'error');
            }
            
            // Update button
            if (activateBtn) {
                activateBtn.disabled = true;
                activateBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">활성화 완료!</span>';
                activateBtn.style.background = '#48bb78';
                activateBtn.style.color = 'white';
            }
            
            this.showToast('모델이 성공적으로 활성화되었습니다! 이제 모델 리스트에서 확인할 수 있습니다.', 'success');
            
            // Redirect to model list after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html#models';
            }, 2000);
        }, 1500);
    }

    /**
     * Admin skip all KYC steps
     */
    adminSkipKYC() {
        console.log('Admin skipping KYC step entirely');
        console.log('Current step:', this.currentStep);
        
        // Set all required data that validateKYC() checks for
        this.registrationData.idDocument = 'admin-bypass';
        this.registrationData.facePhoto = 'admin-bypass';
        this.registrationData.verificationVideo = 'admin-bypass';
        
        // Also set the other properties for completeness
        this.registrationData.idCardImage = 'admin-bypass';
        this.registrationData.faceImage = 'admin-bypass';
        this.registrationData.ocrData = {
            name: '테스트 사용자',
            idNumber: '000000-0000000',
            issueDate: '2024-01-01'
        };
        this.registrationData.randomCode = '000000';
        this.registrationData.videoAnalysis = {
            speechText: '000000',
            faceMatches: true,
            deepfakeDetected: false,
            audioQuality: 'good'
        };
        this.registrationData.kycComplete = true;
        
        // Show skip message
        this.showToast('KYC 단계를 건너뛰고 다음 단계로 이동합니다', 'info');
        
        // Log what step we're going to
        console.log('Moving from step', this.currentStep, 'to step', this.currentStep + 1);
        
        // Directly go to next step, bypassing validation
        this.goToStep(this.currentStep + 1);
    }
}

// Global functions for HTML onclick handlers
function goBack() {
    modelApp.goBack();
}

function startModelRegistration() {
    modelApp.startRegistration();
}

function nextModelStep() {
    modelApp.nextModelStep();
}

function prevModelStep() {
    modelApp.prevModelStep();
}

function openThumbnailSelector() {
    console.log('Global openThumbnailSelector called');
    console.log('modelApp exists:', !!modelApp);
    if (modelApp) {
        modelApp.openThumbnailSelector();
    } else {
        console.error('modelApp is not initialized');
        // Fallback: try to initialize if not already done
        if (typeof ModelRegistrationApp !== 'undefined') {
            console.log('Attempting to initialize modelApp...');
            modelApp = new ModelRegistrationApp();
            setTimeout(() => {
                if (modelApp) {
                    modelApp.openThumbnailSelector();
                }
            }, 100);
        }
    }
}

function closeThumbnailSelector() {
    modelApp.closeThumbnailSelector();
}

function confirmThumbnailSelection() {
    modelApp.confirmThumbnailSelection();
}

function resetThumbnail() {
    modelApp.resetThumbnail();
}

function startReviewProcess() {
    modelApp.startReviewProcess();
}

// Admin skip function for testing
function adminSkipKYC() {
    console.log('Admin skip KYC triggered');
    if (modelApp) {
        modelApp.adminSkipKYC();
    }
}

// Admin approve registration function
function adminApproveRegistration() {
    console.log('Admin approve registration triggered');
    if (modelApp) {
        modelApp.adminApproveRegistration();
    }
}

// Activate model function
function activateModel() {
    console.log('Activate model triggered');
    if (modelApp) {
        modelApp.activateModel();
    }
}

// Go to dashboard function
function goToDashboard() {
    console.log('Going to dashboard...');
    // For now, redirect to main page
    window.location.href = 'index.html';
}

// Initialize app when DOM is ready
let modelApp;
document.addEventListener('DOMContentLoaded', () => {
    modelApp = new ModelRegistrationApp();
    window.modelApp = modelApp; // Make it globally accessible
    console.log('Model Registration App initialized and stored globally');
});

// Global debug function
window.debugThumbnailSelection = function() {
    if (window.modelApp) {
        window.modelApp.debugThumbnailSelection();
    } else {
        console.error('ModelApp not initialized');
    }
};

// Global test function
window.testThumbnailSelection = function(imageId) {
    if (window.modelApp) {
        window.modelApp.testThumbnailSelection(imageId);
    } else {
        console.error('ModelApp not initialized');
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Debug helper function for thumbnail selection
window.debugThumbnailSelection = function() {
    console.log('=== Thumbnail Selection Debug Info ===');
    console.log('1. ModelApp exists:', !!window.modelApp);
    console.log('2. Uploaded images:', window.modelApp?.uploadedImages);
    console.log('3. Modal element exists:', !!document.getElementById('thumbnailModal'));
    console.log('4. Modal display style:', document.getElementById('thumbnailModal')?.style.display);
    console.log('5. Grid element exists:', !!document.getElementById('portfolioThumbnailGrid'));
    console.log('6. Thumbnail items count:', document.querySelectorAll('.portfolio-thumbnail-item').length);
    console.log('7. Selected thumbnail ID:', window.modelApp?.selectedThumbnailId);
    console.log('8. Confirm button element:', document.getElementById('confirmThumbnailBtn'));
    console.log('9. Confirm button disabled:', document.getElementById('confirmThumbnailBtn')?.disabled);
    
    // Check click handlers
    const firstThumbnail = document.querySelector('.portfolio-thumbnail-item');
    if (firstThumbnail) {
        console.log('10. First thumbnail element:', firstThumbnail);
        console.log('11. First thumbnail data-image-id:', firstThumbnail.getAttribute('data-image-id'));
        console.log('12. First thumbnail computed styles:');
        const styles = window.getComputedStyle(firstThumbnail);
        console.log('    - cursor:', styles.cursor);
        console.log('    - pointer-events:', styles.pointerEvents);
        console.log('    - z-index:', styles.zIndex);
        console.log('    - position:', styles.position);
    }
    
    console.log('=== End Debug Info ===');
};