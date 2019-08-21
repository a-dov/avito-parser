var PROTO_PATH = __dirname + './../protos/service.proto';

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

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

// console.log('tobelease_parser.Parser:', tobelease_parser.Parser);
// console.log('tobelease_parser.Parser.service:', tobelease_parser.Parser.service);


function main() {
  var client = new tobelease_parser.ParseRequest('localhost:50051', grpc.credentials.createInsecure());

  client.parseUrl({query: 'vk.com/'}, function(err, response) {
    console.log('KEKEKEKEKEK!');
  });
}

main();
