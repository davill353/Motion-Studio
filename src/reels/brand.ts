// Edit these to update every reel at once.
export const brand = {
  summitName: "AI Business Summit",
  endTagline: "Real AI skills for real life",
  cta: "Next summit coming soon",
  ctaSub: "Follow for dates & details",
};

export type Theme = { a: string; b: string; bg: string };

export const themes = {
  violet: { a: "#ff7ab6", b: "#7af0ff", bg: "#0d0a1f" },
  money: { a: "#3cf0a0", b: "#d8ff5c", bg: "#071512" },
  hustle: { a: "#ffb03c", b: "#ff5c8a", bg: "#170b0b" },
  family: { a: "#7aa8ff", b: "#ffd36e", bg: "#0a0f1f" },
  bold: { a: "#b47aff", b: "#5cf2ff", bg: "#0b0b14" },
} satisfies Record<string, Theme>;

export const REEL = { width: 1080, height: 1920, fps: 30 };
