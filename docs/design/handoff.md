# Weft — frontend handoff

Последнее исправление: [адаптация под 2K, сверхширокие экраны и телефоны](responsive-display-verification.md). Выбранная композиция сохранена, фиксированные размеры заменены согласованным адаптивным масштабом.

Актуальный handoff: [реализованный гибрид A/B/C и финальная проверка](selected-hybrid-verification.md). Владелец выбрал главную и поиск A, каталог B, левые фильтры C и компактный выбор 3/4/5 колонок. Ниже сохранена история первоначальной реализации; и cream/serif, и последующая cold-studio ревизия отклонены и не являются текущим дизайном.

12 сентября 2026 · ветка `codex/weft-frontend-redesign`. Изменения локальные, без commit, merge в main, публикации, новых платных сервисов или миграции БД.

## Что получилось

Выбрано направление A: тёплый фон, тёмная типографика, сдержанный терракотовый акцент и одежда вместо декоративного AI-hero. На главной сразу доступны запрос, отправка, примеры и реальные изображения каталога. В выдаче поиск, бюджет, магазины, сортировка и сброс условий находятся рядом; первая строка товаров начинается около y=379 на desktop вместо исходных y≈873. На mobile поиск остаётся сверху, фильтры открываются в нижней панели с отдельными Apply/Cancel.

Карточки показывают фактические сведения и открывают детали. Возврат сохраняет query/filter/sort, избранное действительно сохраняется в браузере. EN/LT переключается без потери условий, включая немедленный следующий переход. Информационные страницы согласованы; Privacy описывает существующие данные, а не неработающую контактную форму. 3D показывает существующий приблизительный манекен вместо SOON, но не обещает AI-примерку или точную посадку.

## Посмотреть результат

| Поверхность | Desktop | Mobile |
| --- | --- | --- |
| Главная EN | [кадр](../../.omx/artifacts/frontend/final/home-en-desktop.png) | [кадр](../../.omx/artifacts/frontend/final/home-en-mobile.png) |
| Выдача LT | [кадр](../../.omx/artifacts/frontend/final/results-lt-desktop.png) | [кадр](../../.omx/artifacts/frontend/final/results-lt-mobile.png) |
| Детали EN | [кадр](../../.omx/artifacts/frontend/final/details-en-desktop.png) | [кадр](../../.omx/artifacts/frontend/final/details-en-mobile.png) |

Первичные и итоговые кадры разделены: `.omx/artifacts/frontend/baseline`, `pass-1`, `pass-2`, `final`. Дополнительные страницы — `secondary`, управляемые ошибки/диалоги/узкие экраны — `qa-browser/screenshots`. Тяжёлые материалы находятся вне git; существующая ignore-политика сохранена.

## Решения и источники

- [Аудит](audit.md): исходные проблемы, границы данных, baseline.
- [Исследование A](research-a.md) и [B](research-b.md): 20 существующих сайтов, 80 основных desktop/mobile кадров, дополнительные walkthrough. Недоступные действия и частичные проверки явно отмечены; заявления об AI отделены от живого браузерного подтверждения.
- [Три направления](directions-and-decisions.md): одинаковые товары, 12 отрисованных кадров, три схемы управления desktop/mobile, экспертная рубрика A93/B86/C76. Это не пользовательское A/B-исследование.
- [Пять палитр](palettes.md): полные semantic tokens и проверенные контрасты. Выбрана linen/rust — одежда остаётся самым цветным элементом.
- [Навыки и инструменты](skills-research.md): 13 кандидатов → семь shortlisted → три проверенных и установленных навыка. Реально использованы OMX0.21.5, его design-процесс, notepad checkpoint и типизированные native subagents. OMC-команда отсутствует; вымышленный вызов OMC не заявлен.
- [DESIGN.md](../../DESIGN.md) — действующий контракт; [EN/LT и release](copy-and-release.md) — словарь, privacy, инфраструктура и гипотезы после релиза.

Паттерны исследования адаптированы: одежда в первом экране; компактный поиск как основной вход; URL-backed chips; фильтры с явным применением; отделённое сохранение; доступная числовая сортировка. Чужие логотипы, отзывы, изображения и заявления о масштабах не перенесены в приложение.

## Изменения кода

- `app/page.tsx`, `app/search/page.tsx`, `app/globals.css`: единый storefront, новый hero, компактная выдача, responsive и light/dark tokens. Удалены неиспользуемые cinematic hero/filter wrapper и остатки скрывающего HTML route-loading оформления; возврат возможен из исходного Git commit.
- `search-form`, `search-input`, `search-controls`: native GET без JavaScript, настоящая индикация перехода, бюджет/несколько магазинов, draft/apply/cancel, удержание фокуса, сохранение редактируемого запроса при позднем ответе.
- `lib/search-params.ts`, `lib/search-cache-key.ts`: валидация и пересечение ручных условий; cache key учитывает входной каталог. Алгоритм semantic/hybrid ranking не перенастраивался.
- `lib/public-product.ts`, `product-detail-view`, `product-image`: публичный allowlist DTO, безопасный returnTo, реальные optional fields, галерея и честные image/price fallback.
- `locale-provider`, `site-header`, `proxy.ts`: серверный язык, cookie/prefetch/RSC границы и синхронное намерение при смене языка.
- `lib/saved-items.ts`, `wishlist-button`, `account-dashboard`: настоящее локальное сохранение, cross-tab события и работа при заблокированном storage. Старые preference-данные не удалялись.
- `fitting-room-avatar`: включена уже существующая геометрия манекена, удалён SOON/font-loader путь; измерения, предмет, цвет и кнопки поворота работают локально. Three.js не добавлялся.

Новый пакет только для разработки: `axe-core@4.13.0`. Исправлены обнаруженные существующие уязвимости: Next16.2.12 →16.3.5, sharp0.35.3 →0.35.4 и baseline-browser-mapping2.11.22. `package-lock.json` согласован, `npm audit` сообщает 0. Основания: [Next Windows advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), [image advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4), [sharp advisory](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), [Next16.3.5](https://github.com/vercel/next.js/releases/tag/v16.3.5).

## Проверки

| Gate | Результат |
| --- | --- |
| `npm run build`, `npm run lint`, `npm run typecheck` | PASS; lint в этом проекте тоже запускает TypeScript, не отдельный ESLint |
| `npm run test:unit` | 56/56, включая feed safety, semantic constraints, DTO, цены, URL, saved state и locale proxy |
| `npm run test:search` | DEV44/44, REGRESSION47/48; threshold PASS. Исходный REGRESSION-012 wedding query остаётся слишком широким, это не новая ошибка |
| `npm run test:integration` | 15/15: поиск/fallback, /out200/404, same-origin202, hostile-origin403, oversized413 |
| Полная locale suite | 3 004 assertions, 207 кликов внутренних LT-ссылок, 100 atomic race cases, 0 browser errors |
| Общая browser suite | 21 PASS / 0 FAIL; отдельные непроведённые области перечислены ниже |
| Управляемые сценарии | Поздний старый RSC ответ×3; реальный catalog500→Retry; sparse product EN/LT — PASS |
| Accessibility | 24 axe скана EN/LT/light/dark без нарушений; отдельно клавиатура, focus containment/restoration, reduced motion и reflow |
| 3D | Выбор предмета, размеры, keyboard rotation, reduced motion и видимая WebGL-сцена проверены |

Подробности: [все UX-01–30](acceptance.md), [browser QA](qa-browser.md), [визуальный проход1](visual-review-pass-1.md), [проход2](visual-review-pass-2.md). Во время проверки реально исправлены скрытая no-JS форма, выход фокуса из двух диалогов, языковая и поисковая гонки, неработающий Retry и второстепенные визуальные противоречия.

[Сопоставимая производительность](performance-final.md): финальные медианы LCP главной1120→928ms, выдачи1040→1172ms; blocking proxy414→220ms и404→159ms. Передача ресурсов выросла примерно на11%, script bytes на5.7–6.5%. Это честно принятый trade-off, не заявление об улучшении всех метрик. Не field INP/CWV.

Финальные production-проверки отключают внешние интеграции и при build, и при start: `NEXT_PUBLIC_*` встраиваются во время сборки, поэтому одного runtime override недостаточно. Ранние проверки могли читать публичную RLS-проекцию; это не выдаётся за доказанный CSV-only режим. Для сравнения скорости старый frontend повторно собран на той же версии Next16.3.5 и CSV в отдельном временном worktree. Он и его сервер удалены после измерения.

## Локальный запуск и воспроизведение

Обычная разработка: `npm run dev`. Для production-проверки: `npm run build`, затем `npm run start -- --hostname 127.0.0.1 --port 3100`. Текущий preview оставлен на [localhost3100](http://127.0.0.1:3100).

Детерминированный режим в PowerShell7: перед build и start установить пустые значения `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `POSTHOG_PROJECT_API_KEY` только в окружении этих процессов. Приватный `.env.local` не изменён; значения секретов в отчёте отсутствуют.

```powershell
$env:BASE_URL='http://127.0.0.1:3100'
npm run test:locale
python scripts/frontend_e2e.py
python scripts/navigation_race_e2e.py
python scripts/catalog_failure_e2e.py
python scripts/catalog_failure_e2e.py --sparse
python scripts/fitting_room_e2e.py
python scripts/frontend_metrics.py --phase final
python scripts/frontend_capture.py --phase final
python scripts/frontend_surfaces.py
python scripts/frontend_secondary_states.py
```

Catalog fixtures запускают собственный localhost3112 процесс и изменяют только возвращаемые тестовому процессу данные/ошибку для точного файла, а не CSV на диске. Служебный marker и процесс убираются в finally. Это не публичный query flag или API. Не запускать два fixture-процесса одновременно. Прототипы воспроизводятся отдельно через `scripts/frontend_prototypes.py`; они никогда не были public routes.

## Границы результата

Не запускались физические iPhone/Android, NVDA/VoiceOver/TalkBack, Windows High Contrast, настоящий browser-UI zoom, live Gemini timeout или облачный production smoke. 200% reflow — честно обозначенная CSS-zoom симуляция. Postgres17 container/RLS integration отдельно не запускался: в доступном shell не обнаружены docker/podman/psql; SQL и importer approvals не менялись. Zero axe violations не означает формальную WCAG-сертификацию.

Не требуется платный upgrade. Нет нового env-контракта или database rollback. Будущие merchant redirects/affiliate feeds не входят в выполненный редизайн. Перед публичным запуском остаются реальный контакт для privacy и отдельное решение о правовых основаниях/consent существующей аналитики.

Safe rollback: изменения изолированы в этой ветке, исходный commit `e601f4b2cec98a3a46c6d2fd8e3137267b6e4108` сохранён. Перед откатом нужно сохранить текущий diff; пакет и lockfile откатываются согласованно, без изменения main или production. Установленные три локальные skill-папки перечислены с provenance/license в skills-research; их удаление не влияет на приложение.
