"use client";

import React, { useEffect, useRef } from "react";

type PlacePick = {
  description: string;
  lat?: number;
  lon?: number;
};

type Props = {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onSelect?: (place: PlacePick) => void;
};

export default function GooglePlacesInput({
  value,
  placeholder,
  onChange,
  onSelect,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const compRef = useRef<
    | (HTMLElement & {
        value?: unknown;
        fields?: string[];
        addEventListener: (type: string, listener: EventListener) => void;
        removeEventListener: (type: string, listener: EventListener) => void;
        setAttribute: (name: string, value: string) => void;
      })
    | null
  >(null);
  const inputElRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    type MapsNs = { places?: unknown };
    type GoogleNs = { maps?: MapsNs };
    type GmpWindow = Window & { google?: GoogleNs; gmpx?: unknown };
    const w = window as unknown as GmpWindow;

    function ensureMapsAndComponentsLoaded(cb: () => void) {
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      // Reuse global singletons to avoid duplicate loads
      const g = window as unknown as Record<string, unknown> & {
        __mapsApiPromise?: Promise<void>;
        __gmpxLibPromise?: Promise<void>;
      };

      const needMaps = !(w.google && w.google.maps && w.google.maps.places);
      const needExt = !w.gmpx;

      const mapsSrc = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      const extSrc =
        "https://unpkg.com/@googlemaps/extended-component-library@0.6/dist/index.min.js";

      const ensureScript = (
        src: string,
        id: string,
        opts?: { typeModule?: boolean; readyCheck?: () => boolean }
      ): Promise<void> => {
        if (opts?.readyCheck && opts.readyCheck()) {
          console.log(`[Places] ${id} readyCheck -> ready`);
          return Promise.resolve();
        }
        const existingById = document.getElementById(
          id
        ) as HTMLScriptElement | null;
        if (existingById)
          return existingById.dataset.loaded === "1"
            ? Promise.resolve()
            : new Promise((res) =>
                existingById.addEventListener("load", () => {
                  console.log(`[Places] ${id} onload (existingById)`);
                  res();
                })
              );
        const existingBySrc = Array.from(
          document.getElementsByTagName("script")
        ).find((s) => s.src === src) as HTMLScriptElement | undefined;
        if (existingBySrc)
          return existingBySrc.dataset.loaded === "1"
            ? Promise.resolve()
            : new Promise((res) =>
                existingBySrc.addEventListener("load", () => {
                  console.log(`[Places] ${id} onload (existingBySrc)`);
                  res();
                })
              );
        return new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.id = id;
          script.src = src;
          script.async = true;
          if (opts?.typeModule) script.type = "module";
          script.onload = () => {
            script.dataset.loaded = "1";
            console.log(`[Places] ${id} injected and loaded`);
            resolve();
          };
          document.head.appendChild(script);
          console.log(`[Places] injecting ${id}: ${src}`);
        });
      };

      const extPromise = needExt
        ? (g.__gmpxLibPromise ||= ensureScript(extSrc, "gmaps-ext-lib", {
            typeModule: true,
            readyCheck: () => !!w.gmpx,
          }))
        : Promise.resolve();

      extPromise.then(() => {
        console.log("[Places] extended component library ready");
        // Use official loader element to load Maps JS
        if (!document.getElementById("gmpx-api-loader")) {
          const loader = document.createElement("gmpx-api-loader");
          loader.id = "gmpx-api-loader";
          if (key) loader.setAttribute("api-key", key);
          loader.setAttribute("libraries", "places");
          loader.setAttribute("solution-channel", "GMPES_autocomplete_element");
          document.body.appendChild(loader);
          console.log("[Places] appended <gmpx-api-loader>");
        }
        // Prefer the modern importLibrary flow instead of checking for google.maps.places
        const start = Date.now();
        const tick = () => {
          const gm = (window as any).google?.maps;
          if (gm?.importLibrary) {
            console.log("[Places] importLibrary detected – importing 'places'");
            gm.importLibrary("places")
              .then(() => {
                console.log("[Places] places library imported");
                cb();
              })
              .catch((e: unknown) => {
                console.warn("[Places] importLibrary('places') failed", e);
                cb();
              });
            return;
          }
          if (Date.now() - start > 10000) {
            console.warn(
              "[Places] timeout waiting for google.maps.importLibrary; injecting fallback"
            );
            const fid = "gmaps-js-fallback";
            if (!document.getElementById(fid)) {
              const s = document.createElement("script");
              s.id = fid;
              s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
                String(key || "")
              )}&v=weekly&libraries=places&loading=async`;
              s.async = true;
              s.onload = () => {
                console.log("[Places] fallback maps script loaded");
                cb();
              };
              document.head.appendChild(s);
            } else {
              cb();
            }
            return;
          }
          window.setTimeout(tick, 100);
        };
        tick();
      });
    }

    function initElement() {
      if (!hostRef.current) {
        console.warn("[Places] hostRef missing");
        return;
      }
      if (!compRef.current) {
        // Create the visible input first
        const input = document.createElement("input");
        const inputId = `gmpx-input-${Math.random().toString(36).slice(2, 9)}`;
        input.id = inputId;
        input.setAttribute("placeholder", placeholder || "City, Country");
        input.className = "input";
        input.autocomplete = "off";
        inputElRef.current = input;
        hostRef.current.appendChild(input);

        // Create the autocomplete element and link it to the input via `for`
        compRef.current = document.createElement(
          "gmpx-place-autocomplete"
        ) as unknown as HTMLElement & {
          value?: unknown;
          fields?: string[];
          addEventListener: (type: string, listener: EventListener) => void;
          removeEventListener: (type: string, listener: EventListener) => void;
          setAttribute: (name: string, value: string) => void;
        };
        compRef.current.setAttribute("for", inputId);
        hostRef.current.appendChild(compRef.current);
        console.log(
          "[Places] created gmpx-place-autocomplete and bound to:",
          inputId
        );
      }
      const el = compRef.current;
      if (!el) return;
      el.fields = ["formatted_address", "geometry"];
      // Sync input text with external value
      if (inputElRef.current && inputElRef.current.value !== value) {
        inputElRef.current.value = value;
      }
      const handler = () => {
        try {
          const place = el.value as
            | {
                formatted_address?: string;
                geometry?: {
                  location?: { lat?: () => number; lng?: () => number };
                };
              }
            | undefined;
          const desc: string = place?.formatted_address || "";
          const lat = place?.geometry?.location?.lat?.();
          const lon = place?.geometry?.location?.lng?.();
          console.log("[Places] gmpx-placechange", {
            desc,
            lat,
            lon,
            raw: place,
          });
          if (desc) onChange(desc);
          onSelect?.({ description: desc || value, lat, lon });
        } catch {}
      };
      el.addEventListener("gmpx-placechange", handler as EventListener);
      // Also bubble manual typing to parent state
      const inputHandler = () => {
        if (inputElRef.current) {
          const v = inputElRef.current.value;
          console.log("[Places] input event", v);
          onChange(v);
        }
      };
      inputElRef.current?.addEventListener("input", inputHandler);
      return () => {
        el.removeEventListener("gmpx-placechange", handler as EventListener);
        inputElRef.current?.removeEventListener("input", inputHandler);
      };
    }

    return ensureMapsAndComponentsLoaded(() => {
      const cleanup = initElement();
      if (cleanup) return cleanup;
    });
  }, [value, onChange, onSelect, placeholder]);

  return <div ref={hostRef} />;
}
