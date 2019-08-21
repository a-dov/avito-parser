var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

var proto = grpc.loadPackageDefinition(
  protoLoader.loadSync('../protos/service.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

let client = new proto.parser.Parser(
  '0.0.0.0:3001',
  grpc.credentials.createInsecure()
);

function getData() {
  let channel = client.parse({ query: 'https://www.avito.ru/rossiya/velosipedy?cd=1' });

  channel.on("data", (message) => console.log(message));
}
getData();
