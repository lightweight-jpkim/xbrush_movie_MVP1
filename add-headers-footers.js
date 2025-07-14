// Script to add consistent headers and footers to admin pages

const standardHeader = `
    <!-- Site Header -->
    <header class="site-header">
        <div class="header-container">
            <div class="logo-section">
                <h1 class="logo">xBrush</h1>
                <span class="logo-subtitle">AI Video Creator</span>
            </div>
            <nav class="header-nav">
                <a href="index.html" class="nav-link">동영상 제작</a>
                <a href="models.html" class="nav-link">모델 쇼케이스</a>
                <a href="model-register.html" class="nav-link btn-primary-small">모델 등록</a>
            </nav>
        </div>
    </header>
`;

const standardFooter = `
    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-content">
            <p>&copy; 2024 xBrush. All rights reserved.</p>
            <div class="footer-links">
                <a href="#">이용약관</a>
                <a href="#">개인정보처리방침</a>
                <a href="#">문의하기</a>
                <a href="admin.html" style="opacity: 0.5;">관리자</a>
                <a href="model-pricing-dashboard.html" style="opacity: 0.5;">모델 가격설정</a>
                <a href="admin-plan-review.html" style="opacity: 0.5;">플랜 검토</a>
            </div>
        </div>
    </footer>
`;

const adminPages = [
    'admin-simple.html',
    'admin-plan-review.html',
    'database-explorer.html',
    'test-admin-db.html',
    'check-config-loading.html',
    'check-database.html',
    'initialize-database.html',
    'initialize-database-simple.html'
];

const fs = require('fs');
const path = require('path');

// Function to add header and footer to a file
function addHeaderFooter(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if header/footer already exists
        if (content.includes('site-header') || content.includes('site-footer')) {
            console.log(`✓ ${path.basename(filePath)} already has header/footer`);
            return;
        }
        
        // Find the body tag
        const bodyMatch = content.match(/<body[^>]*>/);
        if (!bodyMatch) {
            console.log(`✗ ${path.basename(filePath)} - No <body> tag found`);
            return;
        }
        
        // Insert header after body tag
        const bodyEndIndex = bodyMatch.index + bodyMatch[0].length;
        content = content.slice(0, bodyEndIndex) + '\n' + standardHeader + content.slice(bodyEndIndex);
        
        // Find the closing body tag
        const bodyCloseMatch = content.match(/<\/body>/);
        if (!bodyCloseMatch) {
            console.log(`✗ ${path.basename(filePath)} - No </body> tag found`);
            return;
        }
        
        // Insert footer before closing body tag
        const bodyCloseIndex = bodyCloseMatch.index;
        content = content.slice(0, bodyCloseIndex) + '\n' + standardFooter + '\n' + content.slice(bodyCloseIndex);
        
        // Write the updated content
        fs.writeFileSync(filePath, content);
        console.log(`✓ ${path.basename(filePath)} - Header and footer added successfully`);
        
    } catch (error) {
        console.error(`✗ ${path.basename(filePath)} - Error: ${error.message}`);
    }
}

// Process all admin pages
console.log('Adding headers and footers to admin pages...\n');

adminPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        addHeaderFooter(filePath);
    } else {
        console.log(`✗ ${page} - File not found`);
    }
});

console.log('\nProcess completed!');