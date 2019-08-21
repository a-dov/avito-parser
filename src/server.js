var grpc = require('grpc');
var parseUrl = require('./functions');
var protoLoader = require('@grpc/proto-loader');

const server = new grpc.Server();

let proto = grpc.loadPackageDefinition(
  protoLoader.loadSync("../protos/service.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

function parse(call, callback) {
  parseUrl(call);
}

server.addService(proto.parser.Parser.service, { parse: parse });

server.bind('localhost:3001', grpc.ServerCredentials.createInsecure());

server.start();

