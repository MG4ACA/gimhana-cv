const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const launchOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
    };
    const fs = require('fs');
    if (fs.existsSync(chromePath)) {
      launchOptions.executablePath = chromePath;
    }
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const filePath = path.resolve(__dirname, 'cv_sales.html');
    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: 'Gimhana_Mithuranga_Sales_CV.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
    await browser.close();
    console.log('PDF generated: Gimhana_Mithuranga_Sales_CV.pdf');
  } catch (err) {
    console.error('Error generating PDF:', err);
    process.exitCode = 1;
  }
})();
