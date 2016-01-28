var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	console.log(__filename);
  res.sendFile(__dirname+'/chat.html');
});
io.on('connection',function(socket){
	  console.log('a user connected!\n');
	  socket.on('disconnect',function(){
	  	  console.log('a user disconnected!\n ');
	  });
	  socket.on('chat message',function(msg){
	  	  console.log('message: '+msg);
	  	  io.emit('chat message',msg);
	  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



