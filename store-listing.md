# Chrome Web Store listing: RedemptionX 1.3.0

Paste these into the developer dashboard by hand. First submission.

## Package

Upload `distribution.zip` from the repo root, built by `bash build-distribution.sh`, or the one on the GitHub
release.

## Store listing tab

Name and summary come from the manifest.

Name:

```text
RedemptionX
```

Summary (132 characters at most):

```text
Bulk delete all your own Reddit posts and comments from old Reddit.
```

Category: choose Make Chrome Yours > Privacy & Security.

Language: choose English (UK).

Description:

```text
RedemptionX deletes all your own Reddit posts and comments for you, one by one.

Warning: deletion is permanent. There is no undo.

How it works:
- Click the RedemptionX icon, read the warning and choose "Start Deletion".
- RedemptionX opens your overview page on old Reddit (old.reddit.com), in a tab of its own or one you already have open on old Reddit, and deletes each post and comment, confirming each one.
- It pauses between deletions to avoid rate limits, and moves on to the next page until nothing is left.
- The popup shows a running count. Choose "Stop Deletion" at any time to halt it.

Good to know:
- It works on old Reddit only, and only on content you posted while signed in.
- Deleting removes content from Reddit. Copies may still exist in search engine caches or third-party archives.

Privacy: RedemptionX only runs on old.reddit.com. It collects nothing and sends nothing anywhere. Privacy policy: https://thechels.uk/app/privacy

RedemptionX is an independent project. It is not made, endorsed or supported by Reddit.

Help: raise an issue on GitHub (https://github.com/thechelsuk/ext-chrome-reddit-deletion-tool/issues) or reach out on socials (https://links.thechels.uk).

If you can support me and continued ongoing development: GitHub Sponsors (https://github.com/sponsors/thechelsuk) or Ko-fi (https://ko-fi.com/thechelsuk).

Made with ♥ in the UK by thechels.uk: https://thechels.uk/projects/ext-reddit-delete-tool. See my other projects: https://thechels.uk/projects
```

Official URL: the dashboard only lists sites verified in Google Search Console. Choose thechels.uk if it's listed,
otherwise None.

Homepage URL:

```text
https://thechels.uk/projects/ext-reddit-delete-tool
```

Support URL:

```text
https://github.com/thechelsuk/ext-chrome-reddit-deletion-tool/issues
```

Images (made by `tools/app-store-art pages`):

- Store icon, 128×128: `assets/icon128.png`
- Screenshots, 1280×800, in this order: `screenshots/webstore/01-ready.png`, `02-running.png`, `03-complete.png`
- Small promo tile, 440×280: `screenshots/webstore-tile/01-ready.png`

## Privacy practices tab

Single purpose:

```text
Delete all of the signed-in user's own Reddit posts and comments in bulk, at their request.
```

Host permission justification (`*://old.reddit.com/*`, the only permission):

```text
The extension opens your overview page on old Reddit, finds and clicks the delete and confirm links on your own posts and comments, and moves through its pages. It runs on no other site, including the new Reddit site.
```

Remote code: choose "No, I am not using remote code".

Data usage: tick none of the data types, then tick all three certifications.

Privacy policy URL:

```text
https://thechels.uk/app/privacy
```

## Distribution tab

Choose Free, Public, all regions.

## Test instructions tab

```text
Sign in to a throwaway Reddit account on old.reddit.com and post a test comment. Click the RedemptionX toolbar icon and choose Start Deletion. Deletion is permanent, so please don't use a real account.
```
