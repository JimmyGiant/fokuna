import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  InsightActivityCard,
  InsightCard,
  InsightDeadlineContent,
  InsightMetricContent,
  InsightPlaceCard,
  InsightProgressRing,
} from "./insight-card";

describe("InsightCard", () => {
  it("renders header content inside the card shell", () => {
    const { container } = render(
      <InsightCard icon="calendar" size="sm" subtitle="noch 23 Tage" title="Zeitpunkt">
        <InsightDeadlineContent day="28." month="Juli" year="2026" />
      </InsightCard>,
    );

    expect(container.querySelector(".fk-insight-card")).toHaveAttribute("data-size", "sm");
    expect(screen.getByText("Zeitpunkt")).toBeInTheDocument();
    expect(screen.getByText("noch 23 Tage")).toBeInTheDocument();
    expect(screen.getByText("28.")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("renders metric values", () => {
    render(
      <InsightCard size="sm" subtitle="Aktuell" title="Aufgaben">
        <InsightMetricContent value={47} />
      </InsightCard>,
    );

    expect(screen.getByText("47")).toBeInTheDocument();
  });

  it("renders the place card map shell with OSM credit", () => {
    const { container } = render(
      <InsightPlaceCard latitude={52.52} longitude={13.405} mapLabel="Berlin" />,
    );

    expect(container.querySelector(".fk-insight-place__map")).toBeInTheDocument();
    expect(screen.getByText("© OpenStreetMap · CARTO")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Berlin" })).toBeInTheDocument();
  });

  it("animates progress ring via CSS variable", () => {
    const { container } = render(<InsightProgressRing value={79} />);
    expect(container.querySelector(".fk-insight-ring")).toHaveStyle("--fk-insight-ring-offset: 21");
  });

  it("opens the threshold picker and updates the activity threshold", () => {
    const onThresholdChange = vi.fn();

    const { container } = render(
      <InsightActivityCard
        defaultThreshold={4}
        onThresholdChange={onThresholdChange}
        weeks={[
          { label: "KW 21", value: 4 },
          { label: "KW 22", value: 2 },
        ]}
      />,
    );

    expect(container.querySelector(".fk-insight-activity")).toHaveStyle(
      "--fk-insight-threshold-offset: 99px",
    );

    fireEvent.click(screen.getByRole("button", { name: "Schwellenwert festlegen" }));
    fireEvent.click(screen.getByRole("option", { name: "2" }));

    expect(onThresholdChange).toHaveBeenCalledWith(2);
  });

  it("scales segments and keeps the threshold inside the plot when the goal rises", () => {
    const { container, rerender } = render(
      <InsightActivityCard
        threshold={2}
        weeks={[
          { label: "KW 21", value: 2 },
          { label: "KW 22", value: 1 },
        ]}
      />,
    );

    const activity = () => container.querySelector(".fk-insight-activity");
    expect(activity()).toHaveStyle("--fk-insight-segment-height: 49px");
    expect(activity()).toHaveStyle("--fk-insight-threshold-offset: 99px");

    rerender(
      <InsightActivityCard
        threshold={8}
        weeks={[
          { label: "KW 21", value: 2 },
          { label: "KW 22", value: 1 },
        ]}
      />,
    );

    expect(activity()).toHaveStyle("--fk-insight-segment-height: 11px");
    expect(activity()).toHaveStyle("--fk-insight-threshold-offset: 95px");
  });
  it("hides threshold controls when disabled", () => {
    render(
      <InsightActivityCard showThresholdControl={false} weeks={[{ label: "KW 21", value: 3 }]} />,
    );

    expect(screen.queryByRole("button", { name: "Schwellenwert festlegen" })).not.toBeInTheDocument();
  });
});
