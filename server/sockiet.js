var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express = require('express')
//定义全局变量用来存储当前在线人数
var onlineUserList = {};
var onlineUserCount = 0;
//定义一个当前用户的对象
function user(name,userid,avatar){
               this.username = name;
               this.userid = userid;
               this.avatar = avatar;
}
/*聊天专用路由接口*/
app.get('/',function(req,res){
         res.send("welcom to websocket chat!");
});
io.on('connection',function(socket){
	 //连接成功后进行push操作
	 console.log('a user has connected the chat server!\n');
	  //监听一个用户登录到服务器的时候进行的
	  socket.on('login',function(obj){
	  	socket.name = obj.username;
	  	socket.userid = obj.userid;
	  	console.log(obj);
		if(!onlineUserList.hasOwnProperty(obj.userid)){
	          var _user = new user(obj.username,obj.userid,obj.avatar);
		   onlineUserList[obj.userid ] = _user;
		   onlineUserCount++;
		   //通知所有人有人加入
		   io.emit('login',{onlineUserList:onlineUserList,onlineUserCount:onlineUserCount,user:obj});
		   console.log('user : '+socket.name+' has joined the chat server!\n');
		}
	  });
	  //监听一个用户是否离开
	  socket.on('disconnect',function(){
	  	 console.log('user : '+socket.name+' has disconnected the chat server!\n');
	  	 if(onlineUserList.hasOwnProperty(socket.userid)){
	  	 	      var obj = {userid:socket.userid,username:onlineUserList[socket.userid].username};
                    //删除数组中的元素
	  	  	 delete onlineUserList[socket.userid];
	  	  	 onlineUserCount --;
	  	  	 //通知所有人此人已经下线
	  	              io.emit('logout',{onlineUserList:onlineUserList,onlineUserCount:onlineUserCount,user:obj});
	  	 }
	  });
	  socket.on('message',function(obj){
                       io.emit('message',obj);
                       console.log(obj.username+'说：'+obj.content);
               
	  });
});
http.listen(4000, function(){
  console.log('listening on *:4000');
});



