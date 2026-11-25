# RedemptionX - Automated Reddit content deletion tool

A Chrome/Chromium extension that automatically deletes all your own Reddit posts and comments.

RedemptionX is an independent project. It is not made, endorsed or supported by Reddit.

## Warning

This extension will **permanently delete** all your Reddit posts and comments. This action **cannot be undone**. Use with extreme caution!

## Features

- Automatically finds and deletes Reddit posts and comments one by one, starting from your old Reddit overview page.
- Real-time progress tracking with deletion counter
- Safety confirmation before starting
- Ability to stop the deletion process at any time (but no undo)
- Built-in rate limiting to avoid Reddit API restrictions
- Auto-pagination to load more posts and comments

## Installation

RedemptionX is not on the Chrome Web Store yet. Until it is, load it by hand:

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Click the extension icon in your browser toolbar
2. Read the warning carefully
3. Click "Start Deletion" and confirm
4. The extension will open your Reddit overview page
5. Deletion begins automatically
6. Monitor progress in the popup window
7. Click "Stop Deletion" at any time to halt the process

## How It Works

1. Opens `old.reddit.com/user/me/overview/`, in a new tab or an old Reddit tab you already have open
2. Finds delete buttons for posts and comments on the page
3. Clicks each delete button
4. Confirms deletion by clicking "yes"
5. Waits between deletions to avoid rate limits
6. Paginates to load more posts or comments when needed
7. Continues until no more posts or comments are found

## Technical Details

- Uses Chrome Extension Manifest V3
- Content script runs on old Reddit pages only
- Background service worker manages state
- Pauses between deletions to avoid rate limits
- Needs access to old.reddit.com only. No data is collected or sent anywhere.

## Links

- [Project page](https://thechels.uk/projects/ext-reddit-delete-tool)
- [GitHub](https://github.com/thechelsuk/ext-chrome-reddit-deletion-tool)
- [Privacy policy](https://thechels.uk/app/privacy)

## Help

Raise an [issue on GitHub](https://github.com/thechelsuk/ext-chrome-reddit-deletion-tool/issues) or reach out on [socials](https://links.thechels.uk).

## Support

RedemptionX is free and maintained in my spare time. If you can support me and continued ongoing development, you can through [GitHub Sponsors](https://github.com/sponsors/thechelsuk) or [Ko-fi](https://ko-fi.com/thechelsuk).

Made with ♥ in the UK by [thechels.uk](https://thechels.uk). See my [other projects](https://thechels.uk/projects).
