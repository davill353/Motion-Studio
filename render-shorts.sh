#!/usr/bin/env bash
# Renders all nine AI Pound shorts to renders/ai-pound-shorts/
set -e
OUT=renders/ai-pound-shorts
mkdir -p "$OUT"
EXTRA=${CHROMIUM:+--browser-executable=$CHROMIUM}
for id in 01-SkinClinic-Part1 02-SkinClinic-Part2 03-Restaurant-Part1 04-Restaurant-Part2 \
          05-VoiceAssistant-Part1 06-VoiceAssistant-Part2 07-WhatsApp-Part1 08-WhatsApp-Part2 09-HumanInTheLoop; do
  npx remotion render "$id" "$OUT/$id.mp4" --crf=18 $EXTRA
done
