import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Directory } from 'expo-file-system';

const STORAGE_KEY = '@savebridge/folder-settings';
const DEFAULT_PC_PATH = 'C:\\Users\\PROGRAMACION\\Documents\\Emulaciones\\games\\nds';

interface StoredFolderSettings {
  pcPath: string;
  androidPath: string | null;
}

export function useFolderSettings() {
  const [pcPath, setPcPath] = useState(DEFAULT_PC_PATH);
  const [androidPath, setAndroidPath] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings) as StoredFolderSettings;
        setPcPath(settings.pcPath);
        setAndroidPath(settings.androidPath);
      }
      setIsLoaded(true);
    }

    loadSettings().catch(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const settings: StoredFolderSettings = { pcPath, androidPath };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => undefined);
  }, [androidPath, isLoaded, pcPath]);

  async function selectAndroidFolder() {
    try {
      const directory = await Directory.pickDirectoryAsync();
      setAndroidPath(directory.uri);
    } catch {
      // The user can cancel the system picker without changing the current selection.
    }
  }

  return {
    androidPath,
    pcPath,
    selectAndroidFolder,
    setPcPath,
  };
}
