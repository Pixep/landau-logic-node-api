var WebSocketServer = require('websocket').server;
var http = require('http');

var controlServer = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

var analysisServer = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

controlServer.listen(5880, function() {
    console.log((new Date()) + ' Control server is listening on port 5880');
});
analysisServer.listen(5881, function() {
    console.log((new Date()) + ' Analysis server is listening on port 5881');
});

wsControlServer = new WebSocketServer({
    httpServer: controlServer,
    autoAcceptConnections: false
});
wsAnalysisServer = new WebSocketServer({
    httpServer: analysisServer,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsControlServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    // Accept connection
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted from ' + request.origin);

    // Handle reception
    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            return;
        }

        console.log('Control message received: ' + message.utf8Data);
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

wsAnalysisServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    // Accept connection
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted from ' + request.origin);

    // Handle reception
    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            return;
        }

        console.log('Analysis message received: ' + message.utf8Data);
    });

    // Close handler
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
