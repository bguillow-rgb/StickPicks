#!/usr/bin/env bash
# Patches react-native-vision-camera-v3-text-recognition@1.1.1 so it compiles
# against VisionCamera 4.x on iOS:
#   1. Fixes the VisionCameraProxy.h import path (needs <VisionCamera/...>)
#   2. Renames the .m file to .mm so Objective-C++ stdlib headers resolve
#      (VisionCameraProxyHolder transitively pulls in <condition_variable>).
#
# Runs in postinstall so it's idempotent and survives npm install / CI.

set -euo pipefail

PLUGIN_DIR="node_modules/react-native-vision-camera-v3-text-recognition/ios"
M_FILE="$PLUGIN_DIR/VisionCameraV3TextRecognition.m"
MM_FILE="$PLUGIN_DIR/VisionCameraV3TextRecognition.mm"

# If the plugin isn't installed (e.g. fresh clone with no node_modules), bail quietly.
if [ ! -d "$PLUGIN_DIR" ]; then
  exit 0
fi

# Step 1: fix the import path. Works on whichever file currently exists.
TARGET=""
if [ -f "$M_FILE" ]; then
  TARGET="$M_FILE"
elif [ -f "$MM_FILE" ]; then
  TARGET="$MM_FILE"
fi

if [ -n "$TARGET" ]; then
  # Use a sentinel to guard against repeated runs.
  if grep -q "^#import <VisionCameraProxy.h>" "$TARGET"; then
    # Use a temp file so BSD sed on macOS doesn't require an extension arg.
    sed 's|^#import <VisionCameraProxy\.h>|#import <VisionCamera/VisionCameraProxy.h>|' \
      "$TARGET" > "$TARGET.tmp" && mv "$TARGET.tmp" "$TARGET"
    echo "[patch-vision-camera-text-recognition] Fixed VisionCameraProxy import."
  fi
fi

# Step 2: rename .m → .mm if still needed.
if [ -f "$M_FILE" ] && [ ! -f "$MM_FILE" ]; then
  mv "$M_FILE" "$MM_FILE"
  echo "[patch-vision-camera-text-recognition] Renamed .m → .mm."
fi
