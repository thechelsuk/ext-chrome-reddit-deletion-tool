#!/bin/bash
# build-distribution.sh
# Create a zip file containing extension source and assets for distribution
zip -r distribution.zip background.js content.js manifest.json popup.html popup.js assets/ -x '*.DS_Store'
