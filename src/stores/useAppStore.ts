import { create } from 'zustand';

export type ModelOption = 'fable-5' | 'opus-4.8' | 'sonnet-4.6';

interface User {
  id: string;
  email: string;
  name?: string;
  displayName: string;
  avatarUrl: string;
  role: string;
  status: string;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  selectedModel: ModelOption;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedModel: (model: ModelOption) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  selectedModel: 'opus-4.8',
  // Drawer is closed until the hamburger opens it. The old default of `true`
  // was part of the dead-hamburger bug: the first tap "closed" a drawer that
  // was never rendered.
  sidebarOpen: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
