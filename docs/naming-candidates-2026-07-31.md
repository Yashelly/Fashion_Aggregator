# Brand Name Candidates — replacing "VIBEWEAR"

**Prepared:** 2026-07-31 (all availability lookups performed same-day, timestamps below)
**Status:** Decision artifact only. No code or other files were changed to produce this document. The owner picks; this document does not rank or recommend a winner.

## Why the current name is being replaced

Per `.omc/specs/deep-interview-vibewear-strategic-vision.md` (§3, §5): "VIBEWEAR" is confirmed non-final by the owner — too many fashion startups already use generic `-wear`/`-vibe`/`-style` compounds. The candidates below deliberately avoid that pattern and instead try to encode one of the product's four real differentiators:

1. **Semantic/visual search** — "hoodie with stars" matches by visual/conceptual content, not literal text.
2. **Cross-brand aggregation** — one place instead of visiting every brand's own site.
3. **Cross-store price/size comparison** for the same item.
4. **AI virtual fitting room** — positioned as not yet available in Lithuania.

Market is Lithuania now, so every candidate is also checked for EN/LT pronunciation and unfortunate-meaning risk.

## Confidence note — what was and wasn't verifiable

- **.com availability is fully verified for all 8 candidates** via direct RDAP queries to `https://rdap.verisign.com/com/v1/domain/<name>.com`, with raw HTTP status and (for registered names) the parsed `ldhName`/nameserver fields recorded below. A `404` with `Content-Type: application/rdap+json` and an empty body is Verisign's standard "no registration record" response (available); a `200` with a JSON body containing matching `ldhName` and live nameservers is registered. Confirmed via both `curl -w "%{http_code}"` and verbose (`-v`) header inspection.
- **.lt availability is fully verified for all 8 candidates**, but not via RDAP: IANA's RDAP bootstrap (`https://rdap.iana.org/domain/<name>.lt`) has no delegated RDAP server for `.lt` and returns a blanket `404 {"errorCode":404,"title":"Not Found","description":["Domain not found :","<name>.lt"]}` for *every* `.lt` query regardless of actual registration status — this was tested and confirmed unusable as evidence (see raw output note in the per-candidate table). Instead, **authoritative WHOIS was queried directly against the Lithuanian ccTLD registry** at `whois.domreg.lt:43` (raw TCP, port 43, the standard WHOIS protocol) for every candidate, and the literal `Status:` line (`registered` or `available`) plus registration/expiry dates were recorded. This is a stronger source than RDAP would have been.
- **Social handles (Instagram) were checked by directly fetching the bare-handle profile URL** (`instagram.com/<name>/`) and inspecting the rendered page for a username/follower count (exists) vs. a stripped/logo-only shell (does not exist / not resolvable this way). This worked for 7 of 8 candidates with a clear signal; one (`drabuva`) returned an ambiguous stripped page — documented as such below, not asserted either way.
- **TikTok could not be verified for any candidate.** `tiktok.com/@<name>` is client-side rendered behind a "Please wait..." interstitial for automated fetches — every attempt returned that loading shell with no account data and no explicit not-found message. This is recorded as a bot-blocked/unverifiable outcome per candidate, not silently omitted.
- Trademark/company-registry conflicts were **not** checked (out of scope for this pass) — a genuine gap worth a follow-up before final commitment on whichever name is picked.

---

## Candidates

### 1. Aptik

**Rationale:** From Lithuanian *aptikti* ("to detect, come across, spot") — ties to the **semantic/visual search** differentiator (finding things by recognizing them, not just matching keywords). Bonus: phonetically close to English "optic," which reads as a visual-search cue to English speakers too. Pronunciation ("AP-tik") is easy and near-identical in both languages; no known negative meanings in either.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/aptik.com` | `HTTP 200`; `ldhName: "APTIK.COM"`; nameservers `NS43/NS44.DOMAINCONTROL.COM` (GoDaddy) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `aptik.lt` | `Domain: aptik.lt` / `Status: registered` / `Registered: 2024-03-19` / `Expires: 2028-03-20` / Registrar: HOSTINGER operations, UAB → **REGISTERED** |
| Instagram | Fetched `instagram.com/aptik/` | Existing profile, private: "2 followers," "23 following" → **TAKEN** (small/inactive account) |
| TikTok | Fetched `tiktok.com/@aptik` | Returned "Please wait..." JS loading interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 2. Rasta

**Rationale:** From Lithuanian *rasta* ("found" — past participle of *rasti*, to find) — directly names the **search/discovery** outcome. Risk flag: in English, "Rasta" reads overwhelmingly as "Rastafarian," an unrelated and culturally loaded association that would likely confuse or misfire for an EN-facing fashion brand, despite the clean Lithuanian meaning.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/rasta.com` | `HTTP 200`; `ldhName: "RASTA.COM"` with live nameserver records → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `rasta.lt` | `Domain: rasta.lt` / `Status: registered` / `Registered: 2021-03-02` / `Expires: 2027-03-03` / Registrant contact: UAB Bartus pro → **REGISTERED** |
| Instagram | Fetched `instagram.com/rasta/` | Existing active profile: bio "Love ❤️‍🔥🗝️," 761 followers, 136 following, visible posts → **TAKEN** |
| TikTok | Fetched `tiktok.com/@rasta` (same method as above) | Not individually re-queried; TikTok's loading-wall behavior was confirmed bot-blocked across every candidate tested — treated as **UNVERIFIABLE (bot-blocked)** by the same evidenced method |

---

### 3. Lygina

**Rationale:** From Lithuanian *lygina* (present tense of *lyginti*, "to compare") — directly names the **cross-store price/size comparison** differentiator. To English speakers it reads as an invented word ("lih-GHEE-nah"); no confirmed negative meaning, but it has a faint surface resemblance to "lying" if clipped/mispronounced — worth a native-speaker gut-check before committing.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/lygina.com` | `HTTP 404`, `Content-Type: application/rdap+json`, empty body → **AVAILABLE** |
| .lt | `whois.domreg.lt:43` query `lygina.lt` | `Domain: lygina.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/lygina/` | Existing profile: "Вероника Лыгина," 9 followers, 1 following → **TAKEN** (bare handle only; very low activity, a variant like `@lygina.app` is plausible but unchecked) |
| TikTok | Fetched `tiktok.com/@lygina` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 4. Pritaik

**Rationale:** From Lithuanian *pritaik(yti)* ("to fit, adapt, tailor to") — directly names the **AI Fitting Room** differentiator ("fit it to you"). Weakest cross-language legibility in this set: the "pr-" consonant cluster and unclear stress pattern read awkwardly to non-Lithuanian speakers.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/pritaik.com` | `HTTP 404`, `Content-Type: application/rdap+json`, empty body → **AVAILABLE** |
| .lt | `whois.domreg.lt:43` query `pritaik.lt` | `Domain: pritaik.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/pritaik/` | Existing profile: 1 follower, 207 following → **TAKEN** (very low-activity account) |
| TikTok | Fetched `tiktok.com/@pritaik` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 5. Kompara

**Rationale:** Invented word built on the shared Latin/Romance/Esperanto root for "compare" (*comparare* / *kompari*), which also reads intuitively to Lithuanian speakers (cf. *komparatyvas*, comparative). Ties to the **cross-store comparison** differentiator without requiring translation for either audience. No known negative meaning in EN or LT.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/kompara.com` | `HTTP 200`; `ldhName: "KOMPARA.COM"` present with registered nameservers → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `kompara.lt` | `Domain: kompara.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/kompara/` | Existing profile, private: 245 followers, 353 following → **TAKEN** |
| TikTok | Fetched `tiktok.com/@kompara` | "Please wait..." interstitial pattern (same as other candidates) → **UNVERIFIABLE (bot-blocked)** |

---

### 6. Sema

**Rationale:** Short for "semantic" — directly names the **semantic/visual search** differentiator, reads as modern/tech-forward in both languages, short and easy to say ("SEH-mah"). Caveat: "Sema" is also a common given name/word in several unrelated languages (Turkish, Indonesian, Arabic-derived), so it's a short, crowded string — worth a trademark check before committing even though no negative meaning surfaced.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/sema.com` | `HTTP 200`; `ldhName: "SEMA.COM"` present with registered nameservers → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `sema.lt` | `Domain: sema.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/sema/` | Existing profile: "Thetree Dalziel," 26 followers, 4 following, 2 posts → **TAKEN** |
| TikTok | Fetched `tiktok.com/@sema` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 7. Drabuva

**Rationale:** Invented from Lithuanian *drabužiai* ("clothes/garments") — doesn't encode one specific differentiator, but reads unambiguously as clothing-related in Lithuanian while sounding like a distinctive, brandable place-name to English ears (no negative meaning found in either language). Loosely supports the **cross-brand aggregation** idea ("the one place for clothes") more than the search/comparison/fitting mechanics. Weakest direct differentiator tie in this set — included as the "safe, on-topic, unclaimed" option.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/drabuva.com` | `HTTP 404`, `Content-Type: application/rdap+json`, empty body (confirmed via verbose `-v` header trace) → **AVAILABLE** |
| .lt | `whois.domreg.lt:43` query `drabuva.lt` | `Domain: drabuva.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/drabuva/` | Returned a stripped page (Instagram logo only, page title "Instagram," no username/follower/bio data) — this pattern differs from every other candidate above, all of which returned real profile data. Consistent with a non-existent account, but no explicit "Sorry, this page isn't available" text was captured, so recorded as **INCONCLUSIVE, LEANS AVAILABLE** rather than asserted |
| TikTok | Fetched `tiktok.com/@drabuva` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 8. Vilnia

**Rationale:** Real name of a river running through Vilnius — a strong, distinctive Lithuania-market identity marker (the market is Lithuania now, per the spec). Does **not** map to any of the four functional differentiators directly; included as a location-identity wildcard rather than a differentiator-coded name. Easy to pronounce in both EN/LT, no negative meaning found; the soft Lithuanian "li" may land slightly differently for non-LT speakers but isn't a hard stop.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/vilnia.com` | `HTTP 200`; `ldhName: "VILNIA.COM"` present with registered nameservers (nsone.net, second-ns.com, your-server.de) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `vilnia.lt` | `Domain: vilnia.lt` / `Status: registered` / `Registered: 2023-08-28` / `Expires: 2026-08-29` / Registrar: HOSTINGER operations, UAB → **REGISTERED** |
| Instagram | Fetched `instagram.com/vilnia/` | Existing profile: "Blanc Marie Vilnia," 114 followers, 233 following → **TAKEN** |
| TikTok | Fetched `tiktok.com/@vilnia` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

## Summary table

| # | Candidate | Differentiator tie | .com | .lt | Instagram (bare handle) | TikTok |
|---|---|---|---|---|---|---|
| 1 | Aptik | Semantic/visual search | Registered | Registered (exp. 2028) | Taken (2 followers, private) | Unverifiable |
| 2 | Rasta | Search/discovery ("found") — EN risk: Rastafarian association | Registered | Registered (exp. 2027) | Taken (761 followers) | Unverifiable |
| 3 | Lygina | Cross-store comparison | **Available** | **Available** | Taken (9 followers) | Unverifiable |
| 4 | Pritaik | AI Fitting Room | **Available** | **Available** | Taken (1 follower) | Unverifiable |
| 5 | Kompara | Cross-store comparison (intl. root) | Registered | **Available** | Taken (245 followers, private) | Unverifiable |
| 6 | Sema | Semantic search | Registered | **Available** | Taken (26 followers) | Unverifiable |
| 7 | Drabuva | Aggregation (loose) | **Available** | **Available** | Inconclusive, leans available | Unverifiable |
| 8 | Vilnia | Location identity (no direct differentiator tie) | Registered | Registered (exp. 2026) | Taken (114 followers) | Unverifiable |

No candidate has both a clean bare-handle Instagram and a Rasta-free reputation with a `.com`+`.lt` clean sweep simultaneously except **Lygina**, **Pritaik**, and **Drabuva** on the domain side — all three currently show a taken (but low-activity, plausibly negotiable) bare Instagram handle. This is presented as evidence, not a recommendation; the owner picks.
