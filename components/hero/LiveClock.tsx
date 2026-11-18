"use client";

import { useEffect, useState } from "react";

interface LiveClockProps {
  timeZone: string;
  className?: string;
}

function read(timeZone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    zone: get("timeZoneName"),
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
    iso: now.toISOString(),
  };
}

/** Local time where Maxime is — rendered after mount so server and client agree. */
export function LiveClock({ timeZone, className }: LiveClockProps) {
  const [value, setValue] = useState<ReturnType<typeof read> | null>(null);

  useEffect(() => {
    const tick = () => setValue(read(timeZone));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <time
      dateTime={value?.iso}
      className={className}
      aria-label={value ? `Local time ${value.time} ${value.zone}` : "Local time"}
    >
      <span className="text-ink-3">{value?.zone ?? "CET"}</span>{" "}
      <span className="tabular-nums">{value?.time ?? "--:--:--"}</span>
    </time>
  );
}
