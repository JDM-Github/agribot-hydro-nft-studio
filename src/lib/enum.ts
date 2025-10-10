
export enum LiveStreamState {
    STOPPED = 0,
    RUNNING = 1,
    PAUSED = 2
}

export enum RobotState {
    STOPPED = 0,
    RUNNING = 1,
    PAUSED = 2
}

export const ScanningState = {
    STOPPED: false,
    RUNNING: true,
} as const;


export const ConnectionState = {
    DISCONNECTED: false,
    CONNECTED: true,
} as const;

export const RobotScanningState = {
    STOPPED: false,
    RUNNING: true,
} as const;


export const CapturingImageState = {
    ACTIVE: true,
    INACTIVE: false,
} as const;


export const RobotLivestream = {
    RUNNING: true,
    STOPPED: false,
} as const;


export const PerformingScanState = {
    RUNNING: true,
    STOPPED: false,
} as const;


export type ScanningState = typeof ScanningState[keyof typeof ScanningState];
export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState];
export type RobotScanningState = typeof RobotScanningState[keyof typeof RobotScanningState];
export type CapturingImageState = typeof CapturingImageState[keyof typeof CapturingImageState];
export type RobotLivestream = typeof RobotLivestream[keyof typeof RobotLivestream];
export type PerformingScanState = typeof PerformingScanState[keyof typeof PerformingScanState];

