"use client";

import { Check, ImagePlus, LockKeyhole, Ruler, Sparkles, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCategoryLabel, type Locale } from "@/lib/i18n";

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

const FittingRoomAvatar = dynamic(
  () => import("./fitting-room-avatar").then((module) => module.FittingRoomAvatar),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" className="avatar-placeholder"><Sparkles size={34} /></div>,
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
      if (stored) setMeasurements({ ...measurementDefaults, ...(JSON.parse(stored) as Partial<Measurements>) });
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
      setFileError(isLt ? "Pasirinkite JPG, PNG arba WEBP failą." : "Choose a JPG, PNG, or WEBP file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError(isLt ? "Nuotrauka turi būti mažesnė nei 10 MB." : "The photo must be smaller than 10 MB.");
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
      const next = { ...current, [key]: value };
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
          <div><h2>{isLt ? "Įkelkite nuotrauką" : "Upload your photo"}</h2><p>{isLt ? "Nebūtina — nuotrauka naudojama tik manekeno odos atspalviui apytiksliai nustatyti." : "Optional — the photo is only used to approximate the mannequin skin tone."}</p></div>
        </div>

        <div className={`photo-dropzone${previewUrl ? " has-photo" : ""}`}>
          {previewUrl ? (
            <>
              {/* User-selected blob URLs cannot use next/image. */}
              <img alt={isLt ? "Įkeltos nuotraukos peržiūra" : "Uploaded photo preview"} src={previewUrl} />
              <button aria-label={isLt ? "Pašalinti nuotrauką" : "Remove photo"} className="remove-photo" onClick={clearPhoto} type="button"><X aria-hidden="true" /></button>
              <span className="photo-file-name">{fileName}</span>
            </>
          ) : (
            <button className="photo-prompt" onClick={() => inputRef.current?.click()} type="button">
              <span><ImagePlus aria-hidden="true" size={32} /></span>
              <strong>{isLt ? "Pasirinkti nuotrauką" : "Choose a photo"}</strong>
              <small>JPG, PNG, WEBP · max 10 MB</small>
            </button>
          )}
          <input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} ref={inputRef} type="file" />
        </div>
        {fileError ? <p className="photo-error" role="alert">{fileError}</p> : null}
        {previewUrl && <button className="replace-photo" onClick={() => inputRef.current?.click()} type="button"><Upload aria-hidden="true" size={16} />{isLt ? "Pakeisti nuotrauką" : "Replace photo"}</button>}

        <div className="privacy-note">
          <LockKeyhole aria-hidden="true" />
          <div><strong>{isLt ? "Privatu pagal nutylėjimą" : "Private by default"}</strong><p>{isLt ? "Šiame prototipe nuotrauka lieka jūsų įrenginyje ir nėra siunčiama į serverį." : "In this prototype, your photo remains on your device and is not sent to a server."}</p></div>
        </div>
      </section>

      <section className="fitting-measurements">
        <div className="fitting-step">
          <span>02</span>
          <div><h2>{isLt ? "Pridėkite išmatavimus" : "Add measurements"}</h2><p>{isLt ? "Išmatavimai centimetrais formuoja 3D manekeno proporcijas." : "Measurements in centimetres shape the 3D mannequin proportions."}</p></div>
        </div>
        <div className="measurement-fields">
          <label><span>{isLt ? "Ūgis (cm)" : "Height (cm)"}</span><input max="220" min="130" onChange={(event) => updateMeasurement("height", event.target.valueAsNumber)} type="number" value={measurements.height} /></label>
          <label><span>{isLt ? "Krūtinė (cm)" : "Chest (cm)"}</span><input max="180" min="55" onChange={(event) => updateMeasurement("chest", event.target.valueAsNumber)} type="number" value={measurements.chest} /></label>
          <label><span>{isLt ? "Liemuo (cm)" : "Waist (cm)"}</span><input max="180" min="45" onChange={(event) => updateMeasurement("waist", event.target.valueAsNumber)} type="number" value={measurements.waist} /></label>
          <label><span>{isLt ? "Klubai (cm)" : "Hips (cm)"}</span><input max="190" min="55" onChange={(event) => updateMeasurement("hips", event.target.valueAsNumber)} type="number" value={measurements.hips} /></label>
          <label><span>{isLt ? "Pečiai (cm)" : "Shoulders (cm)"}</span><input max="75" min="25" onChange={(event) => updateMeasurement("shoulders", event.target.valueAsNumber)} type="number" value={measurements.shoulders} /></label>
          <label><span>{isLt ? "Vidinė kojos siūlė (cm)" : "Inseam (cm)"}</span><input max="125" min="45" onChange={(event) => updateMeasurement("inseam", event.target.valueAsNumber)} type="number" value={measurements.inseam} /></label>
        </div>
        <p className="measurement-note"><Ruler aria-hidden="true" size={16} />{isLt ? "Išmatavimai saugomi tik šioje naršyklėje." : "Measurements are saved in this browser only."}</p>
      </section>

      <section className="fitting-products">
        <div className="fitting-step">
          <span>03</span>
          <div><h2>{isLt ? "Pasirinkite drabužį" : "Choose an item"}</h2><p>{isLt ? "Vienu metu galite matuotis vieną prekę." : "Try one item at a time."}</p></div>
        </div>
        <div className="fitting-product-list" role="radiogroup" aria-label={isLt ? "Drabužiai" : "Clothing"}>
          {products.map((product) => {
            const selected = selectedId === product.id;
            return (
              <button aria-checked={selected} className={selected ? "is-selected" : ""} key={product.id} onClick={() => setSelectedId(product.id)} role="radio" type="button">
                <span className="fitting-product-image"><Image alt="" fill sizes="96px" src={product.imagePath} /></span>
                <span className="fitting-product-copy"><small>{formatCategoryLabel(product.category, locale)}</small><strong>{product.title}</strong><span>{new Intl.NumberFormat(isLt ? "lt-LT" : "en-IE", { style: "currency", currency: product.currency }).format(Number(product.price))}</span></span>
                <span className="product-check">{selected ? <Check aria-hidden="true" size={16} /> : null}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="fitting-result">
        <div className="fitting-step">
          <span>04</span>
          <div><h2>{isLt ? "3D pasimatavimo peržiūra" : "3D fitting preview"}</h2><p>{isLt ? "Pasukite manekeną ir apžiūrėkite apytikslę drabužio formą." : "Rotate the mannequin to inspect the approximate garment shape."}</p></div>
        </div>
        <div className="result-preview">
          <FittingRoomAvatar garment={garment} garmentColor={garmentColor} isLt={isLt} measurements={measurements} skinColor={skinColor} />
        </div>
        <p className="fitting-disclaimer"><Sparkles aria-hidden="true" size={17} />{isLt ? "Tai sintetinė, apytikslė 3D peržiūra — ne fotorealistinis rezultatas ir ne dydžio garantija." : "This is a synthetic, approximate 3D preview — not a photorealistic result or a fit guarantee."}</p>
      </section>
      <style>{fittingStyles}</style>
    </div>
  );
}

const fittingStyles = `
.fitting-room{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(290px,.85fr);gap:20px;align-items:start}.fitting-workspace,.fitting-measurements,.fitting-products,.fitting-result{border-top:2px solid var(--color-ink);padding-top:24px}.fitting-workspace{grid-row:span 2}.fitting-result{grid-column:1/-1;margin-top:34px}
.fitting-step{display:flex;gap:16px;align-items:flex-start;margin-bottom:24px}.fitting-step>span{font-family:var(--font-display);font-size:13px;color:var(--color-accent);padding-top:4px}.fitting-step h2{font-family:var(--font-display);font-size:clamp(24px,3vw,34px);line-height:1;margin:0}.fitting-step p{color:var(--color-ink-muted);font-size:13px;margin:8px 0 0}
.photo-dropzone{position:relative;display:grid;place-items:center;min-height:480px;background:var(--color-surface-soft);border:1px dashed var(--color-line);overflow:hidden}.photo-prompt{display:grid;justify-items:center;gap:10px;border:0;background:transparent;color:var(--color-ink);cursor:pointer;padding:30px}.photo-prompt>span{width:64px;height:64px;display:grid;place-items:center;background:var(--color-acid);color:var(--color-on-acid)}.photo-prompt strong{font-size:16px}.photo-prompt small{color:var(--color-ink-muted)}.photo-dropzone img{position:absolute;width:100%;height:100%;object-fit:contain}.remove-photo{position:absolute;right:12px;top:12px;width:44px;height:44px;display:grid;place-items:center;border:0;background:var(--color-ink);color:var(--color-canvas);cursor:pointer}.photo-file-name{position:absolute;bottom:12px;left:12px;max-width:calc(100% - 24px);padding:7px 10px;background:var(--color-ink);color:var(--color-canvas);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.replace-photo{display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 0;border:0;background:transparent;color:var(--color-ink);font-weight:600;cursor:pointer}.photo-error{color:var(--color-error);font-size:13px;margin:10px 0 0}
.privacy-note{display:flex;gap:13px;background:var(--color-surface);border-left:4px solid var(--color-acid);padding:18px 20px;margin-top:20px}.privacy-note svg{flex:0 0 auto}.privacy-note p{font-size:12px;color:var(--color-ink-muted);margin:4px 0 0}
.measurement-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.measurement-fields label{display:grid;gap:7px}.measurement-fields label>span{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}.measurement-fields input{width:100%;min-height:48px;border:1px solid var(--color-line);background:var(--color-canvas);color:var(--color-ink);padding:10px 12px;font:inherit;border-radius:0}.measurement-note{display:flex;align-items:center;gap:8px;color:var(--color-ink-muted);font-size:12px;margin:16px 0 0}.measurement-note svg{color:var(--color-accent);flex:0 0 auto}
.fitting-product-list{display:grid;gap:8px;max-height:360px;overflow:auto;padding-right:5px}.fitting-product-list>button{display:grid;grid-template-columns:76px 1fr 30px;gap:14px;align-items:center;text-align:left;border:1px solid var(--color-line);background:var(--color-surface);color:var(--color-ink);padding:9px;cursor:pointer}.fitting-product-list>button.is-selected{border:2px solid var(--color-ink);padding:8px}.fitting-product-image{position:relative;width:76px;height:92px;background:var(--color-surface-soft);overflow:hidden}.fitting-product-image img{object-fit:contain}.fitting-product-copy{min-width:0}.fitting-product-copy small,.fitting-product-copy strong,.fitting-product-copy>span{display:block}.fitting-product-copy small{color:var(--color-ink-muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em}.fitting-product-copy strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px 0;font-size:13px}.fitting-product-copy>span{font-weight:600;font-size:12px}.product-check{width:26px;height:26px;display:grid;place-items:center;background:var(--color-ink);color:var(--color-canvas)}
.result-preview{min-height:460px;background:var(--color-surface-soft)}.avatar-placeholder{min-height:460px;display:grid;place-items:center;border:1px solid var(--color-line);background:var(--color-surface-soft);color:var(--color-accent)}.fitting-disclaimer{display:flex;align-items:flex-start;gap:9px;color:var(--color-ink-muted);font-size:12px;margin:14px 0 0}.fitting-disclaimer svg{color:var(--color-accent);flex:0 0 auto}
@media(max-width:800px){.fitting-room{grid-template-columns:1fr}.fitting-workspace{grid-row:auto}.fitting-result{grid-column:auto}.photo-dropzone{min-height:420px}.fitting-product-list{max-height:480px}}
@media(max-width:520px){.photo-dropzone,.result-preview,.avatar-placeholder{min-height:380px}.measurement-fields{grid-template-columns:1fr}.fitting-product-list>button{grid-template-columns:64px 1fr 26px}.fitting-product-image{width:64px;height:82px}}
`;
