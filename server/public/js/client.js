/**
 *  @author laike 
 *  @date 2016-1-28
 */
"use strict";
var Tools = (function(){
    var debugPanel=document.getElementById("debug-info");
    function _extends(defaultOpts,options){
        for(var i  in options){
            if(!defaultOpts.hasOwnProperty(i)){
                defaultOpts[i] = options[i];
            }else{
                defaultOpts[i] = options[i];
            }
        }
        return defaultOpts;
    }
    function Alert(msg){
        var dialog = document.createElement("dialog");
        dialog.className = "dialog-panel";
        var txtMsg=document.createTextNode(msg);
        var innerMsgEle = document.createElement('p');
        innerMsgEle.appendChild(txtMsg);
        dialog.appendChild(innerMsgEle);
        var button = document.createElement('button');
        button.innerHTML = 'ok';
        button.onclick = function(){
            dialog.close();
        };
        dialog.appendChild(button);
        document.body.appendChild(dialog);
        dialog.showModal();
    }
    function getStyle(ele,name){
        var computedStyle;
        try{
            computedStyle = document.defaultView.getComputedStyle(ele,null);
        }catch(e){
            computedStyle = ele.currentStyle;
        }
        if(name != "float"){
            return computedStyle[name];
        }else{
            return computedStyle['cssFloat'] || computedStyle['styleFloat'];
        }
    }
    function setStyle(ele,name,value){
        ele.style[name] = value;
    }
    function Log(msg){
        var p = document.createElement('p');
        p.className = "debug-info-p";
        var msginfo = document.createTextNode(msg);
        p.appendChild(msginfo);
        debugPanel.appendChild(p);
        debugPanel.scrollTop = debugPanel.scrollHeight - debugPanel.offsetTop;
        //scrollBy(0,19);
    }
    function showLoading(){
        var loading = document.getElementsByClassName('loading');
        if(loading.length === 0){
            loading = document.createElement('i');
            loading.className = "fa fa-spinner fa-spin fa-5x loading";
            //添加到video-container 容器中
            var videoContainer = document.getElementsByClassName('video-container')[0];
            videoContainer.appendChild(loading);
            return;
        }
        for(var i = 0;i<loading.length;i++){
            Tools.setStyle(loading[i],'display','block');
        }
    }
    function hideLoading(){
        var loading = document.getElementsByClassName('loading');
        if(loading.length >0){
            for(var i = 0;i<loading.length;i++){
                Tools.setStyle(loading[i],'display','none');
            }
        }
    }
    var runPrefixMethod = function(ele,method){
        var usablePrefixMethod;
        ['webkit','ms','o',''].forEach(function(prefix){
            if(usablePrefixMethod){
                return ;
            }
            //如果是没有前缀的话
            if(prefix ===''){
                method = method.slice(0,1).toLowerCase()+method.slice(1);
            }
            var typePrefixMethod = typeof ele[prefix+method];
            if(typePrefixMethod !== 'undefined'){
                if(typePrefixMethod === 'function'){//如果typePrefixMethod是一个方法的话那么执行下面语句
                    usablePrefixMethod = ele[prefix+method]();
                }else{
                    usablePrefixMethod = ele[prefix+method];//如果不是方法那么就当做属性进行返回
                }
            }
        });
        return usablePrefixMethod;
    };
    //进行全屏
    function requestFullScreen(ele){
        if(runPrefixMethod(ele,'FullScreen')||runPrefixMethod(ele,'IsFullScreen')){
            runPrefixMethod(ele,'CancleFullScreen');
            Tools.Log("The video is in Basic Mode");
        }else if(runPrefixMethod(ele,'RequestFullScreen')){
            Tools.Log("The video is in FullScreen Mode");
        }
    }
    //退出全屏
    function exitFullScreen(){

    }
    return {
        extends:function (defaultOpts,options){
            return _extends(defaultOpts,options);
        },
        Alert:function (msg){
            Alert(msg);
        },
        getStyle:function(ele,name){
            return getStyle(ele,name);
        },
        setStyle:function (ele,name,value){
            setStyle(ele,name,value);
        },
        showLoading:function (){
            showLoading();
        },
        hideLoading:function(){
            hideLoading();
        },
        Log:function(msg){
            Log(msg);
        },
        requestFullScreen:function(ele){
            requestFullScreen(ele);
        },
        exitFullScreen:function(){
            exitFullScreen();
        }
    };
}());
//自用工具库
var whenReady = (function(){
    var ready = false;
    var funcs = [];//存储函数的数组
    function handler(e){
        if(ready) return;
        if(e.type === 'readystatechange' && document.readyState !== 'commplete'){
            return;
        }
        for(var i=0;i<funcs.length;i++){
              funcs[i].call(document);
        }
        //进行标记
        ready  = true;
        funcs = null;//置空
    }
    if(document.addEventListener){
         document.addEventListener('DOMContentLoaded', handler,false);
         document.addEventListener('readystatechange', handler,false);
         window.addEventListener('load',handler,false);
    }else{
        //兼容IE等不支持addEventListener方法的浏览器
        document.attachEvent('onreadystatechange',handler);
        window.attachEvent('onload',handler);
    }

    return function isReady(f){

        if(ready){
             f.call(document);
        }else{
            funcs.push(f);
        }
    }
}());
//查询滚动条窗口的位置  用于计算文档坐标位置
function getScrollOffset(w){
     w = w || window;
     if(w.pageXOffset) return {x:w.pageXOffset,y:w.pageYOffset};
     var d = w.document;
     if(document.compatMode === 'CSS1Compat'){
         return {
              x: d.docuemntElement.scrollLeft,
              y: d.docuemntElement.scrollTop
         }
     }
     //如果是怪异模式的话那么
     return {
          x : d.body.scrollLeft,
          y : d.body.scrollTop
     }
}
//追加addEvent方法
function addEvent(ele,type,fn,iscapture){
      if(!iscapture) iscapture = false;
      if(ele.addEventListener){
            return ele.addEventListener(type, fn,iscapture);
      }else if(ele.attachEvent){
              return ele.attachEvent('on'+type,function(event){
                     event = event || window.event;//兼容某些不支持event传递的浏览器
                     fn.call(event);
               });
      }
      //如果上述的两种方法都不支持那么就使用在documentElement元素上绑定on事件的方法 兼容所有浏览器
      ele['on'+type] = function (event){
          event = event || window.event;
          fn.call(event);
      }
}
//新增操作node节点的函数兼容大部分现代浏览器
function parent(ele,n){
     if(n === undefined) n =1;
     while(n-- && ele) ele = ele.parentNode;
     if(!ele || ele.nodeType !==1) return null;//排除像fragmentElement这种 必须是element元素才行
     //否则返回
     return ele; 
}
//新增获取兄弟元素方法
/**
@ele 当前元素
@n 第几个兄弟元素
*/
function siblings(ele,n){
      if(n === undefined) n =1;
      while(ele && n !== 0){
           if(n > 0){
              if(ele.nextElementSibling){
                ele = ele.nextElementSibling
              }else{
                for(ele = ele.nextSibling;ele && ele.nodeType !== 1;ele = ele.nextSibling);//空循环
              } 
              n--;
           }else{
              if(ele.previousElementSibling){
                ele = ele.previousElementSibling;
              }else{

                 for(ele = ele.previousSibling;ele && ele.nodeType !== 1;ele = ele.previousSibling);
              }
              n++;
           }

      }
      return ele;//返回兄弟元素
}

var Chat = (function(){
      var _socket = null;
      var _username = '';
      var _sex  = 'male';
      var _avatar = 'avatar1.png';
      var _userid = '';
      var _user_self ={};
      var _new_user = null;
      var _onlineuserlist = [];
      var _onlineusercount = 0;
      var _login_panel = document.getElementById('login-panel');
      var _chat_panel = document.getElementById('chat-panel');
      var _login_form = document.querySelector('form[name=login-box]');
      var _chat_form = document.querySelector('form[name=senbox]');
      var _username_input = document.querySelector('input[name=username]');
      var _avatar_input = document.querySelector('input[name=avatar]:checked');
      var _sex_input = document.querySelector('input[name=sex]:checked');
      var _login_form_submit_btn = document.querySelector("#login-panel input[type=submit]");
      var _messge_box = document.querySelector('textarea[name=message-box]');
      var _chat_room_users = document.querySelector('.chat-message-users');
      var _message_container = document.querySelector('#messages');
      var _close_chat_btn = document.querySelector('.chat-message-title-tools .btn-close');
      function initClickEvent(){
          var _avatar_labels = document.querySelectorAll(".form-group-item .img");
          for(var i=0;i<_avatar_labels.length;i++){
               _avatar_labels[i].addEventListener('click',function(){
                          //this.addAttribute();
               });
          }
      }
      //生成一个唯一的iD
      function generUid(){
         return new Date().getTime() + '' +Math.floor(Math.random() *899 +100);
      }
      //退出
      function loginOut(){
         window.location.reload();
      }
      //滚动到聊天区域的最下面
      function scrollToMsgBottom(){
          _message_container.scrollTop = _message_container.scrollHeight - _message_container.offsetTop;
      }
      //更新系统信息
      function updateSystemInfo(obj,act){
           _onlineuserlist = obj.onlineUserList;
           _onlineusercount = obj.onlineUserCount;
           _new_user = obj.user;
           var key;
           var _users_html='';
           var _seprator = ''
           for (key in _onlineuserlist){
                   if(_onlineuserlist.hasOwnProperty(key)){
                      _users_html +=    '<span class="user">'+_seprator+_onlineuserlist[key].username+'</span>'; 
                      _seprator = '、';
                   }
           }
           _chat_room_users.innerHTML = '<span class="title">当前共有：<font class="col-red">'+_onlineusercount+' </font> 在线，在线列表：</span>' +_users_html;

           var _join_out_li_container = document.createElement("li");
           _join_out_li_container.className = "chat-message chat-message-join-out";
           var _login_out_msg = (act == 'login') ? "加入聊天室" :"离开聊天室";
           var _color = (act == 'login') ? "col-green" :"col-red";
           _join_out_li_container.innerHTML = '<div class="info"><span class="'+_color+'"> '+_new_user.username+' '+_login_out_msg+'</span></div>';
           _message_container.appendChild(_join_out_li_container);
          
      }
      function onSubmitMsg(event){
          if(_messge_box.value == ""){
             alert('请输入聊天消息内容！');
             return false;
          }
          _socket.emit('message',{username:_user_self.username,avatar:_user_self.avatar,content:_messge_box.value});
          //清空输入的聊天信息
          _messge_box.value= '';
          scrollToMsgBottom();
          return false;
       }
     function init(){
         
          _login_form.onsubmit = function(event){
          event = event || window.event;
          event.stopPropagation();
          if(_username_input.value==""){
                alert('请输入您的名字！');
                return false;
          }
          console.log(_avatar_input);
         _username = _username_input.value;
         _sex = _sex_input.value;
         _avatar = _avatar_input.value;
         _userid = generUid();
         _user_self.userid = _userid;
         _user_self.avatar = _avatar;
         _user_self.username = _username;
         _user_self.sex = _sex;
         //连接socket服务器
         _socket = io.connect('http://127.0.0.1:4000');
         _socket.on('connect_error',function(event){
            console.log(event);
         });
         //告诉服务器端有用户登录
         _socket.emit('login',{userid:_userid,username:_username,avatar:_avatar});
         //监听用户登录
         _socket.on('login',function(obj){
              updateSystemInfo(obj,'login');
         });
         //监听用户退出
         _socket.on('logout',function(obj){
              updateSystemInfo(obj,'logout');
         });
         //监听聊天的信息
         _socket.on('message',function(msgobj){
                 var _msg_info_li = document.createElement('li');
                 _msg_info_li.className = "chat-message";
                 var isme = (_user_self.userid == msgobj.userid) ? true : false;
                 if(isme){
                   _msg_info_li.classList.add("chat-message-right");
                 }else{
                   _msg_info_li.classList.add("chat-message-left");
                 }
                 var _msg_info_message_container = document.createElement("div");
                 _msg_info_message_container.className = "chat-message-container";
                 var _msg_info_msg = document.createTextNode(msgobj.content);
                 _msg_info_message_container.appendChild(_msg_info_msg);
                var _msg_info_figure = document.createElement('figure');
                var _msg_info_figure_img = document.createElement("img");
                _msg_info_figure_img.src ="/images/"+msgobj.avatar ;
                _msg_info_figure_img.alt = msgobj.username;
                var _msg_info_figure_span = document.createElement('span');
                _msg_info_figure_span.className = "username";
                _msg_info_figure_span.innerHTML = msgobj.username;
                _msg_info_figure.appendChild(_msg_info_figure_img);
                _msg_info_figure.appendChild(_msg_info_figure_span);
                _msg_info_li.appendChild(_msg_info_message_container);
                _msg_info_li.appendChild(_msg_info_figure);
                _message_container.appendChild(_msg_info_li);
                
        });
         //隐藏登陆框显示聊天窗口
         _chat_panel.style.display = 'flex';
         _login_panel.style.display = 'none';
         return false;

       }
       //监听发送消息的事件
       _chat_form.onsubmit = onSubmitMsg;
       //监听关闭或者退出聊天室的方法
       _close_chat_btn.addEventListener('click',function(){
           loginOut();
       });
       //监听keydown 事件
       _messge_box.onkeydown = function(event){
          event = event || window.event;
          if(event.keyCode === 13){
            onSubmitMsg();
          }
       }
       initClickEvent();
     }

    return {
        init:function(){
             init();
        }
    }
}());
//当dom加载完成进行初始化
whenReady(function(){
    Chat.init(); 
});