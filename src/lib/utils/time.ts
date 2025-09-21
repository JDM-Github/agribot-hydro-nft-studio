
export function getTimestamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function addMinutes(time: string, minutes: number): string {
    const [hh, mm] = time.split(':').map(Number);
    let total = hh * 60 + mm + minutes;
    total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
    const nh = Math.floor(total / 60).toString().padStart(2, '0');
    const nm = (total % 60).toString().padStart(2, '0');
    return `${nh}:${nm}`;
}

export function isValid24HourTime(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

export function isValidTimestamp(ts: any): boolean {
    if (typeof ts !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ts);
}
