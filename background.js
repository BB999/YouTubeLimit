// 初期設定とデフォルト値
const DEFAULT_LIMIT = 60; // デフォルトの制限時間（分）
let watchTime = 0;
let isTracking = false;
let activeTabId = null;
let timerInterval = null;

// 拡張機能の初期化
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    timeLimit: DEFAULT_LIMIT,
    watchTime: 0,
    isBlocked: false,
    isPaused: false
  });
  setupMidnightReset();
});

// 0時リセット用のアラーム設定
function setupMidnightReset() {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  chrome.alarms.create('dailyReset', {
    when: midnight.getTime(),
    periodInMinutes: 1440 // 24時間
  });
}

// アラームリスナー
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    resetDailyStats();
  }
});

// 日次統計のリセット
async function resetDailyStats() {
  await chrome.storage.local.set({
    watchTime: 0,
    isBlocked: false
  });
  stopTracking();
}

// タブの更新監視
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com')) {
    checkAndUpdateTracking(tabId, tab.url);
  }
});

// タブのアクティブ状態監視
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url?.includes('youtube.com')) {
    activeTabId = activeInfo.tabId;
    startTracking();
  } else {
    stopTracking();
  }
});

// 視聴時間の追跡開始
function startTracking() {
  if (!isTracking) {
    isTracking = true;
    timerInterval = setInterval(updateWatchTime, 1000);
  }
}

// 視聴時間の追跡停止
function stopTracking() {
  if (isTracking) {
    isTracking = false;
    clearInterval(timerInterval);
  }
}

// 視聴時間の更新
async function updateWatchTime() {
  const data = await chrome.storage.local.get(['watchTime', 'timeLimit', 'isPaused']);
  if (data.isPaused) return;

  watchTime = data.watchTime + 1;
  await chrome.storage.local.set({ watchTime });

  if (watchTime >= data.timeLimit * 60) {
    await blockYouTube();
  }
}

// YouTube のブロック
async function blockYouTube() {
  await chrome.storage.local.set({ isBlocked: true });
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, { action: 'block' });
  }
  stopTracking();
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getState':
      chrome.storage.local.get(null, sendResponse);
      return true;
    case 'updateLimit':
      chrome.storage.local.set({ timeLimit: request.value });
      break;
    case 'togglePause':
      chrome.storage.local.set({ isPaused: request.value });
      break;
  }
});

// タブ状態の確認と追跡の更新
async function checkAndUpdateTracking(tabId, url) {
  const data = await chrome.storage.local.get(['isBlocked', 'watchTime', 'timeLimit']);
  
  if (data.isBlocked) {
    chrome.tabs.sendMessage(tabId, { action: 'block' });
    return;
  }

  if (url.includes('youtube.com/watch')) {
    activeTabId = tabId;
    startTracking();
  }
}