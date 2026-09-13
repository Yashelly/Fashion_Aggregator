"use client";

import { CircleAlert, ImagePlus, LockKeyhole, Ruler, Shirt, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format-price";
import { formatCategoryLabel, type Locale } from "@/lib/i18n";
import { getSecondaryCopy } from "@/lib/secondary-copy";

type FittingProduct = {
  id: string;
  title: string;
  category: string;
  color: string;
  imagePath: string;
  price: string;
  currency: string;
};

type Measurements = {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  inseam: number;
};

const measurementStorageKey = "weft-fitting-measurements";
const measurementDefaults: Measurements = {
  height: 170,
  chest: 92,
  waist: 78,
  hips: 98,
  shoulders: 42,
  inseam: 78,
};

const measurementRanges: Record<keyof Measurements, { min: number; max: number }> = {
  height: { min: 130, max: 220 },
  chest: { min: 55, max: 180 },
  waist: { min: 45, max: 180 },
  hips: { min: 55, max: 190 },
  shoulders: { min: 25, max: 75 },
  inseam: { min: 45, max: 125 },
};

function clampMeasurement(key: keyof Measurements, value: unknown) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const range = measurementRanges[key];
  if (!Number.isFinite(numericValue)) return measurementDefaults[key];
  return Math.min(range.max, Math.max(range.min, numericValue));
}

function sanitizeMeasurements(value: unknown): Measurements {
  if (!value || typeof value !== "object") return measurementDefaults;
  const record = value as Partial<Record<keyof Measurements, unknown>>;
  return Object.fromEntries(
    (Object.keys(measurementDefaults) as (keyof Measurements)[]).map((key) => [
      key,
      clampMeasurement(key, record[key]),
    ]),
  ) as Measurements;
}

const FittingRoomAvatar = dynamic(
  () => import("./fitting-room-avatar").then((module) => module.FittingRoomAvatar),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" className="avatar-placeholder"><Shirt size={34} /></div>,
  },
);

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function sampleSkinColor(imageUrl: string) {
  return new Promise<string | undefined>((resolve) => {
    const image = document.createElement("img");
    image.onload = () => {
      const scale = Math.min(48 / image.naturalWidth, 48 / image.naturalHeight, 1);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve(undefined);
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const totals = { red: 0, green: 0, blue: 0, count: 0 };
      const warmTotals = { red: 0, green: 0, blue: 0, count: 0 };

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];
        if (alpha < 128 || (red > 235 && green > 235 && blue > 235) || (red < 25 && green < 25 && blue < 25)) continue;
        totals.red += red;
        totals.green += green;
        totals.blue += blue;
        totals.count += 1;
        if (red > 70 && red > blue * 1.08 && red >= green * 0.92 && green > blue * 0.8) {
          warmTotals.red += red;
          warmTotals.green += green;
          warmTotals.blue += blue;
          warmTotals.count += 1;
        }
      }

      const selected = warmTotals.count >= 12 ? warmTotals : totals;
      if (!selected.count) {
        resolve(undefined);
        return;
      }
      resolve(`#${toHex(selected.red / selected.count)}${toHex(selected.green / selected.count)}${toHex(selected.blue / selected.count)}`);
    };
    image.onerror = () => resolve(undefined);
    image.src = imageUrl;
  });
}

function sampleDominantColor(imageUrl: string) {
  return new Promise<string | undefined>((resolve) => {
    const image = document.createElement("img");
    image.onload = () => {
      try {
        const scale = Math.min(64 / image.naturalWidth, 64 / image.naturalHeight, 1);
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve(undefined);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        const pixels = context.getImageData(0, 0, width, height).data;
        type ColorBucket = { red: number; green: number; blue: number; count: number; saturation: number };
        const buckets = new Map<string, ColorBucket>();

        for (let index = 0; index < pixels.length; index += 4) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const maximum = Math.max(red, green, blue);
          const minimum = Math.min(red, green, blue);
          const chroma = maximum - minimum;
          if (alpha < 128 || (maximum > 224 && chroma < 24) || (red > 242 && green > 242 && blue > 242)) continue;

          const key = `${red >> 5}-${green >> 5}-${blue >> 5}`;
          const bucket = buckets.get(key) ?? { red: 0, green: 0, blue: 0, count: 0, saturation: 0 };
          bucket.red += red;
          bucket.green += green;
          bucket.blue += blue;
          bucket.count += 1;
          bucket.saturation += maximum ? chroma / maximum : 0;
          buckets.set(key, bucket);
        }

        let selected: ColorBucket | undefined;
        let selectedScore = -1;
        let mostCommon = 0;
        buckets.forEach((bucket) => {
          mostCommon = Math.max(mostCommon, bucket.count);
        });
        // Pick the most present *saturated* colour, not the most present colour
        // overall — the studio background (cream/grey) covers more pixels than
        // the garment, so a plain count would return the backdrop. Near-neutral
        // buckets are skipped; if nothing is saturated enough (a genuinely white/
        // grey/black garment) we return undefined and let the catalog colour map
        // decide, which is the correct fallback.
        buckets.forEach((bucket) => {
          if (bucket.count < mostCommon * 0.12) return;
          const averageSaturation = bucket.saturation / bucket.count;
          if (averageSaturation < 0.16) return;
          const score = bucket.count * averageSaturation;
          if (score > selectedScore) {
            selected = bucket;
            selectedScore = score;
          }
        });

        if (!selected?.count) {
          resolve(undefined);
          return;
        }
        resolve(`#${toHex(selected.red / selected.count)}${toHex(selected.green / selected.count)}${toHex(selected.blue / selected.count)}`);
      } catch {
        resolve(undefined);
      }
    };
    image.onerror = () => resolve(undefined);
    image.src = imageUrl;
  });
}

export function AiFittingRoom({
  initialProductId,
  locale,
  products,
}: {
  initialProductId?: string;
  locale: Locale;
  products: FittingProduct[];
}) {
  const secondaryCopy = getSecondaryCopy(locale);
  const copy = secondaryCopy.fitting;
  const isLt = locale === "lt";
  const inputRef = useRef<HTMLInputElement>(null);
  const photoSampleRef = useRef(0);
  const garmentSampleRef = useRef(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedId, setSelectedId] = useState(initialProductId ?? products[0]?.id ?? "");
  const [fileError, setFileError] = useState("");
  const [measurements, setMeasurements] = useState(measurementDefaults);
  const [skinColor, setSkinColor] = useState<string>();
  const [garmentColorSample, setGarmentColorSample] = useState<{ color?: string; imagePath: string }>();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(measurementStorageKey);
      if (stored) setMeasurements(sanitizeMeasurements(JSON.parse(stored)));
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function chooseFile(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFileError(copy.invalidType);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError(copy.tooLarge);
      return;
    }
    setFileError("");
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return objectUrl;
    });
    setFileName(file.name);
    const sampleId = photoSampleRef.current + 1;
    photoSampleRef.current = sampleId;
    void sampleSkinColor(objectUrl).then((color) => {
      if (photoSampleRef.current === sampleId) setSkinColor(color);
    });
  }

  function clearPhoto() {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFileName("");
    setFileError("");
    setSkinColor(undefined);
    photoSampleRef.current += 1;
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateMeasurement(key: keyof Measurements, value: number) {
    if (!Number.isFinite(value)) return;
    setMeasurements((current) => {
      const next = { ...current, [key]: clampMeasurement(key, value) };
      try {
        window.localStorage.setItem(measurementStorageKey, JSON.stringify(next));
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
      return next;
    });
  }

  const selectedProduct = products.find((product) => product.id === selectedId);
  const garment = useMemo(() => selectedProduct ? {
    category: selectedProduct.category,
    color: selectedProduct.color,
    title: selectedProduct.title,
  } : null, [selectedProduct]);
  const garmentColor = garmentColorSample && garmentColorSample.imagePath === selectedProduct?.imagePath
    ? garmentColorSample.color
    : undefined;

  useEffect(() => {
    const sampleId = garmentSampleRef.current + 1;
    garmentSampleRef.current = sampleId;
    setGarmentColorSample(undefined);
    if (!selectedProduct?.imagePath) return;
    const imagePath = selectedProduct.imagePath;
    let cancelled = false;
    void sampleDominantColor(imagePath).then((color) => {
      if (!cancelled && garmentSampleRef.current === sampleId) setGarmentColorSample({ color, imagePath });
    });
    return () => {
      cancelled = true;
    };
  }, [selectedProduct?.imagePath]);

  return (
    <div className="fitting-room">
      <section className="fitting-workspace">
        <div className="fitting-step">
          <span>01</span>
          <div><h2>{copy.photoTitle}</h2><p>{copy.photoLead}</p></div>
        </div>

        <div className={`photo-dropzone${previewUrl ? " has-photo" : ""}`}>
          {previewUrl ? (
            <>
              {/* User-selected blob URLs cannot use next/image. */}
              <img alt={copy.uploadedPhoto} src={previewUrl} />
              <button aria-label={copy.removePhoto} className="remove-photo" onClick={clearPhoto} type="button"><X aria-hidden="true" /></button>
              <span className="photo-file-name">{fileName}</span>
            </>
          ) : (
            <button className="photo-prompt" onClick={() => inputRef.current?.click()} type="button">
              <span><ImagePlus aria-hidden="true" size={32} /></span>
              <strong>{copy.choosePhoto}</strong>
              <small>{copy.fileTypes}</small>
            </button>
          )}
          <input accept="image/jpeg,image/png,image/webp" aria-label={copy.choosePhoto} className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} ref={inputRef} type="file" />
        </div>
        {fileError ? <p className="photo-error" role="alert">{fileError}</p> : null}
        {previewUrl && <button className="replace-photo" onClick={() => inputRef.current?.click()} type="button"><Upload aria-hidden="true" size={16} />{copy.replacePhoto}</button>}

        <div className="privacy-note">
          <LockKeyhole aria-hidden="true" />
          <div><strong>{copy.localTitle}</strong><p>{copy.localLead}</p></div>
        </div>
      </section>

      <section className="fitting-measurements">
        <div className="fitting-step">
          <span>02</span>
          <div><h2>{copy.measurementsTitle}</h2><p>{copy.measurementsLead}</p></div>
        </div>
        <div className="measurement-fields">
          <label><span>{copy.height}</span><input max="220" min="130" onChange={(event) => updateMeasurement("height", event.target.valueAsNumber)} type="number" value={measurements.height} /></label>
          <label><span>{copy.chest}</span><input max="180" min="55" onChange={(event) => updateMeasurement("chest", event.target.valueAsNumber)} type="number" value={measurements.chest} /></label>
          <label><span>{copy.waist}</span><input max="180" min="45" onChange={(event) => updateMeasurement("waist", event.target.valueAsNumber)} type="number" value={measurements.waist} /></label>
          <label><span>{copy.hips}</span><input max="190" min="55" onChange={(event) => updateMeasurement("hips", event.target.valueAsNumber)} type="number" value={measurements.hips} /></label>
          <label><span>{copy.shoulders}</span><input max="75" min="25" onChange={(event) => updateMeasurement("shoulders", event.target.valueAsNumber)} type="number" value={measurements.shoulders} /></label>
          <label><span>{copy.inseam}</span><input max="125" min="45" onChange={(event) => updateMeasurement("inseam", event.target.valueAsNumber)} type="number" value={measurements.inseam} /></label>
        </div>
        <p className="measurement-note"><Ruler aria-hidden="true" size={16} />{copy.measurementsStored}</p>
      </section>

      <section className="fitting-products">
        <div className="fitting-step">
          <span>03</span>
          <div><h2>{copy.itemTitle}</h2><p>{copy.itemLead}</p></div>
        </div>
        {products.length ? (
          <fieldset className="fitting-product-list">
            <legend className="sr-only">{copy.clothing}</legend>
            {products.map((product) => (
              <label className="fitting-product-option" key={product.id}>
                <input checked={selectedId === product.id} name="fitting-product" onChange={() => setSelectedId(product.id)} type="radio" value={product.id} />
                <span className="fitting-product-image"><ProductImage alt={product.title} sizes="(max-width: 32.5em) 4rem, 7.125rem" src={product.imagePath} unavailableLabel={secondaryCopy.stores.imageUnavailable} /></span>
                <span className="fitting-product-copy"><small>{formatCategoryLabel(product.category, locale)}</small><strong>{product.title}</strong><span>{formatPrice(product.price, product.currency, locale)}</span></span>
                <span aria-hidden="true" className="product-check" />
              </label>
            ))}
          </fieldset>
        ) : <p className="fitting-empty">{copy.noItems}</p>}
      </section>

      <section className="fitting-result">
        <div className="fitting-step">
          <span>04</span>
          <div><h2>{copy.previewTitle}</h2><p>{copy.previewLead}</p></div>
        </div>
        <div className="result-preview">
          <FittingRoomAvatar garment={garment} garmentColor={garmentColor} isLt={isLt} measurements={measurements} skinColor={skinColor} />
        </div>
        <p className="fitting-disclaimer"><CircleAlert aria-hidden="true" size={17} />{copy.disclaimer}</p>
      </section>
      <style>{fittingStyles}</style>
    </div>
  );
}

const fittingStyles = `
.fitting-room{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(18.125rem,.85fr);gap:1.25rem;align-items:start}.fitting-workspace,.fitting-measurements,.fitting-products,.fitting-result{border-top:2px solid var(--color-ink);padding-top:1.5rem}.fitting-workspace{grid-row:span 2}.fitting-result{grid-column:1/-1;margin-top:2.125rem}
.fitting-step{display:flex;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.fitting-step>span{font-family:var(--font-display);font-size:0.8125rem;color:var(--color-accent);padding-top:0.25rem}.fitting-step h2{font-family:var(--font-display);font-size:clamp(1.5rem,3vw,2.125rem);line-height:1;margin:0}.fitting-step p{color:var(--color-ink-muted);font-size:0.8125rem;margin:0.5rem 0 0}
.photo-dropzone{position:relative;display:grid;place-items:center;min-height:30rem;background:var(--color-surface-soft);border:1px dashed var(--color-line);overflow:hidden}.photo-prompt{display:grid;justify-items:center;gap:0.625rem;border:0;background:transparent;color:var(--color-ink);cursor:pointer;padding:1.875rem}.photo-prompt>span{width:4rem;height:4rem;display:grid;place-items:center;background:var(--color-acid);color:var(--color-on-acid)}.photo-prompt strong{font-size:1rem}.photo-prompt small{color:var(--color-ink-muted)}.photo-dropzone img{position:absolute;width:100%;height:100%;object-fit:contain}.remove-photo{position:absolute;right:0.75rem;top:0.75rem;width:2.75rem;height:2.75rem;display:grid;place-items:center;border:0;background:var(--color-ink);color:var(--color-canvas);cursor:pointer}.photo-file-name{position:absolute;bottom:0.75rem;left:0.75rem;max-width:calc(100% - 1.5rem);padding:0.4375rem 0.625rem;background:var(--color-ink);color:var(--color-canvas);font-size:0.6875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.replace-photo{display:flex;align-items:center;gap:0.5rem;margin-top:0.625rem;padding:0.625rem 0;border:0;background:transparent;color:var(--color-ink);font-weight:600;cursor:pointer}.photo-error{color:var(--color-error);font-size:0.8125rem;margin:0.625rem 0 0}
.privacy-note{display:flex;gap:0.8125rem;background:var(--color-surface);border-left:0.25rem solid var(--color-acid);padding:1.125rem 1.25rem;margin-top:1.25rem}.privacy-note svg{flex:0 0 auto}.privacy-note p{font-size:0.75rem;color:var(--color-ink-muted);margin:0.25rem 0 0}
.measurement-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.875rem}.measurement-fields label{display:grid;gap:0.4375rem}.measurement-fields label>span{font-size:0.75rem;font-weight:600}.measurement-fields input{width:100%;min-height:3rem;border:1px solid var(--color-line);background:var(--color-canvas);color:var(--color-ink);padding:0.625rem 0.75rem;font:inherit;border-radius:0}.measurement-note{display:flex;align-items:center;gap:0.5rem;color:var(--color-ink-muted);font-size:0.75rem;margin:1rem 0 0}.measurement-note svg{color:var(--color-accent);flex:0 0 auto}
.fitting-product-list{border:0;display:grid;gap:0.5rem;margin:0;max-height:22.5rem;overflow:auto;padding:0 0.3125rem 0 0}.fitting-product-option{position:relative;display:grid;grid-template-columns:4.75rem 1fr 1.875rem;gap:0.875rem;align-items:center;text-align:left;border:1px solid var(--color-line);background:var(--color-surface);color:var(--color-ink);padding:0.5625rem;cursor:pointer}.fitting-product-option:has(input:checked){border:2px solid var(--color-ink);padding:0.5rem}.fitting-product-option:focus-within{outline:0.1875rem solid var(--color-focus,var(--color-accent));outline-offset:2px}.fitting-product-option>input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.fitting-product-image{position:relative;width:4.75rem;height:5.75rem;background:var(--color-surface-soft);overflow:hidden}.fitting-product-image img{object-fit:contain}.fitting-product-copy{min-width:0}.fitting-product-copy small,.fitting-product-copy strong,.fitting-product-copy>span{display:block}.fitting-product-copy small{color:var(--color-ink-muted);font-size:0.6875rem}.fitting-product-copy strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0.3125rem 0;font-size:0.8125rem}.fitting-product-copy>span{font-weight:600;font-size:0.75rem}.product-check{width:1.625rem;height:1.625rem;border:1px solid var(--color-line);border-radius:50%;display:grid;place-items:center;background:var(--color-surface);color:var(--color-canvas)}.fitting-product-option:has(input:checked) .product-check{border:0.4375rem solid var(--color-ink)}.fitting-empty{color:var(--color-ink-muted);margin:0}
.result-preview{min-height:28.75rem;background:var(--color-surface-soft)}.avatar-placeholder{min-height:28.75rem;display:grid;place-items:center;border:1px solid var(--color-line);background:var(--color-surface-soft);color:var(--color-accent)}.fitting-disclaimer{display:flex;align-items:flex-start;gap:0.5625rem;color:var(--color-ink-muted);font-size:0.75rem;margin:0.875rem 0 0}.fitting-disclaimer svg{color:var(--color-accent);flex:0 0 auto}
@media(max-width:50em){.fitting-room{grid-template-columns:1fr}.fitting-workspace{grid-row:auto}.fitting-result{grid-column:auto}.photo-dropzone{min-height:26.25rem}.fitting-product-list{max-height:30rem}}
@media(max-width:32.5em){.photo-dropzone,.result-preview,.avatar-placeholder{min-height:23.75rem}.measurement-fields{grid-template-columns:1fr}.fitting-product-option{grid-template-columns:4rem 1fr 1.625rem}.fitting-product-image{width:4rem;height:5.125rem}}
`;
