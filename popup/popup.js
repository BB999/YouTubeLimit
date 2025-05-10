document.addEventListener('DOMContentLoaded', () => {
  const remainingTimeElement = document.getElementById('remaining-time');
  const totalTimeElement = document.getElementById('total-time');
  const limitInput = document.getElementById('limit-input');
  const setLimitButton = document.getElementById('set-limit-button');
  const togglePauseButton = document.getElementById('toggle-pause-button');
  const errorMessageElement = document.getElementById('error-message');

  // Helper function to format time (seconds to MM:SS)
  function formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
  }

  // Request initial state from background script
  chrome.runtime.sendMessage({ action: 'REQUEST_STATE' }, (response) => {
    if (response) {
      updateUI(response);
    }
  });

  // Listen for state updates from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'STATE_UPDATE') {
      updateUI(request.state);
    } else if (request.action === 'LIMIT_SET_SUCCESS') {
      // Optional: Show a success message briefly
      console.log('Limit set successfully');
    }
  });

  // Update UI based on state
  function updateUI(state) {
    if (remainingTimeElement) {
      remainingTimeElement.textContent = formatTime(state.remainingTime);
      // Optional: Change color based on remaining time
      if (state.remainingTime < 60) { // Less than 1 minute
        remainingTimeElement.style.color = 'red';
      } else if (state.remainingTime < 300) { // Less than 5 minutes
        remainingTimeElement.style.color = 'orange';
      } else {
        remainingTimeElement.style.color = ''; // Default color
      }
    }
    if (totalTimeElement) {
      totalTimeElement.textContent = formatTime(state.totalTimeToday);
    }
    if (limitInput) {
      // Only set value if user hasn't typed yet or on initial load
      if (!limitInput.dataset.userEdited) {
         limitInput.value = state.limitMinutes;
      }
    }
    if (togglePauseButton) {
      togglePauseButton.textContent = state.isPaused ? '再開' : '一時停止';
    }
  }

  // Handle limit setting
  if (setLimitButton && limitInput) {
    setLimitButton.addEventListener('click', () => {
      const limitMinutes = parseInt(limitInput.value, 10);
      if (isNaN(limitMinutes) || limitMinutes < 0) {
        if (errorMessageElement) {
          errorMessageElement.textContent = '有効な分数を入力してください。';
        }
        return;
      }
      if (errorMessageElement) {
        errorMessageElement.textContent = ''; // Clear error
      }
      chrome.runtime.sendMessage({ action: 'SET_LIMIT', limitMinutes: limitMinutes });
      limitInput.dataset.userEdited = 'false'; // Reset user edited flag
    });

    // Mark input as user edited
    limitInput.addEventListener('input', () => {
        limitInput.dataset.userEdited = 'true';
    });
  }

  // Handle pause/resume
  if (togglePauseButton) {
    togglePauseButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'TOGGLE_PAUSE' });
    });
  }

  // Clear error message on input focus
  if (limitInput && errorMessageElement) {
    limitInput.addEventListener('focus', () => {
      errorMessageElement.textContent = '';
    });
  }
});