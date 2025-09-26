import type { Load } from '@sveltejs/kit';

export const load: Load = async () => {
    const notifications = [
        {
            id: 1,
            title: 'System Update',
            message: 'The system will undergo maintenance at 10 PM.',
            type: 'system',
            isRead: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: 'New Feature',
            message: 'Check out the new dashboard analytics feature!',
            type: 'success',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
            id: 3,
            title: 'Warning',
            message: 'Your storage is almost full.',
            type: 'warning',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
            id: 4,
            title: 'Error',
            message: 'Failed to sync your data.',
            type: 'error',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
        },
        {
            id: 5,
            title: 'Reminder',
            message: 'Don’t forget to review your weekly report.',
            type: 'system',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
        }
    ];

    return { notifications };
};
