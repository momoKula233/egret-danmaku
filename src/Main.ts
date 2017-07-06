class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;
    private socket:egret.WebSocket = new egret.WebSocket();

    public constructor() {
        super();
        this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event): void {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }
    private onConfigComplete(evt: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.loadGroup('preload');
    }
    private onResourceLoadComplete(evt: RES.ResourceEvent) {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        this.createScene();
        this.connect();
    }
    private createScene() {
        // create background
        const bg: egret.Sprite = new egret.Sprite();
        bg.graphics.beginFill(0xebebeb);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        this.stage.addChild(bg);

        // create textinput
        const wrapper:egret.Shape =  new egret.Shape();
        wrapper.graphics.beginFill(0x000000);
        wrapper.graphics.drawRect(0,0,this.stage.stageWidth - 150,40);
        wrapper.graphics.endFill();
        wrapper.alpha = .1;
        this.stage.addChild(wrapper);
        wrapper.touchEnabled = true;
        const textIput:egret.TextField = new egret.TextField();
        textIput.text = '';
        textIput.inputType = egret.TextFieldInputType.TEXT;
        textIput.type = egret.TextFieldType.INPUT;
        textIput.width = this.stage.width - 150;
        textIput.height = 40;
        textIput.verticalAlign = 'center';
        this.stage.addChild(textIput);
        const postionY = this.stage.stageHeight - 50;
        wrapper.y = postionY - 5;
        textIput.y = postionY;
        textIput.x = 10;
        textIput.addEventListener(egret.Event.CHANGE, () => {
        }, this)
        
        // create send button
        const label:egret.TextField = new egret.TextField();
        label.width = 70;
        label.height = 70;
        label.textColor = 0xff0000;
        label.text = "send";
        label.size = 18;
        label.x = this.stage.width - 100;
        label.y = postionY;
        label.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(e) => {
                this.onPressSend(textIput.text);
                textIput.text = '';
            }, this);
        this.stage.addChild(label);
        label.touchEnabled = true;
    }

    private connect(): void {
        this.socket.connectByUrl('ws://192.168.1.51:8080');
        this.socket.type = egret.WebSocket.TYPE_BINARY;
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReciveMsg, this)
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
    }

    private onSocketClose():void {
        egret.log('closed');
        this.socket.connect('localhost', 8080);
    }

    private onSocketError(): void {
        egret.log('error');
        this.socket.connectByUrl('ws://192.168.1.51:8080');
    }

    private onPressSend(msg: string) {
        this.socket.writeUTF(msg);
    }

    private onReciveMsg(e: egret.Event): void {
        const bytes: egret.ByteArray = new egret.ByteArray();
        this.socket.readBytes(bytes);
        const msg:string = bytes.readUTF();
        this.createDanmaku(msg);
    }

    private onSocketOpen(): void {
        egret.log('connected');
    }

    /**
     * hadnle for create danmaku
     */
    private createDanmaku(msg): void {
        if(!msg) return;
        const danmaku:egret.TextField = new egret.TextField();
        danmaku.text = msg;
        danmaku.y = Math.random() * (this.stage.stageHeight - 100);
        this.stage.addChild(danmaku);
        danmaku.x = this.stage.stageWidth - danmaku.textWidth;
        danmaku.size = 18 + Math.random() * 6;
        danmaku.textColor = parseInt(`0x${Math.random().toString(16).substr(2,6)}`);
        let swith: number = this.stage.width;
        const enterFrame: number = 2 * (Math.random() + .5);
        egret.startTick(() => {
            if(swith < -1 * danmaku.textWidth) return true;
            swith -= enterFrame;
            danmaku.x = swith;
            return false;
        }, this);
    }
}


