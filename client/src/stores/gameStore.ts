import { makeAutoObservable, runInAction, computed } from 'mobx';
import type { inferRouterOutputs } from '@trpc/server';
import type AppRouter from '@server/trpc/types/AppRouter';
import { trpc } from '../trpc/client';
import { authStore } from './authStore';
import { useNavigate } from 'react-router-dom';
import { thirdPartyErrorFilterIntegration } from '@sentry/browser';
import { MobXGlobals } from 'mobx/dist/internal';

type RouterOutput = inferRouterOutputs<AppRouter>;
type Room = RouterOutput['game']['getRoom'];
type RoomStatus = RouterOutput['game']['hasRoom'];
type EmptyRoom = RouterOutput['game']['getEmptyRooms'][number];

class GameStore {
  // Public properties
  public currentRoom: Room | null = null;
  public emptyRooms: EmptyRoom[] = [];
  public isLoading: boolean = false;
  public hasActiveRoom: boolean = false;
  public activeRoomId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Check if user has an active room
  async checkActiveRoom() {
    if (!authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const roomStatus = await trpc.game.hasRoom.query();
      
      runInAction(() => {
        this.hasActiveRoom = roomStatus.hasRoom;
        this.activeRoomId = roomStatus.roomId;
      });
      
      // If user has an active room, load its details
      if (roomStatus.hasRoom && roomStatus.roomId) {
        await this.getRoom(roomStatus.roomId);
      }
      
      return roomStatus;
    } catch (error) {
      console.error('Failed to check active room:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Get room details
  async getRoom(roomId: number) {
    if (!authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const room = await trpc.game.getRoom.query({ roomId });
      
      runInAction(() => {
        this.currentRoom = room;
      });
      
      return room;
    } catch (error) {
      console.error(`Failed to get room ${roomId}:`, error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Get list of empty rooms
  async getEmptyRooms() {
    if (!authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const rooms = await trpc.game.getEmptyRooms.query();
      
      runInAction(() => {
        if (rooms) {
          this.emptyRooms = rooms;
        }
      });
      
      return rooms;
    } catch (error) {
      console.error('Failed to get empty rooms:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Create a new room
  async createRoom() {
    if (!authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const room = await trpc.game.joinRoom.mutate({});
      
      runInAction(() => {
        this.currentRoom = room;
        this.hasActiveRoom = true;
        this.activeRoomId = room.id;
      });
      
      return room;
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Join an existing room
  async joinRoom(roomId: number) {
    if (!authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const room = await trpc.game.joinRoom.mutate({ roomId });
      
      runInAction(() => {
        this.currentRoom = room;
        this.hasActiveRoom = true;
        this.activeRoomId = room.id;
      });
      
      return room;
    } catch (error) {
      console.error(`Failed to join room ${roomId}:`, error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Make a move
  async makeMove(card: string) {
    if (!this.currentRoom || !authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const updatedRoom = await trpc.game.makeMove.mutate({
        roomId: this.currentRoom.id,
        card,
      });
      
      runInAction(() => {
        this.currentRoom = updatedRoom;
      });
      
      return updatedRoom;
    } catch (error) {
      console.error('Failed to make move:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Finish the current move (collect cards from table)
  async finishMove() {
    if (!this.currentRoom || !authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const updatedRoom = await trpc.game.finishMove.mutate({
        roomId: this.currentRoom.id,
      });
      
      runInAction(() => {
        this.currentRoom = updatedRoom;
      });
      
      return updatedRoom;
    } catch (error) {
      console.error('Failed to finish move:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Leave the current room
  async leaveRoom() {
    if (!this.currentRoom || !authStore.isAuthenticated || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const result = await trpc.game.leaveRoom.mutate({
        roomId: this.currentRoom.id,
      });
      
      if (result.success) {
        runInAction(() => {
          this.currentRoom = null;
          this.hasActiveRoom = false;
          this.activeRoomId = null;
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to leave room:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Reset store state
  reset() {
    runInAction(() => {
      this.currentRoom = null;
      this.emptyRooms = [];
      this.isLoading = false;
      this.hasActiveRoom = false;
      this.activeRoomId = null;
    });
  }

  // Computed properties
  get isPlayer1(): boolean {
    if (!this.currentRoom || !authStore.user) return false;
    return this.currentRoom.player1.id === authStore.user.id;
  }

  get isPlayer2(): boolean {
    if (!this.currentRoom || !authStore.user) return false;
    return this.currentRoom.player2?.id === authStore.user.id;
  }

  get isMyTurn(): boolean {
    if (!this.currentRoom) return false;
    return (this.isPlayer1 && this.currentRoom.playerMove === 1) || 
           (this.isPlayer2 && this.currentRoom.playerMove === 2);
  }

  get myHand(): string[] {
    if (!this.currentRoom) return [];
    return this.isPlayer1 ? this.currentRoom.player1hand : this.currentRoom.player2hand;
  }

  get opponentHand(): string[] {
    if (!this.currentRoom) return [];
    return this.isPlayer1 ? this.currentRoom.player2hand : this.currentRoom.player1hand;
  }
}

// Create and export singleton instance
export const gameStore = new GameStore();
