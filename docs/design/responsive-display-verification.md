# Weft — адаптация к большим мониторам и телефонам

12 сентября 2026 · ветка `codex/weft-responsive-displays`.

## Результат

Исправлено несоответствие, показанное владельцем на 2K-мониторе: фотографии растягивались, а текст, поиск и панель фильтров сохраняли размеры макета для 1440 px. Выбранный дизайн A/B/C сохранён. Четыре колонки остаются стандартом; переключатель 3/4/5 по-прежнему небольшой и запоминает выбор.

Вместо фиксированных размеров интерфейс использует связанную систему rem: масштаб плавно растёт от базового на 1440 до 1,5× на 2560 CSS px, затем ограничивается. На сверхшироких мониторах рабочая область не превышает 2560 px и центрируется. Это настоящая адаптивная вёрстка, без CSS zoom или масштабирования всей страницы через transform. Телефоны сохраняют отдельную компоновку с двумя колонками, планшеты — с тремя; фильтры открываются в панели. Высота главной также учитывает высоту окна.

| Измерение | 1440 px | 2560 px |
| --- | --- | --- |
| Навигация | 15 px | 22,5 px |
| Название вещи | 14 px | 21 px |
| Цена | 13 px | 19,5 px |
| Панель фильтров | 216 px | 324 px |
| Поиск, без внешних отступов | 770 px | 1155 px |
| Колонки по умолчанию | 4 | 4 |

На телефоне название вещи теперь 14 px, цена — 13 px, поля поиска — не менее 16 px. Цвета, фотографии, состав каталога, ранжирование, URL-фильтры и число результатов на странице не менялись. Стили избранного и 3D-предпросмотра используют ту же систему размеров; логика этих страниц не менялась. Подсказки `sizes` для загрузки изображений согласованы с rem-размерами, em-порогами и ограниченной рабочей областью: миниатюры получают достаточное разрешение, а сверхширокий экран не заставляет загружать неограниченно растущую картинку.

## Посмотреть

[Живой локальный каталог](http://127.0.0.1:3100/search?gender=women&lang=lt) · [Главная](http://127.0.0.1:3100/?lang=lt).

- [2K, до исправления](../../.omx/artifacts/frontend/responsive-display-baseline/screenshots/catalog-lt-women-2560.png) → [2K, после](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-2560.png).
- [2048 CSS px с DPR 1,25](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-2048-dpr125.png), [3840 CSS px](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-3840.png).
- [Каталог на телефоне](../../.omx/artifacts/frontend/responsive-display-final/screenshots/catalog-lt-women-390.png), [главная на 2K](../../.omx/artifacts/frontend/responsive-display-final/screenshots/home-lt-2560.png), [главная на коротком экране телефона](../../.omx/artifacts/frontend/responsive-display-final/screenshots/home-lt-390x667.png).

Финальные скриншоты 2K-каталога, главной и мобильного каталога просмотрены основным агентом; тестовый агент дополнительно просмотрел DPR-вариант и короткие экраны. Первая строка карточек на 2560×1440 помещается вместе с названиями и ценами; цена первой карточки заканчивается на y≈1222. На 3440/3840 рабочая область шириной 2560 центрирована с отступами 440/640 px.

## Проверки

- Новая responsive-регрессия: 7/7 групп PASS. Ширины 320, 390, 430, 768, 1024, 1280, 1440, 1920, 2048, 2560, 3440, 3840 px; дополнительные короткие окна 390×667, 1024×768, 1280×800, 1440×650.
- Проверены не только отсутствие переполнения документа, но и рост текста/поиска/sidebar, попарное отсутствие пересечений элементов header/toolbar, сохранение 3/4/5 после resize/reload, мобильные фильтры, содержимое главной и нативная работа сетки без JavaScript.
- Существующая selected-hybrid регрессия: 11/11 групп PASS, 24 axe-сканирования EN/LT и light/dark без нарушений, 0 ошибок браузера.
- Полная locale-регрессия: 3125 assertions PASS, 231 внутренний переход, 14 маршрутов, 0 ошибок браузера. Дополнительные немедленные переключения языка перед отправкой формы: 8/8 PASS.
- `npm run build`, `npm run lint`, `npm run typecheck`, `git diff --check`: PASS. Lint в этом проекте — TypeScript, не отдельный ESLint-аудит.
- `npm run test:unit`: 56/56 PASS. `npm run test:integration`: 15/15 PASS.

Артефакты: [исходные измерения](../../.omx/artifacts/frontend/responsive-display-baseline/report.json), [намеренная неуспешная проверка старой версии](../../.omx/artifacts/frontend/responsive-display-before-report/report.json), [финальная responsive-проверка](../../.omx/artifacts/frontend/responsive-display-final/report.json), [существующая browser/axe-регрессия](../../.omx/artifacts/frontend/responsive-display-regression/report.json), [locale](../../.omx/artifacts/frontend/responsive-display-final/locale-summary.json), [немедленная отправка форм после выбора языка](../../.omx/artifacts/frontend/responsive-display-final/locale-form-intent.json).

После полной locale/unit/integration-проверки изменились только атрибуты `sizes` изображений. После этого повторены build/lint/typecheck, обе browser-регрессии со свежими скриншотами, axe и 8 сценариев языкового намерения; логика поиска/локали не менялась.

Воспроизведение: при запущенной production-сборке на 3100 выполнить `python scripts/responsive_display_e2e.py --mode final --base-url http://127.0.0.1:3100`. Для существующего набора — `python scripts/selected_hybrid_e2e.py --base-url http://127.0.0.1:3100 --artifacts .omx/artifacts/frontend/responsive-display-regression`.

## Изменения и ограничения

Изменены `app/globals.css`, расчёт плотности в `components/search-controls.tsx`, CSS-блоки в `components/account-dashboard.tsx` и `components/ai-fitting-room.tsx`; добавлен `scripts/responsive_display_e2e.py`. Дополнительно скорректированы только image `sizes` в этих компонентах, `app/page.tsx`, `app/stores/page.tsx`, `components/product-grid.tsx` и `components/product-detail-view.tsx`. Контракт обновлён в DESIGN и текущих разделах AGENTS. Существующие несвязанные изменения рабочей ветки сохранены. Новых зависимостей, сервисов или маршрутов нет.

Навыки `design` и `frontend-design` помогли сохранить выбранную композицию и заменить фиксированные размеры согласованной адаптивной системой, а не вводить другую тему. Использованы App-safe работа и независимые нативные тестовый/ревью-проходы; tmux/goal-runtime не запускался. У design отсутствует служебный шаблон `.codex/templates/AGENTS.md`; применён действующий корневой AGENTS.md.

Независимое [финальное ревью](../../.omx/artifacts/frontend/responsive-display/final-review.md): APPROVE, открытых замечаний нет. Найденное замечание к image `sizes` исправлено; настольные миниатюры запрашивают консервативный максимум для масштаба 1,5× с учётом того, что source-size rem использует начальный, а не вычисленный CSS-шрифт. Это проверено по формуле и стандарту; отдельное подтверждение выбранного браузером файла через `currentSrc` не заявляется.

Автоматизация проверяет браузерные CSS-размеры и DPR, а не физическую диагональ или расстояние до монитора. Проверка увеличенного root-шрифта программная; настоящий пользовательский browser zoom/OS scaling и физический screen reader не тестировались. Известное прежнее ограничение одного сценария ранжирования из [предыдущего отчёта](selected-hybrid-verification.md) не менялось и повторно не оценивалось — это задача вёрстки. Локальный preview оставлен работающим; commit, merge и публикация не выполнялись.
