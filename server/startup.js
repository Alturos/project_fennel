var http = require('http');
var socketio = require('socket.io');
var connect = require('connect');

var configuration = {
	http_port: 7231,
	socket_port: 7232
};
var casual_quest = require('./game.js');
var server = casual_quest({
	domain: 'localhost',
	port: configuration.socket_port
});
var http_server = http.createServer();
var io = socketio.listen(http_server, { log: false });
io.sockets.on('connection', function (socket) {
	var new_client = Object.create(require('./client.js'));
	new_client.setup(socket);
	server.add_client(new_client);
});
http_server.listen(configuration.socket_port);
console.log('Web Socket server listening on port '+configuration.socket_port);