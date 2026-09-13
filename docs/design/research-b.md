# Weft — market research B

Дата проверки: **12 сентября 2026**, UTC. Исследовательская выборка B: 10 сайтов, 40 основных кадров; дополняет `research-a.md`, не заменяет общую выборку из 20. Это экспертное наблюдение, не usability-тест, не измерение конверсии и не утверждение о предпочтениях покупателей.

## Метод и ограничения

Настоящий Chromium/Playwright, чистые контексты без аккаунтов. Основные D-кадры: 1440×1000, M: 390×844, zoom 100%, DPR 1. Для основных mobile использованы отдельные контексты `is_mobile`/`has_touch`; UA остаётся Chromium, поэтому это эмуляция узкого touch-браузера, не проверка Safari на физическом iPhone. Каждый из 40 основных PNG открыт инструментом просмотра изображения; наблюдения ниже относятся к видимому кадру. JSON рядом содержит точный timestamp, конечный URL и дополнительные сведения. Списки товаров динамические: цены/количество здесь — свидетельства экрана, не предложение покупки.

Отказы от необязательных cookies выбирались, где доступны. Everlane первоначально закрывала большую часть экрана подпиской −20%; она закрыта через No Thanks, cookies отклонены. Reformation требовала закрытия cookies и выбора текущего региона; Rains — Rest of World и необходимых cookies. Эти препятствия не принимаются за дизайн основного экрана. Заказов, регистрации, контактов продавцам и личных данных не было; защиту сайтов не обходили.

Не засчитаны: Farfetch, SSENSE, NET-A-PORTER, MR PORTER, Lyst, Depop — HTTP 403; Mytheresa — фирменная BOT/error-страница при HTTP 200; Daydream — 429; Sézane и Weekday — 403; Patagonia — полученная 404; END — повторяющийся диалог ошибки 416, мешающий содержательной проверке. Это ограничения данной сессии, не утверждение, что сайты недоступны обычному покупателю. Сохранённые диагностические изображения этих сайтов не входят в 40 доказательных кадров.

Arc’teryx автоматически выбрал Canada/English. Начальная домашняя hero-область в сессии была неполной/пустой; **два home-кадра заменены содержательной домашней editorial-секцией при scrollY=600**, а не названы начальным viewport. Результаты сняты сверху. В основной выборке нет проверки доставки в Литву для сайтов с другим выбранным рынком.

## Evidence matrix

Факты о присутствии — из официальных страниц; они не доказывают качество UX. Наблюдения и переносимые решения — экспертная интерпретация изображений. «AI не проверен» не означает отсутствия AI. `4 кадра` означает home D/M и catalogue D/M, с оговоркой Arc’teryx выше. Пути всех доказательств перечислены в следующем разделе.

| Продукт / тип | Рынок кадра | Сигнал присутствия / источник (факт) | Просмотрено | Desktop strengths | Mobile strengths | Недостатки | AI/discovery / статус | Для Weft (вывод) | Не переносить | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| GLAMI / агрегатор | LT/LT/EUR | [Компания](https://www.glami.group/): self-reported 13 стран, 4600+ e-shops; страница без даты | 4 кадра, поиск/price-modal walkthrough | Поиск главный; магазин/размеры в карточке | Видимый поиск; единая панель фильтров | Категории отодвигают товары вниз | AI классификация/рекомендации официально; natural-query проверка отдельно ниже | Запрос и магазин видны рядом с выдачей | Переполненную категорийную шапку | `glami-*` |
| Vinted / resale marketplace | LT/LT/EUR | [FY2025](https://company.vinted.com/newsroom/financial-results-2025), 09.04.2026: GMV €10.8 млрд, выручка €1.1 млрд | 4 кадра; query, suggestions, PDP, back, price, narrow filters | Немедленный feed на home; condition/size | Поиск отдельной строкой; 2 колонки | Большое рекламное пустое место на results/PDP; две цены требуют понимания | Suggestions наблюдались; это не доказательство AI | Сохранять запрос, показывать полезные атрибуты | Рекламные пустоты и искусственную срочность | `vinted-*` |
| Everlane / бренд | US/EN/USD | [Официальная компания](https://www.everlane.com/pages/about), [сайт](https://www.everlane.com/): физические магазины и собственный онлайн-каталог; не оценка трафика | 4 кадра | Компактные фильтры, цена и swatches | Filter & Sort одной строкой над сеткой | Видео-home без одежды; первоначальная подписка | Editorial/material discovery видно; AI не проверен | Спокойные карточки с короткими метаданными | Newsletter takeover | `everlane-*` |
| Reformation / бренд | LT/EN/EUR | [Официальные магазины](https://www.thereformation.com/stores.html): международная розница, не пользовательская статистика | 4 кадра | Выраженная serif/фото-иерархия; price рядом с именем | Категорийная горизонтальная лента; два товара | Floating search перекрывает низ; большой wordmark и слабый контраст hero | Поисковый prompt виден; AI не подтверждён | Характер через фотографию/типографику, не декор | Постоянное перекрытие контента поиском | `reformation-*` |
| Ganni / бренд | LT/EN/EUR | [Официальный store locator](https://www.ganni.com/en-gb/store-locator.html): международные точки; страница недатирована | 4 кадра; desktop filter drawer; остальные walkthrough-шаги частичны | Компактное описание; крупная одежда; ясный drawer | Поиск широким полем; 2 колонки | Верхняя promo-анимация наложилась в момент кадра | Search/editorial видны; AI не подтверждён | Крупная одежда, ограниченное вступление, единый refinement | Повторять скидку на каждой карточке | `ganni-*` |
| Acne Studios / бренд | EU/EN/EUR | [Официальные магазины](https://www.acnestudios.com/us/en/stores/): несколько городов/точек, не трафик | 4 кадра | Очень компактная шапка; 4 больших фото | Сетка начинается рано, 2 колонки | Tiny icon-only controls; обрезанные названия на M | Editorial/category discovery; AI не проверен | Уменьшить chrome, сохранить одежду крупной | Неясные иконки и слишком мелкие подписи | `acne-*` |
| Arc’teryx / technical apparel | CA/EN | [Amer FY2025](https://www.amersports.com/newsroom/amer-sports-publishes-annual-report-for-fiscal-year-2025/): официальная отчётность о международном растущем бренде | 4 кадра; home scroll600 | Activity/category discovery; понятные technical facets | Refine и Sort равноценны | Длинный category-hero до товаров; home load gap | Систематизация по activity; AI не проверен | Смысловые фильтры, ясные названия | Огромное вступление перед поисковой выдачей | `arcteryx-*` |
| Boden / бренд | UK/EN/GBP | [Официальная история](https://www.boden.com/pages/about-us): с 1991, выход в США в 2002; исторический сигнал, не текущий трафик | 4 кадра; PDP/back, filter attempt | Читаемая цена, fit/size на PDP; ясные фото | Две колонки с читаемыми именами; Filter/Sort | Coupon/Selling Fast повторяются; floating widgets | Editorial discovery; AI не проверен | Размер/посадка отдельными понятными группами | Непроверенную срочность и счётчики интереса | `boden-*` |
| Rains / бренд | Rest of World/EN/EUR | [Официальные магазины](https://rains.com/pages/stores): Амстердам, Стокгольм, Гамбург и др. | 4 кадра | Крупный фото-язык; model/product и density controls | 2 колонки; видны имя и цена | Floating Filter закрывает данные; большой вводный текст | Model/product toggle наблюдается; AI не проверен | Давать контроль представления только при реальной пользе | Фильтр поверх цены/названия | `rains-*` |
| UNIF / независимый бренд | EN/EUR | [Официальное About](https://www.unifclothing.com/en-gb/pages/about-unif): реальный бренд; количественная популярность НЕ установлена | 4 кадра | Уникальная fashion-фотография; плотная сетка | Ассортимент сразу, компактная шапка | Белые цены на светлой одежде; coupon-overlay | Editorial discovery; AI не проверен | Характер через art direction без лишних блоков | Текст поверх непредсказуемых фото | `unif-*` |

UNIF — нишевый визуальный референс; его не следует считать одним из обязательных широко известных игроков. Финансовые сигналы Vinted/GLAMI и существование магазинов не сопоставимы как численная мера популярности.

## 40 просмотренных кадров

Во всех строках дата 2026-09-12. D=1440×1000, M=390×844. Регион/язык указан в таблице выше. URL H/C в заголовке сайта — точный адрес соответствующего home/catalog кадра; ссылки на PNG — относительные к этому документу. Точные timestamps — в одноимённых JSON.

### GLAMI — [H](https://www.glami.lt/) / [C](https://www.glami.lt/moteriski-drabuziai/)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/glami-home-desktop.png) | Фиолетовый одноуровневый header; крупная формулировка поиска и длинное поле в центре; три гендерные фотокарточки ниже, реальные товары не в первом ряду. |
| [H M](../../.omx/artifacts/frontend/research-b/glami-home-mobile.png) | Трёхстрочный заголовок; поле почти во всю ширину около y308; три категории в одной строке около y394, затем фотокатегории. |
| [C D](../../.omx/artifacts/frontend/research-b/glami-results-desktop.png) | Светло-фиолетовая строка запроса; категории слева, chips над grid; в карточках различимы цена, размеры и магазин. |
| [C M](../../.omx/artifacts/frontend/research-b/glami-results-mobile.png) | Крупные категории занимают примерно y186–568; фильтры только около y630; первые товары начинаются около y714 — слишком поздно для search-first продукта. |

### Vinted — [H](https://www.vinted.lt/) / [C](https://www.vinted.lt/catalog/1037-outerwear)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/vinted-home-desktop.png) | Очень широкое поле поиска; feed из пяти колонок около y204; бренд, размер, состояние и цена под неоднородными пользовательскими фото. |
| [H M](../../.omx/artifacts/frontend/research-b/vinted-home-mobile.png) | Поиск отдельной строкой под header; два товара около y255; состояние/размер и полная цена с защитой покупателя доступны без PDP. |
| [C D](../../.omx/artifacts/frontend/research-b/vinted-results-desktop.png) | Рекламный placeholder y160–438; pills фильтров около y539 и активная категория с крестиком; grid начинается только около y913. |
| [C M](../../.omx/artifacts/frontend/research-b/vinted-results-mobile.png) | Ad-placeholder y167–295; Filters(1) рядом с заголовком, count ниже; две карточки появляются около y553. |

### Everlane — [H](https://www.everlane.com/) / [C](https://www.everlane.com/collections/womens-new-arrivals)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/everlane-home-desktop.png) | Cream promo-strip и компактный uppercase nav; hero — дорога/автомобиль, не одежда; центральная белая надпись и небольшой CTA. |
| [H M](../../.omx/artifacts/frontend/research-b/everlane-home-mobile.png) | Header с поисковой иконкой; видео занимает почти y75–767; play/mute видны, товарного предложения в первом экране нет. |
| [C D](../../.omx/artifacts/frontend/research-b/everlane-results-desktop.png) | Компактные breadcrumb/title и прямоугольные filter-tabs; четыре фотографии начинаются около y278; цена, swatches и материал отделены от фото. |
| [C M](../../.omx/artifacts/frontend/research-b/everlane-results-mobile.png) | Filter & Sort слева, count справа; две колонки около y249; небольшие swatches и цена не спрятаны в hover. |

### Reformation — [H](https://www.thereformation.com/) / [C](https://www.thereformation.com/dresses-all)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/reformation-home-desktop.png) | Очень большой wordmark над fashion-photo; белая serif-фраза на светлом платье теряет контраст; floating search снизу справа. |
| [H M](../../.omx/artifacts/frontend/research-b/reformation-home-mobile.png) | Hero занимает экран до y607; категории начинаются ниже; fixed search «looking for something?» перекрывает нижний край. |
| [C D](../../.omx/artifacts/frontend/research-b/reformation-results-desktop.png) | Шесть category-photo y292–600; фильтры около y675; одежда в grid лишь с y702, wordmark занимает значительное место. |
| [C M](../../.omx/artifacts/frontend/research-b/reformation-results-mobile.png) | Горизонтальная category-photo лента y181–310; size/color/type/all/sort около y375; 2 колонки с ценой и цветами с y407, floating search остаётся. |

### Ganni — [H](https://www.ganni.com/en-lt/home) / [C](https://www.ganni.com/en-lt/clothing/)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/ganni-home-desktop.png) | Явный search в header; hero сумки на жёлтом фоне; в момент снимка текст promo-перехода наложился — transient, не доказанный постоянный дефект. |
| [H M](../../.omx/artifacts/frontend/research-b/ganni-home-mobile.png) | Большой wordmark и отдельное широкое серое поле search; выразительное фото y164–668; товары начинают появляться около y750. |
| [C D](../../.omx/artifacts/frontend/research-b/ganni-results-desktop.png) | Короткое описание с More info; count и Filter & sort над четырьмя фото; имя/цена в одной строке, quick-buy обозначен маленьким плюсом. |
| [C M](../../.omx/artifacts/frontend/research-b/ganni-results-mobile.png) | Search остаётся видимым; Filter & sort перед category-rail; два крупных фото y382–656 и цена сразу под ними. |

### Acne Studios — [H](https://www.acnestudios.com/eu/en/home) / [C](https://www.acnestudios.com/eu/en/woman/clothing/)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/acne-home-desktop.png) | Header около 60px; гигантский белый wordmark поверх тёмного портрета; коллекция появляется лишь около y870. |
| [H M](../../.omx/artifacts/frontend/research-b/acne-home-mobile.png) | Узкие icon-only cells около 45px; большой portrait crop; название следующей коллекции около y630. |
| [C D](../../.omx/artifacts/frontend/research-b/acne-results-desktop.png) | Nav/subnav/title/count очень компактны; четыре фото с y179; синие uppercase названия и EUR-цена под ними, почти без декора. |
| [C M](../../.omx/artifacts/frontend/research-b/acne-results-mobile.png) | Две колонки с y194; count и Filter прямо над grid; длинные имена обрезаны/исчезают у края, мелкие иконки требуют угадывания. |

### Arc’teryx — [H](https://arcteryx.com/ca/en) / [C](https://arcteryx.com/ca/en/c/mens/shell-jackets)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D, scroll600](../../.omx/artifacts/frontend/research-b/arcteryx-home-desktop.png) | После неполного hero видны две editorial-плитки: тёмные волокна и жёлтая technical-куртка; serif display сочетается с sans подписью; верх кадра ещё частично пуст. |
| [H M, scroll600](../../.omx/artifacts/frontend/research-b/arcteryx-home-mobile.png) | Одна плитка про circular system; крупный двухстрочный serif; простая ссылка See the system и начало следующей истории снизу. |
| [C D](../../.omx/artifacts/frontend/research-b/arcteryx-results-desktop.png) | Utility+nav и serif Shell jackets; четыре activity-category плитки y250–673; filters около y715, товары y784. |
| [C M](../../.omx/artifacts/frontend/research-b/arcteryx-results-mobile.png) | Header около 153px; carousel с точками y244–541; Refine и Sort равной ширины около y613, grid около y666. |

### Boden — [H](https://www.boden.com/) / [C](https://www.boden.com/collections/womens-dresses)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/boden-home-desktop.png) | Зелёный wordmark, editorial-группа в клетчатой одежде; красное большое LONDON справа; белый Shop New In и категории под hero. |
| [H M](../../.omx/artifacts/frontend/research-b/boden-home-mobile.png) | Красное LONDON по центру фотографии; Shop New In около y456; две категории около y555, floating help/accessibility icons снизу. |
| [C D](../../.omx/artifacts/frontend/research-b/boden-results-desktop.png) | Центрированный короткий вводный текст; Filter слева и Sort справа; четыре фото y322–783, но Selling Fast и coupon повторяются под каждой карточкой. |
| [C M](../../.omx/artifacts/frontend/research-b/boden-results-mobile.png) | Равноценные Filter/Sort около y220; два фото y276–524; многострочные имена и цены читаемы, promo и floating chat добавляют шум. |

### Rains — [H](https://rains.com/) / [C](https://rains.com/collections/womens-outerwear)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/rains-home-desktop.png) | Floating pill-nav поверх bronze-jacket фото; Search подписан справа; огромный полупрозрачный серый headline внизу даёт характер, но слабый контраст. |
| [H M](../../.omx/artifacts/frontend/research-b/rains-home-mobile.png) | Pill logo/menu/search; портретный crop; серый headline около y421, CTA y507, первые продукты около y694. |
| [C D](../../.omx/artifacts/frontend/research-b/rains-results-desktop.png) | Краткий ввод слева и category-chips; count, model/product и density controls; четыре фото с y411, floating Filter перекрывает низ по центру. |
| [C M](../../.omx/artifacts/frontend/research-b/rains-results-mobile.png) | Вводный текст y176–270; count и sort/model/product занимают ещё две строки; grid y441–731, чёрный Filter накрывает товарные данные у нижнего края. |

### UNIF — [H](https://www.unifclothing.com/) / [C](https://www.unifclothing.com/collections/new)

| Кадр/состояние | Наблюдения |
|---|---|
| [H D](../../.omx/artifacts/frontend/research-b/unif-home-desktop.png) | Зернистый полноэкранный editorial-портрет; белый overlay-nav и тёмный logo на тёмном участке; Summer Pt 1 снизу, product-strip с y724. |
| [H M](../../.omx/artifacts/frontend/research-b/unif-home-mobile.png) | Другой responsive portrait crop; маленькие menu/search; две товарные фотографии с y493 и coupon Get $20 Off поверх нижнего края. |
| [C D](../../.omx/artifacts/frontend/research-b/unif-results-desktop.png) | Компактный Filter and Sort/Featured/count; три крупные фотографии с y133; имя и цена белым прямо на фото. |
| [C M](../../.omx/artifacts/frontend/research-b/unif-results-mobile.png) | Две колонки с y120 и высокая плотность; белые подписи теряются на cream-shirt; coupon закрывает часть нижней карточки. |

## Углублённые walkthrough: выполненное и пробелы

Дата всех дополнительных кадров — 12.09.2026; точные UTC timestamps и конечные URL — `{site}-walk.json` / `{site}-walk-repair.json`. D — 1440×1000. Дополнительные `walk-mobile-filter` сделаны **resize desktop-контекста до 390×844**, поэтому свидетельствуют о narrow responsive layout, а не полном мобильном UA. Все ссылки ниже открыты инструментом просмотра. Это **четыре углублённых среза, не четыре полностью пройденных end-to-end сценария**.

| Сайт / состояние / URL | Кадр | 2–4 конкретных наблюдения | Ограничения |
|---|---|---|---|
| Vinted / ввод `paltas`, [home](https://www.vinted.lt/) / D | [Suggestions](../../.omx/artifacts/frontend/research-b/vinted-walk-suggestions.png) | Под широким полем список продолжений `paltas rudeniui`, `paltas vilna`; отдельное действие поиска исходной строки; остальной feed остаётся контекстом | Suggestions не названы AI |
| Vinted / [submit](https://www.vinted.lt/catalog?search_text=paltas) / D | [Results](../../.omx/artifacts/frontend/research-b/vinted-walk-search-results.png) | Запрос сохранён в header; filters доступны над grid; большой ad-block отодвигает товары | Фильтры далее изучены отдельно в outerwear, не выдано за непрерывную query+filter цепочку |
| Vinted / [outerwear](https://www.vinted.lt/catalog/1037-outerwear) / D | [Price popup](../../.omx/artifacts/frontend/research-b/vinted-walk-filter-open.png) | Небольшой anchored popup с minimum/maximum; поле minimum имеет видимую рамку focus; текущая категория остаётся чипом | Не измерялся screen-reader flow |
| Vinted / category1037 + price_to150 / D | [Applied budget](../../.omx/artifacts/frontend/research-b/vinted-walk-price-selected.png) | Активный chip `Didžiausia 150,00 €` появился; maximum150 остаётся в popup; count и товары обновлены под toolbar | Сортировка не применена |
| Vinted / то же состояние / D | [Sort options](../../.omx/artifacts/frontend/research-b/vinted-walk-sort-options.png) | Четыре radio-пункта включая дешевле/дороже/новее; выбран актуальный relevance; ссылка объяснения ранжирования внизу | Просмотр вариантов, не проверка их эффекта |
| Vinted / [реальный item](https://www.vinted.lt/items/9965028002-skorzana-kurtka-niebieska-xxl?referrer=catalog) / D | [PDP](../../.omx/artifacts/frontend/research-b/vinted-walk-details.png) | Крупная фотомозаика; справа size/condition/material/colour; две цены и объяснение buyer protection | Back вернул URL категории; сохранение фильтра/scroll не доказано этим отдельным прогоном |
| Vinted / outerwear / narrow | [Filter panel](../../.omx/artifacts/frontend/research-b/vinted-walk-mobile-filter.png) | Полноэкранные строки facets; Clear all наверху; широкая кнопка Show results закреплена снизу | Empty-query шаг остановлен неоднозначным selector; empty не подтверждён |
| GLAMI / natural query / D | [Query panel](../../.omx/artifacts/frontend/research-b/glami-walk-natural-suggestions.png) | Исходная фраза полностью помещается в крупном поле; ниже только search-chip этой же фразы; фон размыт, закрытие справа | Не обнаружена видимая semantic интерпретация |
| GLAMI / [результат natural query](https://www.glami.lt/?q=juodas%20vilnonis%20paltas%20iki%20150%20eur%C5%B3) / D | [Zero results](../../.omx/artifacts/frontend/research-b/glami-walk-natural-results.png) | `0` найденных; исходный запрос сохранён; ясный empty-текст предлагает изменить запрос и показывает категории | Запрос принят, но это **не доказательство AI**: нет extracted budget/material chips, результат пустой |
| GLAMI / women clothing / D | [Price modal](../../.omx/artifacts/frontend/research-b/glami-walk-filter-open.png) | Слева facet-rail, справа min/max и готовые budget ranges; отдельный Apply; нижняя широкая Show results/count | Выбор цены не применялся |
| GLAMI / women clothing / narrow | [Filter panel](../../.omx/artifacts/frontend/research-b/glami-walk-mobile-filter.png) | Двухколоночная панель групп и значений; count у категорий; нижняя кнопка результата доступна, длинные названия слева обрезаются | PDP/back не выполнены: не найден надёжный локальный product-link без outbound предположения |
| Ganni / clothing / D | [Filter drawer](../../.omx/artifacts/frontend/research-b/ganni-walk-filter-open.png) | Правая половина viewport отведена panel; accordion Sort/Colour/Size/Material; внизу явный View Items(441), grid затемнён | Query/PDP не подтверждены: generic `.html` открыл delivery help, **не товар**; `ganni-walk-details.png` исключён как PDP. Повторный точный product-link истёк по timeout |
| Boden / [Maeve dress](https://www.boden.com/products/women-maeve-check-midi-shirt-dress-green-navy-and-red-check-d1798grn) / D | [PDP](../../.omx/artifacts/frontend/research-b/boden-walk-details.png) | Две большие фотографии рядом; price/colour/fit и size отдельными группами; delivery/returns под CTA; счётчик интереса — нежелательный паттерн для Weft | Back вернул dresses category. Add to bag не нажимался; filters/search не были успешно открыты |

Ganni/Boden кадры с именем `walk-mobile-filter` фактически показывают **закрытую** панель/toolbar; названия файлов не трактуются как доказательство открытого drawer. Аналогично `boden-walk-filter-open.png` — каталог с видимой кнопкой Filter, не успешное открытие. Они не входят в четыре главных кадра и не повышают walkthrough coverage. Ошибки селекторов сохранены, а не выданы за дефекты сайта.

### Небольшая reference board

[Открыть board PNG](../../.omx/artifacts/frontend/research-b/reference-board.png) · [воспроизводимый HTML](../../.omx/artifacts/frontend/research-b/reference-board.html).

Четыре фрагмента из разных источников: Vinted — поле/suggestions; Everlane — grid; GLAMI — mobile refinement; Boden — product details. Подписи объясняют назначение и ограничения. Это внутренняя аналитическая композиция реальных кадров; никакие коммерческие фотографии не переносились в публичные assets Weft.

## Сопоставимые оценки 1–5

Это направленная экспертная оценка по наблюдённым поверхностям, не лабораторная accessibility-проверка. State score означает видимость состояния/возврата в просмотренной выборке; для не пройденного полного сценария уверенность ниже. 1 — существенно мешает; 3 — приемлемо/есть компромиссы; 5 — сильное решение для конкретного критерия, не безусловно лучший продукт.

S=ясность поиска; C=каталог; M=мобильное удобство; H=иерархия; I=товарная информация; F=фильтры; A=доступность ключевых действий; T=управление состоянием; D=уместность discovery; V=визуальный характер.

| Сайт | S | C | M | H | I | F | A | T | D | V |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GLAMI | 5 | 4 | 3 | 4 | 5 | 5 | 4 | 4 | 5 | 4 |
| Vinted | 5 | 4 | 4 | 3 | 5 | 4 | 4 | 4 | 4 | 3 |
| Everlane | 3 | 5 | 4 | 4 | 4 | 4 | 4 | 3 | 3 | 4 |
| Reformation | 3 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 5 |
| Ganni | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 5 |
| Acne Studios | 2 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 5 |
| Arc’teryx | 3 | 3 | 3 | 3 | 4 | 4 | 4 | 3 | 5 | 4 |
| Boden | 3 | 4 | 4 | 4 | 5 | 3 | 4 | 4 | 4 | 5 |
| Rains | 3 | 4 | 3 | 3 | 3 | 3 | 2 | 3 | 4 | 5 |
| UNIF | 2 | 3 | 3 | 2 | 2 | 3 | 2 | 3 | 3 | 5 |

Крайние оценки: GLAMI/Vinted S5 — доминирующее явное поле, а не один маленький значок. GLAMI I5 — магазин, размеры и цена в агрегаторной карточке; Vinted I5 — condition/size и две объясняемые цены; Boden I5 — fit/size/доставка на PDP. Everlane/Ganni C5 — крупные ровные фото и метаданные вне изображения. V5 у fashion-брендов означает узнаваемую арт-дирекцию, не разрешение копировать её. Acne/UNIF S2/A2 — компактные неочевидные иконки; Rains A2 — фильтр физически перекрывает информацию. UNIF I2/H2 — недостаточный предсказуемый контраст текста на фотографиях. Ни одной оценкой не заявляется соответствие WCAG.

## AI: официальные факты отдельно от интерактивной проверки

| Продукт | Датированное/официальное свидетельство | Что оно подтверждает | Статус этого исследования |
|---|---|---|---|
| Lyst | [AI-powered search FAQ](https://www.lyst.com/help/ai-powered-search/), недатировано, просмотрено 12.09.2026 | Запросы по occasion/style/material/fit/budget; возможны разговорный ответ и/или товары; выдача не гарантирует точность, ranking может учитывать коммерческие факторы | **Официально заявленная текущая функция**, браузер 403; не проверена интерактивно |
| Lyst Lens | [Официальная app help](https://help.lyst.com/hc/en-gb/articles/36133679317778-What-can-I-do-on-the-Lyst-App), обновление 05.08.2026 | Поиск визуально похожей одежды по фото в приложении | Официально заявлено; приложение не устанавливалось, фото не загружались |
| Zalando Assistant | [Анонс 01.10.2024](https://corporate.zalando.com/en/technology/zalando-brings-its-ai-powered-assistant-all-markets-and-adds-four-new-cities-its-trend); [FY2025, 12.03.2026](https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results) | Анонс beta для авторизованных клиентов в 25 рынках на тот момент; поздняя отчётность сообщает 6 млн пользователей Assistant | Текущее существование подкреплено официальной отчётностью, **не** hands-on без аккаунта; 25 рынков не переносится как сегодняшнее число |
| GLAMI | [Официальная компания](https://www.glami.group/), просмотрено 12.09.2026 | AI классификация text/image, similarity и рекомендации для fashion-агрегации | Публичный LT каталог и поисковый интерфейс просмотрены; не считать обычные chips доказательством AI. Старый эксперимент ChatGPT для Czechia — не доказательство живого LT assistant |
| Daydream | [Официальное About](https://daydream.ing/about), просмотрено 12.09.2026 | Natural-language/multimodal fashion discovery официально позиционируется как AI shopping | 429 в интерактивном браузере; не включён в визуальные 10 и не назван hands-on |
| Depop | [Анонс 12.09.2024](https://news.depop.com/depop-launches-ai-powered-listing-from-one-photo/) | AI помогает продавцу создавать listing по фото | Это seller tooling, **не** доказательство buyer natural-language discovery; сайт 403 |

Практический вывод: Weft может показывать разбор запроса в редактируемые ограничения и подтверждённые атрибуты совпадения; нельзя называть AI обычные suggestions или обещать персонализацию без её реализации. Официальная доступность функции и проверенный конкретный рынок/аккаунт — разные категории свидетельств.

## Принципы для Weft и критерии проверки

1. Проблема: брендовые hero часто вытесняют одежду и поиск. Изменение: естественный запрос — основной вход; на results отсутствует второй огромный hero. Проверка: поле и минимум верх первого ряда товаров видны при 390×844.
2. Проблема: категории GLAMI/Arc’teryx занимают почти весь mobile экран. Изменение: одна компактная горизонтальная строка плюс All filters. Проверка: intro не выше списка результатов.
3. Проблема: floating controls Rains/Reformation перекрывают товары. Изменение: toolbar в потоке или sticky с зарезервированным местом. Проверка: цена/название и focus никогда не закрыты.
4. Проблема: агрегатор без магазина теряет контекст. Изменение: нейтральный demo-store рядом с ценой и честный demo status. Проверка: не нужно открывать PDP для понимания источника; реальные retailer slugs не появляются.
5. Проблема: большой запрос исчезает в маленьком поле. Изменение: сохранять исходный запрос и показывать active constraint chips. Проверка: query/budget/store читаются после фильтра и Back.
6. Проблема: белый текст UNIF на фотографии непредсказуем. Изменение: имя, цена, магазин вне фото на постоянном фоне. Проверка: светлые/тёмные/error фотографии не меняют контраст метаданных.
7. Проблема: icon-only chrome требует угадывания. Изменение: Search/Filters/Clear имеют подпись; иконки — дополнение. Проверка: keyboard, доступное имя и видимый focus.
8. Проблема: facets раздроблены на много popup. Изменение: одна mobile-панель с черновиком выбора, clear и явным Apply/count. Проверка: закрытие не применяет неожиданные изменения и возвращает focus.
9. Проблема: крикливые промо и urgency отвлекают. Изменение: один характерный accent, типографика и одежда; без fake popularity/скидок. Проверка: главный CTA не конкурирует с десятью badges.
10. Проблема: AI подаётся как магия. Изменение: интерпретация natural query, редактируемый бюджет и короткое объяснение по данным; ошибка AI не равна empty catalog. Проверка: AI success/fallback/error различимы без ложных обещаний.

Реалистичные возможности, пока **гипотезы**, а не доказанное превосходство: (a) видеть запрос, бюджет и магазин без второго экрана; (b) изменять бюджет одним понятным действием; (c) сохранить query/filter/scroll при возврате из детали; (d) отличать отсутствие совпадений, ошибку загрузки и демонстрационный каталог. Критерий — наблюдаемые состояния в screenshot/E2E, не выдуманный A/B uplift.

Для реализации accessibility опираться на [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (focus, contrast, target size, reflow), а performance — на [Core Web Vitals](https://web.dev/articles/vitals). Исследовательские PNG ничего не доказывают о field CWV; для Weft нужны отдельные измерения, без присвоения конкурентам выдуманных score.

## Handoff

Все чужие PNG — внутренний аналитический материал в `.omx/artifacts`, не production assets. Не использовать фотографии конкурентов в Weft. Основные переносы для decision log: GLAMI search prominence → SearchSurface; Everlane/Ganni grid rhythm → ProductCard; GLAMI/Ganni refinement panel → mobile Filters; Vinted/Boden attribute clarity → ProductDetails; UNIF/Rains contrast/overlay counterexamples → визуальные regression checks. Имена компонентов здесь смысловые, не утверждение о существующих repo symbols; лидер связывает с фактическими изменениями и тестами.
