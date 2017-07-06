var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.socket = new egret.WebSocket();
        _this.once(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    Main.prototype.onConfigComplete = function (evt) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.loadGroup('preload');
    };
    Main.prototype.onResourceLoadComplete = function (evt) {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        this.createScene();
        this.connect();
    };
    Main.prototype.createScene = function () {
        var _this = this;
        // create background
        var bg = new egret.Sprite();
        bg.graphics.beginFill(0xebebeb);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        this.stage.addChild(bg);
        // create textinput
        var wrapper = new egret.Shape();
        wrapper.graphics.beginFill(0x000000);
        wrapper.graphics.drawRect(0, 0, this.stage.stageWidth - 150, 40);
        wrapper.graphics.endFill();
        wrapper.alpha = .1;
        this.stage.addChild(wrapper);
        wrapper.touchEnabled = true;
        var textIput = new egret.TextField();
        textIput.text = '';
        textIput.inputType = egret.TextFieldInputType.TEXT;
        textIput.type = egret.TextFieldType.INPUT;
        textIput.width = this.stage.width - 150;
        textIput.height = 40;
        textIput.verticalAlign = 'center';
        this.stage.addChild(textIput);
        var postionY = this.stage.stageHeight - 50;
        wrapper.y = postionY - 5;
        textIput.y = postionY;
        textIput.x = 10;
        textIput.addEventListener(egret.Event.CHANGE, function () {
        }, this);
        // create send button
        var label = new egret.TextField();
        label.width = 70;
        label.height = 70;
        label.textColor = 0xff0000;
        label.text = "send";
        label.size = 18;
        label.x = this.stage.width - 100;
        label.y = postionY;
        label.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
            _this.onPressSend(textIput.text);
            textIput.text = '';
        }, this);
        this.stage.addChild(label);
        label.touchEnabled = true;
    };
    Main.prototype.connect = function () {
        this.socket.connectByUrl('ws://192.168.1.51:8080');
        this.socket.type = egret.WebSocket.TYPE_BINARY;
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReciveMsg, this);
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
    };
    Main.prototype.onSocketClose = function () {
        egret.log('closed');
        this.socket.connect('localhost', 8080);
    };
    Main.prototype.onSocketError = function () {
        egret.log('error');
        this.socket.connectByUrl('ws://192.168.1.51:8080');
    };
    Main.prototype.onPressSend = function (msg) {
        this.socket.writeUTF(msg);
    };
    Main.prototype.onReciveMsg = function (e) {
        var bytes = new egret.ByteArray();
        this.socket.readBytes(bytes);
        var msg = bytes.readUTF();
        this.createDanmaku(msg);
    };
    Main.prototype.onSocketOpen = function () {
        egret.log('connected');
    };
    /**
     * hadnle for create danmaku
     */
    Main.prototype.createDanmaku = function (msg) {
        if (!msg)
            return;
        var danmaku = new egret.TextField();
        danmaku.text = msg;
        danmaku.y = Math.random() * (this.stage.stageHeight - 100);
        this.stage.addChild(danmaku);
        danmaku.x = this.stage.stageWidth - danmaku.textWidth;
        danmaku.size = 18 + Math.random() * 6;
        danmaku.textColor = parseInt("0x" + Math.random().toString(16).substr(2, 6));
        var swith = this.stage.width;
        var enterFrame = 2 * (Math.random() + .5);
        egret.startTick(function () {
            if (swith < -1 * danmaku.textWidth)
                return true;
            swith -= enterFrame;
            danmaku.x = swith;
            return false;
        }, this);
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
