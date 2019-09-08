const puppeteer = require('puppeteer');
const {Cluster} = require('puppeteer-cluster');
const qs = require('querystring');
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = process.env.DEBUG ? 'debug' : 'error';

module.exports = async function parseRequest(call, db) {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  logger.debug("puppeteer launched ");

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: process.env.THREADS,
    puppeteerOptions: {args: ['--no-sandbox', '--disable-setuid-sandbox']}
  });
  logger.debug("cluster created with", process.env.THREADS, 'threads');

  try {
    await cluster.task(async ({page, data}) => {
      await page.goto(data.url);
      logger.debug("link opened", data.url);

      await page.tap('.js-item-phone-button_card');
      await page.waitForSelector('.item-popup .js-item-phone-big-number img');
      logger.debug("there is selector", '.item-popup .js-item-phone-big-number img');

      const info = await page.evaluate(() => {

        const sellerProfileLink = document.querySelector('.js-seller-info-name a');
        const phoneImg = document.querySelector('.item-popup .js-item-phone-big-number img');
        const title = document.querySelector('.title-info-title-text');
        const price = document.querySelector('.js-item-price');
        const description = document.querySelector('.item-description-text p');

        return {
          title: title.innerText,
          price: price ? price.getAttribute('content') : 'Цена не указана',
          description: description ? description.innerText : '',
          profileLink: sellerProfileLink ? sellerProfileLink.href : '',
          name: sellerProfileLink ? sellerProfileLink.innerText : '',
          phoneImage: phoneImg ? phoneImg.src : '',
        };
      });

      logger.debug("info from evaluate", info);

      if (!db.has(info.profileLink)) {
        logger.debug("set profile to db");
        db.set(info.profileLink, true);
        logger.debug("write to db");
        db.write();
        logger.debug("write to channel");
        call.write(info);
      } else {
        logger.debug("this profile already exists");
      }
    });

    const page = await browser.newPage();
    logger.debug("request opened");

    const leftPath = call.request.query.substring(0, call.request.query.indexOf('?') + 1);

    for (let i = 1; i <= 100; ++i) {
      let url = qs.parse(call.request.query.substring(call.request.query.indexOf('?') + 1));
      url.p = `${i}`;
      url = qs.stringify(url);

      logger.debug("try to open url:", leftPath + url);
      await page.goto(leftPath + url);
      logger.debug("successfully opened:", leftPath + url);

      logger.debug("try to get links from page");
      const hrefs = await page.evaluate(() => {
        const anchors = document.querySelectorAll('.item-description-title-link');
        return [].map.call(anchors, a => a.href);
      });
      logger.debug("successfully got:", hrefs.length, 'items');

      if (!hrefs) break;

      for (let i = 0; i < hrefs.length; ++i) {
        // куеуе
        cluster.queue({
          url: hrefs[i],
        });
      }
    }
  } catch (e) {
    logger.error(e);
    console.error(e);
  } finally {
    await cluster.idle();
    await cluster.close();
    logger.error('final step, close all');
    await browser.close();
    call.end();
    db.write();
  }
};
