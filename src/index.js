const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const URL = 'https://www.avito.ru/rossiya/gruzoviki_i_spetstehnika/ekskavatory/';

function processUrl(url) {
  const reg = /p=[0-9]+/;
  const match = url.match(reg);

  if (match) {
    return url;
  } else if (url.indexOf('?') !== -1) {
    return url + '&p=';
  }
  return url + '?p=';
}

async function run() {
  (async () => {
    const browser = await puppeteer.launch();
    const url = processUrl(URL);

    try {
      const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 3,
      });

      await cluster.task(async ({ page, data: url }) => {
        await page.goto(url);
        await page.tap('.js-item-phone-button_card');
        await page
          .waitForSelector('.item-popup .js-item-phone-big-number img')
          .then(async () => {
            const data = await page.evaluate(() => {
              const phoneImg = document.querySelector('.item-popup .js-item-phone-big-number img');
              const title = document.querySelector('.title-info-title-text');
              const price = document.querySelector('.js-item-price');
              const description = document.querySelector('.item-description-text p');
              const arr = [];
              arr.push(title.innerText, /*phoneImg ? phoneImg.src : 'Нет номера', */price ? price.getAttribute('content') : 'Цена не указана', description ? description.innerText : '');
              return arr;
            });
            console.log(data);
          });
      });

      const page = await browser.newPage();

      for (let i = 1; i <= 100; ++i) {
        await page.goto(url.replace('p=', 'p=' + i));

        console.log('page:', url.replace('p=', 'p=' + i));

        const hrefs = await page.evaluate(() => {
          const anchors = document.querySelectorAll('.item-description-title-link');
          return [].map.call(anchors, a => a.href);
        });

        if (!hrefs) break;

        for (let i = 0; i < 1; ++i) {
          cluster.queue(hrefs[i]);
        }
      }

      await cluster.idle();
      await cluster.close();
    } catch (e) {
      console.error(e);
    } finally {
      await browser.close();
    }
  })();
}

run().catch(err => console.error(err));
