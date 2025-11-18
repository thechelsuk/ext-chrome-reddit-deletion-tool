# Reddit Comment Deleter

A Chrome/Chromium extension that automatically deletes all your Reddit comments.

## ⚠️ Warning

This extension will **permanently delete** all your Reddit comments. This action **cannot be undone**. Use with extreme caution!

## Features

- Automatically finds and deletes Reddit comments one by one
- Real-time progress tracking with deletion counter
- Safety confirmation before starting
- Ability to stop the deletion process at any time
- Built-in rate limiting to avoid Reddit API restrictions
- Auto-scrolls to load more comments

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Click the extension icon in your browser toolbar
2. Read the warning carefully
3. Click "Start Deletion" and confirm
4. The extension will open your Reddit comments page
5. Deletion begins automatically
6. Monitor progress in the popup window
7. Click "Stop Deletion" at any time to halt the process

## How It Works

1. Opens `reddit.com/user/me/comments/` in a new tab
2. Finds delete buttons on the page
3. Clicks each delete button
4. Confirms deletion by clicking "yes"
5. Waits between deletions to avoid rate limits
6. Scrolls to load more comments when needed
7. Continues until no more comments are found

## Technical Details

- Uses Chrome Extension Manifest V3
- Content script runs on all Reddit pages
- Background service worker manages state
- 2-second delay between deletions for rate limiting

## Links

REDemptionX - Automated Reddit comment deletion tool.
