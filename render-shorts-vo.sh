#!/usr/bin/env bash
# Renders the nine voiced AI Pound Shorts (voice + music), loudness-normalised for social.
set -e
OUT=renders/ai-pound-shorts-vo; mkdir -p "$OUT"
EXTRA=${CHROMIUM:+--browser-executable=$CHROMIUM}
IDS=${@:-01-SkinClinic-Part1 02-SkinClinic-Part2 03-Restaurant-Part1 04-Restaurant-Part2 05-VoiceAssistant-Part1 06-VoiceAssistant-Part2 07-WhatsApp-Part1 08-WhatsApp-Part2 09-HumanInTheLoop}
for id in $IDS; do
  npx remotion render "$id-VO" "$OUT/$id-VO.raw.mp4" --crf=18 $EXTRA
  ffmpeg -loglevel error -y -i "$OUT/$id-VO.raw.mp4" -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy -c:a aac -b:a 192k "$OUT/$id-VO.mp4"
  rm "$OUT/$id-VO.raw.mp4"; echo "done $id"
done
