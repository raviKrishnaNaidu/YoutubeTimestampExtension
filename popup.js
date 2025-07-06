document.addEventListener("DOMContentLoaded", async () => {
  const bookmarksContainer = document.getElementById("bookmarks-container");
  const noVideoMessage = document.getElementById("no-video");
  const bookmarksList = document.getElementById("bookmarks-list");
  const addBookmarkBtn = document.getElementById("add-bookmark");

  // Get current tab
  const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  };

  const formatTime = (seconds) => {
    const pad = (num) => num.toString().padStart(2, "0");
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(secs)}`
      : `${minutes}:${pad(secs)}`;
  };

  const updateBookmarksList = async () => {
    // Get all bookmarks for all videos
    const allBookmarks = await chrome.storage.local.get(null);
    bookmarksList.innerHTML = "";
    let hasBookmarks = false;
    for (const videoId in allBookmarks) {
      if (Array.isArray(allBookmarks[videoId])) {
        allBookmarks[videoId].forEach((bookmark) => {
          hasBookmarks = true;
          const bookmarkItem = document.createElement("div");
          bookmarkItem.className = "bookmark-item";
          bookmarkItem.innerHTML = `
            <span class="bookmark-time">${formatTime(bookmark.time)}</span>
            <span class="bookmark-title">${bookmark.title}</span>
            <button class="delete-bookmark">×</button>
          `;

          bookmarkItem
            .querySelector(".delete-bookmark")
            .addEventListener("click", async (e) => {
              e.stopPropagation();
              const updatedBookmarks = allBookmarks[videoId].filter(
                (b) => b.time !== bookmark.time
              );
              await chrome.storage.local.set({ [videoId]: updatedBookmarks });
              updateBookmarksList();
            });

          bookmarkItem.addEventListener("click", async (e) => {
            if (!e.target.classList.contains("delete-bookmark")) {
              const url = `https://www.youtube.com/watch?v=${videoId}&t=${bookmark.time}s`;
              // Try to find an existing tab with this video
              const tabs = await chrome.tabs.query({
                url: `*://www.youtube.com/watch?v=${videoId}*`,
              });
              if (tabs.length > 0) {
                // Focus the first matching tab and update its URL to the timestamp
                await chrome.tabs.update(tabs[0].id, { url, active: true });
                await chrome.windows.update(tabs[0].windowId, {
                  focused: true,
                });
              } else {
                // Open a new tab
                await chrome.tabs.create({ url });
              }
            }
          });

          bookmarksList.appendChild(bookmarkItem);
        });
      }
    }
    bookmarksContainer.style.display = "block";
    bookmarksList.style.display = hasBookmarks ? "block" : "none";
    noVideoMessage.style.display = hasBookmarks ? "none" : "block";
    if (!hasBookmarks) {
      noVideoMessage.textContent =
        "No bookmarks found. Add a timestamp from a YouTube video!";
    } else {
      noVideoMessage.textContent = "";
    }
  };

  addBookmarkBtn.addEventListener("click", async () => {
    const currentTab = await getCurrentTab();
    if (!currentTab || !currentTab.url) {
      alert(
        "Could not detect the current tab. Please try again on a YouTube video page."
      );
      console.error("No currentTab or currentTab.url", currentTab);
      return;
    }
    if (!currentTab.url.includes("youtube.com/watch")) {
      alert("Please navigate to a YouTube video to add a timestamp.");
      return;
    }
    chrome.tabs.sendMessage(
      currentTab.id,
      { type: "ADD_BOOKMARK" },
      (response) => {
        if (chrome.runtime.lastError) {
          alert(
            "Could not add bookmark. Please refresh the YouTube page and try again."
          );
          console.error("chrome.runtime.lastError:", chrome.runtime.lastError);
        } else if (!response) {
          alert(
            "Failed to add bookmark. The content script may not be loaded. Try refreshing the YouTube page."
          );
          console.error("No response from content script", response);
        } else if (!response.success) {
          alert(
            "Failed to add bookmark. Make sure the YouTube page is fully loaded."
          );
          console.error("Response received but success is false", response);
        } else {
          updateBookmarksList();
        }
      }
    );
  });

  // Initialize
  updateBookmarksList();
});
