#!/bin/bash

if ! [ -x "$(command -v minify)" ]; then
    echo "This script needs minify installed to run!"
    echo "See: https://github.com/tdewolff/minify/"
    exit 1;
fi

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

SRC_DIR="$SCRIPT_DIR/src/"
TARGET_DIR="$SCRIPT_DIR/dist/"

minify -o "$TARGET_DIR/" "$SRC_DIR/"*

minify -b -o "$TARGET_DIR/MdEmbed-full.min.js" "$SRC_DIR/MdApi.js" "$SRC_DIR/MdEmbed.js"
minify -b -o "$TARGET_DIR/MdSampleOnlineCollection-full.min.js" "$SRC_DIR/MdApi.js" "$SRC_DIR/MdEmbed.js" "$SRC_DIR/MdSampleOnlineCollection.js"

