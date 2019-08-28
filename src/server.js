const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const parseUrl = require('./functions');
const { start } = require('./mydb');

const db = start();

const server = new grpc.Server();

const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync("./service.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

function parse(call) {
  parseUrl(call, db);
}

server.addService(proto.parser.Parser.service, { parse: parse });

server.bind('0.0.0.0:3001', grpc.ServerCredentials.createInsecure());

server.start();

console.log('Server started');
