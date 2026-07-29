# GLAMI LT affiliate provider discovery

Дата проверки: 2026-07-23

## Короткий вывод

GLAMI можно использовать как очень хороший источник магазинов для первичного отбора, но не как прямой источник affiliate-провайдеров.

Почему:

- GLAMI публично показывает, какие магазины уже работают в fashion discovery/performance-логике.
- У таких магазинов обычно уже есть продуктовый каталог, фид, tracking/pixel и менеджерская инфраструктура.
- Но GLAMI сам работает как отдельная CPC/feed-платформа, а не как affiliate publisher network для нас.

То есть правильная схема такая:

```text
GLAMI LT -> список магазинов -> проверка Awin / VIVnetworks / FlexOffers / direct affiliate pages -> заявка в сеть -> доступ к фиду -> импорт в VIBEWEAR
```

## Что GLAMI реально доказывает

GLAMI LT сам описывает себя как fashion search/discovery platform: он агрегирует предложения e-commerce магазинов и отправляет пользователя в магазин для покупки. На странице для партнеров GLAMI показывает магазины вроде AboutYou.lt, Eavalyne.lt, Reserved.com, Cropp.com, Mohito.com и 4Fstore.lt как примеры магазинов, продающих через GLAMI. Там же GLAMI описывает процесс подключения: регистрация, product feed, tracking/pixel, затем платные кампании.

Это важно для нас не потому, что мы можем брать данные у GLAMI, а потому что магазин уже, вероятно, привык к:

- XML/CSV product feed;
- performance traffic;
- tracking;
- clickout-покупательскому сценарию;
- работе с каталогом за пределами собственного сайта.

Отдельно: GLAMI Help Center описывает Priority mode как paid/CPC-модель, а Restricted mode как бесплатный режим с ограниченным числом продуктов и обязательным GLAMI Pixel. Значит GLAMI - это не наша affiliate-сеть, а скорее конкурент/референс и источник seed-list.

## Приоритетные магазины, найденные через GLAMI + affiliate networks

| Приоритет | Магазин | Провайдер / сеть | Сигнал | Комиссия / cookie | Feed / deeplink | Вердикт |
|---|---|---|---|---|---|---|
| 1 | Reserved LT | VIVnetworks / CJ | Есть отдельная LT affiliate page | 7%, 30 дней | XML feed есть, redirect URL есть | Подаваться в первой волне |
| 1 | Sinsay LT | VIVnetworks / CJ | Есть отдельная LT affiliate page | 10%, 30 дней | XML feed есть, redirect URL есть | Подаваться в первой волне |
| 1 | Sizeer LT | VIVnetworks / CJ | Есть отдельная LT affiliate page | 6-9%, 30 дней | XML feed есть, redirect URL есть | Подаваться в первой волне |
| 1 | MODIVO LT | Awin + MODIVO affiliate page | Есть Awin merchant profile и официальная страница MODIVO | cookie 10 дней, комиссия в Awin | MODIVO публично пишет про product feeds | Подаваться в первой волне |
| 2 | Cropp LT | VIVnetworks / CJ | Есть отдельная LT affiliate page | 4.6-9.3%, 30 дней | XML feed есть, redirect URL есть | Добавить в первую или вторую волну |
| 2 | ABOUT YOU LT | FlexOffers | Есть публичная active program page | 1.6% existing / 12% new, 7 дней | product feeds упомянуты | Хороший кандидат, но проверить в кабинете |
| 5 | Factcool LT | VIVnetworks / CJ regional signal | Program lists LT among available countries, но официальный LT-сайт сообщает об остановке продаж | 8-14%, 15 дней как regional signal | XML feed signal есть регионально | Не брать в первую волну, держать как monitoring lead |
| 3 | Answear | Awin | Официальная partner page ведет в Awin | от 9%, cookie нужно проверить по стране | product feed есть | Кандидат после проверки LT/region |
| 3 | Eavalyne.lt | Awin signal via affiliate directory | GLAMI показывает Eavalyne как partner-shop example | не публично подтверждено | нужно проверить в Awin | Не первая заявка без dashboard-проверки |
| 4 | Mohito.com | VIVnetworks signal, GLAMI example | Есть VIV pages по другим рынкам/generic, GLAMI показывает Mohito.com | 5-10%, 30 дней на некоторых рынках | XML feed есть на найденных pages | Проверить в VIV dashboard, не считать LT-confirmed |
| 4 | 4Fstore.lt | GLAMI example | Есть в GLAMI partner examples | не найдено публично | не найдено публично | Пока direct/contact или dashboard search |

## Почему первая волна теперь выглядит сильнее

Раньше казалось, что с крупными брендами вроде Zara/Bershka/Pull&Bear/Zalando будет проще из-за узнаваемости. По факту для запуска выгоднее начинать с магазинов, где уже публично видны affiliate terms и feed-сигналы.

Лучшая первая волна:

1. Reserved LT
2. Sinsay LT
3. Sizeer LT
4. MODIVO LT
5. Cropp LT
6. ABOUT YOU LT

Factcool LT исключен из первой волны: официальный LT-сайт содержит notice, что продажи были остановлены с 2025-03-06. Его можно вернуться проверять позже, если LT продажи возобновятся.

Почему именно так:

- Все они подходят под fashion discovery.
- У большинства есть публичный XML/feed signal.
- VIVnetworks дает сразу несколько CEE/LT fashion-программ.
- Awin закрывает MODIVO и потенциально Answear/Eavalyne.
- FlexOffers закрывает ABOUT YOU LT.

## По провайдерам

### VIVnetworks / CJ

Самый сильный провайдер для первой волны.

Найдены:

- Reserved LT;
- Sinsay LT;
- Sizeer LT;
- Cropp LT;
- Factcool только как monitoring lead: есть regional affiliate signal, но LT sales suspended;
- потенциально другие LPP/CEE fashion brands через catalog search.

Плюсы:

- много fashion/CEE;
- публичные комиссии и cookie;
- часто есть XML feed;
- есть redirect URL/deeplink signal;
- понятные ограничения по brand SEM.

Минусы:

- часть программ идет через CJ signup flow;
- финальные terms надо сохранить после approval;
- могут быть ограничения на social/CSS/brand activity.

### Awin

Нужен обязательно.

Найдены:

- MODIVO LT;
- Answear через официальную partner page;
- Eavalyne.lt signal через affiliate directory;
- Douglas LT как beauty-adjacent пример LT-программы.

Плюсы:

- сильная сеть;
- есть product feed tooling;
- удобно строить feed-import через Awin Create-a-Feed / productdata URL.

Минусы:

- не все сигналы LT-specific;
- комиссии часто видны полностью только после логина/approval;
- нужно аккуратно хранить advertiser ID, feed URL, subid/deeplink rules.

### FlexOffers

Нужен ради ABOUT YOU LT.

Плюсы:

- ABOUT YOU LT listed as active;
- указаны payout и cookie;
- product feeds mentioned.

Минусы:

- payout в USD;
- на публичной странице есть текстовая опечатка `Aboutyou.It`, поэтому обязательно проверить программу в кабинете перед импортом;
- сеть менее удобна как основная техническая база, чем Awin/VIV.

## Что не делать

Не брать товары с GLAMI scraping-ом.

GLAMI - это не источник product data для нас. Если мы скопируем карточки, картинки, цены или описания с GLAMI, получим риск по ToS, авторским правам, актуальности цен и отношениям с магазинами.

Правильный data source:

- approved affiliate product feed;
- network API/feed;
- deeplink к официальной странице;
- direct permission от магазина.

## Как отбирать магазины из GLAMI

Оценивать не просто "есть на GLAMI", а по 7 критериям:

| Критерий | Что смотреть | Почему важно |
|---|---|---|
| Public affiliate path | Есть ли страница в Awin/VIV/FlexOffers/direct | Без этого придется писать руками, долго |
| Feed signal | XML/CSV/product feed/API mentioned | Без фида не будет нормального каталога |
| Lithuania-specific | Есть ли LT page, LT domain или LT listed country | Иначе можно получить approval не на тот рынок |
| Commission/cookie | Комиссия и окно атрибуции публичны | Можно приоритизировать деньги |
| Category fit | Fashion/shoes/accessories, не слишком wide marketplace | MVP должен быть сфокусированным |
| Restrictions | brand SEM, coupons, cashback, social, CSS | Чтобы не построить рекламу, которую потом запретят |
| Brand value for users | Узнаваемость + нормальные товары + цены | Пользователь должен хотеть кликать |

Scoring для первой волны:

```text
+ есть LT affiliate page
+ есть XML/product feed
+ есть комиссия/cookie публично
+ есть GLAMI presence
+ бренд понятен литовскому покупателю
-- нет LT-specific terms
-- комиссия видна только после логина
-- нет feed signal
-- нужен direct outreach
```

## Практический следующий шаг

Сначала не писать магазинам напрямую. Сначала:

1. Зарегистрироваться как publisher в VIVnetworks/CJ.
2. Зарегистрироваться как publisher в Awin.
3. Зарегистрироваться как publisher в FlexOffers.
4. Подать заявки в таком порядке:
   1. Reserved LT
   2. Sinsay LT
   3. Sizeer LT
   4. MODIVO LT
   5. Cropp LT
   6. ABOUT YOU LT
   7. Factcool не подавать сейчас; мониторить LT sales status и dashboard availability
5. После approval для каждого магазина сохранить:
   - final commission;
   - cookie days;
   - advertiser/program ID;
   - allowed traffic sources;
   - brand SEM rule;
   - coupon/cashback rule;
   - feed URL/API;
   - deeplink format;
   - subid/tracking parameter format.
6. Только после этого добавлять live products в VIBEWEAR.

## Что это значит для разработки

Нам не нужен полноценный парсер GLAMI. Нужен `affiliate_program_tracker` и feed-import слой под конкретные сети:

- `stores`: магазин, market, network, status, rules;
- `affiliate_programs`: advertiser ID, commission, cookie, approval status;
- `product_feeds`: provider, feed URL, format, last_imported_at;
- `products`: нормализованные товары;
- `outbound_clicks`: clickout tracking + subid.

Первый importer лучше делать под:

1. VIVnetworks/CJ feeds;
2. Awin feeds;
3. FlexOffers feeds.

## Риски

### Риск 1: GLAMI presence != affiliate availability

Магазин может быть на GLAMI, но не иметь открытой affiliate-программы для нас. GLAMI - это отдельная CPC/feed-интеграция между магазином и GLAMI, а не гарантия, что publisher может получить CPS-комиссию.

Как снизить:

- брать GLAMI только как seed-list;
- подтверждать provider через публичную страницу сети или network dashboard;
- маркировать confidence: `confirmed_lt`, `regional_signal`, `directory_signal`, `direct_only`;
- не добавлять магазин в live catalog до approval.

### Риск 2: Market mismatch

Программа может быть для CZ/PL/DE, а не для LT. Это особенно опасно с брендами, где домены выглядят глобально.

Как снизить:

- приоритет только LT-specific pages;
- если страна просто listed, проверять в dashboard;
- хранить country/market на уровне program, а не только store.

### Риск 3: Feed есть, но нельзя использовать как хочется

Даже если XML feed есть, условия могут запрещать часть traffic sources, social, CSS, coupon-позиционирование, brand bidding или кастомные creatives.

Как снизить:

- после approval сохранять финальные terms;
- не запускать paid brand SEM;
- вести трафик на свои discovery/search страницы;
- не обещать "official partner" до разрешения.

### Риск 4: Directory data может устареть

Affilitizer и подобные базы полезны, но это не финальное доказательство. Например, Eavalyne.lt выглядит перспективно, но без Awin dashboard его нельзя считать confirmed.

Как снизить:

- использовать directories только как `lead`;
- финальное подтверждение делать в сети;
- в tracker хранить `last_checked_at`.

## Источники

- GLAMI LT partner page: https://www.glami.lt/info/prideti-parduotuve/
- GLAMI Help Center business modes: https://help.glami.info/business-models
- GLAMI LT about page: https://www.glami.lt/info/
- Reserved LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/reserved-lt/
- Sinsay LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/sinsay-lt/
- Sizeer LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/sizeer-lt/
- Cropp LT on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/cropp-lt/
- Factcool on VIVnetworks: https://www.vivnetworks.com/en/affiliate-catalog/factcool-gr/
- Factcool LT sales suspended notice: https://lt.factcool.com/campaign773
- MODIVO LT affiliate page: https://modivo.lt/b/afiliacija
- MODIVO LT on Awin: https://ui.awin.com/merchant-profile/117515
- ABOUT YOU LT on FlexOffers: https://www.flexoffers.com/affiliate-programs/aboutyou-lt-affiliate-program/
- Answear partner program: https://program-partnerski.answear.com/jak-dziala.php
- Awin product feed help: https://success.awin.com/articles/en_US/Knowledge/How-can-I-access-a-Product-Feed
