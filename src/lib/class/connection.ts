import { get, writable, type Writable } from "svelte/store";
import { SocketService } from "$lib/socket";
import type { CameraInfo } from "../types/cameraInfo";
import {
    ConnectionState, LiveStreamState, RobotScanningState, RobotState,
    ScanningState, CapturingImageState, RobotLivestream, PerformingScanState
} from "../enum";
import { CAMERA_INFO } from "../constant/cameraInfo";
import type { LabelResultArray } from "../types/labelResult";
import type { PlantHistories } from "../type";

type AllState = {
    connection?: Writable<boolean>;
    robotrunning?: Writable<number>;
    livestreamstate?: Writable<number>;
    scanningstate?: Writable<boolean>;
    robotscanningstate?: Writable<boolean>;
    stopcapturingimage?: Writable<boolean>;
    robotlivestream?: Writable<boolean>;
    performingscan?: Writable<boolean>;
};

type TCRT5000 = {
    left: boolean;
    right: boolean;
};
type WaterSensorReadings = boolean[];
type TCS34725 = {
    raw: { r: number, g: number, b: number, c: number },
    normalized: { r: number, g: number, b: number },
    color_name: string
}

class Connection {
    private static connection: Writable<boolean> = writable(ConnectionState.DISCONNECTED);
    private static robotrunning: Writable<number> = writable(RobotState.STOPPED);
    private static livestreamstate: Writable<number> = writable(LiveStreamState.STOPPED);
    private static scanningstate: Writable<boolean> = writable(ScanningState.STOPPED);
    private static robotscanningstate: Writable<boolean> = writable(RobotScanningState.STOPPED);
    private static stopcapturingimage: Writable<boolean> = writable(CapturingImageState.INACTIVE);
    private static robotlivestream: Writable<boolean> = writable(RobotLivestream.STOPPED);
    private static performingscan: Writable<boolean> = writable(PerformingScanState.STOPPED);

    private static camerainfo: Writable<CameraInfo> = writable(CAMERA_INFO);
    private static scanFrameUrl = writable<string | null>(null);
    private static liveFrameUrl = writable<string | null>(null);
    private static robotLiveFrameUrl = writable<string | null>(null);
    private static latestResults: Writable<LabelResultArray> = writable([]);

    private static plantHistories: Writable<PlantHistories> = writable([]);
    private static allLogs: Writable<string[]> = writable([]);

    private static tcrt5000 = writable<TCRT5000>({ left: false, right: false });
    private static waterReadings = writable<WaterSensorReadings>([]);
    private static tcs34725 = writable<TCS34725>({
        raw: { r: 0, g: 0, b: 0, c: 0 },
        normalized: { r: 0, g: 0, b: 0 },
        color_name: "NOT SET"
    });
    private static ultrasonic = writable<number>(0);

    public static init() {
        SocketService.init();
        const socket = SocketService.getSocket();
        if (!socket) return;

        socket.on("tcrt5000", (data: any) => Connection.tcrt5000.set(data));
        socket.on("watersensor", (data: any) => Connection.waterReadings.set(data.readings));
        socket.on("tcs34725", (data: any) => Connection.tcs34725.set(data));
        socket.on("ultrasonic", (data: any) => Connection.ultrasonic.set(data));

        socket.on("connect", () => {
            console.log("✅ Connected to robot, id:", socket.id);
            Connection.connection.set(true);
        });

        socket.on("disconnect", () => {
            console.warn("⚠️ Disconnected from robot");
            Connection.resetStates();
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Connection error:", err.message || err);
            Connection.resetStates();
        });

        socket.on("robot-running", (data: number) => {
            console.log("[SOCKET] robot-running =", data);
            Connection.robotrunning.set(data);
        });

        socket.on("livestream-state", (data: number) => {
            console.log("[SOCKET] livestream-state =", data);
            Connection.livestreamstate.set(data);
        });

        socket.on("scanning-state", (data: boolean) => {
            console.log("[SOCKET] scanning-state =", data);
            Connection.scanningstate.set(data);
        });

        socket.on("robot-scanning-state", (data: boolean) => {
            console.log("[SOCKET] robot-scanning-state =", data);
            Connection.robotscanningstate.set(data);
        });

        socket.on("stop-capturing-image", (data: boolean) => {
            console.log("[SOCKET] stop-capturing-image =", data);
            Connection.stopcapturingimage.set(data);
        });

        socket.on("performing-scan", (data: boolean) => {
            console.log("[SOCKET] performing-scan =", data);
            Connection.performingscan.set(data);
        });

        socket.on("robot-livestream", (data: boolean) => {
            console.log("[SOCKET] robot-livestream =", data);
            Connection.robotlivestream.set(data);
        });


        socket.on("camera_info", (data: CameraInfo) => {
            Connection.camerainfo.set({ ...CAMERA_INFO, ...data });
        });

        socket.on("scan_frame", (data: any) => {
            const blob = new Blob([data], { type: "image/jpeg" });
            Connection.scanFrameUrl.set(URL.createObjectURL(blob));
        });

        socket.on("latest_results", (data: string) => {
            const latestResults: LabelResultArray = JSON.parse(data);
            Connection.latestResults.set(latestResults);
        });

        socket.on("livestream_frame", (data: any) => {
            const blob = new Blob([data], { type: "image/jpeg" });
            Connection.liveFrameUrl.set(URL.createObjectURL(blob));
        });
        socket.on("livestream_frame_stop", (_: any) => Connection.liveFrameUrl.set(null));

        socket.on("robot_livestream_frame", (data: any) => {
            const blob = new Blob([data], { type: "image/jpeg" });
            Connection.robotLiveFrameUrl.set(URL.createObjectURL(blob));
        });

        socket.on("logs", (data: any) => {
            if (data.logs && data.logs.length) {
                Connection.allLogs.update((logs: any[]) => {
                    const combined = [...logs, ...data.logs];
                    return combined.slice(-300);
                });
            }
        });

        socket.on("plant-histories", (data: any) => {
            Connection.plantHistories.update((current) => {
                const dataWithId = data.map((plant: any) => ({
                    ...plant,
                    id: plant.id ?? 'plant-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
                }));
                const combined = [...dataWithId, ...current];
                const uniqueCombined = combined.filter(
                    (plant, index, self) =>
                        index === self.findIndex((p) => p.src === plant.src && p.timestamp === plant.timestamp)
                );
                return uniqueCombined.slice(0, 6);
            });
        });

    }

    public static connect() {
        const socket = SocketService.getSocket();
        if (socket && !socket.connected) socket.connect();
    }

    public static disconnect() {
        SocketService.disconnect();
        Connection.resetStates();
    }

    private static resetStates() {
        Connection.connection.set(false);
        Connection.robotrunning.set(0);
        Connection.livestreamstate.set(0);
        Connection.scanningstate.set(false);
        Connection.robotscanningstate.set(false);
        Connection.stopcapturingimage.set(false);
        Connection.robotlivestream.set(false);
        Connection.performingscan.set(false);

        Connection.camerainfo.set(CAMERA_INFO);
        Connection.scanFrameUrl.set(null);
        Connection.liveFrameUrl.set(null);
        Connection.robotLiveFrameUrl.set(null);
        Connection.latestResults.set([]);
    }

    // getters
    public static getTCRT5000(): Writable<TCRT5000> { return Connection.tcrt5000; }
    public static getReadings(): Writable<WaterSensorReadings> { return Connection.waterReadings; }
    public static getUltrasonic(): Writable<number> { return Connection.ultrasonic; }
    public static getTCS34725(): Writable<TCS34725> { return Connection.tcs34725; }

    public static isConnected(): Writable<boolean> { return Connection.connection; }
    public static isRobotRunning(): Writable<number> { return Connection.robotrunning; }
    public static livestreamState(): Writable<number> { return Connection.livestreamstate; }
    public static scanningState(): Writable<boolean> { return Connection.scanningstate; }
    public static robotScanningState(): Writable<boolean> { return Connection.robotscanningstate; }

    public static stopCapturingImage(): Writable<boolean> { return Connection.stopcapturingimage; }
    public static robotLivestream(): Writable<boolean> { return Connection.robotlivestream; }
    public static performingScan(): Writable<boolean> { return Connection.performingscan; }

    public static getCameraInfo(): Writable<CameraInfo> { return Connection.camerainfo; }
    public static getScanFrameURL(): Writable<string | null> { return Connection.scanFrameUrl; }
    public static getLatestCameraResults(): Writable<LabelResultArray> { return Connection.latestResults; }
    public static getLiveFrameURL(): Writable<string | null> { return Connection.liveFrameUrl; }
    public static getRobotLiveFrameURL(): Writable<string | null> { return Connection.robotLiveFrameUrl; }

    public static getLatestPlantHistories(): Writable<PlantHistories> { return Connection.plantHistories; }
    public static getAllLogs(): Writable<string[]> { return Connection.allLogs; }

    public static getAllState(options: { conn?: boolean; robot?: boolean; live?: boolean; scan?: boolean; rscan?: boolean; stopCapture?: boolean; robotLive?: boolean; performing?: boolean } = {}): AllState {
        const result: AllState = {};
        if (options.conn) result.connection = Connection.connection;
        if (options.robot) result.robotrunning = Connection.robotrunning;
        if (options.live) result.livestreamstate = Connection.livestreamstate;
        if (options.scan) result.scanningstate = Connection.scanningstate;
        if (options.rscan) result.robotscanningstate = Connection.robotscanningstate;
        if (options.stopCapture) result.stopcapturingimage = Connection.stopcapturingimage;
        if (options.robotLive) result.robotlivestream = Connection.robotlivestream;
        if (options.performing) result.performingscan = Connection.performingscan;
        return result;
    }
}

export { Connection, type AllState };
