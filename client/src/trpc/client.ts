import type AppRouter from '@server/trpc/types/AppRouter';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { authStore } from '../stores/authStore';

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/trpc`,
            headers() {
                const token = authStore.token;
                if (token) {
                    return {
                        'Authorization': `Bearer ${token}`
                    };
                }
                return {};
            },
        }),
    ],
});
