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

/**
 * Google Places Input component for location autocomplete functionality.
 *
 * This component initializes Google Maps Places API and creates an input field for users to type in locations. It handles loading the necessary scripts, creating the input and autocomplete elements, and managing events for place selection and input changes. The component also synchronizes the input value with the selected place and triggers the appropriate callbacks.
 *
 * @param value - The current value of the input field.
 * @param placeholder - The placeholder text for the input field.
 * @param onChange - Callback function triggered when the input value changes.
 * @param onSelect - Callback function triggered when a place is selected.
 */
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

    /**
     * Ensures that the Google Maps and extended component libraries are loaded before executing a callback.
     *
     * This function checks if the necessary Google Maps libraries are already loaded and, if not, dynamically loads them.
     * It manages script loading by reusing existing scripts or creating new ones, and handles the loading of the extended component library if required.
     * The function also implements a fallback mechanism to load the Maps JavaScript API if the importLibrary method is not available within a specified timeout.
     *
     * @param cb - A callback function to be executed once the libraries are loaded.
     */
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

      /**
       * Ensures that a script is loaded and ready for use.
       *
       * The function first checks if a readyCheck function is provided and if it returns true. If so, it resolves immediately.
       * It then checks for an existing script element by ID or source, resolving if already loaded.
       * If not found, it creates a new script element, sets its attributes, and appends it to the document head, resolving once loaded.
       *
       * @param src - The source URL of the script to be loaded.
       * @param id - The unique identifier for the script element.
       * @param opts - Optional parameters including typeModule to specify module type and readyCheck for a readiness check.
       * @returns A promise that resolves when the script is loaded.
       */
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
        /**
         * Handles the loading of the Google Maps Places library.
         *
         * The function checks if the Google Maps library is available and attempts to import the 'places' library.
         * If the import fails or times out after 10 seconds, it injects a fallback script to load the library.
         * The callback function `cb` is called upon successful import or fallback loading.
         *
         * @param cb - A callback function to be executed after the library is loaded or on failure.
         */
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

    /**
     * Initializes the input element and the associated autocomplete component.
     *
     * This function checks for the existence of hostRef and compRef, creating an input element and an autocomplete component if they are missing. It sets up event listeners for place changes and input events, synchronizing the input value with external data. The function also handles cleanup of event listeners when the component is unmounted.
     *
     * @param placeholder - The placeholder text for the input element.
     * @param value - The initial value to set for the input element.
     * @param onChange - Callback function to handle changes in the input value.
     * @param onSelect - Optional callback function to handle selection of a place.
     */
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
      /**
       * Handles the processing of place information from an input element.
       *
       * The function retrieves the formatted address, latitude, and longitude from the input element's value. It logs the details to the console and invokes the onChange and onSelect callbacks if applicable. The function is wrapped in a try-catch block to handle potential errors gracefully without throwing exceptions.
       *
       * @param el - The input element containing place information.
       * @param onChange - A callback function to be called with the formatted address if it exists.
       * @param onSelect - An optional callback function to be called with the place details.
       */
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
      /**
       * Handles input events by logging the current value and invoking onChange.
       */
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
