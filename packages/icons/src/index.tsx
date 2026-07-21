import { useId, type SVGProps } from "react";

import { iconNames, iconRecords, type IconName, type IconRecord } from "./registry.generated";

export { iconNames, iconRecords };
export type { IconName, IconRecord };

export type IconSize = 16 | 24;
export type IconStroke = 1 | 1.5 | 2;
export type IconRadius = 0 | 1 | 2;
export type IconFill = "off" | "on";
export type IconJoin = "round" | "square";

export interface FokunaIconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "stroke"> {
  name: IconName;
  size?: IconSize;
  stroke?: IconStroke;
  radius?: IconRadius;
  fill?: IconFill;
  join?: IconJoin;
  title?: string;
}

function scoreIcon(record: IconRecord, requested: Required<IconVariant>) {
  return (
    Math.abs(record.size - requested.size) * 10 +
    Math.abs(Number(record.stroke) - requested.stroke) * 5 +
    Math.abs(record.radius - requested.radius) * 2 +
    Number(record.fill !== requested.fill) * 3 +
    Number(record.join !== requested.join)
  );
}

interface IconVariant {
  size: IconSize;
  stroke: IconStroke;
  radius: IconRadius;
  fill: IconFill;
  join: IconJoin;
}

export function resolveIcon(name: IconName, variant: IconVariant): IconRecord {
  const candidates = iconRecords.filter((record) => record.name === name);
  const best = [...candidates].sort((a, b) => scoreIcon(a, variant) - scoreIcon(b, variant))[0];

  if (!best) {
    throw new Error(`Unknown Fokuna icon: ${name}`);
  }

  return best;
}

export function FokunaIcon({
  name,
  size = 16,
  stroke = 1.5,
  radius = 2,
  fill = "off",
  join = "round",
  title,
  className,
  ...props
}: FokunaIconProps) {
  const titleId = useId();
  const record = resolveIcon(name, { size, stroke, radius, fill, join });
  // Some glyphs only ship a subset of stroke weights. Remap the path stroke so
  // callers can still request the design-system weight (e.g. checklist → 1.5).
  const body =
    String(record.stroke) === String(stroke)
      ? record.body
      : record.body.replaceAll(`stroke-width="${record.stroke}"`, `stroke-width="${stroke}"`);

  return (
    <svg
      {...props}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      className={className}
      fill="none"
      focusable="false"
      height={size}
      role={title ? "img" : undefined}
      viewBox={record.viewBox}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: body }} />
    </svg>
  );
}
