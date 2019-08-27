const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync('../protos/service.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

const client = new proto.parser.Parser(
  '0.0.0.0:3001',
  grpc.credentials.createInsecure()
);

function getData() {
  const channel = client.parse({ query: 'https://www.avito.ru/moskva_i_mo/predlozheniya_uslug?q=%D1%8D%D0%BA%D1%81%D0%BA%D0%B0%D0%B2%D0%B0%D1%82%D0%BE%D1%80' });

  channel.on("data", (message) => console.log(message));
}
getData();
