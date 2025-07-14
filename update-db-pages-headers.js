// Script to update database utility pages with proper headers and footers

const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
    'initialize-database.html',
    'run-migration.html',
    'verify-database-integration.html'
];

const headerHTML = `    <!-- Site Header -->
    <header class="site-header">
        <div class="header-container">
            <div class="logo-section">
                <h1 class="logo">xBrush</h1>
                <span class="logo-subtitle">Admin Tools</span>
            </div>
            <nav class="header-nav">
                <a href="index.html" class="nav-link">동영상 제작</a>
                <a href="models.html" class="nav-link">모델 쇼케이스</a>
                <a href="admin.html" class="nav-link">관리자</a>
            </nav>
        </div>
    </header>`;

const footerHTML = `    <!-- Footer -->
    <footer class="site-footer">
        <div class="footer-content">
            <p>&copy; 2024 xBrush. All rights reserved.</p>
            <div class="footer-links">
                <a href="#">이용약관</a>
                <a href="#">개인정보처리방침</a>
                <a href="#">문의하기</a>
                <a href="admin.html" style="opacity: 0.5;">관리자</a>
            </div>
        </div>
    </footer>`;

const externalCSS = `    <!-- External CSS -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="model-showcase.css">
    `;

pagesToUpdate.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add external CSS after title tag
        if (!content.includes('link rel="stylesheet" href="styles.css"')) {
            content = content.replace(
                /<title>.*?<\/title>\s*\n/,
                (match) => match + externalCSS + '\n'
            );
        }
        
        // Add site header after body tag
        if (!content.includes('site-header')) {
            content = content.replace(
                /<body>\s*\n/,
                '<body>\n' + headerHTML + '\n\n'
            );
        }
        
        // Add footer before closing body tag
        if (!content.includes('site-footer')) {
            content = content.replace(
                /(\s*)<\/body>/,
                '\n' + footerHTML + '\n$1</body>'
            );
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${fileName}`);
    } else {
        console.log(`File not found: ${fileName}`);
    }
});

console.log('Done updating database utility pages');