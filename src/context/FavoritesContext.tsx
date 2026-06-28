import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Job } from '../types';

interface FavoritesContextType {
  favorites: Job[];
  addFavorite: (job: Job) => void;
  removeFavorite: (jobId: string) => void;
  setFavorites: (jobs: Job[]) => void;
  isFavorited: (jobId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavoritesState] = useState<Job[]>([]);

  const setFavorites = useCallback((jobs: Job[]) => {
    setFavoritesState(jobs);
  }, []);

  const addFavorite = useCallback((job: Job) => {
    setFavoritesState((prev) => {
      // Check if already exists
      if (prev.find((j) => j.id === job.id)) {
        return prev;
      }
      return [...prev, job];
    });
  }, []);

  const removeFavorite = useCallback((jobId: string) => {
    setFavoritesState((prev) => prev.filter((job) => job.id !== jobId));
  }, []);

  const isFavorited = useCallback((jobId: string) => {
    return favorites.some((job) => job.id === jobId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        setFavorites,
        isFavorited,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
