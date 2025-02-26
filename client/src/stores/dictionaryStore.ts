import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';

interface Dictionary {
  
}

class DictionaryStore {
  // Public properties
  public dictionary: Dictionary = {
    
  };

  constructor() {
    makeAutoObservable(this);

    // Setup persistence
    makePersistable(this, {
      name: 'dictionary-storage',
      properties: ['dictionary'],
      storage: window.localStorage,
    });
  }

  // Method to update dictionary entries
  updateDictionary(newDictionary: Partial<Dictionary>) {
    this.dictionary = { ...this.dictionary, ...newDictionary };
  }
}

// Create and export singleton instance
export const dictionaryStore = new DictionaryStore();
