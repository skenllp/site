# SKEN LLP — Media Assets

## Hero Video Files

Place the following video files in this `assets/` directory:

| File | Specs | Used When |
|------|-------|-----------|
| `hero-landscape.mp4` | 1920×1080, H.264, ~5–10MB | Desktop & laptop screens |
| `hero-portrait.mp4` | 1080×1920, H.264, ~4–8MB | Mobile screens (≤768px) |

### Recommended Video Encoding Settings
- **Codec**: H.264 (libx264) with `faststart` flag for progressive loading
- **Audio**: None (videos are muted autoplay)
- **Duration**: 8–15 seconds looping
- **Bitrate**: ~2–4 Mbps for landscape, ~1.5–3 Mbps for portrait

### FFmpeg command example
```bash
# Landscape (desktop)
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -movflags +faststart -an -vf scale=1920:1080 hero-landscape.mp4

# Portrait (mobile)
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -movflags +faststart -an -vf scale=1080:1920 hero-portrait.mp4
```

## OG Image
- Place `og-image.jpg` (1200×630px) in the root directory next to `index.html` for social sharing previews.
