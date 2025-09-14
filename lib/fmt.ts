export const fmtTime = (iso?: string | null) =>
  !iso
    ? "—"
    : new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

export const cls = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export const fmtDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
