/**
 * Video Creation Module
 * Handles video creation workflow and progress management
 */

(function(window) {
    'use strict';

    const VideoCreationModule = {
        /**
         * Initialize image selection for video creation
         */
        initializeImageSelection: function(modelData) {
            try {
                // Clear previous selections
                const imageGrid = document.getElementById('imageSelectionGrid');
                if (!imageGrid) return;

                imageGrid.innerHTML = '';
                
                // Generate images based on model
                const images = this.generateModelImages(modelData);
                
                images.forEach((imageUrl, index) => {
                    const imageCard = this.createImageCard(imageUrl, index);
                    imageGrid.appendChild(imageCard);
                });

                // Update UI state
                document.getElementById('imageSelectionSection').style.display = 'block';
                document.getElementById('videoCreationProgress').style.display = 'none';
                
            } catch (error) {
                console.error('Error initializing image selection:', error);
                window.showToast('이미지 선택 초기화 중 오류가 발생했습니다.', 'error');
            }
        },

        /**
         * Generate model images for selection
         */
        generateModelImages: function(modelData) {
            const baseImages = [
                'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/placeholder1.jpg',
                'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/placeholder2.jpg',
                'https://jpjpkimjp.github.io/xbrush_movie_MVP1/images/placeholder3.jpg'
            ];

            // In production, this would generate AI images based on model
            return baseImages.map(url => url + '?model=' + modelData.id);
        },

        /**
         * Create image selection card
         */
        createImageCard: function(imageUrl, index) {
            const card = document.createElement('div');
            card.className = 'image-selection-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="이미지 옵션 ${index + 1}" loading="lazy">
                <button class="select-image-btn" onclick="VideoCreationModule.selectImage('${imageUrl}', ${index})">
                    선택
                </button>
            `;
            return card;
        },

        /**
         * Handle image selection
         */
        selectImage: function(imageUrl, index) {
            try {
                // Store selection
                if (!window.selectedData) window.selectedData = {};
                if (!window.selectedData.selectedImages) window.selectedData.selectedImages = {};
                
                const cutNumber = Object.keys(window.selectedData.selectedImages).length + 1;
                window.selectedData.selectedImages[`cut${cutNumber}`] = imageUrl;

                // Update UI
                window.showToast(`이미지 ${cutNumber} 선택완료`, 'success');

                // Check if all images selected
                if (cutNumber >= 3) {
                    this.proceedToVideoCreation();
                }
            } catch (error) {
                console.error('Error selecting image:', error);
                window.showToast('이미지 선택 중 오류가 발생했습니다.', 'error');
            }
        },

        /**
         * Proceed to video creation
         */
        proceedToVideoCreation: function() {
            document.getElementById('imageSelectionSection').style.display = 'none';
            document.getElementById('videoCreationProgress').style.display = 'block';
            this.startVideoCreation();
        },

        /**
         * Start video creation process
         */
        startVideoCreation: function() {
            try {
                const progressBar = document.querySelector('#videoCreationProgress .progress-fill');
                const statusText = document.querySelector('#videoCreationProgress .status-text');
                
                if (!progressBar || !statusText) {
                    throw new Error('Progress elements not found');
                }

                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 15 + 5;
                    
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        this.onVideoCreationComplete();
                    }

                    progressBar.style.width = progress + '%';
                    statusText.textContent = this.getProgressStatus(progress);
                }, 1000);

                // Store interval for cleanup
                window.videoCreationInterval = interval;

            } catch (error) {
                console.error('Error starting video creation:', error);
                window.showToast('영상 제작 시작 중 오류가 발생했습니다.', 'error');
            }
        },

        /**
         * Get progress status message
         */
        getProgressStatus: function(progress) {
            if (progress < 20) return '시나리오 분석 중...';
            if (progress < 40) return 'AI 모델 준비 중...';
            if (progress < 60) return '장면 생성 중...';
            if (progress < 80) return '영상 편집 중...';
            if (progress < 100) return '최종 마무리 중...';
            return '영상 완성!';
        },

        /**
         * Handle video creation completion
         */
        onVideoCreationComplete: function() {
            window.showToast('영상 제작이 완료되었습니다! 🎬', 'success');
            
            // Navigate to results
            if (window.app && window.app.stepManager) {
                window.app.stepManager.goToStep(7);
            }
        },

        /**
         * Cancel video creation
         */
        cancelVideoCreation: function() {
            if (window.videoCreationInterval) {
                clearInterval(window.videoCreationInterval);
                window.videoCreationInterval = null;
            }
            
            window.showToast('영상 제작이 취소되었습니다.', 'info');
        }
    };

    // Export to global scope
    window.VideoCreationModule = VideoCreationModule;

})(window);