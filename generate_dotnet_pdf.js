const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const page = await browser.newPage();

  // Load the .NET Core / React variant HTML file
  const filePath = path.resolve(__dirname, 'cv_dotnet.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: 'Gimhana_Mithuranga_DotNet_CV.pdf',
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    printBackground: true,
  });

  await browser.close();
  console.log('PDF generated: Gimhana_Mithuranga_DotNet_CV.pdf');
})();
