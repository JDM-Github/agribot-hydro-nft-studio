import { io, Socket } from "socket.io-client";

class SocketService {
    private static socket: Socket | null = null;

    public static init(url: string = "https://agribot-pi4.tail13df43.ts.net:8000") {
        if (!this.socket) {
            this.socket = io(url, {
                transports: ["websocket"],
                autoConnect: false,
            });
        }
    }

    public static getSocket(): Socket | null {
        return this.socket;
    }

    public static disconnect() {
        if (this.socket && this.socket.connected) {
            this.socket.disconnect();
        }
    }

    public static on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
    }

    public static emit(event: string, data?: any) {
        this.socket?.emit(event, data);
    }

    public static id(): string | null {
        return this.socket?.id ?? null;
    }

    public static isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export { SocketService };
