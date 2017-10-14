;
(function($, undefined)
{
	var time = null;
    // 缩放指数
    var zoom = 0;
    var wdt = 0;
    var timeline = function(ele, opt)
    {
        var me = this;
        this.winId = 0;
        this.$element = ele, this.defaults = {
            // 最小缩放指数
            minZoom: 0,
            // 最大缩放指数
            maxZoom: 60,
            // 源数据
            data: [{"rec":{}},{"rec":{}},{"rec":{}},{"rec":[{"starttime":"2017/10/13 00:00:00","endtime":"2017/10/13 22:59:00"}]},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}},{"rec":{}}],// 初始数据
            // 高亮部分点击事件
            HLclick: function(time, win, data)
            {
            },
            // 窗口点击事件
            winClick: function(index, hasData)
            {
                // alert(hasData);
            }
        }, this.options = $.extend({}, this.defaults, opt);
        this.init();
    };
    timeline.prototype = {
        // 初始化
        init: function()
        {
            var me = this;
            // 重载时缩放清零
            zoom = 0;
            wdt = (this.$element.width() - 150) / 250;// 80为窗口号窗口的宽度
            var line = '';
            for (var i = 1; i < 250; i++)
            {
                if (i % 10 == 0)
                {
                    line +=
                        '<li class="time-s time-m" style="width:' + wdt
                            + 'px"></li>';
                }
                else if (i % 5 == 0)
                {
                    line +=
                        '<li class="time-s time-l" style="width:' + wdt
                            + 'px"><p>' + Math.floor(i / 10) + '</p></li>';
                }
                else
                {
                    line +=
                        '<li class="time-s" style="width:' + wdt + 'px"></li>';
                }
            }
            var data = this.options.data;
            // 窗口html
            var winbox = this.showWin(data);
            var html =
                '<div id="timeline"><div class="axis"><ul>' + line
                    + '</ul><div id="winbox">' + winbox.winHtml
                    + '</div><div id="videos">' + winbox.vidHtml
                    + '</div><div id="cur-time"></div></div></div>';
            this.$element.html(html);
            this.bindEvent();
        },
        // 绑定事件
        bindEvent: function()
        {
            var me = this;
            var initLeft = $('#videos').offset().left;
            var initTop = $('#videos').offset().top;
            // 插件初始位置
            var curPos = $('#timeline').offset();
            // 时间轴缩放事件
            me.$element.off('mousewheel').on('mousewheel',
            function(event, delta)
            {
                //zoom += delta;
                me.resize(event,delta);
            });
            // 显示时间事件
            $('#videos').off('mousemove').on('mousemove', function(e)
            {
                e = e || window.event;
                var left = initLeft + (wdt * 4.5 + zoom * 4);// 00:00:00的水平位置
                var pageX = e.pageX || e.clientX + document.body.scrollLeft;
                var pageY = e.pageY || e.clientY + document.body.scrollTop;
                var scrollLeft = me.$element.scrollLeft();// 滚动条水平位置
                var scrollTop = me.$element.scrollTop();// 滚动条水平位置
                var s =
                    Math
                        .floor((pageX + scrollLeft - left) / (wdt + zoom) * 360);
                if (s < 0 || s > 86400)
                {
                    $('#cur-time').hide();
                    return false;
                }
                var time = me.parseTime(s);
                $('#cur-time').text(time).css({
                    "left": pageX - curPos.left + 15 + scrollLeft,
                    "top": pageY - curPos.top + scrollTop - 10
                }).show();
                e.stopPropagation();
                e.preventDefault();
            })
            $('#videos').off('mouseout').on('mouseout', function()
            {
                $('#cur-time').hide();
            })
            // 高亮部分点击事件
            $('#videos').off('click').on('click', '.video-part', function()
            {
                var $me = $(this)
                var winId = $(this).attr('win');
                time = setTimeout(function(){
                    me.HLclick($('#cur-time').text(), Number(winId),me.options.data[winId]);
                },300)
                $('.win').eq(winId).click();
                me.winId = winId;
            })
            $('#videos').off('dblclick').on('dblclick', '.video-part', function()
            {
                var $me = $(this);
                var winId = $(this).attr('win');
                clearTimeout(time);
                me.HLdbclick($('#cur-time').text(), Number(winId),me.options.data[winId]);
                $('.win').eq(winId).click();
                me.winId = winId;
            })
            // 窗口点击事件
            $('#winbox').off('click').on('click', '.win', function()
            {
                var index = $(this).index();
                var hasData = Boolean(me.options.data[index].rec.length);
                me.options.winClick(index, hasData);
                $(this).addClass('cur-win').siblings().removeClass('cur-win');
                me.winId = index;
            })
        },
        // 窗口dom
        showWin: function(data)
        {
            var me = this;
            var winHtml = '<ul>';
            var vidHtml = '<ul>';
            for (var i = 0; i < data.length; i++)
            {
                winHtml += '<li class="win">窗口' + (i + 1) + '</li>';
                vidHtml += '<li class="video"><div class="curPoint"></div>'
                for (var j = 0; j < data[i].rec.length; j++)
                {
                    var startSec = me.parseSecond(data[i].rec[j].starttime);
                    var endSec = me.parseSecond(data[i].rec[j].endtime);
                    var posLeft = me.parsePos(startSec);
                    var posWdt = me.parsePos(endSec) - posLeft;
                    var pos = me.parsePos(startSec, endSec);
                    vidHtml +=
                        '<dl win="' + i + '" class="video-part" style="left:'
                            + posLeft + 'px; width:' + posWdt + 'px;"></dl>';
                }
                vidHtml += '</li>';
            }
            vidHtml += '</ul>';
            winHtml += '</ul>';
            return {
                "winHtml": winHtml,
                "vidHtml": vidHtml
            };
        },
        // 时间转换秒
        parseSecond: function(time)
        {
            var arrTime = time.slice(-8).split(':');
            var second =
                Number(arrTime[0]) * 3600 + Number(arrTime[1] * 60)
                    + Number(arrTime[2]);
            return second;
        },
        // 时间（s）转换成时间轴的位置
        parsePos: function(sec)
        {
            var left = (wdt * 4.5 + zoom * 4);// 00:00:00的水平位置
            return sec / 360 * (wdt + zoom) + left;
        },
        // 时间（s）转换成时间（ h:m:s）
        parseTime: function(s)
        {
            var t = "";
            if (s > -1)
            {
                hour = Math.floor(s / 3600);
                min = Math.floor(s / 60) % 60;
                sec = s % 60;
                if(hour < 10){
                    t += "0";
                }
                t += hour + ":";
                if (min < 10)
                {
                    t += "0";
                }
                t += min + ":";
                if (sec < 10)
                {
                    t += "0";
                }
                t += sec;
            }
            return t;
        },
        // 缩放
        resize: function(e,delta)
        {
            zoom += delta;
            if (zoom < this.options.minZoom)
            {
                zoom = this.options.minZoom;
                if(zoom == delta){
                    return false;
                }else{
                    $('.time-s').css({
                        "margin-right": zoom
                    });
                    $('#videos').html(this.showWin(this.options.data).vidHtml);
                    $('.video').width(wdt * 250 + 248 * zoom);
                }
            }
            else if (zoom > this.options.maxZoom)
            {
                zoom = this.options.maxZoom;
                return false;
            }
            else
            {
                $('.time-s').css({
                    "margin-right": zoom
                });
                $('#videos').html(this.showWin(this.options.data).vidHtml);
                $('.video').width(wdt * 250 + 248 * zoom);
            }
            if(e){
                e.stopPropagation();
                e.preventDefault();
            }
        },
        // 重载数据
        reload: function(opt)
        {
            this.options = $.extend({}, this.options, opt);
            this.init();
            zoom = 0;
        },
        // 追加窗口
        addData: function(opt)
        {
            this.options.data.push(opt);
            this.init();
            zoom = 0;
        },
        // 重载窗口数据
        changeData: function(opt,event){
            var me = this;
            var winId = Number(this.winId);
            this.options.data[winId] = opt;
            zoom = 0;
            
            var vidHtml = '';
            vidHtml += '<div class="curPoint"></div>';
            for (var j = 0; j < opt.rec.length; j++)
            {
                var startSec = me.parseSecond(opt.rec[j].starttime);
                var endSec = me.parseSecond(opt.rec[j].endtime);
                var posLeft = me.parsePos(startSec);
                var posWdt = me.parsePos(endSec) - posLeft;
                var pos = me.parsePos(startSec, endSec);
                vidHtml +=
                    '<dl win="' + winId + '" class="video-part" style="left:'
                        + posLeft + 'px; width:' + posWdt + 'px;"></dl>';
            }
            $('.video').eq(winId).html(vidHtml);
            var winHtml = '窗口'+(winId+1)+' ( '+opt.rec[0].endtime.slice(5,10)+' )'+' '+opt.devname;
            $('.win').eq(winId).text(winHtml).attr('title',opt.devname).data('recData',opt);
            
            this.resize(null,0);
            this.winId++;
        },
        // 设置光标位置
        setCursor: function(opt)
        {
            //var pos = this.parsePos(this.parseSecond(opt.time));
            var pos = this.parsePos(this.parseSecond(opt.time));
            $('.video').eq(opt.curWin).children('.curPoint').css('left', pos)
                .show();
        },
        // 设置高亮
        setHighlight: function(curWin, startTime, endTime)
        {
        },
        // 高亮部分点击事件
        HLclick: function(time, win, data)
        {
            this.options.HLclick(time, win, data);
            this.setCursor({
                "time": time,
                "curWin": win
            });
        },
        HLdbclick: function(time, win, data)
        {
            this.options.HLdbclick(time, win, data);
            this.setCursor({
                "time": time,
                "curWin": win
            });
        }
    };
    $.fn.timeline = function(opt, arg)
    {
        // 一个页面暂只支持一个timeline对象
        return this.each(function()
        {
            var $element = $(this);
            // 判断是否己初化timeline对象
            var timelineObj = $element.data("timeline");
            if (!timelineObj)
            {
                timelineObj = new timeline($element, opt);
                $element.data("timeline", timelineObj);
            }
            if (typeof opt === "string")
            {
                timelineObj[opt](arg)
            }
        })
    }
})(jQuery)