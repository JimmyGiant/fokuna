"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { HTMLAttributes, ReactNode } from "react";

import { Button } from "./button";
import { Card, type CardProps } from "./card-modal";
import { Tag } from "./tag";
import { cn } from "./utils";

export interface TemplateCardMeta {
  id: string;
  label: string;
  icon?: IconName;
}

export interface TemplateCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  description?: string;
  icon?: IconName;
  meta?: TemplateCardMeta[];
  menuLabel?: string;
  onMenuClick?: () => void;
  elevated?: CardProps["elevated"];
  menu?: ReactNode;
}

export function TemplateCard({
  title,
  description,
  icon = "notes",
  meta = [],
  menuLabel = "Mehr Optionen",
  onMenuClick,
  elevated = "subtle",
  menu,
  className,
  ...props
}: TemplateCardProps) {
  return (
    <Card {...props} className={cn("fk-template-card", className)} elevated={elevated}>
      <div className="fk-template-card__main">
        <div className="fk-template-card__top">
          <span aria-hidden="true" className="fk-template-card__icon">
            <FokunaIcon name={icon} size={24} stroke={1.5} />
          </span>
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

        <div className="fk-template-card__copy">
          <h3 className="fk-template-card__title">{title}</h3>
          {description ? <p className="fk-template-card__description">{description}</p> : null}
        </div>
      </div>

      {meta.length > 0 ? (
        <div className="fk-template-card__footer">
          <div className="fk-template-card__meta">
            {meta.map((item) => (
              <Tag className="fk-template-card__meta-tag" icon={item.icon} key={item.id}>
                {item.label}
              </Tag>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
