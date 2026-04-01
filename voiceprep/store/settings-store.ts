import { create } from 'zustand';

interface SettingsState {
  language: string;
  speechRate: number;
  silenceTimeout: number;
  darkMode: boolean;
}

interface SettingsActions {
  setLanguage: (lang: string) => void;
  setSpeechRate: (rate: number) => void;
  setSilenceTimeout: (ms: number) => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  (set) => ({
    language: 'python',
    speechRate: 1.0,
    silenceTimeout: 1500,
    darkMode: true,

    setLanguage: (lang) => set({ language: lang }),

    setSpeechRate: (rate) => set({ speechRate: rate }),

    setSilenceTimeout: (ms) => set({ silenceTimeout: ms }),

    toggleDarkMode: () => set((prev) => ({ darkMode: !prev.darkMode })),
  }),
);
