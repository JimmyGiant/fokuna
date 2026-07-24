"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { HTMLAttributes, ReactNode } from "react";

import type { BlockTone } from "./block-rail";
import { Button } from "./button";
import { Card, type CardProps } from "./card-modal";
import { Tag } from "./tag";
import { cn } from "./utils";

export interface BlockCardMeta {
  id: string;
  label: string;
  icon?: IconName;
}

export interface BlockCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  description?: string;
  icon: IconName;
  tone?: BlockTone;
  badge?: number | string;
  durationLabel: string;
  durationIcon?: IconName;
  meta?: BlockCardMeta[];
  menuLabel?: string;
  onMenuClick?: () => void;
  elevated?: CardProps["elevated"];
  menu?: ReactNode;
}

export function BlockCard({
  title,
  description,
  icon,
  tone = "pink",
  badge,
  durationLabel,
  durationIcon = "clock",
  meta = [],
  menuLabel = "Mehr Optionen",
  onMenuClick,
  elevated = "subtle",
  menu,
  className,
  ...props
}: BlockCardProps) {
  return (
    <Card {...props} className={cn("fk-block-card", className)} elevated={elevated}>
      <div className="fk-block-card__main">
        <div className="fk-block-card__top">
          <div className="fk-block-card__identity">
            <span aria-hidden="true" className="fk-block-tile fk-block-card__icon" data-tone={tone}>
              <FokunaIcon name={icon} radius={1} size={24} stroke={1.5} />
              {badge !== undefined ? (
                <span className="fk-block-tile__badge">{badge}</span>
              ) : null}
            </span>
            <Tag className="fk-block-card__duration" icon={durationIcon} size="sm">
              {durationLabel}
            </Tag>
          </div>
          {menu ?? (
            <Button
              aria-label={menuLabel}
              buttonType="outline"
              iconOnly
              intent="tertiary"
              leadingIcon="more-vertical"
              onClick={onMenuClick}
              size="sm"
              type="button"
            >
              {menuLabel}
            </Button>
          )}
        </div>

        <div className="fk-block-card__copy">
          <h3 className="fk-block-card__title">{title}</h3>
          {description ? <p className="fk-block-card__description">{description}</p> : null}
        </div>
      </div>

      {meta.length > 0 ? (
        <div className="fk-block-card__footer">
          <div className="fk-block-card__meta">
            {meta.map((item) => (
              <Tag className="fk-block-card__meta-tag" icon={item.icon} key={item.id}>
                {item.label}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
