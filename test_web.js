const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    console.log('Navigating to http://localhost:8081');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 15000 });
    
    console.log('Page loaded successfully');
    await browser.close();
  } catch (err) {
    console.error('Script Error:', err.message);
    process.exit(1);
  }
})();
