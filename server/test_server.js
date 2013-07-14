var http = require('http');
var socketio = require('socket.io');
var connect = require('connect');

var configuration = {
	http_port: 80,
	socket_port: 7232
};

// Static http server setup
var server = connect.createServer();
var static_http = http.createServer(server);
socketio.listen(static_http, {log: false});
static_http.listen(configuration.http_port);
console.log('Http server listening on port '+configuration.http_port);
server.use('/', connect.static(__dirname+'/..'));