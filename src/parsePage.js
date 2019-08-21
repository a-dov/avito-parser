const { workerData, parentPort } = require('worker_threads');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(workerData);
  const titles = await page.$$eval('.title-info-title-text', as => as.map(a => a.innerText));
  console.log(titles);
  await browser.close();
  parentPort.postMessage({ hello: titles });
})();


