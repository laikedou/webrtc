/**
 * Created by LaiKe on 2016/1/3.
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
//webrtc
var webRtc = (function(options){
    var _defaultOpts={};
    var _videos = [];
    var _videos_width = 500;
    var _videos_height =500;
    var _perId = 1;
    var isAllowMicAndCamera = false;
    var _content_menu_opts = ['关于作者','视频截图','视频地址','HTML5 WebRTC'];
    var _localStreams = [];
    var _dialog_mask;
    var _canvas;
    var _context;
    var _dialog_content;
    var _dialog_img;
    var _download_btn;
    var _localVideoStream = null;
    var _localVideo = null;
    var _debug_info = document.getElementById('debug-info');
    var _currentRemoteVideo = null;
    var _currentRemoteStream = null;
    //p2p相关
    var _peerConnection = null;
    var _peerStarted = false;
    var _mediaConstraints = {'mandatory':{
        'offerToReceiveAudio':true,
        'offerToReceiveVideo':true
    }};
    var _iceServers = []
    if(options){
        _defaultOpts=Tools.extends(_defaultOpts,options);
    }
    function createVideo(id,islocalstream,title,width,height){
        if(!islocalstream){
            islocalstream = false;
        }
        if(!title){
            title = '';
        }
        var _video = document.createElement('video');
        var _video_container = document.getElementById(id);
        _video.id = '_perVideoId_'+_perId;
        _video.islocalstream = islocalstream;
        _videos.push(_video);
        _perId++;
        //创建一个包容的容器可以用来调整声音以及播放和暂停
        var per_container = document.createElement('div');
        per_container.className = 'per-video-container';
        if(width || height){
            per_container.style.width = width ;
            per_container.style.height = height;
        }else{
            per_container.style.width = _video.videoWidth ;
            per_container.style.height = _video.videoHeight;
        }
        var per_control_bar = document.createElement('div');
        per_control_bar.className = 'per-video-control-bar';
        var per_playing = document.createElement('div');
        per_playing.className = 'video-pre-playing';
        var per_i_play = document.createElement('i');
        var per_i_pause = document.createElement('i');
        per_i_play.style.display ='none';
        per_i_pause.style.display = 'inline-block';
        per_i_play.className ='fa fa-play';
        per_i_pause.className ='fa fa-pause';
        per_playing.appendChild(per_i_play);
        per_playing.appendChild(per_i_pause);
        per_control_bar.appendChild(per_playing);
        per_container.appendChild(_video);
        per_container.appendChild(per_control_bar);
        per_container.style.width = width;
        per_container.style.height = height;
        //这里要给播放和暂停键绑定相关的click 事件
        per_playing.addEventListener('click',function(event){
            event.stopPropagation();
            if(per_i_pause.style.display == 'inline-block'){
                per_i_play.style.display ='inline-block';
                per_i_pause.style.display = 'none';
                _video.pause();
            }else{
                per_i_play.style.display ='none';
                per_i_pause.style.display = 'inline-block';
                _video.play();
            }
        });
        var _video_content_menu;
        per_container.addEventListener('mouseup',function(event){
            event.preventDefault();
            event.stopPropagation();
            if(event.button ==2){
                if(!_video_content_menu){
                    _video_content_menu = document.createElement('ul');
                }else{
                    _video_content_menu.style.display = 'block';
                    _video_content_menu.style.left = event.offsetX+'px';
                    _video_content_menu.style.top = event.offsetY+'px';
                    return;
                }
                //这里要判断鼠标相对于当前点击对象的clientX 和 clientY
                _video_content_menu.style.left = event.offsetX+'px';
                _video_content_menu.style.top = event.offsetY+'px';
                _video_content_menu.className = 'per_video_content_menu';
                for (var i = 0; i < _content_menu_opts.length; i++) {
                    var _li = document.createElement('li');
                    var _txt = document.createTextNode(_content_menu_opts[i]);
                    var _a = document.createElement('a');
                    _a.href = 'javascript:void(0);';
                    _a.appendChild(_txt);
                    if(_content_menu_opts[i] ==='视频截图'){
                        _a.addEventListener('click',function(event){
                            event.stopPropagation();
                            hideEle(_video_content_menu);
                            snapShot(_video);
                        });
                    }
                    _li.appendChild(_a);
                    _video_content_menu.appendChild(_li);
                }
                per_container.appendChild(_video_content_menu);
            }
        });
        per_container.addEventListener('contextmenu',function(event){
            event.preventDefault();//屏蔽右键菜单
            event.stopPropagation();
        });
        if(title){
            var _h3 = document.createElement('h3');
            _h3.className = 'per-video-title';
            var _h3_txt = document.createTextNode(title);
            _h3.appendChild(_h3_txt);
            per_container.appendChild(_h3);
        }
        _video_container.appendChild(per_container);
        return _video_container;
    }
    function hideEle(ele){
        ele.style.display = 'none';
    }
    function isHasStream(_per_vd){
        for(var i =0 ;i<_localStreams.length;i++){
            if(_localStreams[i].perId == _per_vd.id){
                return true;
            }
        }
        return false;
    }
    function snapShot(_per_video){
        var _original_mask_class = 'video-dialog-mask';
        if(!isHasStream(_per_video)){
            Tools.Alert("没有视频正在播放，无法进行截图！");
            return;
        }
        if(_dialog_mask){
            //如果已经创建了这个弹出层遮罩的话那么进行下面的代码
            _context.drawImage(_per_video,0,0);
            _dialog_img.src = _canvas.toDataURL('image/png');
            _dialog_mask.classList.remove('video-dialog-mask-fadeOut')
            _dialog_mask.classList.add('video-dialog-mask-fadeIn');
            return;
        }
        //先创建一个canvas来进行截取video中的图像
        _canvas = document.createElement('canvas');
        _canvas.width = _per_video.videoWidth;
        _canvas.height = _per_video.videoHeight;
        _canvas.style.display = 'none';
        _context = _canvas.getContext('2d');
        _dialog_mask = document.createElement('div');
        _dialog_mask.className = _original_mask_class;
        _dialog_mask.appendChild(_canvas);
        _dialog_content = document.createElement('div');
        _dialog_content.className = 'video-dialog-content';
        _dialog_mask.appendChild(_dialog_content);
        _dialog_img = document.createElement('img');
        _dialog_content.appendChild(_dialog_img);
        _download_btn = document.createElement('button');
        _download_btn.innerHTML = '下载截图';
        _download_btn.className = 'btn btn-download';
        _dialog_content.appendChild(_download_btn);
        _context.drawImage(_per_video,0,0);
        _dialog_img.src = _canvas.toDataURL('image/png');
        //给下载按钮绑定单击事件
        _download_btn.addEventListener('click',function(event){
            var _img = _canvas.toDataURL('image/png');
            var _canvas_window = window.open('','');
            var _output_img = document.createElement('img');
            _output_img.src = _img;
            _canvas_window.document.body.appendChild(_output_img);
        });
        _dialog_mask.addEventListener('click',function(event){
            _dialog_mask.classList.remove('video-dialog-mask-fadeIn')
            _dialog_mask.classList.add('video-dialog-mask-fadeOut');

        });
        _dialog_mask.appendChild(_dialog_content);
        _dialog_mask.classList.add('video-dialog-mask-fadeIn');
        document.body.appendChild(_dialog_mask);
    }
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL ||window.mozURL ||window.msURL;
    function requestMicCamera(_vd){
        navigator.getUserMedia({video:true,audio:false},function(stream){
            _vd.src = window.URL.createObjectURL(stream);
            _vd.play();
            //保存到本地localStream
            var _stream = stream;
            _stream.perId = _vd.id;
            _stream.islocalstream = _vd.islocalstream;
            _localStreams.push(_stream);
        },function(err){
            try{
                Tools.Alert(err);
            }catch(error){
                console.log(err);
            }
        });
    }
    function initIceServers(){
         //首先初始化iceServers
          _iceServers.push({'url':'stun:stun.services.mozilla.com'});
          _iceServers.push({
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'});
          _iceServers.push({
            url: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'});
    }
    function connect(){
         
    }
    function DebugLocalRemoteFn(){
        //在调试栏中创建远程对方的视频
        _currentRemoteVideo = createVideo('debug-info',false,'远程视频','600px','450px');
        //创建建立连接按钮 和 挂断按钮
        var _start_connect_btn = document.createElement('button');
        _start_connect_btn.innerHTML = '建立连接';
        //添加ICE 服务器 像stun 这种服务器
        initIceServers();
        _start_connect_btn.addEventListener('click',function(){
            Tools.Alert('正在建立连接请稍后.....');
        });
        var _hang_up_btn = document.createElement('button');
        _hang_up_btn.innerHTML = '挂断';
        _debug_info.appendChild(_start_connect_btn);
        _debug_info.appendChild(_hang_up_btn);
        var _p = document.createElement('p');
        var _textarea = document.createElement('textarea');
        _textarea.rows = '5';
        _textarea.cols = '100';
        _p.innerHTML = '要发送的SDP信息';
        _debug_info.appendChild(_p);
        _textarea.id = 'text-for-send-sdp';
        _textarea.disabled = 'disabled';
        _debug_info.appendChild(_textarea);
        var _p = document.createElement('p');
        var _textarea = document.createElement('textarea');
        _textarea.rows = '5';
        _textarea.cols = '100';
        _p.innerHTML = '要接收的SDP信息';
        _debug_info.appendChild(_p);
        _textarea.id = 'text-for-recieve-sdp';

        _debug_info.appendChild(_textarea);
        var _button = document.createElement('button');
        _button.innerHTML = '接收SDP信息';
        _button.id = 'btn-recieve-sdp'
        _debug_info.appendChild(_button);
        var _p = document.createElement('p');
        var _textarea = document.createElement('textarea');
        _textarea.rows = '5';
        _textarea.cols = '100';
        _p.innerHTML = '要发送的ICE候选者信息';
        _debug_info.appendChild(_p);
        _textarea.id = 'text-for-send-ice';
        _textarea.disabled = 'disabled';
        _debug_info.appendChild(_textarea);
        var _p = document.createElement('p');
        var _textarea = document.createElement('textarea');
        _textarea.rows = '5';
        _textarea.cols = '100';
        _p.innerHTML = '要接收的ICE候选者信息';
        _debug_info.appendChild(_p);
        _textarea.id = 'text-for-recieve-ice';
        _debug_info.appendChild(_textarea);
        var _button = document.createElement('button');
        _button.innerHTML = '接收ICE候选者';
        _button.id = 'btn-recieve-ice'
        _debug_info.appendChild(_button);


    }
    function init(){
        //创建本地
        _localVideo = createVideo("video-container",true,'我的视频','800px','600px');
        //开启调试模式
        DebugLocalRemoteFn();
        for(var i =0;i<_videos.length;i++){
            if(_videos[i].islocalstream){
                requestMicCamera(_videos[i]);
            }
        }
    }
    return {
        init:function(){
            init();
        }
    }
}());

//当页面文档和deffer属性的script加载完毕后就可以执行webrtc这个方案 而不必等待页面asyn script和图片加载
whenReady(function(){
        webRtc.init();
});