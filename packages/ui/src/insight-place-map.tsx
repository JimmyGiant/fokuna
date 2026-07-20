"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

import { cn } from "./utils";

/** Carto Positron without labels — soft, high-key basemap close to the Figma media mock. */
const PLACE_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const PLACE_TILE_ATTRIBUTION = "&copy; OpenStreetMap &copy; CARTO";

export interface InsightPlaceMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  /** When false (default), the map is decorative: no pan, zoom, or keyboard. */
  interactive?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function InsightPlaceMap({
  latitude,
  longitude,
  zoom = 13,
  interactive = false,
  className,
  "aria-label": ariaLabel,
}: InsightPlaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const viewRef = useRef({ interactive, latitude, longitude, zoom });

  useEffect(() => {
    viewRef.current = { interactive, latitude, longitude, zoom };
  }, [interactive, latitude, longitude, zoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let frame = 0;

    void import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const view = viewRef.current;
      const L = leaflet.default ?? leaflet;
      const map = L.map(containerRef.current, {
        center: [view.latitude, view.longitude],
        zoom: view.zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: view.interactive,
        touchZoom: view.interactive,
        doubleClickZoom: view.interactive,
        scrollWheelZoom: view.interactive,
        boxZoom: view.interactive,
        keyboard: view.interactive,
      });

      L.tileLayer(PLACE_TILE_URL, {
        attribution: PLACE_TILE_ATTRIBUTION,
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      frame = window.requestAnimationFrame(() => {
        mapRef.current?.invalidateSize({ animate: false });
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.setView([latitude, longitude], zoom, { animate: false });
  }, [latitude, longitude, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handlers = [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.scrollWheelZoom,
      map.boxZoom,
      map.keyboard,
    ] as const;

    for (const handler of handlers) {
      if (interactive) handler.enable();
      else handler.disable();
    }
  }, [interactive]);

  return (
    <div className={cn("fk-insight-place__media", className)} data-interactive={interactive}>
      <div
        ref={containerRef}
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
        className="fk-insight-place__map"
        role={ariaLabel ? "img" : undefined}
      />
      <div aria-hidden="true" className="fk-insight-place__marker">
        <span className="fk-insight-place__pin" />
        {ariaLabel ? <span className="fk-insight-place__pin-label">{ariaLabel}</span> : null}
      </div>
      <span aria-hidden="true" className="fk-insight-place__credit">
        © OpenStreetMap · CARTO
      </span>
    </div>
  );
}
