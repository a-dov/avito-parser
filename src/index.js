const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const URL = 'https://www.avito.ru/rossiya/gruzoviki_i_spetstehnika/ekskavatory/'; //TODO get URL from gRPC


var PROTO_PATH = __dirname + './../protos/service.proto';
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');


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

function parseUrl(call) {
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
            call.write(data);
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
      call.end();
    }
  })().catch(err => console.error(err));
}

function main() {
  var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
  var tobelease_parser = grpc.loadPackageDefinition(packageDefinition).tobelease_parser;

  console.log('tobelease_parser.Parser:', tobelease_parser.Parser);
  console.log('tobelease_parser.Parser.service:', tobelease_parser.Parser.service);

  var server = new grpc.Server();
  server.addService(tobelease_parser.Parser.service, { parseUrl: parseUrl });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
