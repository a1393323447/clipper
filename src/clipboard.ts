// export { ClipboardListener }
export { ClipboardListener }
import { clipboard } from "@tauri-apps/api"

class ClipboardListener {
    prev: string = "";
    timer: NodeJS.Timer|null;
    interval: number = 300;
    callback: (text: string) => void;

    public constructor(callback: (text: string) => void) {
        this.timer = null;
        this.callback = callback;
    }

    public async setInterval(interval: number) {
        this.interval = interval;
        await this.unlisten();
        await this.listen();
    }

    public async listen() {
        // immediately start watching 
        await this.watch();

        this.timer = setInterval(
            async () => await this.watch(), 
            this.interval
        );
    }

    public async unlisten() {
        if (this.timer == null) {
            return;
        }
        clearInterval(this.timer);
        this.timer = null;
    }

    private  async watch() {
        let res = await clipboard.readText();
        if (res === null) {
            return ;
        }
        let text = res as string;
        
        // watch for new text
        if (text != this.prev) {
            this.prev = text;
            this.callback(text);
        }
    }
}