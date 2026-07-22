"use client";

import { type IconName } from "@fokuna/icons";
import { Toast as ToastPrimitive } from "radix-ui";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { Button } from "./button";
import { cn } from "./utils";

const DEFAULT_DURATION_MS = 6000;
const MAX_TOASTS = 3;
const EXIT_MS = 200;

export interface ToastActionOptions {
  label: string;
  /** Short screen-reader alternative describing the action. */
  altText: string;
  onClick: () => void;
  /** Defaults to `arrow-undo-down` for undo-style actions. */
  leadingIcon?: ReactNode | IconName;
}

export interface ToastOptions {
  /** Stable id replaces an existing toast with the same id. */
  id?: string;
  title: string;
  action?: ToastActionOptions;
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: string;
  open: boolean;
}

export interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss duration in ms. */
  duration?: number;
  label?: string;
}

const ToastActionButton = forwardRef<
  HTMLButtonElement,
  {
    label: string;
    leadingIcon?: ReactNode | IconName;
  } & ComponentPropsWithoutRef<"button">
>(function ToastActionButton({ label, leadingIcon, ...props }, ref) {
  return (
    <Button
      {...props}
      buttonType="icon-text-inline"
      intent="secondary"
      leadingIcon={leadingIcon ?? "arrow-undo-down"}
      ref={ref}
      size="sm"
      trailingIcon={null}
      type="button"
    >
      {label}
    </Button>
  );
});

export function ToastProvider({
  children,
  duration = DEFAULT_DURATION_MS,
  label = "Benachrichtigung",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id?: string) => {
    setToasts((prev) =>
      prev.map((entry) =>
        id === undefined || entry.id === id ? { ...entry, open: false } : entry,
      ),
    );
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = options.id ?? createToastId();
    setToasts((prev) => {
      const nextEntry: ToastRecord = { ...options, id, open: true };
      const withoutSame = prev.filter((entry) => entry.id !== id);
      const next = [...withoutSame, nextEntry];
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
    return id;
  }, []);

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (open) {
      setToasts((prev) => prev.map((entry) => (entry.id === id ? { ...entry, open: true } : entry)));
      return;
    }
    setToasts((prev) => prev.map((entry) => (entry.id === id ? { ...entry, open: false } : entry)));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((entry) => entry.id !== id || entry.open));
    }, EXIT_MS);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider duration={duration} label={label} swipeDirection="down">
        {children}
        {toasts.map((entry) => (
          <ToastPrimitive.Root
            className="fk-toast"
            duration={entry.duration}
            key={entry.id}
            onOpenChange={(open) => handleOpenChange(entry.id, open)}
            open={entry.open}
          >
            <div className="fk-toast__content">
              <ToastPrimitive.Title className="fk-toast__title">{entry.title}</ToastPrimitive.Title>
            </div>
            {entry.action ? (
              <ToastPrimitive.Action asChild altText={entry.action.altText}>
                <ToastActionButton
                  label={entry.action.label}
                  leadingIcon={entry.action.leadingIcon}
                  onClick={entry.action.onClick}
                />
              </ToastPrimitive.Action>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          className="fk-toast-viewport"
          label="Benachrichtigungen ({hotkey})"
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

/** Static single-line chrome for Pattern Library specimens. */
export function ToastSpecimen({
  title,
  actionLabel = "Rückgängig",
  className,
}: {
  title: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("fk-toast", className)} data-state="open" role="presentation">
      <div className="fk-toast__content">
        <p className="fk-toast__title">{title}</p>
      </div>
      <ToastActionButton label={actionLabel} />
    </div>
  );
}
