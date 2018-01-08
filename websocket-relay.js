// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// node websocket-relay yoursecret 8081 8082
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret

var fs = require('fs'),
	http = require('http'),
	WebSocket = require('ws'),
	exportsFunction = require('./controller/exportsfunction')

var obj = {
	table : []
};

if (process.argv.length < 3) {
	console.log(
		'Usage: \n' +
		'node websocket-relay.js <secret> [<stream-port> <websocket-port>]'
	);
	process.exit();
}

var STREAM_SECRET = process.argv[2],
		STREAM_PORT = process.argv[3] || 5001,
		WEBSOCKET_PORT = process.argv[4] || 5002,
		RECORD_STREAM = false;

// Websocket Server
var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket, upgradeReq) {
socketServer.connectionCount++;
	var logs = {
		'date' : exportsFunction.convertTime(Date.now()),
		'remoteAddress' : (upgradeReq || socket.upgradeReq).socket.remoteAddress,
		'user-agent' : (upgradeReq || socket.upgradeReq).headers['user-agent']
	}
	obj.table.push({logs});
	var json = JSON.stringify(obj,null,4)
	fs.writeFile('logs/log.json', json, 'utf8', (err) => {
			if(err) {
				return console.log(err);
			}
			console.log('saved to logs')
	});
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
	socketServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
var streamServer = http.createServer( function(request, response) {
	var params = request.url.substr(1).split('/');
	console.log(streamServer)
	if (params[0] !== STREAM_SECRET) {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}

	response.connection.setTimeout(0);
	console.log(
		'Stream Connected: ' +
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		socketServer.broadcast(data);
		if (request.socket.recording) {
			request.socket.recording.write(data);
		}
	});
	request.on('end',function(){
		console.log('close');
		if (request.socket.recording) {
			request.socket.recording.close();
		}
	});

	// Record the stream to a local file?
	if (RECORD_STREAM) {
		var path = 'recordings/' + Date.now() + '.ts';
		request.socket.recording = fs.createWriteStream(path);
	}
}).listen(STREAM_PORT);

console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
