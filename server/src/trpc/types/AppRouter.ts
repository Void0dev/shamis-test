import { TrpcRouter } from '../trpc.router';

type AppRouter = ReturnType<TrpcRouter['createRouter']>;
export default AppRouter;
