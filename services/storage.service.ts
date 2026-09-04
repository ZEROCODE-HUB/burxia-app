import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedUser {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface Settings {
  emailAlerts: boolean;
}

const KEYS = {
  LAST_USER: "tecnomind_last_user",
  SETTINGS: "tecnomind_settings",
  PIN_ATTEMPTS: "tecnomind_pin_attempts",
};

export const saveLastUser = async (user: SavedUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_USER, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving last user:", error);
  }
};

export const getLastUser = async (): Promise<SavedUser | null> => {
  try {
    const json = await AsyncStorage.getItem(KEYS.LAST_USER);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Error getting last user:", error);
    return null;
  }
};

export const clearLastUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.LAST_USER);
  } catch (error) {
    console.error("Error clearing last user:", error);
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const getSettings = async (): Promise<Settings | null> => {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Error getting settings:", error);
    return null;
  }
};
export const getPinAttempts = async (email: string): Promise<number> => {
  try {
    const data = await AsyncStorage.getItem(`${KEYS.PIN_ATTEMPTS}_${email}`);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
};

export const incrementPinAttempts = async (email: string): Promise<number> => {
  const current = await getPinAttempts(email);
  const nextAttempts = current + 1;
  await AsyncStorage.setItem(
    `${KEYS.PIN_ATTEMPTS}_${email}`,
    nextAttempts.toString(),
  );
  return nextAttempts;
};

export const resetPinAttempts = async (email: string): Promise<void> => {
  await AsyncStorage.removeItem(`${KEYS.PIN_ATTEMPTS}_${email}`);
};
