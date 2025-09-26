// // import type { RequestHandler } from '@sveltejs/kit';
// // import { TAILNET, API_KEY } from '$env/static/private';

// // export const POST: RequestHandler = async ({ request }) => {
// //     try {
// //         const { deviceName } = await request.json();

// //         const tsRes = await fetch(
// //             `https://api.tailscale.com/api/v2/tailnet/${TAILNET}/keys`,
// //             {
// //                 method: 'POST',
// //                 headers: {
// //                     Authorization:
// //                         'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
// //                     'Content-Type': 'application/json'
// //                 },
// //                 body: JSON.stringify({
// //                     capabilities: {
// //                         devices: {
// //                             create: {
// //                                 reusable: false,
// //                                 ephemeral: false,
// //                                 preauthorized: true,
// //                                 tags: ['tag:mobile']
// //                             }
// //                         }
// //                     },
// //                     expirySeconds: 90 * 24 * 60 * 60,
// //                     ...(deviceName ? { description: deviceName } : {})
// //                 })
// //             }
// //         );


// //         const raw = await tsRes.text();
// //         let data: any;
// //         try {
// //             data = JSON.parse(raw);
// //         } catch {
// //             data = { message: raw }; 
// //         }

// //         if (!tsRes.ok) {
// //             console.error('Failed to create auth key:', data);
// //             return new Response(JSON.stringify({ error: data }), { status: tsRes.status });
// //         }

// //         return new Response(
// //             JSON.stringify({
// //                 success: true,
// //                 authKey: data.key,
// //                 expires: data.expiry,
// //                 ...(deviceName ? { deviceName } : {})
// //             }),
// //             { status: 200 }
// //         );
// //     } catch (err) {
// //         console.error('Error creating Tailscale auth key:', err);
// //         return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500 });
// //     }
// // };


// // src/routes/api/tailscale/tailscale-authkey/+server.ts
// import type { RequestHandler } from '@sveltejs/kit';
// import { TAILNET, API_KEY } from '$env/static/private';

// export const POST: RequestHandler = async ({ request, locals }) => {
//     try {
//         const { deviceName } = await request.json();
//         const userId = locals.user.id;
//         if (!userId) {
//             return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
//         }

//         const user = await User.findByPk(userId);
//         if (!user) {
//             return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
//         }

//         const activeKeys = (user.allTailscaleUser || []).filter((d: any) => {
//             const notExpired = !d.expiryOfAuth || new Date(d.expiryOfAuth) > new Date();
//             return !d.isRegistered && notExpired;
//         });

//         if (activeKeys.length >= 5) {
//             return new Response(
//                 JSON.stringify({ error: 'Maximum 5 unregistered devices allowed' }),
//                 { status: 400 }
//             );
//         }

//         const tsRes = await fetch(
//             `https://api.tailscale.com/api/v2/tailnet/${TAILNET}/authkeys`,
//             {
//                 method: 'POST',
//                 headers: {
//                     Authorization: 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     reusable: false,
//                     ephemeral: false,
//                     expirySeconds: 90 * 24 * 60 * 60,
//                     preauthorized: true,
//                     tags: ['tag:mobile'],
//                     description: deviceName,
//                 }),
//             }
//         );

//         const data = await tsRes.json();
//         if (!tsRes.ok) {
//             console.error('Failed to create auth key:', data);
//             return new Response(JSON.stringify({ error: data }), { status: 500 });
//         }

//         // Push new key to user's allTailscaleUser
//         const newDevice = {
//             'device-name': deviceName,
//             ip: '', // will be filled once registered
//             authkey: data.key,
//             isRegistered: false,
//             expiryOfAuth: data.expiry,
//         };

//         const updatedDevices = [...(user.allTailscaleUser || []), newDevice];
//         user.allTailscaleUser = updatedDevices;
//         await user.save();

//         return new Response(
//             JSON.stringify({ success: true, authKey: data.key, device: newDevice }),
//             { status: 200 }
//         );
//     } catch (err) {
//         console.error('Error creating Tailscale auth key:', err);
//         return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500 });
//     }
// };
