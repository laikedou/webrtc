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
//定义全局变量用来存储当前在线人数
var onlineUserList = [];
var onlineUserCount = 0;
//定义一个当前用户的对象
function user(name,userid){
               this.username = name;
               this.userid = userid;
}
/*聊天专用路由接口*/
app.get('/chat/:id',function(req,res){
	  io.on('connection',function(socket){
	  	 //连接成功后进行push操作
	  	 console.log('a user has connected the chat server!\n');
	  	  //监听一个用户登录到服务器的时候进行的
	  	  socket.on('login',function(obj){
	  	  	socket.name = obj.username;
	  	  	socket.userid = obj.userid;
			if(!onlineUserList.hasOwnProperty(obj.userid)){
                       var _user = new user(obj.name,obj.userid);
			   onlineUserList[obj.userid ] = _user;
			   onlineUserCount++;
			   //通知所有人有人加入
			   io.emit('login',{onlineUserList:onlineUserList,onlineUserCount:onlineUserCount,user:obj});
			   console.log('user : '+soket.name+'has joined the chat server!\n');
			}
	  	  });
	  	  //监听一个用户是否离开
	  	  soket.on('disconnect',function(){
	  	  	 console.log('user : '+soket.name+'has disconnected the chat server!\n');
	  	  	 if(onlineUserList.hasOwnProperty(socket.userid)){
	  	  	 	      var obj = {userid:socket.userid,username:onlineUserList[socket.userid]};
		                    //删除数组中的元素
			  	  	 delete onlineUserList[socket.userid];
			  	  	 onlineUserCount --;
			  	  	 //通知所有人此人已经下线
	  	  	              io.emit('logout',{onlineUserList:onlineUserList,onlineUserCount:onlineUserCount,user:obj});
	  	  	 }
	  	  });
	  	  soket.on('message',function(obj){

                           io.emit('message',obj);
                           console.log(obj.username+'说：'+obj.content);
                   
	  	  });
	  });

});
http.listen(3000, function(){
  console.log('listening on *:3000');
});



