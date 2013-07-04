//var http = require('http');
var socketio = require('socket.io');
var connect = require('connect');

var configuration = {
//	http_port: 7231,
	socket_port: 7232
};
var game = require('./game.js');
//var http_server = http.createServer();
var io = socketio.listen(configuration.socket_port, { log: false });
io.sockets.on('connection', function (socket){
	socket.on('setup', function(data){
		var new_client = Object.create(require('./client.js'));
		new_client.setup(socket, data);
		game.add_client(new_client);
	});
});
console.log('Web Socket server listening on port '+configuration.socket_port);