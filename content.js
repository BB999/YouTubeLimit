let isBlocked = false;
let blockPageContent = '';

const YOUTUBE_SELECTORS = {
  player: '#movie_player',
  content: '#content',
  video: 'video'
};

async function loadBlockPage() {
  const response = await fetch(chrome.runtime.getURL('templates/blockPage.html'));
  blockPageContent = await response.text();
}

function insertBlockPage() {
  const contentContainer = document.querySelector(YOUTUBE_SELECTORS.content);
  if (!contentContainer) return;

  const blockElement = document.createElement('div');
  blockElement.id = 'youtube-time-limiter-block';
  blockElement.innerHTML = blockPageContent;
  
  contentContainer.style.display = 'none';
  document.body.insertBefore(blockElement, contentContainer);
}

function removeBlockPage() {
  const blockElement = document.getElementById('youtube-time-limiter-block');
  if (blockElement) {
    blockElement.remove();
    document.querySelector(YOUTUBE_SELECTORS.content).style.display = '';
  }
}

function handleVideoEvents() {
  const video = document.querySelector(YOUTUBE_SELECTORS.video);
  if (!video) return;

  video.addEventListener('play', () => {
    chrome.runtime.sendMessage({ type: 'VIDEO_PLAY' });
  });

  video.addEventListener('pause', () => {
    chrome.runtime.sendMessage({ type: 'VIDEO_PAUSE' });
  });
}

function setupMutationObserver() {
  const observer = new MutationObserver(() => {
    if (!document.querySelector(YOUTUBE_SELECTORS.video)) {
      handleVideoEvents();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'BLOCK_PAGE':
      if (!isBlocked) {
        isBlocked = true;
        insertBlockPage();
      }
      break;

    case 'UNBLOCK_PAGE':
      if (isBlocked) {
        isBlocked = false;
        removeBlockPage();
      }
      break;
  }
});

async function initialize() {
  await loadBlockPage();
  handleVideoEvents();
  setupMutationObserver();

  chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_LOADED' }, (response) => {
    if (response && response.isBlocked) {
      isBlocked = true;
      insertBlockPage();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}