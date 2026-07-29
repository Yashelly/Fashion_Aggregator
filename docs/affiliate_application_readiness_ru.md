# Affiliate application readiness

Дата: 2026-07-23

Цель фазы 1B: сделать VIBEWEAR понятным и безопасным для проверки affiliate networks до подключения реальных фидов.

## Что теперь должно быть видно reviewer-у

Reviewer должен за 1-2 минуты понять:

- VIBEWEAR - fashion discovery/search publisher, а не магазин и не coupon spam.
- Checkout происходит только на официальных сайтах магазинов.
- Текущий каталог - synthetic demo preview, не live merchant catalog.
- Live продукты будут добавлены только после approved affiliate feed, approved deeplink, merchant export или direct permission.
- Affiliate disclosure, privacy, terms, data source policy и contact page доступны публично.
- Трафик будет идти на страницы VIBEWEAR, а не напрямую в affiliate links.

## Что сделано в этой фазе

- Search page теперь явно показывает `Review mode` / `Peržiūros režimas`.
- Data Sources page объясняет demo catalog и правила подключения live data.
- How It Works page объясняет current review mode отдельно от будущего feed mode.
- Stores page больше не выглядит как список официальных партнеров: магазины показаны как application targets/demo sources.
- Store tracker расширен до новой первой волны.
- Factcool LT помечен как blocked/monitoring, потому что официальный LT-сайт сообщает об остановке продаж с 2025-03-06.
- Mock catalog расширен demo-карточками для Cropp LT и ABOUT YOU LT.
- Clickout preview route ведет на безопасные store homepages, а не в несуществующие affiliate links.

## Первая волна заявок

| Порядок | Магазин | Network | Почему сейчас |
|---:|---|---|---|
| 1 | Reserved LT | VIVnetworks / CJ | LT page, commission, cookie, XML feed signal |
| 2 | Sinsay LT | VIVnetworks / CJ | LT page, высокая комиссия, XML feed signal |
| 3 | Sizeer LT | VIVnetworks / CJ | LT page, sneakers/streetwear fit, XML feed signal |
| 4 | MODIVO LT | Awin | Official affiliate page + Awin profile + product feed mention |
| 5 | Cropp LT | VIVnetworks / CJ | LT page, LPP streetwear fit, XML feed signal |
| 6 | ABOUT YOU LT | FlexOffers | Active public program page, product feeds mentioned |

## Не подавать сейчас

| Магазин | Причина | Что делать |
|---|---|---|
| Factcool LT | Official LT site says sales were suspended from 2025-03-06 | Monitor only; revisit if LT sales resume |
| Zara / Bershka / Pull&Bear | No easy public LT affiliate path confirmed | Return later through direct/Inditex checks |
| Eavalyne LT | Directory/Awin signal only, not primary confirmed | Verify in Awin dashboard before adding |
| Mohito LT | GLAMI/VIV regional signal, not LT-confirmed | Verify in VIV/CJ dashboard |
| 4Fstore LT | GLAMI seed only, no public affiliate path found | Dashboard search or later direct outreach |

## Перед подачей заявок вручную

Обязательно заполнить:

- live HTTPS domain;
- working contact email;
- owner/company name;
- short project description;
- traffic source description;
- website category: `Content / shopping discovery / fashion search`;
- no coupon/cashback/browser-extension positioning unless this changes intentionally.

Рекомендуемый short description:

```text
VIBEWEAR is a visual fashion search and discovery site for Lithuanian shoppers. Users search by style, category, color, price, size, and store, then click through to official retailer product pages. Product data will be sourced from approved affiliate/product feeds.
```

Traffic answer:

```text
Traffic will come from SEO fashion search pages, curated discovery pages, organic social content, micro-creator collaborations, and small paid tests to VIBEWEAR pages. We will not use prohibited brand SEM, fake coupon claims, misleading official-store wording, or direct affiliate-link advertising.
```

Data source answer:

```text
The current site uses synthetic demo products to show the discovery experience. Live merchant products will be added only after approval to the relevant affiliate program and feed access. We do not scrape retailer websites for live catalog data.
```

## После approval для каждого магазина

Сохранить в tracker/database:

- advertiser/program ID;
- final commission;
- cookie days;
- approved market/countries;
- product feed URL/API access;
- deeplink format;
- subid format;
- allowed traffic sources;
- brand SEM rule;
- coupon/cashback rule;
- image/product-data usage rules;
- approved_at date;
- approval notes.

## Development next after applications

После первых approval делать не "больше дизайна", а feed connector foundation:

1. Provider credential config outside repo.
2. Network-specific feed downloader for the first approved provider.
3. Feed parser into raw rows.
4. Product normalization into common model.
5. `/out/:productId` redirect through approved affiliate URL with subid.
6. Admin/operator import report.

До approval live feed importer лучше не включать публично.
