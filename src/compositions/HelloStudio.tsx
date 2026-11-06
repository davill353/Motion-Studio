import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type HelloStudioProps = {
  title: string;
  subtitle: string;
};

export const helloStudioSchemaDefaults: HelloStudioProps = {
  title: "Hello from my studio",
  subtitle: "Motion Studio · made with code",
};

export const HelloStudio: React.FC<HelloStudioProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slowly rotating gradient background
  const hue = interpolate(frame, [0, durationInFrames], [220, 280]);

  // Words pop in one after another
  const words = title.split(" ");

  // Accent line grows under the title
  const lineWidth = interpolate(frame, [20, 50], [0, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade everything out over the last 10 frames
  const outro = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, hsl(${hue}, 70%, 28%), hsl(${hue + 40}, 60%, 8%))`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
        color: "white",
      }}
    >
      <div style={{ opacity: outro, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1
          style={{
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: -2,
            margin: 0,
            display: "flex",
            gap: 30,
          }}
        >
          {words.map((word, i) => {
            const progress = spring({
              frame: frame - i * 5,
              fps,
              config: { damping: 12, stiffness: 120 },
            });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * 60}px) scale(${0.8 + progress * 0.2})`,
                }}
              >
                {word}
              </span>
            );
          })}
        </h1>
        <div
          style={{
            width: lineWidth,
            height: 8,
            borderRadius: 4,
            marginTop: 30,
            background: "linear-gradient(90deg, #ff7ab6, #7af0ff)",
          }}
        />
        <p style={{ fontSize: 44, opacity: subtitleOpacity * 0.8, marginTop: 36 }}>{subtitle}</p>
      </div>
    </AbsoluteFill>
  );
};
