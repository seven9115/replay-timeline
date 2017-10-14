Ext.ns("GOSUN.REPLAYMOD");
GOSUN.REPLAYMOD.Controler = function(config){
    config = config || {};
    Ext.apply(this, config);
    this.init();
    this.hasInitAct = false;
}
Ext.extend(GOSUN.REPLAYMOD.Controler, Ext.util.Observable, {
    init:function(){
        this.oActiveX = document.getElementById("replay_activeX") || null;
        document.getElementById("replay_activeX").style.width =
            Utils.screen.width - 50;
        document.getElementById("replay_activeX").style.height =
            Utils.screen.height - 240;
        this.platId = '';
        this.initOCX();
        if (this.hasInitAct) this.getPlatLogin();
    },
    /**
     * 初始化控件
     */
    initOCX: function()
    {
        try
        {
            this.oActiveX.InitCtrl();
            this.hasInitAct = true;
            // Utils.oActiveXCtl.ulLayout = 2;
        }
        catch(e)
        {
            this.hasInitAct = false;
            Ext.MessageBox.show({
                title: "系统提示",
                msg: "检测到本机未安装播放插件，请在登录页点击插件下载，并安装后登录系统。",
                fn: function()
                {
                    location.href = "/index.php";
                },
                buttons: Ext.MessageBox.OK
            });
            return;
        }
    },
    /**
     * 查询平台信息并登录
     */
    getPlatLogin:function(){
        Ext.Ajax.request({
            url: "/Interface/SysManage/AppManage.php",
            params: {
                action: "doQueryPlatForm"
            },
            scope: this,
            callback: function(options, is_success, response)
            {
                if (true == is_success)
                {
                    var j = Utils.inspectResponse(response.responseText);
                    if (true == j.success)
                    {
                        for (var i = 0; i < j.restbody.length; i++)
                        {
                            if (j.restbody[i].status)
                            {
                                switch (parseInt(j.restbody[i].vendorType))
                                {
                                    case 1:
                                        // 表示大华平台
                                        this.oActiveX.GSPlgn_SetPltInfo(j.restbody[i].id,
                                            "dahua",
                                            j.restbody[i].accessIpAddress,
                                            j.restbody[i].accessPort,
                                            j.restbody[i].loginUser,
                                            j.restbody[i].loginPasswd, "");
                                        this.platId = j.restbody[i].id;
                                        break;
                                    case 0:
                                        // 表示海康平台
                                        this.oActiveX.GSPlgn_SetPltInfo(j.restbody[i].id,
                                            "hikvision",
                                            j.restbody[i].accessIpAddress,
                                            j.restbody[i].accessPort,
                                            j.restbody[i].loginUser,
                                            j.restbody[i].loginPasswd, "");
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        // this.setActInitInfo();
                    }
                    else
                    {
                        Utils.showErrorTip(j, function()
                        {
                            location.href = "/Pages/index.php";;
                        });
                    }
                }
                else
                {
                    Utils.inspectRequest(options, is_success, response);
                }
            }
        });
    },
    /**
     * 查询录像
     */
    queryrec:function(devName,devId,startTime,endTime,devCode){
        this.oActiveX.GSRec_Query(devName, devId, devCode, this.platId, startTime, endTime, 0, 1);
    },
    /**
     * 播放录像
     */
    recPlay:function(winId,devName,devId,devCode,startTime,endTime){
        this.oActiveX.GSRec_Play(winId, devName, devId, devCode, this.platId, 1,startTime, endTime);
    },
    /**
     * 拖动录像进度
     */
    seek:function(winId,seekTime){
        this.oActiveX.GSRec_Seek(winId,seekTime);
    },
    /**
     * 录像窗口选择
     */
    selectWin:function(winId,hasRec){
        this.oActiveX.GSPlgn_SelectRecWin(winId, hasRec);
    },
    /**
     * 下载录像
     */
    downRec:function(devCode,startTime,endTime){
        return this.oActiveX.GSRec_DownLoad("1", devCode, this.platId, startTime, endTime, 1);
    },
    /**
     * 暂停录像下载
     */
    pauseRec:function(nSsn){
        return this.oActiveX.GSRec_DownPause(nSsn);
    },
    /**
     * 取消录像下载
     */
    stopRec:function(nSsn){
        return this.oActiveX.GSRec_DownStop(nSsn);
    }
})
/**
 * 录像回放进度通知
 */
function replay_activeX::OnRecProgressNty(winId, nSecPro)
{
     $('#replay-source').timeline('setCursor',{'time':nSecPro.slice(-8),'curWin':winId-1});
}
/**
 * 录像查询结果通知
 */
function replay_activeX::OnRecListNty(nSsId, strRecLst)
{
    var replayData = JSON.parse(strRecLst);
    // alert(strRecLst)
    if(replayData.status == 'finish'&&replayData.num!=0){
        $('#replay-source').timeline('changeData',replayData);
    }
}
/**
 * 平台登陆通知
 */
function replay_activeX::OnPltLoginStaus(nPltId, nStatus)
{
      var strInfo =  "OnPltLoginStaus" + nPltId;
        strInfo += nStatus;
        // alert(strInfo);
}
/**
 * 返回当前选中的窗口 正在播放的视频的设备编号
 */
function replay_activeX::OnSelectedVideo(strDevId, strDevCode)
{
    var strInfo =  "OnSelectedVideo" + strDevId + "" + strDevCode;
    // alert(strInfo);
}
/**
 * 下载进度通知
 */
function replay_activeX::OnDownloadProgressNty(nssn, nProPer)
{
    changeProgress(nssn, nProPer);
}
/**
 * 录像列表通知
 */
function replay_activeX::OnShowDownList()
{
    openDown();
}
/**
 * 窗口点击通知
 */
function replay_activeX::OnSelectedVideo(nWinNo,strDevId,strDevCode,ndevType){
    
}
/**
 * 图片录像路径通知 d003-bug edit by zhq
 */
function replay_activeX::OnPathNty(nPathType,strfilename){
    if(nPathType==0){
        Ext.Msg.alert("抓拍成功，抓拍图片保存在（ "
        + strfilename + "）");
        Utils.setLogInfo("成功抓拍图片，图片保存在（ "
        + strfilename + "）",
                            Gosun.Const.logServiceType.SERVICE_VOD,
                            Gosun.Const.OperateType.USER_START, "true", "");
    }else{
        Ext.Msg.alert("录像成功，录像保存在（ "
        + strfilename + "）")
        Utils.setLogInfo("成功录像，录像保存在（ "
        + strfilename + "）",
                            Gosun.Const.logServiceType.SERVICE_VOD,
                            Gosun.Const.OperateType.USER_START, "true", "");
    }
}
/**
 * 录像播放通知
 */
function replay_activeX::OnStartPlayPltRec(nWinNo){
	var recData = $('.cur-win').data('recData');
	var devCode = recData.devcode;
	var devName = recData.devname;
	var devId = recData.devid;
	var startTime = recData.rec[0].starttime;
	var endTime = recData.rec[recData.rec.length-1].endtime;
    Utils.replayOCX.recPlay(nWinNo,devName,devId,devCode,startTime,endTime);
}
var changeProgress = function(){}
var openDown = function(){}
Ext.onReady(function(){
    var panelTree = new Ext.Panel({
        items: [{
            hideBorders: true,
            border: false,
            width: 284,
            autoLoad: {
                url: "/Pages/Tree/rePlayTree.php",
                scripts: true
            }
        }]
    });
    var datepicker = new Ext.Panel({
        border:false,
        html: '<div id="datepicker"></div>'
    })
    var btnSearch = new Ext.Button({
        text:'搜索录像',
        style: 'margin:10px 0 0 60px',
        handler:function(){
            var nodes = Utils.oReplayTree.getCheckedNodes();
            if(nodes.length==0){
                Ext.Msg.alert('请先勾选你要搜索的设备');
                return;
            }
            for (var i = 0; i < nodes.length; i++)
            {
                if (nodes[i].code)
                {
                    var date = $('#datepicker').datetimepicker('getDate').format('y-m-d');
                    var startTime = '20'+date+' 00:00:00';
                    var endTime = '20'+date+' 23:59:59';
                    Utils.replayOCX.queryrec(nodes[i].name,nodes[i].id,startTime,endTime,nodes[i].code);
                }
            }
        }
    })
    var smDowning = new Ext.grid.CheckboxSelectionModel();
    var smDowned = new Ext.grid.CheckboxSelectionModel()
    var smDown = new Ext.grid.CheckboxSelectionModel();
    var dataDowning = [];
    var gridDowning = new Ext.grid.GridPanel({
        store:new Ext.data.SimpleStore({
            data:dataDowning,
            fields:["startTime","endTime","status","deviceName","recId","devCode","devId"]
        }),
        cm: new Ext.grid.ColumnModel([
        smDowning,
        new Ext.grid.RowNumberer(),
        {id:'startTime',header:'开始时间',dataIndex:'startTime',align:'center', width:168},
        {id:'endTime',header:'结束时间',dataIndex:'endTime',align:'center', width:168},
        {id:'status',header:'下载状态',dataIndex:'status',align:'center', width:166},
        {id:'deviceName',header:'设备名称',dataIndex:'deviceName',align:'center', width:166}
        ]),
        sm: smDowning,
        viewConfig:{
            forceFit:true// 每列自动充满Grid
        },
        width: 640,
        height: 340,
        tbar:[{
                text:'取消下载',
                pressed: true,
                handler:function(){
                    var downList = gridDowning.getSelectionModel().getSelections();
                    if(downList.length==0){
                        Ext.Msg.alert('请选择要取消的下载记录');
                        return false;
                    }
                    for(var i=0; i<downList.length; i++){
                        if(Utils.replayOCX.stopRec(downList[i].get('recId'))==0){
                            var index = gridDowning.store.indexOf(downList[i]);
                            dataDowning.splice(index,1);
                        };
                    }
                    gridDowning.store.loadData(dataDowning);
                }
        }]
    })
    
    
    var storeDowned = new Ext.data.JsonStore({
        url: '/Interface/Replay/rePlay.php?action=getDownlist',
        root: 'restbody',
        totalProperty: 'ulTotalRowNum',
        fields: ['startTime','endTime','downloadId','deviceName','downloadStatus']
    });
    storeDowned.load();
    var bbarplugins = new Ext.ux.grid.PageSizePlugin();
    var pagingBar = new Ext.PagingToolbar({
        pageSize: 10,
        store: storeDowned, // 改成对应的store
        plugins: bbarplugins, // 用这个组件分页，重写过了
        displayInfo: true
    });
    var gridDowned = new Ext.grid.GridPanel({
        store:storeDowned,
        viewConfig:{
            forceFit:true,// 每列自动充满Grid
            emptyText: '暂无己下载录像'
        },
        cm: new Ext.grid.ColumnModel([
            smDowned,
            new Ext.grid.RowNumberer(),
            {id:'startTime',header:'开始时间',dataIndex:'startTime',width:148,align:'center'},
            {id:'endTime',header:'结束时间',dataIndex:'endTime',width:148,align:'center'},
            {id:'status',header:'下载状态',dataIndex:'downloadStatus',renderer:function(){return '己下载'},width:146,align:'center'},
            {id:'deviceName',header:'设备名称',dataIndex:'deviceName',width:146,align:'center'}
        ]),
        sm: smDowned,
        width: 640,
        height: 290,
        bbar:pagingBar,
        tbar:[
            new Ext.Button({
                text:'删除',
                pressed: true,
                handler:function(){
                    var delList = [];
                    var downList = gridDowned.getSelectionModel().getSelections();
                    if(downList.length==0){
                        Ext.Msg.alert('请选择要删除的下载记录');
                        return false;
                    }
                    for(var i=0; i<downList.length; i++){
                        delList.push(downList[i].get('downloadId'))
                    }
                    Ext.Ajax.request({
                        url: '/Interface/Replay/rePlay.php?action=delDownlist',
                        params: {
                            "downloadIdList[]": delList
                        },
                        callback: function(options,success,response)
                            {
                                if (success)
                                {
                                    var j = Utils.inspectResponse(response.responseText);
                                    if (j.success)
                                    {
                                       storeDowned.reload();
                                       Ext.Msg.alert('删除成功');
                                    }
                                    else
                                    {
                                        Utils.showErrorTip(j, function()
                                        {
                                            //oThis.oPanelGrid.reload();
                                        });
                                    }
                                }
                                else
                                {
                                    Utils.inspectRequest(options, is_success, response);
                                }
                         }
                    });
                }
            })
        ]
    })
    
    var dataDown= [];
    var dataDownDef = [];
    var storeDown = new Ext.data.Store({
        proxy: new Ext.data.MemoryProxy(dataDown),  
        reader:new Ext.data.ArrayReader({  
                    fields : [    
                       {name : 'startTime',type : 'string'},
                       {name : 'endTime',type : 'string'},
                       {name : 'devCode',type : 'string'},
                       {name : 'devName',type : 'string'},
                       {name : 'devId',type : 'string'}
                    ]
               })
    });
    storeDown.loadData(dataDown)
    // 删除按钮
    /*
     * var btnDel = new Ext.grid.inGridLink({ header : "删除", align : 'center',
     * width : 50, onClick : function(e, t) { if("aabuttonDelete" == t.id){ var
     * row = t.name; var thisGrid = this.grid; debugger; var dom =
     * thisGrid.store.getAt(row); var listGroupID = dom.get('id');
     * thisGrid.store.remove(dom); dataDown.splice(row,1);
     * thisGrid.store.loadData(dataDown) } }, renderer : function(value,
     * metadata, record, rowIndex, colIndex) { if(rowIndex==0){ return ''; }
     * return '<span class="glyphicon glyphicon-remove" id="aabuttonDelete"
     * name="' + rowIndex + '" style="cursor:pointer;color:red"></span>' } });
     */
/*
 * var Plant = Ext.data.Record.create([ {name: 'startTime', type: 'string'},
 * {name: 'endTime', type: 'string'} ]);
 */
    var creatNerRoleRec = Ext.data.Record.create([{
            name: 'startTime'
        }, {
            name: 'endTime'
        },{
            name: 'devCode'
        },{
            name: 'devName'
        },{
            name: 'devId'
        }]);
    var gridDown = new Ext.grid.EditorGridPanel({
        store: storeDown,
        cm: new Ext.grid.ColumnModel([
            smDown,
            new Ext.grid.RowNumberer(),
            /*
             * {header: '序号', width:100,renderer:function(value, cellmeta,
             * record, rowIndex){return rowIndex+1}},
             */
            {header:'开始时间',id:'startTime',dataIndex:'startTime',width:295,align:'center',editor: new Ext.form.TextField({
                regex:/^20\d{2}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/,
                listeners:{
                    blur:function(item,val){
                        /*
                         * var row = gridDown.getSelectionModel().getSelected();
                         * var index = storeDown.indexOf(row);
                         * dataDown[index][0] = val;
                         * storeDown.loadData(dataDown);
                         */
                        var len = storeDown.getCount()
                        dataDown.splice(0,dataDown.length);
                        setTimeout(function(){for(var i =0; i<len; i++){
                            var Record= new creatNerRoleRec({
                                        startTime: storeDown.data.items[i].data.startTime,
                                        endTime: storeDown.data.items[i].data.endTime,
                                        devCode: storeDown.data.items[i].data.devCode,
                                        devName: storeDown.data.items[i].data.devName,
                                        devId: storeDown.data.items[i].data.devId
                                })
                            if(!dataDown[i]){
                                dataDown[i] =[]
                            }
                            dataDown[i].push(Record.data.startTime, Record.data.endTime,Record.data.devCode,Record.data.devName,Record.data.devId)
                        }},50)
                        }
                    },
               allowBlank: false
           })},
            {header:'结束时间',id:'endTime',dataIndex:'endTime',width:295 ,align:'center',editor:new Ext.form.TextField({
                regex:/^20\d{2}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/,
                listeners:{
                    blur:function(item,val){
                        /*
                         * var row = gridDown.getSelectionModel().getSelected();
                         * var index = storeDown.indexOf(row);
                         * dataDown[index][0] = val;
                         * storeDown.loadData(dataDown);
                         */
                        var len = storeDown.getCount()
                        dataDown.splice(0,dataDown.length);
                        setTimeout(function(){for(var i =0; i<len; i++){
                            var Record= new creatNerRoleRec({
                                        startTime: storeDown.data.items[i].data.startTime,
                                        endTime: storeDown.data.items[i].data.endTime,
                                        devCode: storeDown.data.items[i].data.devCode,
                                        devName: storeDown.data.items[i].data.devName,
                                        devId: storeDown.data.items[i].data.devId
                                })
                            if(!dataDown[i]){
                                dataDown[i] =[]
                            }
                            dataDown[i].push(Record.data.startTime, Record.data.endTime,Record.data.devCode,Record.data.devName,Record.data.devId)
                        }},50)
                        }
                    },
               allowBlank: false
           })}
        ]),
        sm: smDown,
        width:640,
        height: 320, 
        border: false,
        buttons:[
            
        ],
        tbar: [{
            text: '新增下载',
            pressed: true,
            handler : function(){
                dataDown.push(dataDownDef);
                storeDown.loadData(dataDown);
            }
        },{
                text:'开始下载',
                pressed: true,
                style:{'margin':'0,5px 0 5px'},
                handler:function(){
                    var downList = gridDown.getSelectionModel().getSelections();
                    if(downList.length==0){
                        Ext.Msg.alert('请选择要下载的时间段');
                        return false
                    }
                    for(var i=0; i<downList.length; i++){
                        var recId = Utils.replayOCX.downRec(downList[i].get('devCode'),downList[i].get('startTime'),downList[i].get('endTime'));
                        var startTime = downList[i].get('startTime');
                        startTime = startTime.substring(0,19);    
                        startTime = startTime.replace(/-/g,'/'); 
                        startTime = new Date(startTime).getTime();
                        var endTime = downList[i].get('endTime');
                        endTime = endTime.substring(0,19);    
                        endTime = endTime.replace(/-/g,'/'); 
                        endTime = new Date(endTime).getTime();
                        if(endTime<=startTime){
                            Ext.Msg.alert('开始时间不能晚于结束时间');
                        }
                        else if(recId){
                            dataDowning.push([downList[i].get('startTime'),downList[i].get('endTime'),"0%",downList[i].get('devName'),recId,downList[i].get('devCode'),downList[i].get('devId')]);
                            gridDowning.store.loadData(dataDowning);
                        }
                    }
                    
                }
            },
            {
                text:'取消下载',
                pressed: true,
                handler:function(){
                    var row = gridDown.getSelectionModel().getSelections();
                    if(row.length==0){
                        Ext.Msg.alert('请选择要取消下载的时间段');
                        return false
                    }
                    for(var i=0; i<row.length; i++){
                       gridDown.store.remove(row[i]);
                    }
                    var len = gridDown.store.getCount();
                    dataDown.splice(0,dataDown.length);
                    for (var i = 0; i < len; i++)
                    {
                        var Record= new creatNerRoleRec({
                                        startTime: storeDown.data.items[i].data.startTime,
                                        endTime: storeDown.data.items[i].data.endTime,
                                        devCode: storeDown.data.items[i].data.devCode,
                                        devName: storeDown.data.items[i].data.devName,
                                        devId: storeDown.data.items[i].data.devId
                                })
                        if(!dataDown[i]){
                                dataDown[i] =[]
                            }
                            dataDown[i].push(Record.data.startTime, Record.data.endTime,Record.data.devCode,Record.data.devName,Record.data.devId)
                    }
                    storeDown.loadData(dataDown);
                }
            }]
    })
    changeProgress = function(nssn,nProPer){
        gridDowning.store.each(function(record,index){
            if(record.data.recId == nssn){
                gridDowning.store.getAt(index).set('status',nProPer+'%')
                /*dataDowning[index][2] = nProPer+'%';
                gridDowning.store.loadData(dataDowning);*/
                if(nProPer==100){
                    dataDowning.splice(index,1);
                    gridDowning.store.loadData(dataDowning);
                    Ext.Ajax.request({
                        url: '/Interface/Replay/rePlay.php?action=addDownlist',
                        params: {
                            "deviceId": record.data.devId,
                            "startTime": record.data.startTime,
                            "endTime": record.data.endTime
                        },
                        callback: function(options,success,response)
                            {
                                if (success)
                                {
                                    var j = Utils.inspectResponse(response.responseText);
                                    if (j.success)
                                    {
                                       storeDowned.reload();
                                       Ext.Msg.alert('己下载完成');
                                    }
                                    else
                                    {
                                        Utils.showErrorTip(j, function()
                                        {
                                            //oThis.oPanelGrid.reload();
                                        });
                                    }
                                }
                                else
                                {
                                    Utils.inspectRequest(options, is_success, response);
                                }
                         }
                    });
                }
            }
        })
    }
    
    openDown = function(){
        if(!$('.cur-win').length||!$('.cur-win').data('recData')){
                Ext.Msg.alert('请选择要下载的录像窗口');
                return;
            }
           
            var recData = $('.cur-win').data('recData');
            var day = recData.rec[0].endtime.slice(0,10);
            var devCode = recData.devcode;
            var devName = recData.devname;
            var devId = recData.devid;
            dataDownDef = [day+" 00:00:00",day+" 23:59:59",devCode,devName,devId]
            dataDown=[dataDownDef];
            var winDown =  new Ext.Window({
                width: 660,
                height: 400,
                title: '下载管理',
                closeAction: 'hide',
                plain: true,
                modal: true,
                bodyStyle :'background-color:#fff',
                style:'margin-left:5px',
                items: new Ext.TabPanel({
                    autoTabs: true,
                    activeTab: 1,
                    deferredRender: false,
                    border: false,
                    items:[{
                        title:'按时间下载',
                        items: [gridDown]
                    },{
                        title:'正在下载',
                        items:[gridDowning]
                    },{
                        title:'己下载',
                        items:[gridDowned]
                    }]
                })
            });
            storeDown.loadData(dataDown);
            winDown.show();
    }
/*    var btnDown = new Ext.Button({
        text:'录像下载',
        style: 'margin:10px 0 0 60px',
        handler:function(){
            
        }
    })*/
    var panelLeft = new Ext.Panel({
        layout: 'border',
        width: 284,
        height: Utils.screen.height-200,
        bodyStyle: 'background-color:#f0f0f0',
        items: [{
            region: 'center',
            hideBorders: true,
            items: panelTree,
            bodyStyle: 'background-color:#f0f0f0',
            autoScroll: true
        }, {
            region: 'south',
            height: 270,
            title: '搜索录像',
            bodyStyle: 'padding:0 0 0 35px',
            collapsible: true,
            items: [datepicker,btnSearch]
        }]
    })
/*
 * var panelMain = new Ext.Panel({ title: '当前位置：录像', layout: 'border', height:
 * Utils.screen.height, items: [{ region: 'west', hideBorders: true, border:
 * false, items: panelLeft, width: 270, layout: 'fit' },{ region: 'center',
 * html: '<OBJECT id="replay_activeX" WIDTH="1600px" HEIGHT="810px"
 * classid="clsid:8363982d-0069-4ea1-b6a3-115e9ff689ee"><param name="realtype"
 * value="0"/></OBJECT>', layout:'fit' },{ region: 'south', id:'replay-source',
 * height: 150, autoScroll: true }] })
 */
    $('#replay-tree').css({'float':'left','width':284,'height':Utils.screen.height-200});
    $('#replay-main').css({'float':'left','width':Utils.screen.fwidth-300,'height':Utils.screen.height-204});
    panelLeft.render(Ext.get('replay-tree'));
    // panelMain.render(Ext.get('replay-con'));
    var endDate = new Date();
    $('#datepicker').datetimepicker({
        language: 'zh-CN',
        weekStart: 1,
        todayBtn:  1,
        autoclose: 0,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0,
        bootcssVer: 3,
        endDate:endDate
    });
    $('#datepicker').datetimepicker('show');
    var bool = true;
    // $('#datepicker').datetimepicker('setDatesHighlight',['Mon Jun 12 2017']);
    $('#replay-source').timeline({
        // 最小缩放指数
        minZoom: 0,
        // 最大缩放指数
        maxZoom: 360,
        // 高亮部分点击事件
        HLclick: function(time, win, data)
        {
            /*
             * if(bool){Utils.replayOCX.recPlay(data.devcode,time);bool=false}
             * else{ Utils.replayOCX.seek(win,time); }
             */
            if($('.win').eq(win).data('isPlay')){
                Utils.replayOCX.seek(Number(win)+1,data.rec[0].starttime.slice(0,11)+time);
            }
            else{
                var day = data.rec[0].endtime.slice(0,11);
                var startTime = day+time;
                var endTime = day+'23:59:59';
                Utils.replayOCX.recPlay(Number(win)+1,data.devname,data.devid,data.devcode, data.rec[0].starttime,endTime);
                $('.win').eq(win).data('isPlay',true);
                Utils.replayOCX.seek(Number(win)+1,data.rec[0].starttime.slice(0,11)+time);
            }
        },
        HLdbclick: function(time, win, data)
        {
            /*
             * if(bool){Utils.replayOCX.recPlay(data.devcode,time);bool=false}
             * else{ Utils.replayOCX.seek(win,time); }
             */
            var day = data.rec[0].endtime.slice(0,11);
            var startTime = day+time;
            var endTime = day+'23:59:59';
            Utils.replayOCX.recPlay(Number(win)+1,data.devname,data.devid,data.devcode, data.rec[0].starttime,endTime);
            $('.win').eq(win).data('isPlay',true);
            Utils.replayOCX.seek(Number(win)+1,startTime);
        },
        winClick: function(index, hasData){
            Utils.replayOCX.selectWin(index+1,hasData);
        }
    });
    // $('#replay-source').timeline('setCursor',{'time':'04:30:00','curWin':'0'});
    /**
     * 初始化录像
     */
    Utils.replayOCX = new GOSUN.REPLAYMOD.Controler();
});

