"use strict";

module.exports = {
  connectionHandler: function(socket) {
    socket.server.logger.info('SocketIO connection established', socket.id);
  }
};