import type { RouteProps } from 'react-router-dom';

import Rules from '@/pages/Rules/Rules';
import Index from '../pages/Index/Index';
import Room from '../pages/Room/Room';

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
        path: '/room/:id',
        element: <Room />
    },
];
