import { FokunaIcon, type IconName } from "@fokuna/icons";
import type { CSSProperties, ElementType, HTMLAttributes } from "react";

import { SubtaskIcon } from "./subtask-icon";
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
  emptyMilestoneActionLabel?: string;
  emptyMilestoneActionHref?: string;
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
  milestonePreviewLimit,
  totalMilestones,
  emptyMilestoneLabel = "Keine Meilenstein",
  emptyMilestoneActionLabel = "Anlegen",
  emptyMilestoneActionHref,
  className,
  style,
  ...props
}: GoalCardProps) {
  const Component: ElementType = href ? "a" : "article";
  const normalizedProgress = clampProgress(progress);
  const milestoneCount = Math.max(totalMilestones ?? milestones.length, milestones.length);
  const resolvedPreviewLimit = milestonePreviewLimit ?? (milestoneCount <= 3 ? 3 : 2);
  const visibleMilestones = milestones.slice(0, Math.max(0, resolvedPreviewLimit));
  const remainingMilestones = Math.max(0, milestoneCount - visibleMilestones.length);
  const hasContext = Boolean(location || tags.length);
  const progressStyle = {
    ...style,
    "--fk-goal-card-progress-offset": 100 - normalizedProgress,
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
        <svg
          aria-hidden="true"
          className="fk-goal-card__media-mask"
          fill="none"
          viewBox="0 0 71 72"
        >
          <path
            d="M71 16.0001L71 71.0001L16 71.0001L16 42.5001C16 27.8646 27.8645 16.0001 42.5 16.0001L71 16.0001Z"
            fill="currentColor"
          />
          <path
            d="M55.002 16C55.002 16 61.2238 16.6253 66.4798 10.4926C71.002 4.50037 71.002 0.0000078032 71.002 0.0000078032L71.002 16L55.002 16Z"
            fill="currentColor"
          />
          <path
            d="M0.00000000233295 70.9979C0.00000000233295 70.9979 6.22185 71.6231 11.4778 65.4904C16 59.4982 16 54.9979 16 54.9979L16 70.9979L0.00000000233295 70.9979Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div
        aria-label={`Fortschritt ${normalizedProgress} Prozent`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedProgress}
        className="fk-goal-card__progress"
        role="progressbar"
      >
        <svg aria-hidden="true" className="fk-goal-card__progress-ring" viewBox="0 0 48 48">
          <circle cx="24" cy="24" pathLength="100" r="18" />
        </svg>
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
                        <FokunaIcon
                          className="fk-goal-card__check"
                          name="check-small"
                          size={16}
                          stroke={2}
                        />
                      ) : null}
                    </span>
                    <div className="fk-goal-card__milestone-body">
                      <strong>{milestone.title}</strong>
                      {hasMetadata ? (
                        <span className="fk-goal-card__milestone-meta">
                          {milestone.subtasks ? (
                            <span>
                              <SubtaskIcon />
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
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="fk-goal-card__empty-milestones">
              <FokunaIcon aria-hidden="true" name="flag" size={24} />
              <strong>{emptyMilestoneLabel}</strong>
              {href ? (
                <span className="fk-goal-card__empty-action">{emptyMilestoneActionLabel}</span>
              ) : emptyMilestoneActionHref ? (
                <a className="fk-goal-card__empty-action" href={emptyMilestoneActionHref}>
                  {emptyMilestoneActionLabel}
                </a>
              ) : null}
            </div>
          )}

          {remainingMilestones ? (
            <p className="fk-goal-card__remaining">+ {remainingMilestones} weitere Meilensteine</p>
          ) : null}
        </div>
      </div>
    </Component>
  );
}
