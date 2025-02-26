import { makeAutoObservable, runInAction } from 'mobx';
import type { inferRouterOutputs } from '@trpc/server';
import type AppRouter from '@server/trpc/types/AppRouter';
import { trpc } from '../trpc/client';

type RouterOutput = inferRouterOutputs<AppRouter>;
type User = RouterOutput['auth']['telegramAuth']['user'];

class AuthStore {
  // Public properties
  public token: string | null = null;
  public user: User | null = null;
  public isAuthenticated: boolean = false;
  public isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  async authenticate(initData: string) {
    if (this.isLoading) return;

    const { token, user } = await trpc.auth.telegramAuth.mutate({
      initData,
      localTime: new Date().toISOString(),
    }).finally(() => {
      this.isLoading = false;
    });

    if (token && user) {
      runInAction(() => {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;
      });
    }
    
  }

  async connectWallet(address: string) {
    if (this.user?.tonAddress !== address) {
      await trpc.auth.connectWallet.mutate({
        tonAddress: address,
      });

      runInAction(() => {
        if (this.user) {
          this.user.tonAddress = address;
        }
      });
    }
  }
}

// Create and export singleton instance
export const authStore = new AuthStore();
