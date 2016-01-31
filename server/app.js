var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express')
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public'))); 
app.get('/', function(req, res){
  res.render('chat',{'title':'socket-chat demo','PUBLIC':__dirname+'/public','version':(new Date()).getTime()});
});
http.listen(3000, function(){
  console.log('listening on *:3000');
});



