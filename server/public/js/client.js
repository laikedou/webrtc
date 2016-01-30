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
      var _socket = io();
      var _username = '';
      var _userid = '';
      var _onlineuserlist = [];
      var _onlineusercount = 0;
      
     function init(){
         console.log('初始化.....');
         _username = 'test';

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