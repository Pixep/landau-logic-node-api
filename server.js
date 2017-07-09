var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(5880, function() {
    console.log((new Date()) + ' Server is listening on port 5880');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    // Accept connection
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted from ' + request.origin);

    // Echo text received
    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            return;
        }

        console.log('Received Message: ' + message.utf8Data);

        // Process message
    });

    // Close handler
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        clearInterval(connection.controlTimer);
    });

    // Send control periodically
    function sendControl() {
      var data = {
        steering: 0,
        acceleration: -0.5,
        brake: 0.5,
        handBrake: 0
      }

      connection.sendUTF(JSON.stringify(data));
    }

    connection.controlTimer = setInterval(sendControl, 1500);
});
