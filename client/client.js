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
  const channel = client.parse({ query: 'https://www.avito.ru/moskva_i_mo/predlozheniya_uslug/transport_perevozki?cd=1&q=%D1%81%D0%BF%D0%B5%D1%86%D1%82%D0%B5%D1%85%D0%BD%D0%B8%D0%BA%D0%B0' });

  channel.on("data", (message) => console.log(message));
}
getData();
