import type { RequestHandler } from '@sveltejs/kit';
import { TAILNET, API_KEY } from '$env/static/private';

export const GET: RequestHandler = async () => {
    try {
        const res = await fetch(
            `https://api.tailscale.com/api/v2/tailnet/${TAILNET}/devices`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(API_KEY + ':').toString('base64')}`
                }
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error('Tailscale API error:', res.status, text);
            return new Response(
                JSON.stringify({ error: `Tailscale API error: ${res.status}`, details: text }),
                { status: res.status }
            );
        }

        const data = await res.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Server route error:', err);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error', details: String(err) }),
            { status: 500 }
        );
    }
};
