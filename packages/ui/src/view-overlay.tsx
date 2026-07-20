"use client";

import { FokunaIcon, type IconName } from "@fokuna/icons";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

import { cn } from "./utils";

export interface ViewOverlayProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  icon?: IconName | ReactNode;
  children: ReactNode;
  footerStart?: ReactNode;
  footerEnd?: ReactNode;
  closeLabel?: string;
  contentClassName?: string;
}

function renderHeaderIcon(icon: IconName | ReactNode | undefined) {
  if (!icon) return null;
  if (typeof icon === "string") {
    return <FokunaIcon name={icon as IconName} size={24} stroke={1.5} />;
  }
  return icon;
}

export function ViewOverlay({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  icon,
  children,
  footerStart,
  footerEnd,
  closeLabel = "Overlay schließen",
  contentClassName,
}: ViewOverlayProps) {
  const showFooter = Boolean(footerStart || footerEnd);

  return (
    <Dialog.Root defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fk-view-overlay__scrim" />
        <Dialog.Content className="fk-view-overlay" aria-describedby={undefined}>
          <header className="fk-view-overlay__header">
            <div className="fk-view-overlay__heading">
              {icon ? (
                <span aria-hidden="true" className="fk-view-overlay__icon">
                  {renderHeaderIcon(icon)}
                </span>
              ) : null}
              <Dialog.Title className="fk-view-overlay__title">{title}</Dialog.Title>
            </div>
            <Dialog.Close aria-label={closeLabel} className="fk-view-overlay__close">
              <FokunaIcon name="close" size={24} stroke={1.5} />
            </Dialog.Close>
          </header>

          <div className={cn("fk-view-overlay__body", contentClassName)}>{children}</div>

          {showFooter ? (
            <footer className="fk-view-overlay__footer">
              <div className="fk-view-overlay__footer-start">{footerStart}</div>
              <div className="fk-view-overlay__footer-end">{footerEnd}</div>
            </footer>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
