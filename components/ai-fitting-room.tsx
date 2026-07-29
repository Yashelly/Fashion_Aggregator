"use client";

import { Check, ImagePlus, LockKeyhole, RotateCcw, Shirt, Sparkles, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatCategoryLabel, type Locale } from "@/lib/i18n";

type FittingProduct = {
  id: string;
  title: string;
  category: string;
  imagePath: string;
  price: string;
  currency: string;
};

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedId, setSelectedId] = useState(initialProductId ?? products[0]?.id ?? "");
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const [fileError, setFileError] = useState("");

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
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setStatus("idle");
  }

  function clearPhoto() {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFileName("");
    setFileError("");
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  const selectedProduct = products.find((product) => product.id === selectedId);

  return (
    <div className="fitting-room">
      <section className="fitting-workspace">
        <div className="fitting-step">
          <span>01</span>
          <div><h2>{isLt ? "Įkelkite nuotrauką" : "Upload your photo"}</h2><p>{isLt ? "Geriausiai tinka visu ūgiu, neutraliame fone." : "A full-body photo against a simple background works best."}</p></div>
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

      <section className="fitting-products">
        <div className="fitting-step">
          <span>02</span>
          <div><h2>{isLt ? "Pasirinkite drabužį" : "Choose an item"}</h2><p>{isLt ? "Vienu metu galite matuotis vieną prekę." : "Try one item at a time."}</p></div>
        </div>
        <div className="fitting-product-list" role="radiogroup" aria-label={isLt ? "Drabužiai" : "Clothing"}>
          {products.map((product) => {
            const selected = selectedId === product.id;
            return (
              <button aria-checked={selected} className={selected ? "is-selected" : ""} key={product.id} onClick={() => { setSelectedId(product.id); setStatus("idle"); }} role="radio" type="button">
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
          <span>03</span>
          <div><h2>{isLt ? "Virtualus pasimatavimas" : "Virtual try-on"}</h2><p>{isLt ? "Patikrinkite pasirinkimą prieš tęsdami." : "Review your selection before continuing."}</p></div>
        </div>
        <div className="result-preview">
          {previewUrl && selectedProduct ? (
            <div className="selection-summary">
              <div className="selection-icons"><span><Check aria-hidden="true" /></span><span className="selection-line" /><span><Shirt aria-hidden="true" /></span></div>
              <strong>{selectedProduct.title}</strong>
              <p>{isLt ? "Nuotrauka ir prekė paruoštos." : "Photo and item are ready."}</p>
            </div>
          ) : (
            <div className="selection-summary is-empty"><Sparkles aria-hidden="true" size={34} /><strong>{isLt ? "Paruoškite abu žingsnius" : "Complete both steps"}</strong><p>{isLt ? "Įkelkite nuotrauką ir pasirinkite drabužį." : "Upload a photo and choose an item."}</p></div>
          )}
        </div>
        <button className="button fitting-generate" disabled={!previewUrl || !selectedProduct} onClick={() => setStatus("ready")} type="button"><Sparkles aria-hidden="true" size={17} />{isLt ? "Kurti pasimatavimą" : "Create try-on"}</button>
        {status === "ready" && (
          <div className="generation-status" role="status">
            <RotateCcw aria-hidden="true" />
            <div><strong>{isLt ? "Generavimas dar neprijungtas" : "Generation is not connected yet"}</strong><p>{isLt ? "Jūsų pasirinkimas paruoštas, tačiau ši versija nesiunčia nuotraukos į AI paslaugą ir nekuria rezultato." : "Your selection is ready, but this version does not send your photo to an AI service or generate an output."}</p></div>
          </div>
        )}
      </section>
      <style>{fittingStyles}</style>
    </div>
  );
}

const fittingStyles = `
.fitting-room{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(290px,.85fr);gap:20px;align-items:start}.fitting-workspace,.fitting-products,.fitting-result{border-top:2px solid var(--color-ink);padding-top:24px}.fitting-result{grid-column:1/-1;margin-top:34px}
.fitting-step{display:flex;gap:16px;align-items:flex-start;margin-bottom:24px}.fitting-step>span{font-family:var(--font-display);font-size:13px;color:var(--color-accent);padding-top:4px}.fitting-step h2{font-family:var(--font-display);font-size:clamp(24px,3vw,34px);line-height:1;margin:0}.fitting-step p{color:var(--color-ink-muted);font-size:13px;margin:8px 0 0}
.photo-dropzone{position:relative;display:grid;place-items:center;min-height:480px;background:var(--color-surface-soft);border:1px dashed var(--color-line);overflow:hidden}.photo-prompt{display:grid;justify-items:center;gap:10px;border:0;background:transparent;color:var(--color-ink);cursor:pointer;padding:30px}.photo-prompt>span{width:64px;height:64px;display:grid;place-items:center;background:var(--color-acid);color:var(--color-on-acid)}.photo-prompt strong{font-size:16px}.photo-prompt small{color:var(--color-ink-muted)}.photo-dropzone img{position:absolute;width:100%;height:100%;object-fit:contain}.remove-photo{position:absolute;right:12px;top:12px;width:44px;height:44px;display:grid;place-items:center;border:0;background:var(--color-ink);color:var(--color-canvas);cursor:pointer}.photo-file-name{position:absolute;bottom:12px;left:12px;max-width:calc(100% - 24px);padding:7px 10px;background:var(--color-ink);color:var(--color-canvas);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.replace-photo{display:flex;align-items:center;gap:8px;margin-top:10px;padding:10px 0;border:0;background:transparent;color:var(--color-ink);font-weight:600;cursor:pointer}.photo-error{color:var(--color-error);font-size:13px;margin:10px 0 0}
.privacy-note{display:flex;gap:13px;background:var(--color-surface);border-left:4px solid var(--color-acid);padding:18px 20px;margin-top:20px}.privacy-note svg{flex:0 0 auto}.privacy-note p{font-size:12px;color:var(--color-ink-muted);margin:4px 0 0}
.fitting-product-list{display:grid;gap:8px;max-height:610px;overflow:auto;padding-right:5px}.fitting-product-list>button{display:grid;grid-template-columns:76px 1fr 30px;gap:14px;align-items:center;text-align:left;border:1px solid var(--color-line);background:var(--color-surface);color:var(--color-ink);padding:9px;cursor:pointer}.fitting-product-list>button.is-selected{border:2px solid var(--color-ink);padding:8px}.fitting-product-image{position:relative;width:76px;height:92px;background:var(--color-surface-soft);overflow:hidden}.fitting-product-image img{object-fit:contain}.fitting-product-copy{min-width:0}.fitting-product-copy small,.fitting-product-copy strong,.fitting-product-copy>span{display:block}.fitting-product-copy small{color:var(--color-ink-muted);font-size:10px;text-transform:uppercase;letter-spacing:.06em}.fitting-product-copy strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:5px 0;font-size:13px}.fitting-product-copy>span{font-weight:600;font-size:12px}.product-check{width:26px;height:26px;display:grid;place-items:center;background:var(--color-ink);color:var(--color-canvas)}
.result-preview{min-height:190px;display:grid;place-items:center;background:var(--color-surface-soft);padding:28px}.selection-summary{text-align:center}.selection-icons{display:flex;align-items:center;justify-content:center;margin-bottom:18px}.selection-icons>span:not(.selection-line){width:48px;height:48px;display:grid;place-items:center;background:var(--color-ink);color:var(--color-canvas)}.selection-icons .selection-line{width:70px;border-top:1px dashed var(--color-ink)}.selection-summary p{color:var(--color-ink-muted);margin:7px 0 0}.selection-summary.is-empty svg{color:var(--color-accent);margin-bottom:13px}.selection-summary.is-empty strong{display:block}.fitting-generate{margin-top:16px;width:100%}.fitting-generate:disabled{opacity:.4;cursor:not-allowed}.generation-status{display:flex;gap:13px;border:1px solid var(--color-line);padding:18px;margin-top:12px}.generation-status svg{color:var(--color-accent);flex:0 0 auto}.generation-status p{color:var(--color-ink-muted);font-size:12px;margin:5px 0 0}
@media(max-width:800px){.fitting-room{grid-template-columns:1fr}.fitting-result{grid-column:auto}.photo-dropzone{min-height:420px}.fitting-product-list{max-height:480px}}
@media(max-width:520px){.photo-dropzone{min-height:380px}.fitting-product-list>button{grid-template-columns:64px 1fr 26px}.fitting-product-image{width:64px;height:82px}}
`;
