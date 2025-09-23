import { writable, type Writable } from "svelte/store";
import RequestHandler from "$lib/utils/request";
import { addToast } from "$lib/stores/toast";
import type { WritableBoolean, WritableString } from "../type";

export interface WifiNetwork {
    ssid: string;
    signal: number;
    known: boolean;
    priority: number;
}

class WifiManager {
    wifiList: Writable<WifiNetwork[]>;
    selectedSSID: WritableString;
    connectedSSID: WritableString;
    password: WritableString;
    loading: WritableBoolean;
    priority: number;

    constructor() {
        this.wifiList = writable<WifiNetwork[]>([]);
        this.selectedSSID = writable("");
        this.connectedSSID = writable("");
        this.password = writable("");
        this.loading = writable(false);
        this.priority = 0;
    }

    async setPriority() {
        let ssid: string = "";
        this.selectedSSID.subscribe(v => ssid = v)();

        if (!ssid) return;
        this.loading.set(true);

        try {
            const [success] = await RequestHandler.authFetch("wifi/set-priority", "POST", {
                ssid,
                priority: +this.priority,
            });

            if (success) {
                addToast(`Priority set to ${this.priority} for ${ssid}`, "success", 4000);
            } else {
                addToast("Failed to set priority", "error", 4000);
            }
        } catch (err) {
            console.error(err);
            addToast("Error setting priority", "error", 4000);
        }
        this.loading.set(false);
    }

    async scanNetworks() {
        this.loading.set(true);
        try {
            const [success, data] = await RequestHandler.authFetch("wifi/scan", "GET");

            if (success && data.networks) {
                this.wifiList.set(data.networks);
                this.connectedSSID.set(data.connected_ssid || "");
            } else {
                addToast("Failed to scan WiFi networks.", "error", 3000);
            }
        } catch (err) {
            console.error(err);
            addToast("Error scanning WiFi.", "error", 3000);
        }
        this.loading.set(false);
    }

    async connectNetwork() {
        let ssid: string = "", pwd: string = "";
        this.selectedSSID.subscribe(v => ssid = v)();
        this.password.subscribe(v => pwd = v)();

        if (!ssid) {
            addToast("Please select a network.", "error", 3000);
            return;
        }
        this.loading.set(true);

        try {
            const [success] = await RequestHandler.authFetch("wifi/connect", "POST", {
                ssid,
                password: pwd,
            });

            if (success) {
                addToast(`Connected to ${ssid}`, "success", 4000);
                this.connectedSSID.set(ssid);
                this.selectedSSID.set("");
                this.password.set("");
            } else {
                addToast("Failed to connect to WiFi.", "error", 4000);
            }
        } catch (err) {
            console.error(err);
            addToast("Connection request failed.", "error", 4000);
        }
        this.loading.set(false);
    }
}

export { WifiManager }