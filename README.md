# YouTube Timestamp Bookmarker

A Chrome extension that allows users to bookmark specific timestamps in YouTube videos and easily jump back to them later.

## Features

- Save timestamps while watching YouTube videos
- Automatically saves video title with each timestamp
- Click on saved timestamps to jump directly to that point in the video
- Delete individual bookmarks
- Clean and intuitive user interface
- Bookmarks are saved per video

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension icon should now appear in your Chrome toolbar

## Usage

1. Navigate to any YouTube video
2. Click the extension icon in your toolbar
3. Click "Add Timestamp" to save the current video position
4. Click on any saved timestamp to jump to that point in the video
5. Click the "×" button next to a timestamp to delete it

## Directory Structure

```
Chrome Extension/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── contentScript.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Note

You'll need to add your own icon files in the `icons` folder before using the extension. The icons should be in PNG format with sizes 16x16, 48x48, and 128x128 pixels.
