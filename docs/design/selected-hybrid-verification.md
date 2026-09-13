# Weft — выбранный гибрид: реализация и проверка

12 сентября 2026 · `codex/weft-frontend-redesign` · локальная реализация завершена.

Актуальный результат: главная A, поисковая строка A, каталог B, левые фильтры по принципу C. Белый фон, чёрная служебная типографика и фотографии одежды; предыдущие cream/serif и cold-studio версии отклонены. Источник решений — [DESIGN.md](../../DESIGN.md). Эта запись заменяет визуальные выводы предыдущих handoff/revision-документов, сохраняя их как историю.

## Посмотреть

Оставлен один локальный production-preview: [главная](http://127.0.0.1:3100/?lang=en), [каталог](http://127.0.0.1:3100/search?lang=en). Это не публикация в интернете.

| Поверхность | Desktop | Mobile |
| --- | --- | --- |
| Главная EN | [скриншот](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-en-desktop.png) | [скриншот](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-en-390.png) |
| Главная LT | [скриншот](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-lt-1440.png) | [скриншот](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/home-lt-390.png) |
| Каталог EN | [4 колонки](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-4-desktop.png) | [2 колонки](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-mobile-390.png) |
| Каталог LT | [скриншот](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/browse-lt-1440.png) | [скриншот](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/browse-lt-390.png) |

Дополнительно: [3 колонки](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-3-desktop.png), [5 колонок](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-5-desktop.png), [скрытые фильтры](../../.omx/artifacts/frontend/selected-hybrid-qa/screenshots/catalog-en-sidebar-hidden-desktop.png). В папке screenshots также сохранены результаты запроса black, детали товара и избранное в EN/LT на desktop/mobile.

## Что реализовано

- Главная: крупный фрагмент реальной фотографии MOCK-011, плавающая белая навигация с поиском, нижний заголовок/переход в каталог и небольшое изображение вещи целиком. При отсутствии товара не выдумываются замена или цена.
- Каталог: 4 колонки по умолчанию, фотографии 4:5, горизонтальный зазор 2 px, спокойная строка названия/магазина/цены. Поиск ограничен по ширине, а не растянут на экран.
- Левые фильтры шириной 216 px можно скрыть. Изменения применяются явно; Cancel/Escape/закрытие мобильной панели сбрасывают черновик.
- Вместо большого переключателя — небольшой нативный `View: 4` рядом с сортировкой. 3/4/5 сохраняются локально и не меняют URL, ранжирование или размер страницы. Слишком плотный вариант недоступен при недостаточной ширине. На телефоне две колонки, на планшете три; desktop-предпочтение восстанавливается.
- Поиск, сортировка и фильтры сохраняют нативную GET-работу без JavaScript; зависимый от JS выбор плотности в этом режиме скрыт. Блокировка localStorage не ломает управление.
- Общая типографика и токены согласованы с карточкой товара, избранным, магазинами и служебными страницами. Тема и приблизительный 3D-preview остаются доступны, но не занимают главную навигацию.
- Исправлен обнаруженный ревьюером случай немедленной отправки формы после переключения языка: URL, серверные результаты и интерфейс теперь используют одно актуальное языковое намерение.

Основные изменённые поверхности: `app/page.tsx`, `app/search/page.tsx`, `app/layout.tsx`, `app/globals.css`; компоненты `site-header`, `site-footer`, `search-input`, `search-controls`, `search-form`, `locale-provider`, `product-grid`, `product-detail-view`; новые `category-nav` и `theme-toggle`; `lib/i18n.ts`, `lib/use-client-locale.ts`. Регрессии: `scripts/selected_hybrid_e2e.py`, `scripts/locale_form_intent_e2e.py`. Обновлены DESIGN/CLAUDE и текущие описания в app/components AGENTS. Предшествующие изменения в общей рабочей ветке сохранены; этот список не приписывает данной итерации весь dirty worktree.

Упрощения: удалена прежняя визуальная композиция вместо наложения альтернативной темы; Syne оставлен только у wordmark, основной интерфейс использует Arial/Helvetica; нативные select/dialog/form переиспользуют существующую модель URL и серверные результаты. Новых зависимостей в этой итерации нет.

## Проверки

Проверки выполнены на production-сборке локального приложения, с настоящим порядком синтетического каталога. Секреты необязательных сервисов не использовались; `.env.local` не изменён.

| Проверка | Результат |
| --- | --- |
| `npm run build` | PASS, 81 маршрут |
| `npm run lint`, `npm run typecheck` | PASS; обе команды проверяют TypeScript, отдельного ESLint-аудита не заявлено |
| `git -c core.safecrlf=false diff --check` | PASS |
| `npm run test:unit` | 56/56 PASS |
| `npm run test:integration` | 15/15 PASS |
| `npm run test:locale` | 3 125 assertions PASS, 14 маршрутов, 231 переход, 0 ошибок браузера |
| `python scripts/locale_form_intent_e2e.py` | 8/8 PASS: home/search/sort/filters, оба направления EN/LT |
| `python scripts/navigation_race_e2e.py` | 3/3 PASS: поздний ответ не заменяет новый запрос |
| `python scripts/selected_hybrid_e2e.py` | 11/11 групп PASS; 24 axe-сканирования без нарушений; 0 ошибок браузера |
| `npm run test:search` — только DEV/REGRESSION | Пороговый gate PASS; DEV 44/44, REGRESSION 47/48 — ограничение ниже |

Матрица responsive: 320/360/390/430/768/1280/1440/1920 px, без горизонтального переполнения документа. Проверены EN/LT, светлая/тёмная тема, фокус и Escape в фильтрах, Apply/Cancel/reset, multi-store, бюджет, скрытие sidebar, плотность и её восстановление, отсутствие JS и блокировка хранилища. Локально прокручиваемая строка категорий и обрезанный внутри hero увеличенный снимок не являются переполнением документа.

Машиночитаемая база: [browser/visual/axe report](../../.omx/artifacts/frontend/selected-hybrid-qa/report.json), [locale summary](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-summary.json), [locale-form red](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent-before.json), [locale-form green](../../.omx/artifacts/frontend/selected-hybrid-qa/locale-form-intent.json), [navigation race](../../.omx/artifacts/frontend/qa-browser/navigation-race-report.json). Для браузерных скриптов используется `BASE_URL=http://127.0.0.1:3100` при запущенном `npm run start -- --hostname 127.0.0.1 --port 3100`.

Последняя полная locale-проверка выполнена после исправления форм. Следующие изменения касались только доступного имени переключателя плотности и его скрытия без JS; после них повторены build/typecheck, browser/axe/no-JS и 8 сценариев отправки форм.

## Визуальное подтверждение и независимое ревью

Применены repo-local навыки `design` и `frontend-design`: выбор владельца закреплён как единый контракт компонентов и токенов. `visual-ralph` использован в App-safe режиме для цикла эталон → скриншот → вердикт → исправление; не заявляются запуск tmux-команды, активный goal/runtime или новый эстетический выбор. `code-review` дал два независимых прохода с нативными ролями code-reviewer и architect.

Сопоставлены утверждённые [главная A](../../.omx/artifacts/frontend/visual-concepts-02/a-home-en-desktop.png) и [компактный каталог](../../.omx/artifacts/frontend/visual-selected-03/catalog-en-4-compact-desktop.png) с реальными браузерными снимками. Финальные кадры просмотрены визуально, включая desktop/mobile EN/LT и 5 колонок. На 1440 px: поиск x=25/ширина770; sidebar216; toolbar58; верх сетки y=238; карточка304.5×380.62; нет рамки, скругления или тени карточки.

Pixel-diff — вспомогательная метрика, не автоматическое одобрение: нормализованная MAE главной 0.007017, каталога 0.115831. В каталоге основное отличие связано с реальным составом/порядком товаров (регион изображений 0.173850); chrome значительно ближе: поиск/навигация0.007195, sidebar0.009349, toolbar0.015874. Ранжирование не подменено фикстурой для совпадения с макетом; названия категорий соответствуют реальным данным.

Финальный [визуальный вердикт](../../.omx/artifacts/visual-ralph/selected-hybrid/verdict-final.json): PASS, экспертная оценка96/100, не результат пользовательского тестирования. Независимое [ревью](../../.omx/artifacts/visual-ralph/selected-hybrid/final-review.md): code-reviewer APPROVE без открытых замечаний; architect CLEAR после воспроизведения и устранения языковой гонки. Первичный архитектурный BLOCK не скрыт: до исправления 4/8 сценариев проваливались, после 8/8 проходят; архитектор отдельно подтвердил 4/4 поиск/автосортировку.

## Ограничения и границы

- У существующего ранжирования остаётся один неуспешный REGRESSION-сценарий: REGRESSION-012, `something for a wedding`, 17 результатов вместо максимума12, precision0.60/recall1.0. Общий gate проходит, но это не 100% сценариев. Ranker, данные и eval-fixtures этой итерацией не изменены; blind-наборы не читались и не использовались для настройки. Исправление ранжирования не включено в визуальную задачу.
- Нет проверки живых Gemini/Supabase/аналитики, production-deployment, полевых Core Web Vitals, физических устройств, реального screen reader или Windows High Contrast. Axe не равен сертификации WCAG.
- Фотографии существующего синтетического каталога сохранены. Выбор Acne/Rains как направления не даёт разрешения на чужие фотографии и не означает подтверждение владельцем качества текущих манекенов.
- Сохранены публичные нейтральные магазины, безопасные DTO, fallback и RLS-контракт; `/out` остаётся просмотром без перехода к продавцу. Публичный контакт, лицензирование и affiliate-подключение остаются отдельными release-вопросами.
- Commit, merge в main, публикация и миграция БД не выполнялись. Старые визуальные артефакты оставлены как история. Задача реализации выбранной композиции завершена; личная эстетическая оценка владельца не заменяется автоматическими тестами.
