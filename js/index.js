(function () {
    var wrap=document.getElementById("wrap");
    swiper({
        el:wrap,
        dir:"x"
    })

    function swiper(init){
        var el = init.el;
        var dir = init.dir?init.dir:"y";
        var scroll = el.children[0];
        var startPoint = {};
        var startEl = {};
        scroll.style.minWidth = "100%";
        scroll.style.minHeight = "100%";
        var transformDir = {
            x: "translateX",
            y: "translateY"
        };
        var isMove = {
            x: false,
            y: false
        };
        var isFirst = false;

        var lastPoint = {}; //上一次手指位置
        var lastTime = 0; //上一次的时间戳
        var	diffPoint = {}; //两次手指之间的距离差
        var diffTime = 0;// 时间差值

        var minTranslate = {};

        css(scroll,"translateX",0);
        css(scroll,"translateY",0);
        css(scroll,"translateZ",0);
        el.addEventListener('touchstart', function(e) {
            init.start&&init.start.call(el);
            var touch = e.changedTouches[0];
            startPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            startEl = {
                x: css(scroll,"translateX"),
                y: css(scroll,"translateY")
            };

            lastPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            lastTime = Date.now();
            diffPoint = {
                x: 0,
                y:0
            };
            diffTime = 0;

            minTranslate = {
                x: el.clientWidth - scroll.offsetWidth,
                y: el.clientHeight - scroll.offsetHeight
            };
        });
        el.addEventListener('touchmove', function(e) {
            var touch = e.changedTouches[0];
            var nowPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            var dis = {
                x: nowPoint.x - startPoint.x,
                y: nowPoint.y - startPoint.y
            };
            getDir(dis);
            var target = startEl[dir] + dis[dir];
            if(target > 0){
                /*F = (1 - Math.abs(target/el.clientHeight));
                target *= F;*/
                target=0;

            } else if(target < minTranslate[dir]){
                /*var over = (target - minTranslate[dir]);
                F = (1 - Math.abs(over/el.clientHeight));
                target = minTranslate[dir] + over*F;*/
                target=minTranslate[dir]
            }
            isMove[dir]&&(css(scroll,transformDir[dir],target));


            var nowTime = Date.now();
            diffTime = nowTime - lastTime;
            diffPoint = {
                x: nowPoint.x - lastPoint.x,
                y: nowPoint.y - lastPoint.y
            };
            lastPoint.x = nowPoint.x;
            lastPoint.y = nowPoint.y;
            lastTime = nowTime;
            init.move&&init.move.call(el);
        });
        el.addEventListener('touchend', function(e) {
            isMove = {
                x: false,
                y: false
            };
            isFirst = false;

            var speed = diffPoint[dir] / diffTime;
            speed = diffTime?speed:0;
            if(Date.now() - lastTime > 100){
                speed = 0;
            }
            var target = speed*120;
            target += css(scroll,transformDir[dir]);

            var type = "easeOutStrong";
            if(target > 0){
                target = 0;
                //type = "backOut";
            } else if(target < minTranslate[dir]){
                target = minTranslate[dir];
                //type = "backOut";
            }

            var time = parseInt(Math.abs(target - css(scroll,transformDir[dir]))*.12);
            var target = dir == "x"?{translateX:target}:{translateY:target};
            mTween({
                el: scroll,
                target: target,
                time: time,
                type: type,
                callIn: function(){
                    init.move&&init.move.call(el);
                },
                callBack: function(){
                    init.over&&init.over.call(el);
                }
            });
            init.end&&init.end.call(el);
        });

        //获取用户的滑屏方向
        function getDir(dis){
            if(!isFirst){
                if(Math.abs(dis['y']) - Math.abs(dis['x']) > 2){
                    isMove.y = true;
                    isFirst = true;
                } else if (Math.abs(dis['x']) - Math.abs(dis['y']) > 2){
                    isMove.x = true;
                    isFirst = true;
                }
            }
        }
    }
})();


//幻灯片
(function () {
    var wrap=document.getElementById("slideWrap");
    var list=document.getElementById("slide");
    var lis=list.getElementsByTagName("li");
    var num=document.getElementById("num");
    var spanL=num.getElementsByTagName("span")[0]
    var spanR=num.getElementsByTagName("span")[1]
    var arr=[
        "img/A0.jpg",
        "img/A1.jpg",
        "img/A2.jpg",
        "img/A3.jpg",
        "img/A4.jpg"
    ]
    var timer=0;
    var now = 0; //当前第几个
    var nowNum=0;
    var imgW = wrap.clientWidth;
    list.style.width=imgW*arr.length*2+"px";

    var str=""
    for(var i=0;i<arr.length;i++){
        str+=`<li>
                    <a href="javascript:;">
                        <img src=${arr[i]} alt="">
                    </a>
               </li>`
    }
    str+=str;
    list.innerHTML=str;
    spanL.innerHTML=nowNum+1;
    spanR.innerHTML=arr.length;
    swiper({
        el:wrap,
        dir:"x",
        start: function(e){
            clearInterval(timer);
            cancelAnimationFrame(list.timer)
            list.style.transition = "none";
            if(now==0){
                transform(list,"translateX",-lis.length*imgW/2);
            }else if(now==1-lis.length){
                transform(list,"translateX",-(lis.length/2-1)*imgW);
            }
        },
        move: function(e){
//                console.log("手指移动");
        },
        end: function(){
            var nowX = transform(list,"translateX");
            now = Math.round(nowX/imgW);
            nowX = now*imgW;
            list.style.transition = ".5s";
            transform(list,"translateX",nowX);
            nowNum=Math.abs(now%(lis.length/2));
            spanL.innerHTML=nowNum+1;
            setTimeout(function () {
                list.style.transition = "none";
               move()
            },600)
        }
    })
    move()
    function move() {
        timer=setTimeout(function () {
            if(now==1-lis.length){
                transform(list,"translateX",imgW*(1-lis.length/2));
                now=1-lis.length/2
            }
            now--;
            mTween({
                el: list,
                target: {
                    "translateX":imgW*now
                },
                time: 100,
                type: "linear",
                callIn: function(){
                    // console.log("开始")
                },
                callBack: function(){
                    move();
                    spanL.innerHTML=Math.abs(now%(lis.length/2))+1
                }
            })
        },400)

    }



    function swiper(init){
        var el = init.el;
        var dir = init.dir?init.dir:"y";
        var scroll = el.children[0];
        var startPoint = {};
        var startEl = {};
        scroll.style.minWidth = "100%";
        scroll.style.minHeight = "100%";
        var transformDir = {
            x: "translateX",
            y: "translateY"
        };
        var isMove = {
            x: false,
            y: false
        };
        var isFirst = false;

        var lastPoint = {}; //上一次手指位置
        var	diffPoint = {}; //两次手指之间的距离差


        css(scroll,"translateX",0);
        css(scroll,"translateY",0);
        css(scroll,"translateZ",0);
        el.addEventListener('touchstart', function(e) {
            init.start&&init.start.call(el);
            var touch = e.changedTouches[0];
            startPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            startEl = {
                x: css(scroll,"translateX"),
                y: css(scroll,"translateY")
            };

            lastPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
        });
        el.addEventListener('touchmove', function(e) {
            var touch = e.changedTouches[0];
            var nowPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            var dis = {
                x: nowPoint.x - startPoint.x,
                y: nowPoint.y - startPoint.y
            };
            getDir(dis);
            var target = startEl[dir] + dis[dir];

            isMove[dir]&&(css(scroll,transformDir[dir],target));

        });
        el.addEventListener('touchend', function(e) {
            isMove = {
                x: false,
                y: false
            };
            isFirst = false;
            init.end&&init.end.call(el);
        });

        //获取用户的滑屏方向
        function getDir(dis){
            if(!isFirst){
                if(Math.abs(dis['y']) - Math.abs(dis['x']) > 2){
                    isMove.y = true;
                    isFirst = true;
                } else if (Math.abs(dis['x']) - Math.abs(dis['y']) > 2){
                    isMove.x = true;
                    isFirst = true;
                }
            }
        }
    }
})();

/*页面上下滚动*/
(function () {
    var wrap = document.getElementById("page")
    var scroll = document.getElementById("scroll");
    var list = document.getElementById("items");
    var footer = document.querySelector('footer');
    var str="";
    var now = 0;//当前第几次添加数据
    var length = 15;//每次向ul中添加多少数据

    createLi();
    swiperBar({
        el: wrap,
        move: function(){
            var min = wrap.clientHeight - scroll.offsetHeight;
            var y = css(scroll,"translateY");
            if(min - y > 50){
                footer.innerHTML = "松开立即刷新消息";
            } else if(min > y){
                footer.innerHTML = "上滑刷新更多消息";
            }
        },
        end: function(){
            var min = wrap.clientHeight - scroll.offsetHeight;
            var y = css(scroll,"translateY");
            if(min - y > 50){
                cancelAnimationFrame(scroll.timer);
                footer.innerHTML = "正在加载更多消息"
                mTween({
                    el:scroll,
                    target: {
                        translateY: min-40
                    },
                    type: "easeOut",
                    time: 15,
                    callBack: function(){
                        //通过ajax 去请求数据
                        var bar = wrap.getElementsByClassName("bar")[0];
                        bar.style.opacity = 0;
                        setTimeout(function(){
                            createLi();
                        },1000);
                    }
                });
            }
        }
    });
    function createLi(){
        var start = now * length;
        var end = start + length;
        if(start >= data.length){
            footer.innerHTML = "没有更多数据了";
            var min = wrap.clientHeight - scroll.offsetHeight;
            setTimeout(function(){
                mTween({
                    el:scroll,
                    target: {
                        translateY: min
                    },
                    type: "easeOut",
                    time: 15
                });
            },1000);
            return;
        }
        end = end > data.length?data.length:end;
        for(var i=start;i<end;i++){
            str+=`
            <li>
                <a href=${data[i].link}>
                    <span class="category">${data[i].category}</span>
                    <span class="title"><strong>${i+1}</strong>${data[i].title}</span>
                    <span class="tcount">${number(data[i].tcount)}</span>
                </a>
            </li>        
        `
        }
        list.innerHTML=str;
        now++;
    }
    function number(num) {
        if(num>9999){
            num=Math.floor(num/1000)/10+"万";
        }
        return num;
    }

    function swiperBar(init){
        var dir = init.dir?init.dir:"y";
        var el = init.el;
        var scroll = el.children[0];
        var bar = document.createElement("div");
        var scale = 1;
        var transformDir = {
            x: "translateX",
            y: "translateY"
        };
        bar.className = "bar";
        bar.style.cssText = "position:absolute;background:rgba(0,0,0,0.5);border-radius:3px;opacity:0;transition: .3s opacity;";
        if(dir == "x"){
            bar.style.left = 0;
            bar.style.bottom = 0;
            bar.style.height = "6px";
        } else {
            bar.style.right = 0;
            bar.style.top = 0;
            bar.style.width = "6px";
        }
        getScale();
        css(bar,transformDir[dir],0);
        el.appendChild(bar);
        swiper({
            el: el,
            dir: dir,
            start: function(){
                getScale();
                bar.style.opacity = 1;
                init.start&&init.start.call(el);
            },
            move: function(){
                var dis = -css(scroll,transformDir[dir]);
                css(bar,transformDir[dir],dis*scale);
                init.move&&init.move.call(el);
            },
            end: function(){
                init.end&&init.end.call(el);
            },
            over: function(){
                bar.style.opacity = 0;
                init.over&&init.over.call(el);
            }
        });

        function getScale(){
            if(dir == "x"){
                scale = el.clientWidth/scroll.offsetWidth;
                bar.style.width = el.clientWidth * scale + "px";
            } else {
                scale = el.clientHeight/scroll.offsetHeight;
                bar.style.height = el.clientHeight * scale + "px";
            }
        }
    }

    function swiper(init){
        var el = init.el;
        var dir = init.dir?init.dir:"y";
        var scroll = el.children[0];
        var startPoint = {};
        var startEl = {};
        scroll.style.minWidth = "100%";
        scroll.style.minHeight = "100%";
        var transformDir = {
            x: "translateX",
            y: "translateY"
        };
        var isMove = {
            x: false,
            y: false
        };
        var isFirst = false;

        var lastPoint = {}; //上一次手指位置
        var lastTime = 0; //上一次的时间戳
        var	diffPoint = {}; //两次手指之间的距离差
        var diffTime = 0;// 时间差值

        var minTranslate = {};

        css(scroll,"translateX",0);
        css(scroll,"translateY",0);
        css(scroll,"translateZ",0);
        el.addEventListener('touchstart', function(e) {
            init.start&&init.start.call(el);
            var touch = e.changedTouches[0];
            startPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            startEl = {
                x: css(scroll,"translateX"),
                y: css(scroll,"translateY")
            };

            lastPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            lastTime = Date.now();
            diffPoint = {
                x: 0,
                y:0
            };
            diffTime = 0;

            minTranslate = {
                x: el.clientWidth - scroll.offsetWidth,
                y: el.clientHeight - scroll.offsetHeight
            };
        });
        el.addEventListener('touchmove', function(e) {
            var touch = e.changedTouches[0];
            var nowPoint = {
                x: touch.pageX,
                y: touch.pageY
            };
            var dis = {
                x: nowPoint.x - startPoint.x,
                y: nowPoint.y - startPoint.y
            };
            getDir(dis);
            var target = startEl[dir] + dis[dir];
            if(target > 0){
                F = (1 - Math.abs(target/el.clientHeight));
                target *= F;

            } else if(target < minTranslate[dir]){
                var over = (target - minTranslate[dir]);
                F = (1 - Math.abs(over/el.clientHeight));
                target = minTranslate[dir] + over*F;
            }
            isMove[dir]&&(css(scroll,transformDir[dir],target));


            var nowTime = Date.now();
            diffTime = nowTime - lastTime;
            diffPoint = {
                x: nowPoint.x - lastPoint.x,
                y: nowPoint.y - lastPoint.y
            };
            lastPoint.x = nowPoint.x;
            lastPoint.y = nowPoint.y;
            lastTime = nowTime;
            init.move&&init.move.call(el);
        });
        el.addEventListener('touchend', function(e) {
            isMove = {
                x: false,
                y: false
            };
            isFirst = false;

            var speed = diffPoint[dir] / diffTime;
            speed = diffTime?speed:0;
            if(Date.now() - lastTime > 100){
                speed = 0;
            }
            var target = speed*120;
            target += css(scroll,transformDir[dir]);

            var type = "easeOutStrong";
            if(target > 0){
                target = 0;
                //type = "backOut";
            } else if(target < minTranslate[dir]){
                target = minTranslate[dir];
                //type = "backOut";
            }

            var time = parseInt(Math.abs(target - css(scroll,transformDir[dir]))*.12);
            var target = dir == "x"?{translateX:target}:{translateY:target};
            mTween({
                el: scroll,
                target: target,
                time: time,
                type: type,
                callIn: function(){
                    init.move&&init.move.call(el);
                },
                callBack: function(){
                    init.over&&init.over.call(el);
                }
            });
            init.end&&init.end.call(el);
        });

        //获取用户的滑屏方向
        function getDir(dis){
            if(!isFirst){
                if(Math.abs(dis['y']) - Math.abs(dis['x']) > 2){
                    isMove.y = true;
                    isFirst = true;
                } else if (Math.abs(dis['x']) - Math.abs(dis['y']) > 2){
                    isMove.x = true;
                    isFirst = true;
                }
            }
        }
    }

})();


(function () {
    var arrow=document.getElementById("arrow");
    var rotate=false;
    arrow.style.transition=".3s"
    tap(arrow,function () {
        if(rotate){
            this.style.transform="rotateX(0deg)"
        }else{
            this.style.transform="rotateX(180deg)"
        }
        rotate=!rotate;
    })

    function tap(el,fn) {
        var isTap=true;
        el.addEventListener("touchmove",function () {
            isTap=false;
        })
        el.addEventListener('touchend', function(e) {
            if(isTap){
                fn&&fn.call(el,e);
            }
            isTap = true;
        });
    }
})()