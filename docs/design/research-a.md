# Market research A — 10 fashion interfaces

## Три mobile walkthrough — фактический охват и пробелы

Все 17 финальных walkthrough PNG открыты и рассмотрены; размеры 390×844 CSS/DPR3, LT/LT/EUR для Reserved/MODIVO и LT/EN/EUR для Colorful Standard. Снимки — дополнение к основным 40, не замена четырёх поверхностей. Из ссылок PDP удалены поисковые tracking-параметры.

Reserved: ввод → реальные suggestions → Enter → results → filter sheet → price ascending → PDP → browser back (остался PDP) → явный сохранённый results URL. MODIVO: ввод → категории/товары suggestions → Enter → results → filters → PDP → browser back (results восстановлены). Colorful Standard: ввод tee → товарные suggestions → Enter → results → filters → Apply → PDP → browser back (results восстановлены).

Ограничения: выбранные size/color фильтры и empty-state не подтверждены; MODIVO discount switch не удалось активировать обычным locator без force, обход не применён; числовые price inputs не обнаружились как type=number, изменение бюджета не заявляется. У Colorful Apply(3) — наблюдаемый текст, не доказательство трёх выбранных пользователем фильтров. Сортировка выполнена у Reserved; у других только панель просмотрена. Полное тестирование mobile menu/focus/keyboard не проводилось. Поэтому это три содержательных, но не исчерпывающих walkthrough по всему расширенному чеклисту.

| Сайт / состояние | Дата | URL | Файл | Наблюдения |
|---|---|---|---|---|
| reserved / suggestions / 390×844 | 2026-09-12T12:48:04.354967+03:00 | [страница](https://www.reserved.com/lt/lt/?query=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-suggestions.png) | Запрос suknelė сохранён в широкой строке; dropdown предлагает варианты фразы; выдача видна под подсказками. |
| reserved / search-results / 390×844 | 2026-09-12T12:48:09.269588+03:00 | [страница](https://www.reserved.com/lt/lt/?query=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-search-results.png) | Запрос повторён заголовком; счётчик 1240 у Filter; две колонки платьев. |
| reserved / filters / 390×844 | 2026-09-12T12:48:10.710266+03:00 | [страница](https://www.reserved.com/lt/lt/?query=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-filters.png) | Полноэкранная панель с крупными строками сортировки; категории по полу ниже; нижний CTA показывает число. |
| reserved / sort-selected / 390×844 | 2026-09-12T12:48:12.14264+03:00 | [страница](https://www.reserved.com/lt/lt/?query=suknel%C4%97&sort=product_res_lt_lt_final_price_asc) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-sort-selected.png) | Цена по возрастанию выделена фоном; sort появился в URL; нижний CTA сохраняет count. |
| reserved / details / 390×844 | 2026-09-12T12:48:14.662317+03:00 | [страница](https://www.reserved.com/lt/lt/medvilniniai-sortai-2-vnt-minnie-mouse-218ep-03x) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-details.png) | Открыта карточка дешёвого товара из отсортированной выдачи (шорты, не платье); фотография доминирует; sticky покупка не нажималась. |
| reserved / return-results / 390×844 | 2026-09-12T12:48:16.058062+03:00 | [страница](https://www.reserved.com/lt/lt/medvilniniai-sortai-2-vnt-minnie-mouse-218ep-03x) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-return-results.png) | Browser back оставил PDP на том же URL; видно то же фото; возврат к поиску не подтверждён. |
| reserved / explicit-return-results / 390×844 | 2026-09-12T12:48:18.384671+03:00 | [страница](https://www.reserved.com/lt/lt/?query=suknel%C4%97&sort=product_res_lt_lt_final_price_asc) | [PNG](../../.omx/artifacts/frontend/research-a/reserved-walk-explicit-return-results.png) | Явный переход на сохранённый results URL вернул запрос и sort; цены начинаются с дешёвых; название первой карточки обрезано. |
| modivo / suggestions / 390×844 | 2026-09-12T12:48:33.343622+03:00 | [страница](https://modivo.lt/?cookie_consent=true) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-suggestions.png) | Категорийные подсказки занимают верх; запрос suknelė виден; подходящие товары начинаются ниже. |
| modivo / search-results / 390×844 | 2026-09-12T12:48:38.210468+03:00 | [страница](https://modivo.lt/s/suknel%C4%97?q=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-search-results.png) | Запрос крупно повторён в заголовке; половые chips доступны; нижний split Sort/Filter виден. |
| modivo / filters / 390×844 | 2026-09-12T12:48:39.594496+03:00 | [страница](https://modivo.lt/s/suknel%C4%97?q=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-filters.png) | Одна sheet содержит цену min/max и slider; размер/цвет/бренд отдельными строками; Grįžti į produktus внизу. |
| modivo / details / 390×844 | 2026-09-12T12:48:43.866773+03:00 | [страница](https://modivo.lt/p/reebok-kasdienine-suknele-reebok-x-ewa-chodakowska-rk25617ccw-juoda-slim-fit-0000305907660) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-details.png) | Открыта Reebok dress; фото большое; сверху сохраняется поиск и категория, цена ниже первого viewport. |
| modivo / return-results / 390×844 | 2026-09-12T12:48:48.013683+03:00 | [страница](https://modivo.lt/s/suknel%C4%97?q=suknel%C4%97) | [PNG](../../.omx/artifacts/frontend/research-a/modivo-walk-return-results.png) | Browser back восстановил запрос и grid; счётчик 6346 снова виден; Sort/Filter не потерян. |
| colorfulstandard / suggestions / 390×844 | 2026-09-12T12:43:33.475763+03:00 | [страница](https://colorfulstandard.com/) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-suggestions.png) | Autocomplete показывает маленькое фото, название и цену; query tee сохранён; Products/Suggestions/Collections отделены вкладками. |
| colorfulstandard / search-results / 390×844 | 2026-09-12T12:43:38.903013+03:00 | [страница](https://colorfulstandard.com/search?q=tee&type=product) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-search-results.png) | Заголовок содержит query и count1000; две колонки; цена и цвета доступны без PDP. |
| colorfulstandard / filters / 390×844 | 2026-09-12T12:43:40.40533+03:00 | [страница](https://colorfulstandard.com/search?q=tee&type=product) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-filters.png) | Единая sheet с accordion Sort/Gender/Size/Category/Material; Apply находится внизу; явный Close сверху. |
| colorfulstandard / details / 390×844 | 2026-09-12T12:43:42.972707+03:00 | [страница](https://colorfulstandard.com/products/classic-organic-tee-t-shirt-optical-white-male) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-details.png) | Открыт реальный Classic Organic Tee, не gift card из ранней неудачной попытки; крупный front view; ниже strip миниатюр ракурсов. |
| colorfulstandard / return-results / 390×844 | 2026-09-12T12:43:44.6607+03:00 | [страница](https://colorfulstandard.com/search?q=tee&type=product) | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-walk-return-results.png) | Browser back вернул query tee и карточки; цена/swatches снова видны; положение выдачи восстановлено около первой строки. |


Дата наблюдения: 2026-09-12. Метод: настоящий headless Chromium через установленный Python Playwright, изолированные контексты, zoom 100%; desktop 1440×1000 CSS px/DPR1, mobile 390×844 CSS px с iPhone 13 UA/DPR3 (физический PNG 1170×2532). Все 40 основных PNG открыты инструментом просмотра и рассмотрены. Это экспертный срез, не тест пользователей, конверсии или доступности по WCAG. Цены и счётчики — динамическое состояние снимка.

Необязательные cookies отклонены доступными UI: Asket — вручную выключены Preferences/Statistics/Marketing, MODIVO — сохранены настройки с optional off, LPP — сохранён минимальный выбор. Sinsay mobile PLP переснят в свежем контексте после app-promo в первом прогоне; CSS/защита не менялись. Старые неудачные артефакты не засчитаны. Скриншоты используются только внутренне, коммерческие изображения не переносились в публичный Weft.

## Evidence matrix

Факты — рынок, наблюдавшаяся структура и источник. Strengths/недостатки/перенос — экспертная интерпретация этих фактов. У всех строк просмотрены home + catalog на двух ширинах; каталог допустим вместо query results. У Asket/Kotn/Colorful Standard отбор основан на действующей сети и визуальной релевантности, а не заявлении, что это массовые бренды.

| Продукт | Тип | Рынок | Сигнал присутствия / первичный источник | Реально просмотрено | Desktop strengths | Mobile strengths | Недостатки | AI/discovery, статус | Для Weft | Не переносить | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UNIQLO | Mass-market | LT / EN / EUR | [Fast Retailing Annual Report 2025](https://www.fastretailing.com/eng/ir/library/pdf/ar2025_en.pdf), сеть и европейское присутствие | 4 кадра home/catalog | 4 колонки, цвет/размер под фото | Широкий поиск, 2 колонки | Большой ряд категорий отодвигает товары | Фотокатегории; AI не подтверждён | Простая рамка фото и варианты | Полноэкранный hero в результатах | [кадры](#uniqlo) |
| Reserved | Mass-market | LT / LT / EUR | [LPP](https://www.lpp.com/en/about-us/), один из пяти брендов группы в 46 рынках; это группа, не аудитория Reserved | 4 кадра home/catalog | Левая таксономия, название/цена/отзывы | Видимое поле поиска, текстовый Filter | Высокий header и promo, гео-toast | Поиск suknelė проверен; AI не подтверждён | Запрос остаётся над grid | Слишком высокая промополоса | [кадры](#reserved) |
| ABOUT YOU | Мультибренд | LT / LT / EUR | [Zalando FY2025](https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results), ABOUT YOU входит в группу; 62 млн относится ко всей группе | 4 кадра home/catalog | Подробные подписанные фильтры | Плавающая панель фильтр/сортировка | Неоновая распродажа доминирует; app banner | Твои предложения видны; персонализация/AI не проверена | Явный единый refinement CTA | Countdown и многослойная реклама | [кадры](#aboutyou) |
| MODIVO | Мультибренд | LT / LT / EUR | [MODIVO Group Q1 2026](https://modivoplatform.com/en/download/pobierz/interim-condensed-consolidated-report-of-the-modivo-group-for-the-three-months-of-2026), официальный операционный отчёт CEE | 4 кадра home/catalog | Широкий поиск, бренд/название/цена | Большое поле поиска, раздельные Sort/Filter | Promo header высокий; нижняя панель перекрывает метаданные | Поиск доступен; AI не подтверждён | Разделить бренд и название карточки | Обещания магазина переносить нельзя | [кадры](#modivo) |
| Sinsay | Value mass-market | LT / LT / EUR | [LPP](https://www.lpp.com/en/about-us/), самостоятельный бренд группы с международной сетью | 4 кадра home/catalog | Видимые цены и фильтры | Категории картинками, 2 колонки | Delivery баннер занимает много места; app promo мешал первому прогону | Редакционные категории; AI не подтверждён | Наглядные подкатегории только если нужны | App-install takeover | [кадры](#sinsay) |
| MOHITO | Mass-market fashion | LT / LT / EUR | [LPP](https://www.lpp.com/en/about-us/), отдельный бренд группы, не региональная копия Reserved | 4 кадра home/catalog | Ранняя 4-col сетка, короткий toolbar | Поиск отдельной строкой, 2-col | Header высоковат, гео-toast | Категории и editorial; AI не подтверждён | Короткий toolbar перед товарами | Скопировать брендовый denim hero | [кадры](#mohito) |
| Asket | Современный DTC | EU / EN / EUR | [Официальный сайт и магазинная навигация](https://www.asket.com/en-se), London/Stockholm; показатель сети, не массовости | 4 кадра home/catalog | Тихая 4-col сетка без sidebar | Текстовые Search/Menu, 2-col | Длинный вступительный текст; сложный отказ cookies | Коллекции; AI не подтверждён | Нейтральная основа и краткие метаданные | Предвыбранные optional cookies | [кадры](#asket) |
| Kotn | Современный DTC | Canada / EN / CAD | [Официальный help/store directory](https://kotn.com/help), действующая розничная сеть; [B Lab](https://www.bcorporation.net/en-us/find-a-b-corp/company/kotn/) подтверждает компанию, не трафик | 4 кадра home/catalog | 4-col, спокойный типографический ритм | 2-col, явные Filter+Sort | Chat/a11y bubbles перекрывают углы; обрезанные названия | Редакционные коллекции; наличие chat не доказывает AI | Крупная цена и единый photo ratio | CAD/доставку/checkout ожидания | [кадры](#kotn) |
| Colorful Standard | Современный DTC | LT / EN / EUR | [Официальный multi-city store directory](https://colorfulstandard.com/), Antwerp/Berlin/Copenhagen/London и др.; не MAU | 4 кадра home/catalog | Плотные 5-col и swatches | 2-col и достижимый bottom filter | Floating control накрывает нижний контент | Autocomplete с товарами проверен, AI не подтверждён | Одна панель уточнения и цена в suggestions | 42 варианта при отсутствии таких данных Weft | [кадры](#colorfulstandard) |
| Soulz | Baltic мультибренд | LT / LT / EUR | [Apranga history](https://aprangagroup.lt/lt/istorija/istorija), Soulz LT launch2019, LV/EE2021; отдельный storefront | 4 кадра home/catalog | Бренд/цена, быстрая доставка фильтром | 2-col, категории chips | App/newsletter полосы съедают высоту | Категории; sparkle рядом с поиском не доказывает AI | Магазин/бренд рядом с ценой | Промо приложения на первый экран | [кадры](#soulz) |

## Экспертные оценки 1–5

Порядок: поиск / каталог / mobile / иерархия / товарная информация / фильтры / доступность ключевых действий / управление состоянием / уместность discovery / характер. 3 означает рабочий, но компромиссный результат. Оценка состояния без walkthrough предварительная (только видимость текущего контекста, не доказательство back/focus preservation). Оценка доступности действий — видимость/размер/подпись, не сертификация accessibility. Discovery — категории/editorial тоже; это не рейтинг AI.

| Продукт | П / К / М / И / Т / Ф / Д / С / Discovery / Х |
|---|---|
| UNIQLO | 4/5/4/4/5/4/4/3/4/4 |
| Reserved | 5/4/4/4/4/4/4/2/3/4 |
| ABOUT YOU | 4/4/3/3/4/4/4/3/3/3 |
| MODIVO | 5/4/4/4/5/4/4/3/3/3 |
| Sinsay | 4/3/3/3/4/4/3/3/3/3 |
| MOHITO | 4/4/4/4/4/4/4/3/3/4 |
| Asket | 4/5/4/5/4/4/4/3/4/5 |
| Kotn | 4/4/4/4/4/3/4/3/4/5 |
| Colorful Standard | 4/5/4/4/5/4/4/4/4/5 |
| Soulz | 3/4/3/4/4/4/3/3/3/4 |

Крайние оценки: поиск 5 у Reserved/MODIVO за явное широкое поле, не за качество ранжирования. Каталог 5 у UNIQLO/Asket/Colorful Standard за сопоставимые фото и доступные метаданные; товарная информация 5 у UNIQLO/MODIVO/Colorful Standard за цвет/размер либо бренд+варианты. Иерархия 5 Asket — почти нет конкурирующей проморекламы. Характер 5 Asket/Kotn/Colorful Standard — разный узнаваемый фотоподход при спокойной рамке. Состояние 2 Reserved — попытка browser back осталась в галерее PDP в наблюдённом сценарии; это не доказанный универсальный дефект сайта.

## Покадровый журнал

У каждой строки — фактический URL, дата/время (ISO с часовым поясом), регион и язык, CSS viewport, состояние, файл и конкретные видимые наблюдения. Машиночитаемый журнал каждого бренда лежит рядом как `<site>.json`; он также содержит requested URL и текст снимка. Первые две строки каждой группы desktop, последние две mobile.

### uniqlo

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://www.uniqlo.com/eu-lt/en/) | 2026-09-12T12:31:52.535818+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-desktop-home.png) | Две портретные панели занимают почти весь экран; белая поисковая капсула контрастирует с фото; есть pause видео. |
| desktop results / 1440×1000 | [страница](https://www.uniqlo.com/eu-lt/en/women/skirts-and-dress) | 2026-09-12T12:31:57.346392+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-desktop-results.png) | Четыре карточки в ряд; фото-категории над сеткой съедают высоту; варианты цвета и размерный диапазон под фото. |
| mobile home / 390×844 | [страница](https://www.uniqlo.com/eu-lt/en/) | 2026-09-12T12:32:03.354044+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-mobile-home.png) | Поиск назван текстом в верхней строке; одиночный портрет доминирует; категории только у нижней границы. |
| mobile results / 390×844 | [страница](https://www.uniqlo.com/eu-lt/en/women/skirts-and-dress) | 2026-09-12T12:32:08.624442+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/uniqlo-mobile-results.png) | Две колонки фото; Filter and sort выделен текстом; блок категорий отодвигает первые товары. |

### reserved

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://www.reserved.com/lt/lt/) | 2026-09-12T12:31:53.177309+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-desktop-home.png) | Крупный fashion hero с жёлтой промострокой; поиск справа; header занимает заметную высоту. |
| desktop results / 1440×1000 | [страница](https://www.reserved.com/lt/lt/moterims/sukneles) | 2026-09-12T12:31:57.875585+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-desktop-results.png) | Слева категории; четыре колонки товаров; названия, цены и отзывы помещаются в первый экран. |
| mobile home / 390×844 | [страница](https://www.reserved.com/lt/lt/) | 2026-09-12T12:32:05.327199+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-mobile-home.png) | Поиск занимает почти всю ширину отдельной строки; логотип и подписанные account-иконки сверху; region-toast снизу. |
| mobile results / 390×844 | [страница](https://www.reserved.com/lt/lt/moterims/sukneles) | 2026-09-12T12:32:11.86302+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/reserved-mobile-results.png) | Две колонки товаров; счётчик связан с заголовком; отдельные сортировка и фильтр над grid. |

### aboutyou

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://www.aboutyou.lt/mano-parduotuve) | 2026-09-12T12:34:33.570564+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-desktop-home.png) | Широкий разделённый hero и категорийные CTA; trust/promo строки повторяются; крупный неон перетягивает внимание. |
| desktop results / 1440×1000 | [страница](https://www.aboutyou.lt/c/moterims/drabuziai/sukneles-20236) | 2026-09-12T12:34:37.701413+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-desktop-results.png) | Левая taxonomy и несколько рядов filter chips; четыре колонки; большой баннер отодвигает grid вниз. |
| mobile home / 390×844 | [страница](https://www.aboutyou.lt/) | 2026-09-12T12:34:42.674502+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-mobile-home.png) | App banner занимает верх; категории по полу подписаны; неоновый блок заполняет большую часть viewport. |
| mobile results / 390×844 | [страница](https://www.aboutyou.lt/c/moterims/drabuziai/sukneles-20236) | 2026-09-12T12:34:46.914201+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/aboutyou-mobile-results.png) | Две колонки с брендом и ценами; плавающий Filtruoti ir rūšiuoti; несколько строк цен затрудняют краткое сравнение. |

### modivo

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://modivo.lt/) | 2026-09-12T12:35:06.092082+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-desktop-home.png) | Широкое поле поиска в header; три демографические плитки; логотипы брендов формируют отдельный вход. |
| desktop results / 1440×1000 | [страница](https://modivo.lt/c/moterims/drabuziai/sukneles-ir-kombinezonai) | 2026-09-12T12:35:11.72596+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-desktop-results.png) | Четыре колонки с нейтральным фоном; слева категории; фильтры размер/цвет/цена явно подписаны. |
| mobile home / 390×844 | [страница](https://modivo.lt/?cookie_consent=true) | 2026-09-12T12:35:16.888832+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-mobile-home.png) | Полноширинный поиск под логотипом; крупный текст перед fashion фото; промострока добавляет высоту. |
| mobile results / 390×844 | [страница](https://modivo.lt/c/moterims/drabuziai/sukneles-ir-kombinezonai) | 2026-09-12T12:35:23.190806+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/modivo-mobile-results.png) | Две колонки с жирным брендом; горизонтальные категорийные chips; фиксированная Sort/Filter панель частично закрывает нижнюю цену. |

### sinsay

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://www.sinsay.com/lt/lt/) | 2026-09-12T12:32:17.769506+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-desktop-home.png) | Lifestyle hero с понятными категориями ниже; несколько промострок; поиск видим в header. |
| desktop results / 1440×1000 | [страница](https://www.sinsay.com/lt/lt/moterims/drabuziai/sukneles) | 2026-09-12T12:32:22.300763+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-desktop-results.png) | Четыре колонки; крупный delivery banner над ассортиментом; фильтры отделены от категорий. |
| mobile home / 390×844 | [страница](https://www.sinsay.com/lt/lt/) | 2026-09-12T12:32:28.510791+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-mobile-home.png) | Компактный логотип/иконки; круглые категории занимают мало ширины; region-toast закрывает нижний контент. |
| mobile results / 390×844 | [страница](https://www.sinsay.com/lt/lt/moterims/drabuziai/sukneles) | 2026-09-12T12:42:49.224764+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/sinsay-mobile-results.png) | Полезный named Filter и price/size chips; две колонки только у нижней части экрана; доставка продублирована banner+header. |

### mohito

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://www.mohito.com/lt/lt/) | 2026-09-12T12:32:32.004745+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-desktop-home.png) | Крупный denim crop задаёт характер; синий CTA контрастен; поиск отдельной капсулой. |
| desktop results / 1440×1000 | [страница](https://www.mohito.com/lt/lt/drabuziai/sukneles-kombinezonai) | 2026-09-12T12:32:36.781108+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-desktop-results.png) | Четыре колонки начинаются относительно рано; слева таксономия; названия и евроцены читаемы. |
| mobile home / 390×844 | [страница](https://www.mohito.com/lt/lt/) | 2026-09-12T12:32:43.725752+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-mobile-home.png) | Фото сохраняет крупное кадрирование; поисковая строка видна; гео-toast перекрывает нижний участок. |
| mobile results / 390×844 | [страница](https://www.mohito.com/lt/lt/drabuziai/sukneles-kombinezonai) | 2026-09-12T12:32:49.134576+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/mohito-mobile-results.png) | Две колонки и подписанные filters; счётчик у названия; горизонтальные подкатегории экономят вертикаль. |

### asket

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://www.asket.com/en-eu/) | 2026-09-12T12:32:34.143703+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-desktop-home.png) | Короткая типографическая шапка над diptych; фото начинается ниже описания; почти нет декоративного UI. |
| desktop results / 1440×1000 | [страница](https://www.asket.com/en-eu/womens) | 2026-09-12T12:32:38.049151+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-desktop-results.png) | Четыре одинаковые карточки; горизонтальные категории/filters вместо sidebar; сезонные chips компактны. |
| mobile home / 390×844 | [страница](https://www.asket.com/en-eu/) | 2026-09-12T12:32:44.744168+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-mobile-home.png) | Search/Account/Cart/Menu названы текстом; вводный абзац занимает большую часть верха; фото не мельчит. |
| mobile results / 390×844 | [страница](https://www.asket.com/en-eu/womens) | 2026-09-12T12:32:49.390873+03:00; EU / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/asket-mobile-results.png) | Две колонки с ценой и цветом; Filters отдельным текстовым действием; нейтральное фото и спокойные интервалы. |

### kotn

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://kotn.com/) | 2026-09-12T12:32:40.781312+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-desktop-home.png) | Тёплый интерьер и контрастный teal garment; большая сезонная типографика; подчёркнутый Shop now у нижней границы. |
| desktop results / 1440×1000 | [страница](https://kotn.com/collections/womens) | 2026-09-12T12:32:45.376852+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-desktop-results.png) | Четыре колонки под коротким intro; всего несколько dropdown; swatches видны под названием/ценой. |
| mobile home / 390×844 | [страница](https://kotn.com/) | 2026-09-12T12:32:51.237827+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-mobile-home.png) | Одиночная editorial фотография с крупным текстом; минимальная chrome; два плавающих виджета по углам. |
| mobile results / 390×844 | [страница](https://kotn.com/collections/womens) | 2026-09-12T12:32:55.782808+03:00; Canada / EN / CAD | [PNG](../../.omx/artifacts/frontend/research-a/kotn-mobile-results.png) | Две колонки начинаются после intro; широкая Filter+Sort строка; цена и swatches читаемы, названия частично обрезаны. |

### colorfulstandard

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://colorfulstandard.com/) | 2026-09-12T12:32:55.158747+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-desktop-home.png) | Три равношироких фото-панели; кнопки подписаны типами вещей; цвет сосредоточен в товарах, а не UI. |
| desktop results / 1440×1000 | [страница](https://colorfulstandard.com/collections/all-womens-apparel-accessories) | 2026-09-12T12:33:00.107768+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-desktop-results.png) | Пять колонок без sidebar; имя, цена, цвета, количество цветов и размеры сгруппированы; ровный photo ratio. |
| mobile home / 390×844 | [страница](https://colorfulstandard.com/) | 2026-09-12T12:33:07.529995+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-mobile-home.png) | Панели складываются вертикально; явный CTA категории; простая icon-навигация. |
| mobile results / 390×844 | [страница](https://colorfulstandard.com/collections/all-womens-apparel-accessories) | 2026-09-12T12:33:13.146568+03:00; LT / EN / EUR | [PNG](../../.omx/artifacts/frontend/research-a/colorfulstandard-mobile-results.png) | Две колонки с названием и ценой; floating Filter and sort; swatches и размеры доступны без PDP. |

### soulz

| Состояние / viewport | URL | Дата / рынок | Файл | Визуальные факты |
|---|---|---|---|---|
| desktop home / 1440×1000 | [страница](https://soulz.lt/lt/moterims) | 2026-09-12T12:32:14.209444+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-desktop-home.png) | Большой fashion hero с app-sale сообщением; две строки навигации; утилитарные действия отдельными иконками. |
| desktop results / 1440×1000 | [страница](https://soulz.lt/lt/c/moterys/drabuziai/sukneles-31-1) | 2026-09-12T12:32:18.50428+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-desktop-results.png) | Четыре колонки и sidebar; жирная цена и бренд; quick-delivery toggle явно подписан. |
| mobile home / 390×844 | [страница](https://soulz.lt/lt/moterims) | 2026-09-12T12:32:24.31246+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-mobile-home.png) | App banner и подписка занимают много высоты; fashion hero читается; поиск только иконкой. |
| mobile results / 390×844 | [страница](https://soulz.lt/lt/c/moterys/drabuziai/sukneles-31-1) | 2026-09-12T12:32:29.032968+03:00; LT / LT / EUR | [PNG](../../.omx/artifacts/frontend/research-a/soulz-mobile-results.png) | Две колонки с брендом и ценой; фильтры горизонтальными chips; непояснённая иконка линейки на фото. |

## Непрошедшие кандидаты — не входят в 10

Zalando показал branded unavailable; ASOS, H&M, Zara, Mango, COS, ARKET, Pull&Bear, Bershka, Stradivarius, Massimo Dutti, &Other Stories — Access Denied; Urban Outfitters — challenge; Next — техническую ошибку; Boozt — region gate и затем Cloudflare challenge; Answear — ERR_CERT_COMMON_NAME_INVALID (проверка сертификата не отключалась). Peek & Cloppenburg corporate route не дал нужный commerce catalog. Apranga storefront ведёт в Soulz — засчитан только Soulz. Защита не обходилась, заблокированным не выставлялся ноль. Их PNG/JSON оставлены как журнал попыток, не как содержательное evidence.

## AI: границы фактов

В этой десятке нет интерактивно подтверждённого AI. Autocomplete Colorful Standard и редакционные категории не названы AI. [Zalando официально анонсировал расширение ассистента 2024-10-01](https://corporate.zalando.com/en/technology/zalando-brings-its-ai-powered-assistant-all-markets-and-adds-four-new-cities-its-trend); это дата анонса, не проверка текущей LT-доступности: storefront здесь заблокирован. Из этого материала допустима только дополнительная гипотеза «разговорное уточнение», не утверждение текущего работающего AI в исследованном интерфейсе.

## Переносимые решения — гипотезы для интегратора

1. Проблема: mobile поиск скрывают иконки. Изменение: заметный named search у входа; проверка — запрос начинается без открытия меню (Reserved/MODIVO).
2. Проблема: promo съедает каталог. Изменение: results без hero, intro не выше одного короткого блока; проверка — реальные товары в первом viewport (MOHITO против Sinsay/ABOUT YOU).
3. Проблема: refinement распадается на много экранов. Изменение: одна mobile sheet с count и Apply; проверка — цена/категория меняются без ухода с выдачи (Colorful Standard).
4. Проблема: состояние ограничения невидимо. Изменение: query и активный бюджет с clear рядом с grid; проверка — их видно после submit и back (Reserved walkthrough показывает риск).
5. Проблема: трудно сравнивать. Изменение: постоянный photo ratio и двухколоночный mobile grid; проверка — цена и название не обрезаются горизонтально (все 10).
6. Проблема: неизвестен источник. Изменение: нейтральный demo-store label на карточке перед переходом; проверка — все карточки показывают публичный магазин (MODIVO/Soulz как структура, не реальные магазины).
7. Проблема: декорация конкурирует с одеждой. Изменение: нейтральный canvas, один акцент действия; проверка — fashion создают разрешённые фото/типографика (Asket/Kotn/Colorful Standard).
8. Проблема: голая иконка не объясняет действие. Изменение: Filters, Search, Clear текстом и доступные имена icon-кнопок; проверка — действие узнаваемо без tooltip (Asket).
9. Проблема: случайный переход разрушает поиск. Изменение: PDP получает return URL с query/filter/locale; проверка — browser back и явный back восстанавливают контекст (Reserved/Colorful walkthrough).
10. Проблема: шум из счётчиков/акций выдаётся за полезность. Изменение: отображать только имеющиеся demo-данные, явно отличать loading/error/empty; проверка — не выдумывать rating, availability, AI explanations.

Реалистичные преимущества Weft (не доказанная победа): запрос + бюджет + магазин видны одновременно; весь refinement в одной панели; пустая выдача отличается от сетевой ошибки; просмотр деталей сохраняет контекст. Критерии проверяются локальными screenshots и e2e, а не заявлением роста конверсии.

Reference-board candidates: Reserved mobile search (явное поле), Asket desktop catalog (тихая плотность), Colorful Standard mobile filters (единая sheet), MODIVO mobile catalog (бренд и цена), Colorful Standard PDP (gallery). Интегратору собрать небольшой подписанный board из разных источников, не копировать целую страницу и не брать фото для каталога.
