#!/usr/bin/env node

/**
 * Module dependencies.
 */
var db = require('mongoose');
var app = require('./config/app');
var debug = require('debug')('g5s4f21:server');
var http = require('http');
const MongoStore = require('connect-mongo');
const configureSocket = require('./config/socketio');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
const io = require('socket.io')(server);
const mongoStore = MongoStore.create({
  mongoUrl:
    'mongodb+srv://admin:L650Xs9ixkF3fwGr@cluster0.nk3nn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
});
configureSocket(server, io, mongoStore);

/**
 * Listen on provided port, on all network interfaces.
 */

/*
 */
const { createAdapter } = require('@socket.io/mongo-adapter');
const { MongoClient } = require('mongodb');

const DB = 'mydb';
const COLLECTION = 'socket.io-adapter-events';

const mongoClient = new MongoClient(
  'mongodb+srv://admin:L650Xs9ixkF3fwGr@cluster0.nk3nn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useUnifiedTopology: true,
  }
);

const main = async () => {
  await mongoClient.connect();

  try {
    await mongoClient.db(DB).createCollection(COLLECTION, {
      capped: true,
      size: 1e6,
    });
  } catch (e) {
    // collection already exists
  }
  const mongoCollection = mongoClient.db(DB).collection(COLLECTION);

  io.adapter(createAdapter(mongoCollection));
  //io.listen(3000);
};

main();

/*
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
