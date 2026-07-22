import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import { ToastProvider, ToastSpecimen, useToast } from "./toast";

function Trigger({ onAction }: { onAction?: () => void }) {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({
          title: "Nach „Arbeit“ verschoben",
          action: onAction
            ? {
                label: "Rückgängig",
                altText: "Verschieben rückgängig machen",
                onClick: onAction,
              }
            : undefined,
        })
      }
    >
      Zeigen
    </Button>
  );
}

describe("Toast", () => {
  it("renders a notification with optional undo action", () => {
    const onAction = vi.fn();

    render(
      <ToastProvider>
        <Trigger onAction={onAction} />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zeigen" }));

    expect(screen.getByText("Nach „Arbeit“ verschoben")).toBeInTheDocument();
    const undo = screen.getByRole("button", { name: "Rückgängig" });
    expect(undo).toHaveAttribute("data-type", "icon-text-inline");
    expect(undo.querySelector("svg")).toBeTruthy();

    fireEvent.click(undo);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("exposes a static specimen chrome for the Pattern Library", () => {
    render(<ToastSpecimen title="Aufgabe verschoben" />);
    expect(screen.getByText("Aufgabe verschoben")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rückgängig" })).toHaveAttribute(
      "data-type",
      "icon-text-inline",
    );
  });
});
