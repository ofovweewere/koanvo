const config = require('./app');
const cookieParser = require('cookie-parser');
const passport = require('passport');

module.exports = function(server, io, mongoStore) {
  io.use((socket, next) => {
    cookieParser(config.sessionSecret)(socket.request, {}, (err) => {
      const sessionId = socket.request.signedCookies['connect.sid'];
        console.log("dapooooooooooooooooomejiiiiiiiiiii");
      mongoStore.get(sessionId, (err, session) => {
        socket.request.session = session;

        passport.initialize()(socket.request, {}, () => {
          passport.session()(socket.request, {}, () => {
            if (socket.request.user) {
              next(null, true);
            } else {
              next(new Error('User is not authenticated'), false);
            }
          })
        });
      });
    });
  });
  io.on('connection', (socket) => {
    /* ... */
  });
};
