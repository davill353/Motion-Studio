// The AI Pound brand settings. Edit here to update all reels.
export const P = {
  name: "The AI Pound",
  navy: "#16233b",
  navy2: "#1b2a46",
  card: "#1f2f4f",
  mint: "#6ee7a8",
  teal: "#5eead4",
  muted: "rgba(255,255,255,0.62)",
  logo: "pound/logo.png",
  ctaFollow: "Follow The AI Pound for more automations",
  ctaComment: "Comment “AUTOMATE” to get this built",
  font: "Inter, 'Inter Display', Helvetica, Arial, sans-serif",
};

export const FPS = 30;
export const TOTAL = 60 * FPS;

// Safe area for TikTok / YouTube Shorts UI (1080x1920)
export const SAFE = { top: 330, bottom: 480, left: 60, right: 130 };
export const CONTENT_W = 1080 - SAFE.left - SAFE.right; // 890

export const grad = (a = P.mint, b = P.teal): React.CSSProperties => ({
  background: `linear-gradient(90deg, ${a}, ${b})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});
