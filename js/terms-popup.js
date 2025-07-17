/**
 * Terms and Conditions Popup Component
 */

class TermsPopup {
    constructor(options = {}) {
        this.options = {
            onAgree: options.onAgree || (() => {}),
            onCancel: options.onCancel || (() => {}),
            context: options.context || 'default', // 'model-register' or 'movie-maker'
            ...options
        };
        
        this.agreements = {
            allAgree: false,
            serviceTerms: false,
            privacyPolicy: false,
            portraitRights: false,
            aiContent: false,
            paymentTerms: false,
            ageVerification: false,
            marketing: false
        };
        
        this.requiredAgreements = [
            'serviceTerms',
            'privacyPolicy',
            'portraitRights',
            'aiContent',
            'paymentTerms',
            'ageVerification'
        ];
        
        this.init();
    }
    
    init() {
        this.createPopup();
        this.attachEventListeners();
    }
    
    createPopup() {
        const popup = document.createElement('div');
        popup.className = 'terms-overlay';
        popup.id = 'termsPopup';
        
        popup.innerHTML = `
            <div class="terms-popup">
                <div class="terms-header">
                    <h2>서비스 이용약관 동의</h2>
                    <p>xBrush 서비스를 이용하기 위해 아래 약관에 동의해 주세요.</p>
                </div>
                
                <div class="terms-body">
                    <!-- 전체 동의 -->
                    <div class="terms-all-agree">
                        <div class="terms-checkbox-item">
                            <div class="terms-checkbox">
                                <input type="checkbox" id="allAgree" name="allAgree">
                                <span class="terms-checkbox-custom"></span>
                            </div>
                            <div class="terms-checkbox-content">
                                <label for="allAgree" class="terms-checkbox-label">
                                    전체 약관에 동의합니다
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="terms-divider"></div>
                    
                    <!-- 필수 약관 -->
                    <div class="terms-section">
                        <div class="terms-section-title">필수 약관</div>
                        <div class="terms-checkbox-group">
                            <!-- 서비스 이용약관 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="serviceTerms" name="serviceTerms">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="serviceTerms" class="terms-checkbox-label required">
                                        서비스 이용약관에 동의합니다
                                    </label>
                                    <a href="#" class="terms-view-details" data-terms="service">
                                        전문 보기 →
                                    </a>
                                </div>
                            </div>
                            
                            <!-- 개인정보 처리방침 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="privacyPolicy" name="privacyPolicy">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="privacyPolicy" class="terms-checkbox-label required">
                                        개인정보 수집 및 이용에 동의합니다
                                    </label>
                                    <a href="#" class="terms-view-details" data-terms="privacy">
                                        전문 보기 →
                                    </a>
                                </div>
                            </div>
                            
                            <!-- 초상권 사용 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="portraitRights" name="portraitRights">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="portraitRights" class="terms-checkbox-label required">
                                        초상권 사용에 대한 동의 (AI 학습 및 상업적 이용 포함)
                                    </label>
                                    <a href="#" class="terms-view-details" data-terms="portrait">
                                        전문 보기 →
                                    </a>
                                </div>
                            </div>
                            
                            <!-- AI 생성 콘텐츠 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="aiContent" name="aiContent">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="aiContent" class="terms-checkbox-label required">
                                        AI 생성 콘텐츠의 저작권 및 사용권에 대한 이해
                                    </label>
                                    <a href="#" class="terms-view-details" data-terms="ai">
                                        전문 보기 →
                                    </a>
                                </div>
                            </div>
                            
                            <!-- 결제 및 환불 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="paymentTerms" name="paymentTerms">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="paymentTerms" class="terms-checkbox-label required">
                                        결제 및 환불 정책에 동의합니다
                                    </label>
                                    <a href="#" class="terms-view-details" data-terms="payment">
                                        전문 보기 →
                                    </a>
                                </div>
                            </div>
                            
                            <!-- 만 14세 이상 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="ageVerification" name="ageVerification">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="ageVerification" class="terms-checkbox-label required">
                                        만 14세 이상입니다
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="terms-divider"></div>
                    
                    <!-- 선택 약관 -->
                    <div class="terms-section">
                        <div class="terms-section-title">선택 약관</div>
                        <div class="terms-checkbox-group">
                            <!-- 마케팅 수신 동의 -->
                            <div class="terms-checkbox-item">
                                <div class="terms-checkbox">
                                    <input type="checkbox" id="marketing" name="marketing">
                                    <span class="terms-checkbox-custom"></span>
                                </div>
                                <div class="terms-checkbox-content">
                                    <label for="marketing" class="terms-checkbox-label">
                                        마케팅 정보 수신에 동의합니다 (선택)
                                    </label>
                                    <a href="#" class="terms-view-details" data-terms="marketing">
                                        전문 보기 →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="terms-footer">
                    <button class="terms-btn terms-btn-cancel" id="termsCancel">취소</button>
                    <button class="terms-btn terms-btn-confirm" id="termsConfirm" disabled>동의하고 계속</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.popup = popup;
    }
    
    attachEventListeners() {
        // All agree checkbox
        const allAgreeCheckbox = document.getElementById('allAgree');
        allAgreeCheckbox.addEventListener('change', (e) => {
            this.handleAllAgree(e.target.checked);
        });
        
        // Individual checkboxes
        Object.keys(this.agreements).forEach(key => {
            if (key !== 'allAgree') {
                const checkbox = document.getElementById(key);
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        this.updateAgreements();
                    });
                }
            }
        });
        
        // View details links
        document.querySelectorAll('.terms-view-details').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const termsType = e.target.getAttribute('data-terms');
                this.showTermsDetail(termsType);
            });
        });
        
        // Buttons
        document.getElementById('termsCancel').addEventListener('click', () => {
            this.close();
            this.options.onCancel();
        });
        
        document.getElementById('termsConfirm').addEventListener('click', () => {
            if (this.isValid()) {
                this.close();
                this.options.onAgree(this.agreements);
            }
        });
        
        // Close on background click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.close();
                this.options.onCancel();
            }
        });
    }
    
    handleAllAgree(checked) {
        Object.keys(this.agreements).forEach(key => {
            this.agreements[key] = checked;
            const checkbox = document.getElementById(key);
            if (checkbox) {
                checkbox.checked = checked;
            }
        });
        this.updateConfirmButton();
    }
    
    updateAgreements() {
        // Update individual agreement states
        Object.keys(this.agreements).forEach(key => {
            if (key !== 'allAgree') {
                const checkbox = document.getElementById(key);
                if (checkbox) {
                    this.agreements[key] = checkbox.checked;
                }
            }
        });
        
        // Check if all are checked
        const allChecked = Object.keys(this.agreements)
            .filter(key => key !== 'allAgree')
            .every(key => this.agreements[key]);
        
        this.agreements.allAgree = allChecked;
        document.getElementById('allAgree').checked = allChecked;
        
        this.updateConfirmButton();
    }
    
    updateConfirmButton() {
        const isValid = this.isValid();
        const confirmButton = document.getElementById('termsConfirm');
        confirmButton.disabled = !isValid;
    }
    
    isValid() {
        // Check if all required agreements are checked
        return this.requiredAgreements.every(key => this.agreements[key]);
    }
    
    showTermsDetail(type) {
        // Terms content based on type
        const termsContent = {
            service: `
                <h3>서비스 이용약관</h3>
                <p>제1조 (목적)</p>
                <p>이 약관은 xBrush(이하 "회사")가 제공하는 AI 모델 생성 및 영상 제작 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                
                <p>제2조 (서비스의 내용)</p>
                <p>1. AI 모델 생성 서비스</p>
                <p>2. AI 기반 영상 콘텐츠 제작</p>
                <p>3. 생성된 콘텐츠의 상업적 활용 지원</p>
                
                <p>제3조 (회원의 의무)</p>
                <p>1. 회원은 본인의 초상권 또는 정당한 사용 권한이 있는 이미지만을 업로드해야 합니다.</p>
                <p>2. 타인의 권리를 침해하는 콘텐츠 생성은 금지됩니다.</p>
                <p>3. 생성된 콘텐츠를 불법적인 목적으로 사용할 수 없습니다.</p>
            `,
            privacy: `
                <h3>개인정보 처리방침</h3>
                <p>1. 수집하는 개인정보 항목</p>
                <ul>
                    <li>필수: 이메일, 이름, 연락처, 얼굴 이미지</li>
                    <li>선택: 신체 정보, 포트폴리오 이미지</li>
                </ul>
                
                <p>2. 개인정보의 수집 및 이용 목적</p>
                <ul>
                    <li>AI 모델 생성 및 학습</li>
                    <li>서비스 제공 및 운영</li>
                    <li>고객 문의 대응</li>
                </ul>
                
                <p>3. 개인정보의 보유 및 이용 기간</p>
                <p>회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
            `,
            portrait: `
                <h3>초상권 사용 동의서</h3>
                <p>본인은 xBrush 서비스에 제공한 본인의 초상(얼굴, 신체 등)에 대하여 다음과 같은 사용에 동의합니다:</p>
                
                <p>1. AI 모델 학습 및 생성</p>
                <p>- 본인의 초상을 기반으로 한 AI 모델 생성</p>
                <p>- AI 학습 데이터로의 활용</p>
                
                <p>2. 상업적 이용</p>
                <p>- 생성된 AI 모델을 활용한 영상 콘텐츠 제작</p>
                <p>- 제작된 콘텐츠의 상업적 활용 (광고, 마케팅 등)</p>
                
                <p>3. 권리 및 수익 배분</p>
                <p>- 생성된 콘텐츠로 인한 수익은 사전 합의된 비율에 따라 배분</p>
                <p>- 초상권 사용에 대한 별도의 사용료 지급</p>
            `,
            ai: `
                <h3>AI 생성 콘텐츠 관련 안내</h3>
                <p>1. 저작권</p>
                <p>- AI가 생성한 콘텐츠의 저작권은 회사와 모델 제공자가 공동으로 보유합니다.</p>
                <p>- 구체적인 권리 비율은 별도 계약에 따릅니다.</p>
                
                <p>2. 사용권</p>
                <p>- 생성된 콘텐츠는 합의된 범위 내에서 자유롭게 사용 가능합니다.</p>
                <p>- 제3자 제공 시 별도 협의가 필요합니다.</p>
                
                <p>3. 책임의 한계</p>
                <p>- AI 생성 콘텐츠의 품질은 보장되지 않을 수 있습니다.</p>
                <p>- 생성된 콘텐츠로 인한 법적 문제 발생 시 이용자가 책임집니다.</p>
            `,
            payment: `
                <h3>결제 및 환불 정책</h3>
                <p>1. 결제 방식</p>
                <p>- 신용카드, 계좌이체, 간편결제 지원</p>
                <p>- 구독제 및 건별 결제 가능</p>
                
                <p>2. 환불 정책</p>
                <p>- 서비스 이용 전: 전액 환불</p>
                <p>- AI 모델 생성 시작 후: 환불 불가</p>
                <p>- 기술적 오류로 인한 서비스 미제공: 전액 환불</p>
                
                <p>3. 구독 해지</p>
                <p>- 언제든지 구독 해지 가능</p>
                <p>- 해지 시 다음 결제일부터 서비스 중단</p>
            `,
            marketing: `
                <h3>마케팅 정보 수신 동의</h3>
                <p>1. 수신 정보</p>
                <p>- 신규 서비스 및 기능 안내</p>
                <p>- 이벤트 및 프로모션 정보</p>
                <p>- 맞춤형 콘텐츠 추천</p>
                
                <p>2. 수신 방법</p>
                <p>- 이메일, SMS, 앱 푸시 알림</p>
                
                <p>3. 수신 거부</p>
                <p>- 언제든지 수신 거부 가능</p>
                <p>- 수신 거부 시에도 서비스 이용에 제한 없음</p>
            `
        };
        
        // Create a modal or alert to show the full terms
        // For now, we'll use a simple alert
        const content = termsContent[type] || '약관 내용을 불러올 수 없습니다.';
        
        // Create a detail popup
        const detailPopup = document.createElement('div');
        detailPopup.className = 'terms-detail-popup';
        detailPopup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 70vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 10001;
        `;
        
        detailPopup.innerHTML = `
            ${content}
            <button style="
                margin-top: 20px;
                padding: 10px 20px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            " onclick="this.parentElement.remove()">확인</button>
        `;
        
        document.body.appendChild(detailPopup);
    }
    
    show() {
        this.popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.popup.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            this.popup.remove();
        }, 300);
    }
}

// Export for use in other files
window.TermsPopup = TermsPopup;