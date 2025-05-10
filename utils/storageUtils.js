const DEFAULT_SETTINGS = {
  dailyLimit: 60, // minutes
  isTimerPaused: false,
  watchedToday: 0, // minutes
  lastReset: new Date().setHours(0, 0, 0, 0)
};

const validateSettings = (settings) => {
  if (typeof settings.dailyLimit !== 'number' || settings.dailyLimit < 1) {
    return false;
  }
  if (typeof settings.isTimerPaused !== 'boolean') {
    return false;
  }
  if (typeof settings.watchedToday !== 'number' || settings.watchedToday < 0) {
    return false;
  }
  if (typeof settings.lastReset !== 'number') {
    return false;
  }
  return true;
};

const getStorageData = async (key) => {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key];
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
};

const setStorageData = async (key, value) => {
  try {
    await chrome.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
};

const initializeSettings = async () => {
  const settings = await getStorageData('settings');
  if (!settings || !validateSettings(settings)) {
    await setStorageData('settings', DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return settings;
};

const updateSettings = async (newSettings) => {
  const currentSettings = await getStorageData('settings');
  const updatedSettings = { ...currentSettings, ...newSettings };
  
  if (!validateSettings(updatedSettings)) {
    return false;
  }
  
  return await setStorageData('settings', updatedSettings);
};

const clearStorage = async () => {
  try {
    await chrome.storage.local.clear();
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
};

export {
  getStorageData,
  setStorageData,
  initializeSettings,
  updateSettings,
  clearStorage,
  DEFAULT_SETTINGS
};