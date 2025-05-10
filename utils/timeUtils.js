// 時間をHH:MM:SS形式に変換
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const pad = (num) => num.toString().padStart(2, '0');
  return hours > 0 
    ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`;
};

// 秒を分に変換
const secondsToMinutes = (seconds) => Math.floor(seconds / 60);

// 分を秒に変換
const minutesToSeconds = (minutes) => minutes * 60;

// 次の0時までの残り時間（秒）を計算
const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
};

// 残り時間の計算
const calculateRemainingTime = (limitSeconds, usedSeconds) => {
  return Math.max(0, limitSeconds - usedSeconds);
};

// 時間入力の検証（1-1440分の範囲）
const validateTimeInput = (minutes) => {
  const numMinutes = Number(minutes);
  return !isNaN(numMinutes) && numMinutes >= 1 && numMinutes <= 1440;
};

// タイマーIDの生成
const createTimerId = () => `timer_${Date.now()}`;

// 経過時間の計算
const calculateElapsedTime = (startTime) => {
  return Math.floor((Date.now() - startTime) / 1000);
};

export {
  formatTime,
  secondsToMinutes,
  minutesToSeconds,
  getTimeUntilMidnight,
  calculateRemainingTime,
  validateTimeInput,
  createTimerId,
  calculateElapsedTime
};