"use client";

import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CircleUserRound,
  Euro,
  History,
  LockKeyhole,
  Palette,
  Ruler,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Profile = {
  name: string;
  email: string;
  style: string[];
  topSize: string;
  bottomSize: string;
  shoeSize: string;
  budget: string;
  saleAlerts: boolean;
  priceAlerts: boolean;
  // Detailed body measurements (cm). Opt-in via the checkbox in the Sizes card;
  // captured now, used for size filtering once product cm ranges are wired in.
  detailedSizes: boolean;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
};

const storageKey = "weft-account-preferences";
const defaults: Profile = {
  name: "",
  email: "",
  style: ["Minimal"],
  topSize: "M",
  bottomSize: "M",
  shoeSize: "39",
  budget: "150",
  saleAlerts: true,
  priceAlerts: false,
  detailedSizes: false,
  chest: "",
  waist: "",
  hips: "",
  inseam: "",
};

// EU shoe sizes in half steps — half sizes are common here (42.5 is a real
// size), so a whole-number list left those shoppers unable to pick their own.
const shoeSizes = Array.from({ length: 21 }, (_, i) => (36 + i * 0.5).toString());

export function AccountDashboard({ locale }: { locale: Locale }) {
  const isLt = locale === "lt";
  const [profile, setProfile] = useState(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setProfile({ ...defaults, ...(JSON.parse(stored) as Partial<Profile>) });
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setSaved(false);
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function save() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function toggleStyle(style: string) {
    update(
      "style",
      profile.style.includes(style)
        ? profile.style.filter((item) => item !== style)
        : [...profile.style, style],
    );
  }

  // A broad, everyday set. "Romantic" was pulled — a niche aesthetic next to
  // wardrobe staples most shoppers actually pick from; "Casual" and "Elegant"
  // cover far more of the catalog.
  const styles = isLt
    ? ["Minimal", "Kasdienis", "Gatvės", "Klasikinis", "Elegantiškas", "Sportinis"]
    : ["Minimal", "Casual", "Streetwear", "Classic", "Elegant", "Sporty"];

  return (
    <div className="account-layout">
      <aside className="account-summary">
        <div className="account-avatar"><CircleUserRound aria-hidden="true" size={34} /></div>
        <p className="account-overline">{isLt ? "MANO PROFILIS" : "MY PROFILE"}</p>
        <h2>{profile.name || (isLt ? "Jūsų profilis" : "Your profile")}</h2>
        <p>{profile.email || (isLt ? "El. paštas nepridėtas" : "No email added")}</p>
        <div className="account-summary-rule" />
        <p className="account-privacy"><LockKeyhole aria-hidden="true" size={16} />{isLt ? "Duomenys saugomi tik šioje naršyklėje." : "Data stays in this browser only."}</p>
      </aside>

      <div className="account-content">
        <section className="account-card">
          <div className="account-card-title"><CircleUserRound aria-hidden="true" /><div><h2>{isLt ? "Profilis" : "Profile"}</h2><p>{isLt ? "Pagrindinė informacija" : "Basic information"}</p></div></div>
          <div className="account-fields two-column">
            <label><span>{isLt ? "Vardas" : "Name"}</span><input value={profile.name} onChange={(event) => update("name", event.target.value)} placeholder={isLt ? "Jūsų vardas" : "Your name"} /></label>
            <label><span>{isLt ? "El. paštas" : "Email"}</span><input type="email" value={profile.email} onChange={(event) => update("email", event.target.value)} placeholder="name@example.com" /></label>
          </div>
        </section>

        <section className="account-card">
          <div className="account-card-title"><Palette aria-hidden="true" /><div><h2>{isLt ? "Stiliaus kryptys" : "Style preferences"}</h2><p>{isLt ? "Pasirinkite vieną ar kelias" : "Choose one or more"}</p></div></div>
          <div className="preference-chips">
            {styles.map((style) => <button aria-pressed={profile.style.includes(style)} className={profile.style.includes(style) ? "is-selected" : ""} key={style} onClick={() => toggleStyle(style)} type="button">{profile.style.includes(style) && <Check aria-hidden="true" size={14} />}{style}</button>)}
          </div>
          {/* Free-text style entry — the idea is good but not wired up yet, so it
              ships visibly disabled with a SOON badge rather than pretending to work. */}
          <label className="preference-custom">
            <span className="preference-custom-label">{isLt ? "Savas stilius" : "Your own style"}<span className="soon-badge">SOON</span></span>
            <input disabled placeholder={isLt ? "Netrukus galėsite įrašyti savo" : "Soon you'll be able to type your own"} />
          </label>
        </section>

        <div className="account-card-grid">
          <section className="account-card">
            <div className="account-card-title"><Ruler aria-hidden="true" /><div><h2>{isLt ? "Dydžiai" : "Sizes"}</h2><p>{isLt ? "Greitesniam filtravimui" : "For faster filtering"}</p></div></div>
            <div className="account-fields size-fields">
              <label><span>{isLt ? "Viršus" : "Top"}</span><select value={profile.topSize} onChange={(event) => update("topSize", event.target.value)}>{["XS", "S", "M", "L", "XL"].map((size) => <option key={size}>{size}</option>)}</select></label>
              <label><span>{isLt ? "Apačia" : "Bottom"}</span><select value={profile.bottomSize} onChange={(event) => update("bottomSize", event.target.value)}>{["XS", "S", "M", "L", "XL"].map((size) => <option key={size}>{size}</option>)}</select></label>
              <label><span>{isLt ? "Avalynė" : "Shoes"}</span><select value={profile.shoeSize} onChange={(event) => update("shoeSize", event.target.value)}>{shoeSizes.map((size) => <option key={size}>{size}</option>)}</select></label>
            </div>
            {/* Products carry both a letter size (S/M/L) and a cm range, so a
                shopper who knows their measurements can be matched more precisely.
                Opt-in — the panel only appears once the box is ticked. */}
            <label className="detailed-toggle">
              <input checked={profile.detailedSizes} onChange={(event) => update("detailedSizes", event.target.checked)} type="checkbox" />
              <span>{isLt ? "Įvesti tikslias kūno merkes (cm)" : "Enter exact body measurements (cm)"}</span>
            </label>
            {profile.detailedSizes && (
              <div className="account-fields measure-fields">
                <label><span>{isLt ? "Krūtinė" : "Chest"}</span><input inputMode="numeric" placeholder="cm" value={profile.chest} onChange={(event) => update("chest", event.target.value)} /></label>
                <label><span>{isLt ? "Juosmuo" : "Waist"}</span><input inputMode="numeric" placeholder="cm" value={profile.waist} onChange={(event) => update("waist", event.target.value)} /></label>
                <label><span>{isLt ? "Klubai" : "Hips"}</span><input inputMode="numeric" placeholder="cm" value={profile.hips} onChange={(event) => update("hips", event.target.value)} /></label>
                <label><span>{isLt ? "Vidinė kojos" : "Inseam"}</span><input inputMode="numeric" placeholder="cm" value={profile.inseam} onChange={(event) => update("inseam", event.target.value)} /></label>
                <p className="account-hint measure-hint">{isLt ? "Netrukus filtruosime prekes pagal šias merkes." : "We'll soon filter products against these measurements."}</p>
              </div>
            )}
          </section>
          <section className="account-card">
            <div className="account-card-title"><Euro aria-hidden="true" /><div><h2>{isLt ? "Biudžetas" : "Budget"}</h2><p>{isLt ? "Vienai prekei" : "Per item"}</p></div></div>
            <label className="budget-field"><span>€</span><input min="0" step="10" type="number" value={profile.budget} onChange={(event) => update("budget", event.target.value)} /></label>
            <p className="account-hint">{isLt ? "Naudosime kaip numatytąjį kainos filtrą." : "Used as your default price filter."}</p>
          </section>
        </div>

        <div className="account-card-grid">
          <section className="account-card account-link-card">
            <Bookmark aria-hidden="true" /><div><h2>{isLt ? "Išsaugotos prekės" : "Saved items"}</h2><p>{isLt ? "Kol kas nieko neišsaugojote." : "You have not saved anything yet."}</p></div><Link href={isLt ? "/search?lang=lt" : "/search"} aria-label={isLt ? "Naršyti prekes" : "Browse products"}><ChevronRight aria-hidden="true" /></Link>
          </section>
          <section className="account-card account-link-card">
            <History aria-hidden="true" /><div><h2>{isLt ? "Naujausios paieškos" : "Recent searches"}</h2><p>{isLt ? "Paieškos istorija šioje naršyklėje tuščia." : "Search history in this browser is empty."}</p></div><Link href={isLt ? "/search?lang=lt" : "/search"} aria-label={isLt ? "Atidaryti paiešką" : "Open search"}><ChevronRight aria-hidden="true" /></Link>
          </section>
        </div>

        <section className="account-card">
          <div className="account-card-title"><Settings2 aria-hidden="true" /><div><h2>{isLt ? "Pranešimų nustatymai" : "Notification settings"}</h2><p>{isLt ? "Šie pasirinkimai bus paruošti būsimoms funkcijoms." : "These preferences are ready for future features."}</p></div></div>
          <label className="account-toggle"><span><Bell aria-hidden="true" size={18} /><span><strong>{isLt ? "Išpardavimų priminimai" : "Sale reminders"}</strong><small>{isLt ? "Pranešti apie mėgstamų kategorijų akcijas" : "Updates for preferred categories"}</small></span></span><input checked={profile.saleAlerts} onChange={(event) => update("saleAlerts", event.target.checked)} type="checkbox" /></label>
          <label className="account-toggle"><span><Euro aria-hidden="true" size={18} /><span><strong>{isLt ? "Kainos pokyčiai" : "Price changes"}</strong><small>{isLt ? "Pranešti, kai išsaugotos prekės atpinga" : "Updates when saved items get cheaper"}</small></span></span><input checked={profile.priceAlerts} onChange={(event) => update("priceAlerts", event.target.checked)} type="checkbox" /></label>
        </section>

        <div className="account-actions">
          <button className="button" onClick={save} type="button">{saved ? <Check aria-hidden="true" size={17} /> : null}{saved ? (isLt ? "Išsaugota" : "Saved") : (isLt ? "Išsaugoti nustatymus" : "Save preferences")}</button>
          <p>{isLt ? "Prisijungimas nereikalingas." : "No sign-in required."}</p>
        </div>
      </div>
      <style>{accountStyles}</style>
    </div>
  );
}

const accountStyles = `
.account-layout{display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr);gap:clamp(28px,5vw,72px);align-items:start}
.account-summary{position:sticky;top:110px;border-top:2px solid var(--color-ink);padding-top:24px}
.account-avatar{width:64px;height:64px;display:grid;place-items:center;background:var(--color-acid);color:var(--color-on-acid);margin-bottom:22px}
.account-overline{font-size:10px;font-weight:600;letter-spacing:.12em;color:var(--color-ink-muted);margin:0 0 8px}
.account-summary h2,.account-card h2{font-family:var(--font-display);margin:0;line-height:1.05}.account-summary h2{font-size:28px}.account-summary>p:not(.account-overline):not(.account-privacy){color:var(--color-ink-muted);overflow-wrap:anywhere}
.account-summary-rule{border-top:1px solid var(--color-line);margin:28px 0 18px}.account-privacy{display:flex;gap:9px;align-items:flex-start;font-size:12px;color:var(--color-ink-muted)}
.account-content{display:grid;gap:18px}.account-card{border:1px solid var(--color-line);background:var(--color-surface);padding:clamp(20px,3vw,30px)}
.account-card-title{display:flex;gap:14px;align-items:flex-start;margin-bottom:24px}.account-card-title>svg{color:var(--color-accent);flex:0 0 auto}.account-card-title h2{font-size:24px}.account-card-title p,.account-link-card p{margin:5px 0 0;color:var(--color-ink-muted);font-size:13px}
.account-fields{display:grid;gap:16px}.account-fields.two-column{grid-template-columns:repeat(2,minmax(0,1fr))}.account-fields.size-fields{grid-template-columns:repeat(3,minmax(0,1fr))}
.account-fields label,.budget-field{display:grid;gap:7px}.account-fields label>span{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.account-fields input,.account-fields select,.budget-field input{width:100%;min-height:48px;border:1px solid var(--color-line);background:var(--color-canvas);color:var(--color-ink);padding:10px 12px;font:inherit;border-radius:0}
.preference-chips{display:flex;flex-wrap:wrap;gap:9px}.preference-chips button{display:flex;align-items:center;gap:6px;min-height:42px;padding:8px 14px;border:1px solid var(--color-line);background:transparent;color:var(--color-ink);cursor:pointer}.preference-chips button.is-selected{background:var(--color-ink);border-color:var(--color-ink);color:var(--color-canvas)}
.preference-custom{display:grid;gap:7px;margin-top:18px}.preference-custom-label{display:flex;align-items:center;gap:9px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.soon-badge{display:inline-flex;align-items:center;font-size:9px;font-weight:700;letter-spacing:.1em;padding:3px 7px;background:var(--color-acid);color:var(--color-on-acid)}
.preference-custom input{width:100%;min-height:48px;border:1px dashed var(--color-line);background:var(--color-canvas);color:var(--color-ink);padding:10px 12px;font:inherit;border-radius:0;cursor:not-allowed;opacity:.6}
.detailed-toggle{display:flex;gap:11px;align-items:center;margin-top:20px;cursor:pointer;font-size:13px}.detailed-toggle input{width:18px;height:18px;accent-color:var(--color-accent);flex:0 0 auto}
.account-fields.measure-fields{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:16px}.measure-hint{grid-column:1/-1}
.account-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.budget-field{position:relative}.budget-field span{position:absolute;left:14px;top:14px;font-weight:600}.budget-field input{padding-left:34px}.account-hint{font-size:12px;color:var(--color-ink-muted);margin:10px 0 0}
.account-link-card{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start}.account-link-card>svg{color:var(--color-accent)}.account-link-card a{display:grid;place-items:center;min-width:44px;min-height:44px;border:1px solid var(--color-line)}
.account-toggle{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:16px 0;border-top:1px solid var(--color-line)}.account-toggle>span{display:flex;gap:12px;align-items:flex-start}.account-toggle strong,.account-toggle small{display:block}.account-toggle small{color:var(--color-ink-muted);margin-top:4px}.account-toggle input{width:20px;height:20px;accent-color:var(--color-accent)}
.account-actions{display:flex;align-items:center;gap:18px;justify-content:flex-end;padding-top:8px}.account-actions p{font-size:12px;color:var(--color-ink-muted)}
@media(max-width:800px){.account-layout{grid-template-columns:1fr}.account-summary{position:static}.account-card-grid{grid-template-columns:1fr}}
@media(max-width:560px){.account-fields.two-column,.account-fields.size-fields{grid-template-columns:1fr}.account-fields.measure-fields{grid-template-columns:repeat(2,minmax(0,1fr))}.account-actions{align-items:stretch;flex-direction:column-reverse}.account-actions .button{width:100%}}
`;
