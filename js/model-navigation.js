/**
 * Model Navigation - Handles model selection across pages
 */

/**
 * Select a model for video creation and navigate to index.html
 * @param {string} modelId - Model ID
 * @param {Object} modelData - Model data object
 */
function selectModelForVideo(modelId, modelData) {
    // Use navigation manager to store context and navigate
    if (window.navigationManager) {
        window.navigationManager.selectModelAndNavigate(modelId, modelData);
    } else {
        // Fallback: use URL parameter
        window.location.href = 'index.html?model=' + encodeURIComponent(modelId);
    }
}

/**
 * Check for preselected model on page load (for index.html)
 */
function checkPreselectedModel() {
    // Check URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    var modelId = urlParams.get('model');
    
    // Check navigation context
    var context = window.navigationManager ? window.navigationManager.getContext() : {};
    
    if (modelId || context.autoSelectModel) {
        var targetModelId = modelId || context.autoSelectModel;
        
        // Wait for models to load then select
        var checkInterval = setInterval(function() {
            var modelCard = document.querySelector('[data-model-id="' + targetModelId + '"]');
            if (modelCard) {
                clearInterval(checkInterval);
                
                // Trigger model selection
                if (typeof selectModel === 'function') {
                    selectModel(modelCard, targetModelId, 'preselected');
                } else if (modelCard.onclick) {
                    modelCard.onclick();
                } else {
                    modelCard.click();
                }
                
                // Show notification
                if (window.notificationManager) {
                    window.notificationManager.info('선택한 모델로 동영상 제작을 시작합니다.');
                } else if (typeof showToast === 'function') {
                    showToast('선택한 모델로 동영상 제작을 시작합니다.', 'info');
                }
                
                // Clear URL parameter to avoid confusion on refresh
                if (modelId) {
                    var newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                }
            }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(function() {
            clearInterval(checkInterval);
        }, 5000);
    }
}

/**
 * Add "Select for Video" button to model cards
 */
function addVideoSelectionButtons() {
    // This function can be called from models.html to add selection buttons
    var modelCards = document.querySelectorAll('.model-card');
    
    modelCards.forEach(function(card) {
        // Check if button already exists
        if (card.querySelector('.select-for-video-btn')) return;
        
        var modelId = card.dataset.modelId;
        if (!modelId) return;
        
        // Create button
        var button = document.createElement('button');
        button.className = 'btn btn-primary select-for-video-btn';
        button.textContent = '동영상 제작하기';
        button.onclick = function(e) {
            e.stopPropagation();
            
            // Get model data
            var modelName = card.querySelector('.model-name')?.textContent || '';
            var modelImage = card.querySelector('img')?.src || '';
            
            selectModelForVideo(modelId, {
                name: modelName,
                image: modelImage
            });
        };
        
        // Add button to card
        var cardContent = card.querySelector('.model-content') || card;
        cardContent.appendChild(button);
    });
}

// Auto-initialize on index.html
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(checkPreselectedModel, 500);
    });
}

// Auto-add buttons on models.html
if (window.location.pathname.includes('models.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for models to load
        setTimeout(addVideoSelectionButtons, 1000);
        
        // Also listen for dynamic model loading
        var observer = new MutationObserver(function(mutations) {
            addVideoSelectionButtons();
        });
        
        var container = document.querySelector('.models-grid') || document.querySelector('.models-container');
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    });
}