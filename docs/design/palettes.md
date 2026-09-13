# Palette and contrast evidence

Historical alternatives from the first design pass. The owner subsequently rejected the cream/serif composition. The current implementation uses the cold-studio/denim tokens in `DESIGN.md`; see [the revision](revision-cold-studio.md). These five sheets remain available for comparison, but are not a theme picker or five independently implemented sites.

Five complete semantic alternatives on identical source product data. Each has 18 roles, not just an accent swatch. Application light/dark roles are in `app/globals.css`; the linen-rust light map is selected. Numeric values below computed with WCAG sRGB relative luminance, not screenshot guessing.

| Role | Paper/cobalt | Porcelain/pine | Mist/aubergine | Chalk/citron | Linen/rust |
|---|---|---|---|---|---|
| canvas | #F6F4EF | #F7F7F2 | #F4F5F7 | #F5F5F0 | #F7F5F0 |
| surface | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF |
| raised | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF |
| ink | #191C21 | #172B27 | #22212A | #20231F | #242522 |
| muted | #565C66 | #53615B | #605D6B | #596055 | #62635D |
| faint | #EAE8E2 | #EAE8E2 | #EAE8E2 | #EAE8E2 | #EAE8E2 |
| border | #D8D8CF | #D8D8CF | #D8D8CF | #D8D8CF | #D8D8CF |
| control | #85877E | #85877E | #85877E | #85877E | #85877E |
| accent | #2348D6 | #1B5848 | #653F70 | #242B21 | #993D1F |
| hover | #1837AE | #124537 | #4E2E58 | #10160E | #773018 |
| onAccent | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF |
| selected | #EBEFFF | #EAF2E9 | #F0EAF2 | #F0F4DD | #F5E8DF |
| focus | #3152A0 | #3152A0 | #3152A0 | #3152A0 | #3152A0 |
| success | #286145 | #286145 | #286145 | #286145 | #286145 |
| error | #A22C26 | #A22C26 | #A22C26 | #A22C26 | #A22C26 |
| warning | #785414 | #785414 | #785414 | #785414 | #785414 |
| disabled | #73766E | #73766E | #73766E | #73766E | #73766E |
| overlay | rgba(20,23,20,.5) | rgba(20,23,20,.5) | rgba(20,23,20,.5) | rgba(20,23,20,.5) | rgba(20,23,20,.5) |

| Palette | Ink/canvas | Muted/canvas | Accent/canvas | Button text/fill | Control boundary/canvas | Focus/canvas |
|---|---:|---:|---:|---:|---:|---:|
| paper-cobalt | 15.54 | 6.13 | 6.43 | 7.07 | 3.31 | 6.72 |
| porcelain-pine | 13.85 | 6.05 | 7.71 | 8.28 | 3.39 | 6.87 |
| mist-aubergine | 14.59 | 5.88 | 7.71 | 8.41 | 3.34 | 6.77 |
| chalk-citron | 14.53 | 5.95 | 13.31 | 14.56 | 3.33 | 6.75 |
| linen-rust | 14.14 | 5.57 | 6.34 | 6.9 | 3.34 | 6.77 |

Normal text threshold 4.5:1; meaningful control/focus boundaries 3:1. Decorative hairlines are not used as the only input boundary. Disabled controls are exempt from contrast requirements, but still distinguishable. Source: [W3C contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Rendered sheets: [paper-cobalt](../../.omx/artifacts/frontend/concepts/palette-paper-cobalt.png) · [porcelain-pine](../../.omx/artifacts/frontend/concepts/palette-porcelain-pine.png) · [mist-aubergine](../../.omx/artifacts/frontend/concepts/palette-mist-aubergine.png) · [chalk-citron](../../.omx/artifacts/frontend/concepts/palette-chalk-citron.png) · [linen-rust](../../.omx/artifacts/frontend/concepts/palette-linen-rust.png). They include search, selected chips, primary/secondary actions, error/retry, light/dark garments, price and filter panel. Expert visual comparison, not a conversion study. Dark theme is separately rendered/axe-checked in QA.
