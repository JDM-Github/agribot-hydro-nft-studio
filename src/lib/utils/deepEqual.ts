
export function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null)
        return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((val, i) => deepEqual(val, b[i]));
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => keysB.includes(key) && deepEqual(a[key], b[key]));
}
