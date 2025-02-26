import type { RouteProps } from 'react-router-dom';

import Rules from '@/pages/Rules/Rules';
import Index from '../pages/Index/Index';
import Chat from '../pages/Chat/Chat';

export const routes: RouteProps[] = [
    {
        path: '/',
        element: <Index />
    },
    {
        path: '/rules',
        element: <Rules />
    },
    {
        path: '/chat',
        element: <Chat />
    }
];
