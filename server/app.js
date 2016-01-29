var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express')
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public'))); 
app.get('/', function(req, res){
  //res.sendFile(__dirname+'/chat.html');
  res.render('chat',{'title':'socket-chat demo','PUBLIC':__dirname+'/public'});
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



