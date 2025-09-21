
export function getBaseApiUrl() {
    return import.meta.env.MODE === 'production'
        ? ''
        : import.meta.env.VITE_DEVELOPMENT_LINK || 'http://127.0.0.1:8000';
}
