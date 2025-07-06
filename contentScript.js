(() => {
  // Get video element and check if it's a YouTube video
  const getVideoElement = () => {
    const video = document.querySelector("video");
    if (!video) return null;

    const isYouTube = window.location.hostname.includes("youtube.com");
    return isYouTube ? video : null;
  };

  // Get current video ID
  const getVideoId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("v");
  };

  // Get video title
  const getVideoTitle = () => {
    return document.title.replace(" - YouTube", "");
  };

  // Add bookmark
  const addBookmark = async () => {
    const video = getVideoElement();
    const videoId = getVideoId();

    if (!video || !videoId) return;

    const currentTime = Math.floor(video.currentTime);
    const title = getVideoTitle();

    const bookmarks = (await chrome.storage.local.get(videoId)) || {};
    const currentBookmarks = bookmarks[videoId] || [];

    // Check if bookmark already exists
    if (!currentBookmarks.some((bookmark) => bookmark.time === currentTime)) {
      const updatedBookmarks = [
        ...currentBookmarks,
        { time: currentTime, title },
      ].sort((a, b) => a.time - b.time);

      await chrome.storage.local.set({ [videoId]: updatedBookmarks });
    }
  };

  // Jump to timestamp
  const jumpToTime = (time) => {
    const video = getVideoElement();
    if (video) {
      video.currentTime = time;
      video.play();
    }
  };

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "ADD_BOOKMARK":
        addBookmark()
          .then(() => sendResponse({ success: true }))
          .catch(() => sendResponse({ success: false }));
        return true;
      case "JUMP_TO_TIME":
        jumpToTime(message.time);
        sendResponse();
        return true;
    }
  });
})();
