import type { RequestHandler } from '@sveltejs/kit';
import { AUTH_KEY } from '$env/static/private';

export const POST: RequestHandler = async () => {
    try {
        const payload = {
            authkey: AUTH_KEY,
        };

        const res = await fetch('https://login.tailscale.com/api/v2/device/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            return new Response(JSON.stringify({ error: text }), { status: res.status });
        }

        const data = await res.json();
        return new Response(JSON.stringify({ message: 'Device connected', data }), { status: 200 });
    } catch (err: any) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
