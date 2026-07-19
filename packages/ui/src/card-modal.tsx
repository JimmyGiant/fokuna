"use client";

import { FokunaIcon } from "@fokuna/icons";
import { Dialog } from "radix-ui";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: "none" | "micro" | "subtle" | "medium" | "highlight";
}

export function Card({ elevated = "subtle", className, ...props }: CardProps) {
  return <div {...props} className={cn("fk-card", className)} data-elevation={elevated} />;
}

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
}: ModalProps) {
  return (
    <Dialog.Root defaultOpen={defaultOpen} onOpenChange={onOpenChange} open={open}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fk-modal__overlay" />
        <Dialog.Content className="fk-modal" data-size={size}>
          <header className="fk-modal__header">
            <span className="fk-modal__heading">
              {icon}
              <span>
                <Dialog.Title className="fk-modal__title">{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className="fk-modal__description">
                    {description}
                  </Dialog.Description>
                ) : null}
              </span>
            </span>
            <Dialog.Close aria-label="Dialog schließen" className="fk-modal__close">
              <FokunaIcon name="close" />
            </Dialog.Close>
          </header>
          <div className="fk-modal__body">{children}</div>
          {footer ? <footer className="fk-modal__footer">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
