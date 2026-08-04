# Brand Name Candidates (English set) — replacing "VIBEWEAR"

**Prepared:** 2026-07-31 (all availability lookups performed same-day, timestamps below)
**Status:** Decision artifact only. No code or other files were changed to produce this document. The owner picks; this document does not rank or recommend a winner.
**Supersedes-in-scope-only:** This is a second, separate candidate set. `docs/naming-candidates-2026-07-31.md` (same day, earlier pass) proposed 8 candidates built on Lithuanian word roots (Aptik, Rasta, Lygina, Pritaik, Kompara, Sema, Drabuva, Vilnia). The owner has since clarified the name should be **English**, not necessarily Lithuanian-rooted — an English/international name is fine and arguably better for later expansion beyond Lithuania. This document is an entirely new candidate set (no overlap with the earlier 8) built on English words/roots, still checked for Lithuanian pronounceability and meaning since Lithuania is the launch market.

## Why the current name is being replaced

Per `.omc/specs/deep-interview-vibewear-strategic-vision.md` (§3, §5): "VIBEWEAR" is confirmed non-final by the owner — too many fashion startups already use generic `-wear`/`-vibe`/`-style` compounds. Per the owner's follow-up brief, this set also avoids `-fit` suffix mashups, `Shop-` prefixes, `-ly` SaaS tics, and `Fashion-` prefixes for the same reason (name-pattern fatigue). Candidates instead try to encode one of the product's four real differentiators, two candidates per differentiator:

1. **Semantic/visual search** — "hoodie with stars" matches by visual/conceptual content, not literal text. → *Glimpse, Lens*
2. **Cross-brand aggregation** — one place instead of visiting every brand's own site. → *Scout, Gathro*
3. **Cross-store price/size comparison** for the same item. → *Parity, Alika*
4. **AI virtual fitting room** — positioned as not yet available in Lithuania. → *Mirror, Drape*

Every candidate is real (or plausibly-real, for the two invented ones) English vocabulary or an English-rooted coinage — no candidate reuses a Lithuanian root, per the owner's instruction to produce a genuinely different set from the earlier pass.

## Confidence note — what was and wasn't verifiable

- **.com availability is fully verified for all 8 candidates** via direct RDAP queries to `https://rdap.verisign.com/com/v1/domain/<name>.com`, HTTP status recorded, and for registered names the `ldhName` and at least one nameserver pulled from the JSON body as corroborating evidence. **All 8 came back `HTTP 200` (registered)** — this is an expected, honest result: essentially every short, pronounceable, real-or-plausible English word/coinage in the 4–7 letter range has long since been registered as a `.com` (domain-squatting/portfolio scarcity), whether or not it's in active commercial use. Four additional candidate words were also RDAP-checked during exploration (`muster.com`, `twin.com`, `peeka.com`, `drapa.com`) and were **also** all registered — consistent with the same pattern — and were dropped from the final 8 in favor of names with a cleaner differentiator/collision story, not because of the `.com` result.
- **.lt availability is fully verified for all 8 candidates**, but not via RDAP: IANA's RDAP bootstrap (`https://rdap.iana.org/domain/<name>.lt`) has no delegated RDAP server for `.lt` and returns a blanket `404` for every `.lt` query regardless of actual registration status — this was independently reconfirmed as unusable in the earlier naming pass and not re-tested here. Instead, **authoritative WHOIS was queried directly against the Lithuanian ccTLD registry** at `whois.domreg.lt:43` (raw TCP, port 43) for every candidate, via a live socket from this session (`exec 3<>/dev/tcp/whois.domreg.lt/43`), and the literal `Status:` line plus registrar/expiry data (when registered) was recorded verbatim below.
- **Instagram was checked by fetching the bare-handle profile URL** (`instagram.com/<name>/`) and inspecting the rendered page for real account data (username, follower count, bio, posts) vs. a stripped/logo-only shell. This produced a clear signal for all 8 — every one of the 8 English words/coinages already has an existing (mostly small/unrelated) Instagram account sitting on the bare handle. None were inconclusive this round.
- **TikTok could not be verified for any candidate.** `tiktok.com/@<name>` returned only a client-side "Please wait..." loading interstitial for automated fetches on all 8 attempts, with no account data and no explicit not-found signal — the same bot-blocked pattern documented in the earlier naming pass. Recorded per-candidate below as a genuine attempt with a bot-blocked outcome, not a silent omission.
- **Trademark/company-name collision checks were done this round** (one web search per candidate, in scope per the owner's brief) — see the "Collision check" line in each candidate section. Several hits are notable and are flagged with severity; this is a quick sanity pass, not a legal trademark clearance search, and does not replace one before final commitment.

---

## Candidates

### 1. Glimpse

**Rationale:** Real English word meaning "a brief or partial view" — maps directly onto the **semantic/visual search** differentiator (catching what you're looking for at a glance, by look/feel rather than exact keywords). Pronunciation for a Lithuanian speaker: the consonant cluster "-mps" doesn't occur natively in Lithuanian, so it reads as mildly effortful but is fully spellable with the Lithuanian alphabet (no w/q/x, no letter "c"); no unfortunate meaning found in either language.

**Collision check (web search):** High severity. "Glimpse" is already in active use by more than one fashion-discovery product in almost exactly this space: a UK app "Glimpse — Your new favourite way to shop" and a US App Store listing "Glimpse: Discover Real Style" both describe AI-curated fashion/style discovery; there was also a 2012 Facebook shopping app called Glimpse (by TheFind) and a Glimpse.com fashion search site (San Mateo, CA) historically. This is the closest direct-competitor-name overlap in this set and is worth weighing heavily.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/glimpse.com` | `HTTP 200`; `ldhName: "GLIMPSE.COM"`; nameservers `A.NS.FACEBOOK.COM` / `B.NS.FACEBOOK.COM` / `C.NS.FACEBOOK.COM` / `D.NS.FACEBOOK.COM` (Meta-operated) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `glimpse.lt` | `Domain: glimpse.lt` / `Status: registered` / `Registered: 2024-09-11` / `Expires: 2026-09-12` / Registrar: HOSTINGER operations, UAB → **REGISTERED** |
| Instagram | Fetched `instagram.com/glimpse/` | Existing active profile: 189 followers, bio "ᴀɴ.ɢ ¨̮" with car-related highlight stories, posted content visible → **TAKEN** (unrelated personal account) |
| TikTok | Fetched `tiktok.com/@glimpse` | "Please wait..." JS loading interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 2. Lens

**Rationale:** Real English word for the optical element that focuses/resolves an image — a direct, one-syllable metaphor for the **semantic/visual search** differentiator ("search through the lens of what it looks like"). Very short and easy to say for a Lithuanian speaker (no w/q/x/c, and the concept overlaps with LT "lęšis," the word for an optical lens, so the meaning transfers without translation). No unfortunate meaning found.

**Collision check (web search):** High severity. "LENS" is an active, currently-filed trademark held by Snap Inc. (Snapchat Lens/Lens+, filed against Advertising/Business/Retail Services) and there is also a dedicated "Lens AI App" (lensapp.io) doing image-based product search and price comparison — functionally overlapping with this product's core pitch. Google Lens is the best-known general-public association. This is a crowded, actively-litigated-adjacent word in exactly this feature space.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/lens.com` | `HTTP 200`; `ldhName: "LENS.COM"`; self-hosted nameservers `DNS01–06.LENS.COM` (Lens.com is a long-running US contact-lens retailer) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `lens.lt` | `Domain: lens.lt` / `Status: registered` / `Registered: 2022-08-25` / `Expires: 2027-08-26` / Registrar: UAB "Interneto vizija" → **REGISTERED** |
| Instagram | Fetched `instagram.com/lens/` | Existing active profile: 3,902 followers, 73 following, recent posts through July 2026 → **TAKEN** |
| TikTok | Fetched `tiktok.com/@lens` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 3. Scout

**Rationale:** Real English word — to scout is to actively search/reconnoiter across many places and report back what's out there, a clean fit for the **cross-brand aggregation** differentiator (one scout instead of visiting every brand's site yourself). Pronunciation flag for Lithuanian speakers: the letter "c" is not native to standard Lithuanian spelling and is pronounced "ts" in Lithuanian loanwords, so an unprimed LT reader could stumble on "sc-" (attempting "sts-"); in practice this is softened because Lithuanian already has an established loanword for the concept, "skautas" (scout, as in the youth movement), which uses "k" not "c" — so the English spelling "Scout" sits slightly apart from the native spelling instinct. No unfortunate meaning found in either language.

**Collision check (web search):** High severity, but different sector. Scout Motors is a Volkswagen-backed electric truck/SUV brand relaunched in 2022 (Wikipedia, Gear Patrol, and Scout Motors' own site all confirm this is an active, well-funded automotive brand as of 2026, headquartered in Charlotte, NC). Scout.com is also a long-established sports recruiting/media site. Not a fashion-sector collision, but "Scout" is a taken brand name at real scale in the US market this project might expand toward.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/scout.com` | `HTTP 200`; `ldhName: "SCOUT.COM"`; nameservers `NS1–5.YAHOO.COM` (Yahoo-operated) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `scout.lt` | `Domain: scout.lt` / `Status: registered` / `Registered: 2019-05-21` / `Expires: 2029-05-22` / Registrar: UAB "Interneto vizija" → **REGISTERED** |
| Instagram | Fetched `instagram.com/scout/` | Existing active profile: 1,766 followers, bio "We are the media company that influences Gen Z and Millennials with a global network of over 800 million followers," posts 2019–2022 → **TAKEN** |
| TikTok | Fetched `tiktok.com/@scout` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 4. Gathro

**Rationale:** Invented English-rooted coinage from "gather" — names the **cross-brand aggregation** differentiator directly ("gathers" every brand's catalog into one place) while being short and distinctive. Ends in "-o," which reads naturally for a Lithuanian speaker (many loan/place-name patterns end this way); no w/q/x/c in it, no unfortunate meaning found in either language.

**Collision check (web search):** Low-medium severity, indirect. No company literally named "Gathro" surfaced. The near-miss is "Gathr" (no "o") — an umbrella name used by several unrelated products: an event-management app, a data/AI-analytics platform (gathr.ai), and a creator-economy platform (gathr.com). None is a fashion product and the exact string "Gathro" appears unclaimed, but the phonetic neighbor "Gathr" is moderately used across unrelated tech sectors — worth a closer look before committing.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/gathro.com` | `HTTP 200`; `ldhName: "GATHRO.COM"`; nameservers `NS57.DOMAINCONTROL.COM` (GoDaddy — consistent with a parked/for-sale domain, not an active business site) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `gathro.lt` | `Domain: gathro.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/gathro/` | Existing profile: display name "John Anthony Estrada," 21 followers, 7 following, no bio → **TAKEN** (small, unrelated personal account) |
| TikTok | Fetched `tiktok.com/@gathro` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 5. Parity

**Rationale:** Real English word meaning "equality/equivalence" — a precise fit for the **cross-store price/size comparison** differentiator (showing shoppers when the same item is/isn't at price parity across stores, or which size is the true equivalent across different brands' sizing). Pronunciation flag: Lithuanian words essentially never end in "-ty," so an LT speaker will likely need a beat to land the ending correctly on first read (a mild friction, not a hard stop); the rest of the word (pa-ri-...) is phonetically natural. No unfortunate meaning found in either language.

**Collision check (web search):** Medium-high severity, different sector. Parity Technologies is a well-known, well-funded (London-based, ~176 employees) blockchain infrastructure company behind Polkadot/Substrate — an active, reasonably prominent "Parity" brand in tech, though not in fashion/retail. There is also a separate, unrelated "Parity.org" focused on workplace gender parity, adding to the crowded-name picture even outside fashion.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/parity.com` | `HTTP 200`; `ldhName: "PARITY.COM"`; AWS Route 53 nameservers (`NS-*.AWSDNS-*`) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `parity.lt` | `Domain: parity.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/parity/` | Returned a stripped page: only the word "Instagram" and two base64 logo images, no username/follower/bio data visible → **INCONCLUSIVE, LEANS AVAILABLE** (same ambiguous pattern the earlier naming pass flagged for one candidate — not asserted as confirmed-available) |
| TikTok | Fetched `tiktok.com/@parity` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 6. Alika

**Rationale:** Invented English-rooted coinage (from "alike") — directly names the **cross-store comparison** differentiator: two listings are flagged as "alika" (alike) when they're the same physical item at different stores. Ends in "-a," a pattern very natural to Lithuanian ears and spelling (many LT words/names end this way); no w/q/x/c, no unfortunate meaning found in either language. Reads as a plausible short brand/given name in both languages, which is a mild plus for memorability.

**Collision check (web search):** Low-medium severity, no fashion-specific hit. "Alika" is a moderately common word/name already in use for unrelated things: an event/RSVP planning app (alika.app), a Czech food-industry company (alika.cz), a business-management platform (alikamanager.com), and at least one small India-based women's clothing seller trading informally as "Alika Fashion" on Facebook (@alikafabs). None is a scaled, well-known fashion-tech brand, but the string is not fully clean either.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/alika.com` | `HTTP 200`; `ldhName: "ALIKA.COM"`; nameservers `NS63.WORLDNIC.COM` (Network Solutions legacy registrar nameservers) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `alika.lt` | `Domain: alika.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/alika/` | Existing profile: 1,235 followers, bio "Ali Gokcil," posts from 2013–2014 → **TAKEN** (personal account, inactive since ~2014) |
| TikTok | Fetched `tiktok.com/@alika` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 7. Mirror

**Rationale:** Real English word — the most literal possible name for the **AI virtual fitting room** differentiator (a mirror that shows you wearing the item before you buy it). Very easy for a Lithuanian speaker: no w/q/x, no letter "c," double "r" is completely natural in a rhotic/trilled-r language. No unfortunate meaning found; the concept also maps cleanly onto the Lithuanian word for mirror, "veidrodis," so the metaphor transfers even for shoppers who don't speak English.

**Collision check (web search):** High severity, but instructively so. Lululemon acquired an at-home fitness hardware company called "Mirror" for $500M in 2020 (an interactive wall-mounted workout mirror); it's a well-known consumer brand, though notably Lululemon's own product now lives at **mirror.co**, not mirror.com — the fitness company evidently could not or did not hold the plain .com. Worth flagging as a real-world precedent that "Mirror" is a strong metaphor but a contested string, especially adjacent to apparel/fitness brands.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/mirror.com` | `HTTP 200`; `ldhName: "MIRROR.COM"`; nameservers `NS1–4.FABULOUS.COM` (Fabulous.com is a premium-domain parking/monetization service — indicates mirror.com is currently a parked domain, not Lululemon's Mirror product, which uses mirror.co) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `mirror.lt` | `Domain: mirror.lt` / `Status: registered` / `Registered: 2022-07-01` / `Expires: 2027-07-02` / Registrar: Hosting Concepts B.V. d/b/a Registrar.eu (OpenProvider) → **REGISTERED** |
| Instagram | Fetched `instagram.com/mirror/` | Existing profile, private: 2,325 followers, 94 following, bio is a single wolf emoji; posts not visible (private account) → **TAKEN** |
| TikTok | Fetched `tiktok.com/@mirror` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

### 8. Drape

**Rationale:** Real English word describing how fabric falls and hangs on a body — ties directly to the **AI virtual fitting room** differentiator (how a garment actually drapes on *your* shape, the thing a flat product photo can't show). Pronunciation flag: English "drape" is one syllable (rhymes with "grape"), but Lithuanian spelling conventions would default to reading it as two syllables ("DRA-pe") since Lithuanian doesn't use silent-e or the "a-consonant-e" long-vowel pattern — a real mismatch to flag, though it doesn't block spelling or typing it. Interesting near-miss note: Lithuanian slang for "clothes" is *drapanos* — "Drape" sits close enough to be a pleasant, on-topic echo rather than a collision, and no unfortunate meaning was found in either language.

**Collision check (web search):** High severity, and the closest functional match in this whole set. There is an existing product literally called **Drape App** (drapeapp.com) whose stated pitch is "upload a photo of yourself and the outfit you want to try on — see it styled on you" — i.e., an AI virtual try-on tool, the same differentiator this candidate was chosen to signal. There's also "Drape Fit" (styling subscription box), "Drape.cloud" (AI wardrobe/styling assistant), and an Instagram account `@drape` (5,628 followers, bio "DRAPE — the future we were promised…," linked to drape.club) that appears to be yet another unrelated tech/consumer brand. This is a crowded, functionally-overlapping name and the single strongest "someone is already doing almost exactly this, under almost exactly this name" flag in the set.

| Check | Method / URL | Raw result |
|---|---|---|
| .com | `GET https://rdap.verisign.com/com/v1/domain/drape.com` | `HTTP 200`; `ldhName: "DRAPE.COM"`; nameservers `NS12/NS13.WIXDNS.NET` (Wix-hosted site) → **REGISTERED** |
| .lt | `whois.domreg.lt:43` query `drape.lt` | `Domain: drape.lt` / `Status: available` → **AVAILABLE** |
| Instagram | Fetched `instagram.com/drape/` | Existing active profile: 5,628 followers, bio "DRAPE - the future we were promised…" linking to drape.club, posts July 2026 back to September 2025 → **TAKEN** (appears to be an active, unrelated tech/consumer brand) |
| TikTok | Fetched `tiktok.com/@drape` | "Please wait..." interstitial, no account data → **UNVERIFIABLE (bot-blocked)** |

---

## Summary table

| # | Candidate | Differentiator tie | .com | .lt | Instagram (bare handle) | TikTok | Collision severity |
|---|---|---|---|---|---|---|---|
| 1 | Glimpse | Semantic/visual search | Registered (Meta-operated NS) | Registered (exp. 2026-09) | Taken (189 followers, unrelated) | Unverifiable | **High** — 2+ existing fashion-discovery apps named Glimpse |
| 2 | Lens | Semantic/visual search | Registered (self-hosted) | Registered (exp. 2027-08) | Taken (3,902 followers) | Unverifiable | **High** — active Snap Inc. trademark + Lens AI shopping app |
| 3 | Scout | Cross-brand aggregation | Registered (Yahoo NS) | Registered (exp. 2029-05) | Taken (1,766 followers) | Unverifiable | **High** — Scout Motors (VW-backed EV brand), Scout.com media |
| 4 | Gathro | Cross-brand aggregation | Registered (parked, GoDaddy) | **Available** | Taken (21 followers, unrelated) | Unverifiable | Low-medium — near-miss "Gathr" used across unrelated tech |
| 5 | Parity | Cross-store comparison | Registered (AWS NS) | **Available** | Inconclusive, leans available | Unverifiable | Medium-high — Parity Technologies (blockchain), Parity.org |
| 6 | Alika | Cross-store comparison | Registered (parked, Network Solutions) | **Available** | Taken (1,235 followers, inactive since 2014) | Unverifiable | Low-medium — small unrelated apps/companies, one India fashion seller |
| 7 | Mirror | AI fitting room | Registered (parked, Fabulous.com) | Registered (exp. 2027-07) | Taken (2,325 followers, private) | Unverifiable | **High** — Lululemon's Mirror fitness brand (though it lives at mirror.co, not .com) |
| 8 | Drape | AI fitting room | Registered (Wix-hosted) | **Available** | Taken (5,628 followers, active unrelated brand) | Unverifiable | **High** — "Drape App" is an existing AI virtual try-on product |

No candidate has a fully clean `.com` — all 8 are registered, consistent with the general scarcity of short English `.com` strings. Four of the 8 (`Gathro`, `Parity`, `Alika`, `Drape`) have an **available `.lt`**. Every bare Instagram handle in this set is already held by an unrelated (mostly small/inactive) account except `Parity`'s, which returned an inconclusive stripped page. Collision severity is heaviest on the two candidates that map most literally onto a differentiator (`Glimpse` for visual search, `Drape` for AI fitting) — a predictable pattern, since the clearest metaphors are also the most obvious ones for other builders to have already reached for. This is presented as evidence, not a recommendation; the owner picks.

---

# Addendum 2 — younger direction, and the domain reality

Added after review feedback: the candidates above (Vestra, Parity, Speculo,
Sartor…) read "too grown-up" — corporate/law-firm energy, wrong for a product
whose signature query is *"hoodie with stars"*. This section takes a younger,
streetwear-vocabulary direction and, more importantly, records what the
domain market actually allows.

## The domain finding (this constrains everything)

`.com` is exhausted. Measured, not assumed:

| Pool tested | Count | Free on `.com` |
|---|---|---|
| Real English words (Glimpse, Lens, Scout, Parity, Mirror, Drape…) | 8 | **0** |
| Invented English/Latin coinages (Vestra, Sartor, Threadle, Reperio, Speculo…) | ~70 | **0** |
| Young/streetwear words (dibs, drip, grail, stash, snag, peep, steez…) | ~75 | **0** |

A deliberate junk control (`placeholderx.com`) returned 404/free in the same
run, so the check discriminates correctly — the zeros are real, not a broken
probe. Cross-checked against a second independent source (the `rdap.org`
bootstrap), which agrees on every sample.

**Refinement — "`.com` is exhausted" is too blunt.** Availability is a
function of length, measured over random pronounceable strings:

| Length | Free on `.com` |
|---|---|
| 4 letters | 0 / 14 |
| 5 letters | 1 / 14 |
| 6 letters | 6 / 14 |
| 7 letters | 14 / 14 |
| 8 letters | 14 / 14 |

So the cliff sits at six letters. But this does NOT reopen `.com` in
practice: 46 hand-picked, brand-quality 6-7 letter names (Velora, Kirano,
Solvea, Zentro, Nimbra, Lumira… and textile words Thread, Stitch, Bobbin,
Damask, Muslin, Brocade, Selvage…) were **all** registered. The strings that
come back free are free precisely because nobody wants them — `nonided`,
`tinepag`, `sebozu`. Anything that reads like a brand has already been
bought.

Practical consequence: for a single-word name the realistic choices are a
`.lt` domain (free, and Lithuania is the launch market) or paying aftermarket
prices for a premium `.com`. Compounds do remain available — verified free:
`scourhq.com`, `scourlabs.com`, `scourstore.com`, `trawllabs.com`,
`weftfashion.com`.

`.app` is also gone: all of dibs/stash/snag/peep/grail/steez/yoink/peeka/
nabbi/dripp `.app` are registered (verified via the `rdap.org` bootstrap with
a junk-domain control).

**Method warning, same class as the `.lt` trap noted earlier:**
`https://www.registry.google/rdap/domain/<name>.app` returns HTTP 404 for
*every* query including `google.app` — it looks like "available" for
everything and is worthless. Use `https://rdap.org/domain/<name>.app`. Always
run a known-registered control before trusting any new RDAP endpoint.

**`.lt` is wide open**, and Lithuania is the launch market — so the practical
answer is a `.lt` domain, optionally with a longer `.com` for redirects.

## Younger candidates, free on `.lt`

Verified via raw WHOIS at `whois.domreg.lt:43`, `Status: available`:

| Name | Reading | Ties to |
|---|---|---|
| **Dibs** | "dibs on that" — claiming an item before someone else | shopping intent; short, no LT-hostile letters |
| **Stash** | your stash of clothes | wardrobe/saved items |
| **Snag** | "snag a deal" | price/deal comparison |
| **Peep** | "peep this fit" | visual/semantic search |
| **Steez** | style-with-ease, authentic streetwear slang | brand voice; niche, may read as insider-only |
| **Grail** | "holy grail item" — core streetwear vocabulary | discovery — **but see collision risk** |
| Yoink, Nabbi, Peeka, Dibsy, Fitsy, Hypa, Freshy, Dripp, Snagg, Scopa | playful/diminutive coinages | mixed; cutesier register |

Also free: `dibsfit.com` — the single `.com` survivor across all three pools.
"Fit" here is streetwear for *outfit* ("fit check"), not the generic
`-fit` suffix rejected earlier.

## Collision risk — check before committing

- **Grail** — Grailed is a major streetwear resale marketplace. Same sector,
  near-identical vocabulary. High risk.
- **Stash** — a well-known US investing app owns this name in fintech.
  Different sector, but a crowded trademark.
- **Dibs**, **Snag**, **Peep**, **Steez** — no obvious fashion-sector holder
  found, but none were run through a formal trademark search. Do that for the
  finalist before buying anything.

No winner picked here — evidence only.

---

# DECISION — 2026-07-31

**Chosen: WEFT.** Domain: **weft.lt**.

The weft is the crosswise thread in weaving — the one that actually crosses
and binds the warp. It is a real textile term, short, spellable, and promises
nothing the product can't deliver. Scour, Trawl and Prowl were the runners-up.

> **Correction — 2026-08-04.** This paragraph originally claimed the name "has
> no hostile letters for a Lithuanian speaker." **That was factually wrong and
> is retracted.** The Lithuanian alphabet has 32 letters and contains no Q, W
> or X; those appear only in unassimilated foreign proper names. The claim also
> contradicted this document's own criterion — "no w/q/x" is cited as an
> explicit *advantage* in the rationales for Glimpse, Lens, Gathero, Alika and
> Mirror above.
>
> The name is kept anyway, as a **deliberate trade decided by the owner on
> 2026-08-04**: Lithuania is the beachhead, not the final market, and an
> EU-wide rollout is intended. A Lithuanian-rooted name (Lygina, Pritaik,
> Drabuva — the LT shortlist in the companion document) would become baggage
> outside Lithuania, and Lithuanian companies export English-form names
> routinely (Vinted, Hostinger, Nord, Omnisend, Whatagraph — the last also on
> a W). What is being bought with the W is international legibility; what is
> being paid is below.
>
> **What the W actually costs, so it is on the record rather than denied:**
> - A Lithuanian reader resolves W as "dviguba vė" or defaults to V, so the
>   name is spoken "veft". Word-of-mouth is lossy: someone told the name may
>   type `veft.lt`. **Registering `veft.lt` as a defensive redirect is cheap
>   (~EUR 10-15/yr) and is the one concrete mitigation — not yet done.**
> - The textile metaphor above is invisible to the target shopper. "Weft" is
>   *ataudai* in Lithuanian; the rationale for the name only lands in English.
>   Shopper-facing copy must therefore never lean on the weaving meaning to
>   explain the product — it has to stand on its own.

Also verified free at decision time: `weft.eu`, `weft.io`, `weft.co`,
`weft.shop`. `weft.store` and `weft.ai` are taken. `weft.com` is registered
since 1999 and dormant — an approach to its owner is deferred, not ruled out.

`.lt` was chosen over `.io` and `.ai` deliberately. Both of those read as
tech-product domains to a general shopper; `.ai` is also ~$70-150/yr versus
~EUR 10-15 for `.lt`, and every candidate name was already taken there
anyway. The buyer here is a Lithuanian consumer arriving from Instagram or
Google, and for a shopping site local familiarity beats international polish.

That reasoning is scoped to the beachhead phase. Under the 2026-08-04 decision
above, an EU rollout is intended, and a `.lt` primary does not travel — it
reads as a national site to a shopper in Warsaw or Berlin. `weft.eu` was
verified free at decision time and is the natural successor; whether it becomes
the primary or a redirect is deferred until there is a second market, but it
should be registered alongside `weft.lt` rather than after someone else takes
it.

**Open risk — not cleared.** Two companies already trade under this name:
Weft Apparel (US, made-to-order clothing manufacturer — Nice class 25) and
Weft Technologies (digital product consultancy — different sector). This
product is retail search and comparison (class 35), and both use compound
domains rather than bare "weft", so the classes appear to differ. That is a
reading of public web results, NOT a legal clearance. Run EUIPO TMview before
any spend on logo, packaging or print.
