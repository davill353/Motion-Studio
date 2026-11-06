import React from "react";

export type IconName =
  | "webhook" | "sheet" | "code" | "switch" | "if" | "telegram" | "openai" | "gmail" | "calendar"
  | "whatsapp" | "http" | "reply" | "form" | "agent" | "memory" | "vector" | "edit" | "mic";

const S = { fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Icon: React.FC<{ name: IconName; size?: number }> = ({ name, size = 44 }) => {
  const c = (() => {
    switch (name) {
      case "webhook":
        return (
          <g {...S} stroke="#ff6d8a">
            <circle cx="12" cy="6" r="3" /><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" />
            <path d="M10.5 8.6 7 14.4M13.5 8.6 17 14.4M8.5 17h7" />
          </g>
        );
      case "sheet":
        return (
          <g>
            <path d="M6 2h9l5 5v15H6z" fill="#21a366" />
            <path d="M9 11h8v8H9zM9 15h8M13 11v8" stroke="white" strokeWidth="1.5" fill="none" />
          </g>
        );
      case "code":
        return (
          <g {...S} stroke="#ffb347" strokeWidth={2.4}>
            <path d="M9 4C6 4 7 10 4.5 12 7 14 6 20 9 20M15 4c3 0 2 6 4.5 8C17 14 18 20 15 20" />
          </g>
        );
      case "switch":
        return (
          <g {...S} stroke="#5aa9ff" strokeWidth={2.2}>
            <path d="M3 6h7l4 6-4 6H3M14 12h7M17 9l3 3-3 3M10 6h11M18 3l3 3-3 3" />
          </g>
        );
      case "if":
        return (
          <g {...S} stroke="#3ddc84" strokeWidth={2.2}>
            <path d="M4 5h6c3 0 3 7 6 7h4M10 5h10M17 2l3 3-3 3M17 9l3 3-3 3" />
          </g>
        );
      case "telegram":
        return (
          <g>
            <circle cx="12" cy="12" r="10" fill="#2aabee" />
            <path d="M6.5 11.8 16.8 7.6c.5-.2.9.1.8.7l-1.7 8.2c-.1.6-.5.7-1 .4l-2.7-2-1.3 1.3c-.2.2-.3.2-.5.2l.2-2.8 5-4.6c.2-.2 0-.3-.3-.1l-6.2 3.9-2.6-.8c-.6-.2-.6-.6.1-.8z" fill="white" />
          </g>
        );
      case "openai":
        return (
          <g {...S} stroke="white" strokeWidth={1.6}>
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <ellipse key={r} cx="12" cy="7.5" rx="3.2" ry="5" transform={`rotate(${r} 12 12)`} />
            ))}
          </g>
        );
      case "gmail":
        return (
          <g>
            <rect x="2.5" y="5" width="19" height="14" rx="2" fill="white" />
            <path d="M3 6.5 12 13l9-6.5" stroke="#ea4335" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
          </g>
        );
      case "calendar":
        return (
          <g>
            <rect x="3" y="4" width="18" height="17" rx="2.5" fill="white" />
            <path d="M3 9h18V6.5A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5z" fill="#4285f4" />
            <text x="12" y="18.5" fontSize="8" fontWeight="800" textAnchor="middle" fill="#4285f4" fontFamily="Inter">31</text>
          </g>
        );
      case "whatsapp":
        return (
          <g>
            <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5z" fill="#25d366" />
            <path d="M9 7.5c.3 0 .5 0 .7.5l.8 1.8c.1.3 0 .5-.2.7l-.6.7c.8 1.5 2 2.6 3.5 3.3l.7-.8c.2-.2.4-.3.7-.2l1.8.8c.4.2.4.4.4.7 0 1-1 2-2.1 2-3.6 0-7-3.4-7-7C7.4 8.5 8.2 7.5 9 7.5z" fill="white" />
          </g>
        );
      case "http":
        return (
          <g {...S} stroke="#8b8bff">
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
          </g>
        );
      case "reply":
        return (
          <g {...S} stroke="#ff6d8a" strokeWidth={2.2}>
            <path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6" />
          </g>
        );
      case "form":
        return (
          <g {...S} stroke="white">
            <rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h5" />
          </g>
        );
      case "agent":
        return (
          <g {...S} stroke="white">
            <rect x="4" y="8" width="16" height="11" rx="4" /><path d="M12 4v4M9 13h.01M15 13h.01" strokeWidth={3} />
            <circle cx="12" cy="3.5" r="1" />
          </g>
        );
      case "memory":
        return (
          <g {...S} stroke="white">
            <rect x="4" y="4" width="16" height="5" rx="1.5" /><rect x="4" y="10" width="16" height="5" rx="1.5" />
            <rect x="4" y="16" width="16" height="5" rx="1.5" />
          </g>
        );
      case "vector":
        return (
          <g fill="white">
            {[[12, 4], [6, 8], [18, 8], [12, 12], [6, 16], [18, 16], [12, 20]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.8} />
            ))}
            <path d="M12 4 6 8l6 4 6-4zM6 16l6 4 6-4M6 8v8M18 8v8M12 12v8" stroke="white" strokeWidth="0.8" fill="none" opacity="0.6" />
          </g>
        );
      case "edit":
        return (
          <g {...S} stroke="#a78bfa">
            <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />
          </g>
        );
      case "mic":
        return (
          <g {...S} stroke="white">
            <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </g>
        );
    }
  })();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {c}
    </svg>
  );
};
