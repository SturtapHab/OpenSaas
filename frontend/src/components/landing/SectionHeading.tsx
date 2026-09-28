interface SectionHeadingProps {
  tag: string;
  title: React.ReactNode;
  text?: React.ReactNode;
  align?: "center" | "left";
  dark?: boolean;
}

export function SectionHeading({ tag, title, text, align = "center", dark = false }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center mx-auto" : ""} style={{ maxWidth: align === "center" ? 760 : undefined }}>
      <div className="section-tag" style={dark ? { color: "#7aa7ff" } : undefined}>{tag}</div>
      <h2
        style={{
          fontSize: "clamp(2rem, 4vw, 3.25rem)",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          color: dark ? "#ffffff" : "#171717",
          marginBottom: text ? 18 : 0,
        }}
      >
        {title}
      </h2>
      {text && (
        <p style={{ fontSize: 17, lineHeight: 1.65, color: dark ? "rgba(255,255,255,0.65)" : "#616161" }}>
          {text}
        </p>
      )}
    </div>
  );
}
