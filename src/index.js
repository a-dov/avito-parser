const {Worker} = require('worker_threads');
const puppeteer = require('puppeteer');

function runService(url) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./parsePage.js', {url});
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}

async function run() {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.avito.ru/rossiya/gruzoviki_i_spetstehnika/ekskavatory?cd=1');

    const hrefs = await page.evaluate(() => {
      const anchors = document.querySelectorAll('.item-description-title-link');
      return [].map.call(anchors, a => a.href);
    });

    for (let i = 0; i < 2; ++i) {
      setTimeout(() => {
        runService(hrefs[i]);
      }, 600 * i);
    }
    await browser.close();
  })();
}

run().catch(err => console.error(err));