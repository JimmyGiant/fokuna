import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { CSSProperties, ElementType, HTMLAttributes } from "react";

import { cn } from "./utils";

export interface GoalCardTag {
  label: string;
  icon?: IconName;
}

export interface GoalCardMilestone {
  id: string;
  title: string;
  completed?: boolean;
  dueDate?: string;
  subtasks?: {
    completed: number;
    total: number;
  };
}

export interface GoalCardProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  title: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  progress?: number;
  location?: string;
  tags?: GoalCardTag[];
  milestones?: GoalCardMilestone[];
  milestonePreviewLimit?: number;
  totalMilestones?: number;
  emptyMilestoneLabel?: string;
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function GoalCard({
  title,
  href,
  imageSrc,
  imageAlt = "",
  progress = 0,
  location,
  tags = [],
  milestones = [],
  milestonePreviewLimit = 2,
  totalMilestones,
  emptyMilestoneLabel = "Noch keine Meilensteine",
  className,
  style,
  ...props
}: GoalCardProps) {
  const Component: ElementType = href ? "a" : "article";
  const normalizedProgress = clampProgress(progress);
  const visibleMilestones = milestones.slice(0, Math.max(0, milestonePreviewLimit));
  const milestoneCount = Math.max(totalMilestones ?? milestones.length, milestones.length);
  const remainingMilestones = Math.max(0, milestoneCount - visibleMilestones.length);
  const hasContext = Boolean(location || tags.length);
  const progressStyle = {
    ...style,
    "--fk-goal-card-progress": `${normalizedProgress * 3.6}deg`,
  } as CSSProperties;

  return (
    <Component
      {...props}
      className={cn("fk-goal-card", className)}
      data-has-context={hasContext || undefined}
      href={href}
      style={progressStyle}
    >
      <div className="fk-goal-card__media">
        {imageSrc ? (
          <img alt={imageAlt} className="fk-goal-card__image" src={imageSrc} />
        ) : (
          <span aria-hidden="true" className="fk-goal-card__image-placeholder">
            <FokunaIcon name="images" size={24} />
          </span>
        )}
      </div>

      <div
        aria-label={`Fortschritt ${normalizedProgress} Prozent`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedProgress}
        className="fk-goal-card__progress"
        role="progressbar"
      >
        <span>{normalizedProgress}</span>
      </div>

      <div className="fk-goal-card__content">
        <header className="fk-goal-card__header">
          <h3>{title}</h3>
          {hasContext ? (
            <div className="fk-goal-card__context">
              {location ? (
                <span>
                  <FokunaIcon name="map-pin" size={16} />
                  {location}
                </span>
              ) : null}
              {tags.map((tag) => (
                <span key={`${tag.icon ?? "tag"}-${tag.label}`}>
                  <FokunaIcon name={tag.icon ?? "tag"} size={16} />
                  {tag.label}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="fk-goal-card__milestones">
          {visibleMilestones.length ? (
            <ol
              aria-label="Meilensteine"
              className="fk-goal-card__timeline"
              data-has-remaining={remainingMilestones || undefined}
            >
              {visibleMilestones.map((milestone) => {
                const hasMetadata = Boolean(milestone.subtasks || milestone.dueDate);

                return (
                  <li data-completed={milestone.completed || undefined} key={milestone.id}>
                    <span aria-hidden="true" className="fk-goal-card__marker">
                      {milestone.completed ? (
                        <FokunaIcon name="check-small" size={16} stroke={2} />
                      ) : null}
                    </span>
                    <strong>{milestone.title}</strong>
                    {hasMetadata ? (
                      <span className="fk-goal-card__milestone-meta">
                        {milestone.subtasks ? (
                          <span>
                            <FokunaIcon name="checklist" size={16} />
                            {milestone.subtasks.completed}/{milestone.subtasks.total}
                          </span>
                        ) : null}
                        {milestone.dueDate ? (
                          <span>
                            <FokunaIcon name="calendar" size={16} />
                            {milestone.dueDate}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="fk-goal-card__empty-milestones">
              <span aria-hidden="true" className="fk-goal-card__marker" />
              {emptyMilestoneLabel}
            </p>
          )}

          {remainingMilestones ? (
            <p className="fk-goal-card__remaining">+ {remainingMilestones} weitere Meilensteine</p>
          ) : null}
        </div>
      </div>
    </Component>
  );
}
