const puppeteer = require('puppeteer');
const express = require('express');
require('dotenv').config();

const app = express();
// Serve the files in /assets at the URI /assets.
app.use('/assets', express.static('assets'));

app.get('/', async (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
});

app.get('/:paymentId', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--single-process',
        '--no-zygote',
        '--disable-setuid-sandbox',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.goto(
      `https://staging.crystalsound.ai/billing-detail/${req.params.paymentId}`,
      {waitUntil: 'networkidle2'}
    );
    //await page.goto(`http://localhost:3000/billing-detail/${req.params.paymentId}`, {waitUntil: 'networkidle2'});
    const pdf = await page.pdf({format: 'A4'});

    await browser.close();
    res.set({'Content-Type': 'application/pdf', 'Content-Length': pdf.length});
    res.send(pdf);
    return;
  } catch (e) {
    console.log('error: ', e);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
  );
});
