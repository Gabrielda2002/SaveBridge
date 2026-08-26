import { useState } from 'react';

type Screen = 'home' | 'settings';

export function useScreen() {
  const [screen, setScreen] = useState<Screen>('home');

  return {
    screen,
    openHome: () => setScreen('home'),
    openSettings: () => setScreen('settings'),
  };
}