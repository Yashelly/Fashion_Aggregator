"""Browser regression suite for the WEFT EN/LT locale contract.

Run a local production or development server first, then execute:

    BASE_URL=http://127.0.0.1:3000 python scripts/locale_e2e.py
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from playwright.sync_api import BrowserContext, Page, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000").rstrip("/")
REPORT_PATH = Path(
    os.environ.get(
        "LOCALE_REPORT",
        ".omx/artifacts/qa/locale-summary.json",
    )
)
LOCALE_COOKIE = "weft-locale"
PUBLIC_ROUTES = [
    "/",
    "/search?query=black",
    "/stores",
    "/ai-fitting-room",
    "/account",
    "/how-it-works",
    "/about",
    "/contact",
    "/data-sources",
    "/affiliate-disclosure",
    "/privacy",
    "/terms",
    "/out/MOCK-001",
    "/out/UNKNOWN",
]
LINK_SOURCE_ROUTES = [
    "/?lang=lt",
    "/search?query=black&category=shoes&lang=lt",
    "/stores?lang=lt",
    "/ai-fitting-room?lang=lt",
    "/account?lang=lt",
    "/how-it-works?lang=lt",
    "/about?lang=lt",
    "/contact?lang=lt",
    "/data-sources?lang=lt",
    "/affiliate-disclosure?lang=lt",
    "/privacy?lang=lt",
    "/terms?lang=lt",
    "/out/MOCK-001?lang=lt",
    "/out/UNKNOWN?lang=lt",
]


def route_with_lang(route: str, lang: str) -> str:
    parsed = urlparse(route)
    query = parse_qs(parsed.query, keep_blank_values=True)
    query["lang"] = [lang]
    return urlunparse(
        parsed._replace(query=urlencode(query, doseq=True))
    )


def expected_status(route: str) -> int:
    return 404 if urlparse(route).path == "/out/UNKNOWN" else 200


def cookie_value(context: BrowserContext) -> str | None:
    values = [
        cookie["value"]
        for cookie in context.cookies()
        if cookie["name"] == LOCALE_COOKIE
    ]
    return values[0] if values else None


def seed_locale(context: BrowserContext, locale: str, page: Page | None = None) -> None:
    """Force the locale cookie to `locale`, as if the visitor already had it.

    The currently-open page must be torn down first. Every rendered page keeps
    a live effect that writes this same cookie from its own locale, so seeding
    underneath one is a race: the page can rewrite the cookie between the seed
    and the next request, and the seeded value is silently lost.
    """
    if page is not None:
        page.goto("about:blank", wait_until="domcontentloaded")
    context.add_cookies(
        [{"name": LOCALE_COOKIE, "value": locale, "url": BASE_URL}]
    )


# The header now renders on every route, including `/` (the old headerless
# "title page" was replaced by a storefront home in the navigation rework).
# The nav's search entry points are the department/category links, which all
# start with `/search`; `.first` resolves the several that now match.
SEARCH_LINK = '.desktop-nav a[href^="/search"]'
MOBILE_SEARCH_LINK = '.mobile-menu nav a[href^="/search"]'

# Breakpoints from app/globals.css. The header serves the same links from two
# different places depending on width, so which one is clickable is decided by
# the viewport, not by probing — `is_visible()` is an instantaneous check and
# returns False while the header is still painting, which would send a desktop
# run down the mobile path.
DESKTOP_NAV_MIN_WIDTH = 1181  # .desktop-nav is display:none at <= 1180px
LANGUAGE_SWITCHER_MIN_WIDTH = 641  # .language-switcher is display:none at <= 640px


def open_mobile_menu(page: Page) -> None:
    summary = page.locator(".mobile-menu > summary")
    summary.wait_for(state="visible")
    summary.click()


def click_search(page: Page) -> None:
    """Reach /search through the header, at any viewport.

    The header renders on every route now (including `/`). Above the desktop-nav
    breakpoint the department links are visible directly; below it the same links
    are reached through the collapsed `<details>` menu. Several nav links start
    with `/search`, so `.first` picks the leading department entry — any of them
    lands on `/search` and satisfies the locale assertions.
    """
    if page.viewport_size["width"] >= DESKTOP_NAV_MIN_WIDTH:
        link = page.locator(SEARCH_LINK).first
        link.wait_for(state="visible")
        link.click()
        return
    open_mobile_menu(page)
    link = page.locator(MOBILE_SEARCH_LINK).first
    link.wait_for(state="visible")
    link.click()


def wait_for_locale(page: Page, locale: str) -> None:
    expected_aria = "Kalba" if locale == "lt" else "Language"
    page.locator("html").wait_for(state="attached")
    page.wait_for_function(
        "expected => document.documentElement.lang === expected",
        arg=locale,
    )
    # The language switcher's aria-label is localized copy rendered in the header
    # on every route, so it proves the locale actually reached rendered output —
    # not just the <html lang> attribute — without depending on any viewport-
    # specific nav link or the obsolete title-page CTA.
    page.wait_for_function(
        "expected => document.querySelector('.language-switcher')?.getAttribute('aria-label') === expected",
        arg=expected_aria,
    )
    page.wait_for_function(
        "expected => document.cookie.includes(`weft-locale=${expected}`)",
        arg=locale,
    )


def assert_locale(page: Page, context: BrowserContext, locale: str) -> None:
    wait_for_locale(page, locale)
    actual_cookie = cookie_value(context)
    assert actual_cookie == locale, (
        f"{page.url}: expected {LOCALE_COOKIE}={locale}, "
        f"got {actual_cookie!r}"
    )


def assert_public_out_path(page: Page, product_id: str) -> None:
    assert urlparse(page.url).path == f"/out/{product_id}", page.url
    hrefs = page.locator(".language-switcher a").evaluate_all(
        "links => links.map(link => link.getAttribute('href'))"
    )
    assert all(
        href and urlparse(href).path == f"/out/{product_id}"
        for href in hrefs
    ), f"internal rewrite path leaked into switcher: {hrefs}"


def click_language(page: Page, locale: str) -> None:
    """Switch locale through the header, at any viewport.

    `.language-switcher` is `display: none` below 640px, where the same two
    links are served from `.mobile-menu-locales` inside the collapsed menu. The
    header (and this behaviour) is now identical on every route, including `/`.
    """
    label = "LT" if locale == "lt" else "EN"
    if page.viewport_size["width"] >= LANGUAGE_SWITCHER_MIN_WIDTH:
        link = page.locator(".language-switcher a", has_text=label)
    else:
        open_mobile_menu(page)
        link = page.locator(".mobile-menu-locales a", has_text=label)
    link.wait_for(state="visible")
    link.click()
    page.wait_for_function(
        "expected => new URL(location.href).searchParams.get('lang') === expected",
        arg=locale,
    )
    wait_for_locale(page, locale)


def run_direct_matrix(browser) -> int:
    assertions = 0
    for viewport in ({"width": 375, "height": 900}, {"width": 1440, "height": 1000}):
        for route in PUBLIC_ROUTES:
            context = browser.new_context(viewport=viewport)
            page = context.new_page()

            response = page.goto(BASE_URL + route, wait_until="domcontentloaded")
            assert response and response.status == expected_status(route)
            assert_locale(page, context, "en")
            assertions += 4

            response = page.goto(
                BASE_URL + route_with_lang(route, "lt"),
                wait_until="domcontentloaded",
            )
            assert response and response.status == expected_status(route)
            assert_locale(page, context, "lt")
            assertions += 4

            response = page.goto(
                BASE_URL + route_with_lang(route, "en"),
                wait_until="domcontentloaded",
            )
            assert response and response.status == expected_status(route)
            assert_locale(page, context, "en")
            assertions += 4

            seed_locale(context, "lt", page)
            response = page.goto(BASE_URL + route, wait_until="domcontentloaded")
            assert response and response.status == expected_status(route)
            assert parse_qs(urlparse(page.url).query).get("lang") == ["lt"]
            assert_locale(page, context, "lt")
            assertions += 5

            invalid = route_with_lang(route, "invalid")
            response = page.goto(BASE_URL + invalid, wait_until="domcontentloaded")
            assert response and response.status == expected_status(route)
            assert parse_qs(urlparse(page.url).query).get("lang") == ["lt"]
            assert_locale(page, context, "lt")
            assertions += 5

            context.close()
    return assertions


def run_switch_matrix(browser) -> int:
    assertions = 0
    for viewport in ({"width": 375, "height": 900}, {"width": 1440, "height": 1000}):
        for route in PUBLIC_ROUTES:
            context = browser.new_context(viewport=viewport)
            page = context.new_page()
            response = page.goto(BASE_URL + route, wait_until="domcontentloaded")
            assert response and response.status == expected_status(route)

            click_language(page, "lt")
            assert_locale(page, context, "lt")
            assertions += 4

            if urlparse(route).path.startswith("/out/"):
                assert_public_out_path(
                    page,
                    urlparse(route).path.rsplit("/", maxsplit=1)[-1],
                )
                assertions += 2

            click_language(page, "en")
            assert_locale(page, context, "en")
            assertions += 4

            if urlparse(route).path.startswith("/out/"):
                assert_public_out_path(
                    page,
                    urlparse(route).path.rsplit("/", maxsplit=1)[-1],
                )
                assertions += 2

            context.close()
    return assertions


def run_internal_link_matrix(browser) -> tuple[int, int]:
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    assertions = 0
    clicked_links = 0

    for source_route in LINK_SOURCE_ROUTES:
        page = context.new_page()
        response = page.goto(BASE_URL + source_route, wait_until="domcontentloaded")
        assert response and response.status == expected_status(source_route)
        assert_locale(page, context, "lt")

        links = page.locator("a[href]")
        candidates: list[str] = []
        current_route = urlparse(page.url)
        current_path_query = (
            current_route.path
            + (f"?{current_route.query}" if current_route.query else "")
        )
        for index in range(links.count()):
            link = links.nth(index)
            href = link.get_attribute("href")
            if (
                not href
                or not href.startswith("/")
                or not link.is_visible()
                or link.get_attribute("aria-disabled") == "true"
                or link.locator("xpath=ancestor::*[contains(@class,'language-switcher')]").count()
                or href == current_path_query
            ):
                continue
            parsed = urlparse(href)
            assert parse_qs(parsed.query).get("lang") == ["lt"], (
                f"{source_route}: internal link dropped LT locale: {href}"
            )
            if href not in candidates:
                candidates.append(href)
            assertions += 1
        page.close()

        for expected_href in candidates:
            page = context.new_page()
            page.goto(BASE_URL + source_route, wait_until="domcontentloaded")
            page.wait_for_function(
                """expected => location.pathname + location.search === expected""",
                arg=source_route,
            )
            assert_locale(page, context, "lt")
            link = page.locator(f'a[href="{expected_href}"]:visible').first
            assert link.count(), (source_route, expected_href)
            link.click()
            page.wait_for_function(
                """expected => location.pathname + location.search === expected""",
                arg=expected_href,
            )
            wait_for_locale(page, "lt")
            assert_locale(page, context, "lt")
            assert parse_qs(urlparse(page.url).query).get("lang") == ["lt"]
            clicked_links += 1
            assertions += 5
            page.close()

    context.close()
    return assertions, clicked_links


def run_search_matrix(browser) -> int:
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    assertions = 0
    filters = {
        "query": "black",
        "category": "shoes",
        "color": "black",
        "sort": "price-low",
    }
    query = urlencode({**filters, "lang": "lt"})
    page.goto(f"{BASE_URL}/search?{query}", wait_until="domcontentloaded")
    assert_locale(page, context, "lt")

    click_language(page, "en")
    current = parse_qs(urlparse(page.url).query)
    for name, value in filters.items():
        assert current.get(name) == [value], (name, current)
    assert current.get("lang") == ["en"]
    assert_locale(page, context, "en")
    assertions += 7

    click_language(page, "lt")
    current = parse_qs(urlparse(page.url).query)
    for name, value in filters.items():
        assert current.get(name) == [value], (name, current)
    assert current.get("lang") == ["lt"]
    assertions += 5

    page.locator("#catalog-query").fill("sneaker")
    page.locator("#catalog-query").press("Enter")
    page.wait_for_function(
        """() => {
          const query = new URL(location.href).searchParams;
          return query.get('query') === 'sneaker' && query.get('lang') === 'lt';
        }"""
    )
    assert_locale(page, context, "lt")
    assertions += 3

    active_filter = page.locator(".active-filters a").first
    if active_filter.count():
        active_filter.click()
        page.wait_for_function(
            "() => new URL(location.href).searchParams.get('lang') === 'lt'"
        )
        assert_locale(page, context, "lt")
        assertions += 3

    clear = page.locator(".active-filters .clear-link")
    if clear.count():
        clear.click()
        page.wait_for_function(
            """() => location.pathname === '/search'
              && new URL(location.href).searchParams.get('lang') === 'lt'"""
        )
        assert_locale(page, context, "lt")
        assertions += 3

    page.goto(
        f"{BASE_URL}/search?query=black&lang=lt",
        wait_until="domcontentloaded",
    )
    product = page.locator(".product-link").first
    product.click()
    page.wait_for_function("() => location.pathname.startsWith('/out/MOCK-')")
    assert parse_qs(urlparse(page.url).query).get("lang") == ["lt"]
    assert "/preview/" not in page.url
    assert_locale(page, context, "lt")
    assertions += 4

    context.close()
    return assertions


def run_history_and_stress_matrix(browser) -> int:
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    assertions = 0

    page.goto(BASE_URL + "/", wait_until="domcontentloaded")
    click_language(page, "lt")
    # The header (with its nav) renders on `/` too, so search is reached the same
    # way here as on any other route.
    click_search(page)
    page.wait_for_function("() => location.pathname === '/search'")
    assert_locale(page, context, "lt")
    page.locator('.desktop-nav a[href^="/stores"]').click()
    page.wait_for_function("() => location.pathname === '/stores'")
    assert_locale(page, context, "lt")
    click_language(page, "en")
    assert_locale(page, context, "en")

    page.go_back(wait_until="domcontentloaded")
    assert urlparse(page.url).path == "/stores"
    assert_locale(page, context, "lt")
    page.go_back(wait_until="domcontentloaded")
    assert urlparse(page.url).path == "/search"
    assert_locale(page, context, "lt")
    page.go_forward(wait_until="domcontentloaded")
    assert urlparse(page.url).path == "/stores"
    assert_locale(page, context, "lt")
    page.go_forward(wait_until="domcontentloaded")
    assert urlparse(page.url).path == "/stores"
    assert_locale(page, context, "en")
    assertions += 12

    click_language(page, "lt")
    for _ in range(5):
        # Current desktop nav: department/category search links, the store list,
        # and the AI fitting room; the brand mark returns home. (How it works /
        # About moved to the footer in the navigation rework.) `.first` resolves
        # the several links that start with `/search`.
        for selector, path in (
            (SEARCH_LINK, "/search"),
            ('.desktop-nav a[href^="/stores"]', "/stores"),
            ('.desktop-nav a[href^="/ai-fitting-room"]', "/ai-fitting-room"),
            (".brand", "/"),
        ):
            page.locator(selector).first.click()
            page.wait_for_function(
                "expected => location.pathname === expected",
                arg=path,
            )
            assert parse_qs(urlparse(page.url).query).get("lang") == ["lt"]
            assert_locale(page, context, "lt")
            assertions += 3

    context.close()
    return assertions


def run_atomic_switch_matrix(browser) -> int:
    """Reproduce a zero-delay language click followed by stale-page navigation."""

    assertions = 0
    for viewport in (
        {"width": 375, "height": 900},
        {"width": 1440, "height": 1000},
    ):
        for _ in range(25):
            context = browser.new_context(viewport=viewport)
            page = context.new_page()
            page.goto(BASE_URL + "/", wait_until="domcontentloaded")
            assert_locale(page, context, "en")

            page.evaluate(
                """() => {
                  document.querySelector('.language-switcher a:last-child').click();
                  document.querySelector('.title-page-cta').click();
                }"""
            )
            page.wait_for_function(
                "() => new URL(location.href).searchParams.get('lang') === 'lt'"
            )
            assert urlparse(page.url).path in {"/", "/search"}, page.url
            assert_locale(page, context, "lt")

            click_search(page)
            page.wait_for_function(
                """() => location.pathname === '/search'
                  && new URL(location.href).searchParams.get('lang') === 'lt'"""
            )
            assert_locale(page, context, "lt")
            assertions += 7
            context.close()

            context = browser.new_context(viewport=viewport)
            page = context.new_page()
            page.goto(BASE_URL + "/?lang=lt", wait_until="domcontentloaded")
            assert_locale(page, context, "lt")

            page.evaluate(
                """() => {
                  document.querySelector('.language-switcher a:first-child').click();
                  document.querySelector('.title-page-cta').click();
                }"""
            )
            page.wait_for_function(
                "() => new URL(location.href).searchParams.get('lang') === 'en'"
            )
            assert urlparse(page.url).path in {"/", "/search"}, page.url
            assert_locale(page, context, "en")

            click_search(page)
            page.wait_for_function(
                """() => location.pathname === '/search'
                  && !new URL(location.href).searchParams.has('lang')"""
            )
            assert_locale(page, context, "en")
            assertions += 7
            context.close()

    return assertions


def main() -> None:
    browser_errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        def attach_error_capture(page: Page) -> None:
            page.on(
                "pageerror",
                lambda error: browser_errors.append(f"{page.url}: {error}"),
            )
            page.on(
                "console",
                lambda message: browser_errors.append(
                    f"{page.url}: console {message.type}: {message.text}"
                )
                if message.type == "error"
                and not (
                    urlparse(page.url).path == "/out/UNKNOWN"
                    and "404" in message.text
                )
                else None,
            )

        original_new_context = browser.new_context

        def new_context_with_capture(*args, **kwargs):
            context = original_new_context(*args, **kwargs)
            context.on("page", attach_error_capture)
            return context

        browser.new_context = new_context_with_capture  # type: ignore[method-assign]

        direct_assertions = run_direct_matrix(browser)
        switch_assertions = run_switch_matrix(browser)
        link_assertions, clicked_links = run_internal_link_matrix(browser)
        search_assertions = run_search_matrix(browser)
        history_assertions = run_history_and_stress_matrix(browser)
        atomic_switch_assertions = run_atomic_switch_matrix(browser)
        browser.close()

    if browser_errors:
        raise AssertionError("Browser errors:\n" + "\n".join(browser_errors))

    report = {
        "status": "passed",
        "base_url": BASE_URL,
        "routes": len(PUBLIC_ROUTES),
        "viewports": [375, 1440],
        "clicked_internal_links": clicked_links,
        "assertions": {
            "direct_cookie_query_matrix": direct_assertions,
            "language_switch_matrix": switch_assertions,
            "internal_link_matrix": link_assertions,
            "search_filter_matrix": search_assertions,
            "history_and_stress_matrix": history_assertions,
            "zero_delay_atomic_switch_matrix": atomic_switch_assertions,
        },
        "browser_errors": 0,
        "boundaries": {
            "known_out_route": "public path retained",
            "unknown_out_route": "404 and public path retained",
            "search_filters": "preserved across EN/LT switches",
            "history": "locale restored across back/forward",
        },
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
