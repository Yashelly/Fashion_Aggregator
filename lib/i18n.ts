export type Locale = "en" | "lt";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export const defaultLocale: Locale = "en";

export function getLocale(params?: SearchParamsInput): Locale {
  const rawLocale = Array.isArray(params?.lang) ? params?.lang[0] : params?.lang;
  return rawLocale === "lt" ? "lt" : defaultLocale;
}

export function normalizeParams(params: SearchParamsInput) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Record<string, string | undefined>;
}

export function withLocale(href: string, locale: Locale) {
  const [pathWithQuery, hash] = href.split("#");
  const [path, query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);

  if (locale === "lt") {
    params.set("lang", "lt");
  } else {
    params.delete("lang");
  }

  const queryString = params.toString();
  return `${path}${queryString ? `?${queryString}` : ""}${hash ? `#${hash}` : ""}`;
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

const genderLabels: Record<Locale, Record<string, string>> = {
  en: {
    men: "Men",
    unisex: "Unisex",
    women: "Women",
  },
  lt: {
    men: "Vyrams",
    unisex: "Visiems",
    women: "Moterims",
  },
};

const categoryLabels: Record<Locale, Record<string, string>> = {
  en: {
    accessories: "Accessories",
    activewear: "Activewear",
    bags: "Bags",
    bottoms: "Trousers",
    dresses: "Dresses",
    jeans: "Jeans",
    knitwear: "Knitwear",
    outerwear: "Outerwear",
    shoes: "Shoes",
    sweats: "Sweats",
    tops: "Tops",
  },
  lt: {
    accessories: "Aksesuarai",
    activewear: "Sportinė apranga",
    bags: "Rankinės",
    bottoms: "Kelnės",
    dresses: "Suknelės",
    jeans: "Džinsai",
    knitwear: "Megztiniai",
    outerwear: "Striukės ir paltai",
    shoes: "Avalynė",
    sweats: "Džemperiai",
    tops: "Marškinėliai",
  },
};

const colorLabels: Record<Locale, Record<string, string>> = {
  en: {
    beige: "Beige",
    burgundy: "Burgundy", camel: "Camel", charcoal: "Charcoal", chocolate: "Chocolate", dark_brown: "Dark brown", emerald: "Emerald", forest_green: "Forest green", ivory: "Ivory", khaki: "Khaki", light_blue: "Light blue", lilac: "Lilac", mint: "Mint", navy: "Navy", olive: "Olive", orange: "Orange", powder_blue: "Powder blue", purple: "Purple", rose_gold: "Rose gold", sage: "Sage", sand: "Sand", silver: "Silver", stone: "Stone", tan: "Tan", washed_blue: "Washed blue",
    black: "Black",
    blue: "Blue",
    brown: "Brown",
    cream: "Cream",
    green: "Green",
    grey: "Grey",
    multi: "Multi",
    pink: "Pink",
    red: "Red",
    white: "White",
  },
  lt: {
    beige: "Smėlinė",
    burgundy: "Bordo", camel: "Kupranugario vilnos", charcoal: "Tamsiai pilka", chocolate: "Šokoladinė", dark_brown: "Tamsiai ruda", emerald: "Smaragdinė", forest_green: "Tamsiai žalia", ivory: "Dramblio kaulo", khaki: "Chaki", light_blue: "Šviesiai mėlyna", lilac: "Alyvinė", mint: "Mėtinė", navy: "Tamsiai mėlyna", olive: "Alyvuogių", orange: "Oranžinė", powder_blue: "Blyškiai mėlyna", purple: "Violetinė", rose_gold: "Rausvo aukso", sage: "Šalavijų", sand: "Smėlio", silver: "Sidabrinė", stone: "Akmens pilkumo", tan: "Rusva", washed_blue: "Blukinta mėlyna",
    black: "Juoda",
    blue: "Mėlyna",
    brown: "Ruda",
    cream: "Kreminė",
    green: "Žalia",
    grey: "Pilka",
    multi: "Įvairiaspalvė",
    pink: "Rožinė",
    red: "Raudona",
    white: "Balta",
  },
};

const availabilityLabels: Record<Locale, Record<string, string>> = {
  en: {
    in_stock: "In stock",
    limited: "Limited",
    out_of_stock: "Out of stock",
    sale: "On sale",
  },
  lt: {
    in_stock: "Yra sandėlyje",
    limited: "Ribotas kiekis",
    out_of_stock: "Išparduota",
    sale: "Išpardavimas",
  },
};

const tagLabels: Record<Locale, Record<string, string>> = {
  en: {},
  lt: {
    "all weather": "bet kokiam orui",
    athleisure: "athleisure",
    casual: "kasdienai",
    city: "miestui",
    clean: "minimalu",
    comfort: "komfortas",
    denim: "denimas",
    dressy: "puošnu",
    everyday: "kasdienai",
    festival: "festivaliui",
    formal: "oficialu",
    leather: "oda",
    minimal: "minimalu",
    office: "biurui",
    party: "vakarui",
    smart: "klasika",
    sneakers: "sportbačiai",
    spring: "pavasariui",
    streetwear: "gatvės stilius",
    summer: "vasarai",
    travel: "kelionėms",
    winter: "žiemai",
  },
};

export function formatGenderLabel(value: string, locale: Locale) {
  return genderLabels[locale][value] ?? humanize(value);
}

export function formatCategoryLabel(value: string, locale: Locale) {
  return categoryLabels[locale][value] ?? humanize(value);
}

export function formatColorLabel(value: string, locale: Locale) {
  return colorLabels[locale][value] ?? humanize(value);
}

export function formatAvailabilityLabel(value: string, locale: Locale) {
  return availabilityLabels[locale][value] ?? humanize(value);
}

export function formatTagLabel(value: string, locale: Locale) {
  return tagLabels[locale][value] ?? value;
}

export const copy = {
  en: {
    frontend: {
      heroTitle: "Find your\nnext layer.",
      heroLead: "Clothing from different stores, in one search.",
      heroLabel: "Clothing search, in your own words",
      aiLabel: "A little AI. A lot more possibility.",
      searchLabel: "What are you looking for?",
      searchPlaceholder: "Describe a piece, colour or budget",
      shortSearchPlaceholder: "What are you looking for?",
      catalog: "Catalog", savedShort: "Saved", stores: "Stores",
      search: "Search", clearSearch: "Clear search", pending: "Finding clothes…",
      examplesLabel: "Try a search", browse: "Explore clothing", browseAll: "Explore all clothing",
      startTitle: "Explore clothing", startLead: "Explore the clothes. Save what feels like you.", viewAll: "View all",
      categoryNav: "Browse categories", allClothing: "All clothing",
      results: "Search results", browseTitle: "All clothing",
      browseLead: "Follow an idea, or see where the clothes take you.",
      filters: "Filters", applyFilters: "Apply filters", clearFilters: "Clear filters",
      hideFilters: "Hide filters", showFilters: "Show filters", view: "View",
      columns: (n: number) => `${n} columns`, recommended: "Recommended",
      priceFrom: "From, €", priceTo: "To, €",
      resetDraft: "Clear selections", cancel: "Cancel", close: "Close",
      category: "Category", department: "Department", store: "Store", colour: "Colour", status: "Availability",
      budget: "Budget", minPrice: "Minimum price (€)", maxPrice: "Maximum price (€)",
      priceHint: "Leave either amount empty for no limit. Your description and these limits both apply.",
      priceError: "Enter a valid price range: minimum must not exceed maximum.",
      invalidFilters: "A filter isn’t recognised. Clear the filters and choose from the available options.",
      queryTooLong: "Keep your description to 500 characters or fewer.",
      sort: "Sort by", relevance: "Relevance", availableFirst: "Available first",
      priceLow: "Price: low to high", priceHigh: "Price: high to low", sale: "Largest price reduction",
      count: (n: number) => `${n} ${n === 1 ? "piece" : "pieces"}`,
      showing: (start: number, end: number, total: number) => `Showing ${start}–${end} of ${total}`,
      removeFilter: (label: string) => `Remove filter: ${label}`,
      resultAria: (n: number) => `Search results: ${n}`,
      noResults: "Nothing quite like that here.",
      noResultsLead: "Try a different description, or explore the clothing collection.",
      noFilteredResults: "No pieces match these filters.",
      noFilteredLead: "Remove a filter or widen your budget. Your search stays in place.",
      retry: "Try again", errorTitle: "We couldn’t load the results.", errorLead: "Try again. Your search is still here.",
      imageUnavailable: "Image unavailable", viewDetails: "View details", storeFallback: "Store",
      currentPrice: "Price", previousPrice: "Previous price", saved: "Saved pieces", savedLead: "Your finds, kept in this browser.",
      localCollectionNote: "Kept in this browser only. No sign-in needed.",
      saveItem: "Save item", removeSaved: "Remove saved item", noSaved: "Your collection starts here.",
      noSavedLead: "Save pieces with the heart beside a photo. You can return to them here.",
      storageUnavailable: "Browser storage is unavailable. Your selections will last for this visit.",
      preferences: "Your space", recentSearches: "Recent searches", noRecent: "Your recent searches will appear here.",
      preview3d: "3D preview", menu: "Open navigation", closeMenu: "Close navigation",
      home: "Weft home", lightMode: "Use light mode", darkMode: "Use dark mode",
      storeSummary: (items: number, categories: number) => `${items} pieces across ${categories} categories`,
      next: "Next", previous: "Previous", pages: "Result pages", perPage: "Products per page", show: "Show",
      examples: [
        { label: "A wool coat", query: "wool coat under 150" },
        { label: "Easy knitwear", query: "knitwear" },
        { label: "White trainers", query: "white sneakers under 80" },
        { label: "Linen shirts", query: "linen shirt" },
        { label: "Wide-leg trousers", query: "wide leg trousers" },
        { label: "Summer dresses", query: "summer dress" },
        { label: "Leather boots", query: "leather boots" },
        { label: "Winter layers", query: "something warm for winter" },
      ],
    },
    productDetail: {
      metadataDescription: (title: string) => `Explore information and photographs of ${title} on Weft.`,
      breadcrumbAria: "Breadcrumb", search: "Search", galleryAria: "Product images", enlargeImage: "Enlarge image",
      productView: "Product view", styledView: "Styled view", styledAlt: (title: string) => `${title} in a styled look`,
      sizesTitle: "Sizes listed", sizesAria: "Size list", colour: "Colour", forLabel: "For", category: "Category",
      preview3d: "3D preview", backToSearch: "Back to search", relatedAria: "Related products", relatedTitle: "More in this category",
      dialogAria: "Enlarged image", close: "Close", zoomInHint: "Click the photo to zoom in", zoomOutHint: "Move to pan · click to zoom out", storeFallback: "Store",
    },
    common: {
      skipToContent: "Skip to content",
    },
    cookieBanner: {
      title: "Cookies on this site",
      body: "Essential cookies keep the site working and remember your language. Anonymous analytics help us see which searches lead nowhere, so we can fix them. Nothing here identifies you personally.",
      accept: "Accept analytics",
      reject: "Essential only",
      privacyLink: "Read the privacy policy",
      ariaLabel: "Cookie consent",
    },
    header: {
      browse: "Browse",
      departmentsAria: "Departments",
      languageAria: "Language",
      mainNavAria: "Main navigation",
      nav: {
        about: "About",
        contact: "Contact",
        search: "Search",
        sources: "Sources",
        stores: "Stores",
      },
      departments: {
        accessories: "Accessories",
        men: "Man",
        sneakers: "Sneakers",
        unisex: "Unisex",
        women: "Woman",
      },
    },
    footer: {
      aria: "Footer navigation",
      text:
        "A fashion discovery experience for exploring style, colour, category, and price.",
      links: {
        about: "About",
        affiliate: "Commercial links",
        contact: "Contact",
        dataSources: "Data sources",
        howItWorks: "How it works",
        privacy: "Privacy",
        terms: "Terms",
      },
    },
    titlePage: {
      demoLabel: "Clothing search",
      slogan: "Find your vibe.",
      lead: "Search fashion the way you actually think about it — by mood, by occasion, by the thing you half-remember seeing.",
      cta: "Start searching",
    },
    search: {
      // Not "Search Weft": the header wordmark sits directly above this h1, so
      // naming the brand again put two display-size wordmarks on one screen.
      title: "Search",
      lead:
        "Describe a piece. Find a place to start.",
      labels: {
        search: "Search",
        store: "Store",
        department: "Department",
        category: "Category",
        color: "Color",
        status: "Status",
        sort: "Sort",
        advanced: "More filters",
      },
      placeholders: {
        search: "A black wool coat under €150",
      },
      options: {
        allStores: "All stores",
        allDepartments: "All departments",
        allCategories: "All categories",
        allColors: "All colors",
        allItems: "All items",
        availableFirst: "Available first",
        priceLow: "Price low-high",
        priceHigh: "Price high-low",
        bestSale: "Best sale",
      },
      actions: {
        clearAll: "Clear filters",
        showResults: "Search",
      },
      active: {
        aria: "Active filters",
        availability: "Availability",
        category: "Category",
        color: "Color",
        department: "Department",
        search: "Search",
        store: "Store",
      },
      interpretation: {
        aria: "How your search was read",
        ranked: "Ranked by how closely each piece matches your description.",
        approximate: "No exact match. Showing the closest alternatives without weakening category, colour, price or availability.",
        relaxed: (words: string) => `Missing requested detail: ${words}`,
        priceRange: (minimum: number, maximum: number) => `Price range read from your search: €${minimum}–€${maximum}`,
        priceCeiling: (limit: number) => `Price limit read from your search: up to €${limit}`,
        unknown: (words: string) => `Not recognised: ${words}`,
      },
      resultsFound: (count: number) => `${count} ${count === 1 ? "piece" : "pieces"} found`,
      sourceNoteAria: "Product source note",
      sourceNoteTitle: "Purchase status",
      sourceNote:
        "Purchase links are not enabled yet.",
      sourceNoteCta: "How product data works",
    },
    comparison: {
      title: "Compare across stores",
      aria: "This item across demo stores",
      storeCount: (count: number) => `Stocked by ${count} demo stores`,
      inStores: (count: number) => `${count} stores`,
      from: "from",
      saving: (amount: string) => `Save up to ${amount} by choosing the cheapest store`,
      samePrice: "Every store lists the same price.",
      columnStore: "Store",
      columnPrice: "Price",
      columnSizes: "Sizes",
      columnAvailability: "Availability",
      best: "Lowest price",
      thisStore: "Viewing",
      partialSizes: (sizes: string) => `Not carried everywhere: ${sizes}`,
      syntheticNote:
        "These listings are synthetic. Prices and stock are generated for the demo — they are not quotes from real shops.",
    },
    productGrid: {
      aria: "Product results",
      clearFilters: "Clear filters",
      noResults: "No pieces matched this search.",
      sale: "Sale",
      limited: "Limited",
      outOfStock: "Out of stock",
      soldOut: "Sold out",
      sizes: "Sizes",
      viewAt: "View at",
      viewProduct: "View",
      wishlistComingSoon: "Wishlist coming soon",
    },
    pages: {
      about: {
        title: "About Weft",
        paragraphs: [
          "Weft helps you find clothing in your own words. Describe a colour, a material, an occasion or a budget, and explore pieces from different stores in one place.",
          "Weft does not operate checkout or resell products. It focuses on helping shoppers search, filter, and compare styles.",
          "Open a piece to see its details, save it for later, or refine your search. You stay in control of the conditions you choose.",
        ],
      },
      affiliate: {
        title: "Commercial links",
        paragraphs: [
          "The current version has no active purchase links.",
          "If commercial links are enabled later, they will be labelled clearly. Purchases will happen on retailer websites, which will remain responsible for price, availability, checkout, delivery, returns, and customer service.",
        ],
      },
      contact: {
        title: "Contact",
        intro:
          "A public contact address has not been provided. You can read about the service, product information and privacy below.",
      },
      dataSources: {
        title: "Product Sources",
        paragraphs: [
          "Weft will show real retailer product data only when it has permission to use that information.",
          "The current catalog supports browsing, search, filters, and store-based discovery.",
          "We do not use scraped retailer photos, logos, product pages, or trademarks.",
          "A public contact address is listed on the contact page when available.",
        ],
        reviewTitle: "Current catalog rules",
        reviewItems: [
          "Purchase links remain disabled until they are ready to be introduced.",
          "No live retailer product, photo, logo, or purchase link is shown.",
          "Product links stay on Weft and cannot complete a purchase.",
          "Future product details will be confirmed on the retailer website.",
        ],
      },
      howItWorks: {
        title: "How it works",
        shoppersTitle: "For shoppers",
        retailersTitle: "For retailers",
        shoppers: [
          "Search by vibe, category, color, size, price, or store.",
          "Browse visual product cards from clearly labelled stores.",
          "Open the details of a piece, or save it to your collection in this browser.",
        ],
        retailers: [
          "Real products are added only with permission.",
          "Shoppers will be sent to the relevant retailer website to purchase.",
          "Retailers remain responsible for checkout and fulfilment.",
        ],
        reviewModeTitle: "What you see now",
        reviewMode: [
          "Product cards support search, filters, stores, and product browsing.",
          "Store pages group products into easy-to-browse selections.",
          "Purchase links are not enabled yet.",
        ],
      },
      privacy: {
        title: "Privacy Policy",
        paragraphs: [
          "Weft receives search text and selected filters to return clothing results. Opening an item stays on Weft; there are no active retailer purchase links or contact-message forms.",
          "The browser sends search events and item-detail openings to Weft’s analytics endpoints. When configured, Supabase storage can include the query, filters, result count, browser identifier and technical request information. PostHog receives summary counts, search timing and item-opening metadata, not search text, body measurements or photos. These events are not records of a purchase or a visit to a retailer.",
          "A cookie remembers your language. Your theme, saved pieces, recent searches, preview measurements and browser identifier use local browser storage. If analytics storage is enabled, cookies also link related search and item-opening events. A photo selected for the 3D preview is processed in the browser and is not uploaded. You can remove locally stored information by clearing this site’s browser data.",
          "You can ask to see, correct, delete, or restrict the processing of your personal data. If EU or EEA law applies to you, you can also object to processing, ask for your data in a portable form, withdraw consent where processing relies on it, and lodge a complaint with a data protection authority. A public contact for these requests has not yet been provided.",
        ],
      },
      stores: {
        title: "Stores",
        lead:
          "Explore fashion selections grouped by store.",
        reviewLead:
          "Choose a store to see its current selection.",
        browseCta: "Browse products",
        demoNotice: "Purchase links are not enabled yet.",
        // Printed once per store card, so the brand name here appeared six
        // times on /stores. The reader already knows whose site they are on.
        fallbackDescription: "Explore the collection.",
      },
      terms: {
        title: "Terms of Use",
        paragraphs: [
          "Weft is a fashion discovery service. A future version may direct users to retailer websites to complete purchases.",
          "Weft does not operate retailer checkout, resell products, control final prices, guarantee availability, or handle delivery, returns, or customer service for retailer orders. Final product information is confirmed on the retailer website.",
          "The current version does not contain live purchase links. Future commercial links will be labelled clearly.",
        ],
      },
    },
  },
  lt: {
    frontend: {
      heroTitle: "Atrask kitą\nsluoksnį.",
      heroLead: "Drabužiai iš skirtingų parduotuvių vienoje paieškoje.",
      heroLabel: "Drabužių paieška savais žodžiais",
      aiLabel: "Truputis DI. Daugiau galimybių.",
      searchLabel: "Kokių drabužių ieškai?", searchPlaceholder: "Aprašyk drabužį, spalvą ar biudžetą",
      shortSearchPlaceholder: "Ko ieškai?",
      catalog: "Katalogas", savedShort: "Išsaugota", stores: "Parduotuvės",
      search: "Ieškoti", clearSearch: "Išvalyti paiešką", pending: "Ieškome drabužių…",
      examplesLabel: "Išbandyk paiešką", browse: "Atrask drabužius", browseAll: "Peržiūrėti visus drabužius",
      startTitle: "Atrask drabužius", startLead: "Atrask drabužius. Išsaugok tai, kas patinka.", viewAll: "Visos prekės",
      categoryNav: "Naršyti kategorijas", allClothing: "Visi drabužiai",
      results: "Paieškos rezultatai", browseTitle: "Visi drabužiai", browseLead: "Ieškok pagal idėją arba tiesiog apsižvalgyk.",
      filters: "Filtrai", applyFilters: "Taikyti filtrus", clearFilters: "Išvalyti filtrus", resetDraft: "Išvalyti pasirinkimus", cancel: "Atšaukti", close: "Uždaryti",
      hideFilters: "Slėpti filtrus", showFilters: "Rodyti filtrus", view: "Rodymas",
      columns: (n: number) => `${n} stulpeliai`, recommended: "Rekomenduojama",
      priceFrom: "Nuo, €", priceTo: "Iki, €",
      category: "Kategorija", department: "Skyrius", store: "Parduotuvė", colour: "Spalva", status: "Prieinamumas",
      budget: "Biudžetas", minPrice: "Mažiausia kaina (€)", maxPrice: "Didžiausia kaina (€)",
      priceHint: "Tuščias laukelis reiškia, kad ribos nėra. Taikomos ir aprašymo, ir šios kainos ribos.",
      priceError: "Įvesk tinkamas kainos ribas: mažiausia kaina negali viršyti didžiausios.",
      invalidFilters: "Filtras neatpažintas. Išvalyk filtrus ir pasirink iš pateiktų parinkčių.", queryTooLong: "Aprašymą sutrumpink iki 500 ženklų.",
      sort: "Rikiuoti pagal", relevance: "Aktualumą", availableFirst: "Pirmiausia turimos", priceLow: "Kainą: nuo mažiausios", priceHigh: "Kainą: nuo didžiausios", sale: "Didžiausią kainos sumažėjimą",
      count: (n: number) => `Prekių: ${n}`, showing: (start: number, end: number, total: number) => `Rodoma ${start}–${end} iš ${total}`,
      removeFilter: (label: string) => `Pašalinti filtrą: ${label}`, resultAria: (n: number) => `Paieškos rezultatų: ${n}`,
      noResults: "Tokio drabužio čia neradome.", noResultsLead: "Pabandyk kitą aprašymą arba peržiūrėk drabužių kolekciją.",
      noFilteredResults: "Šiuos filtrus atitinkančių prekių nėra.", noFilteredLead: "Pašalink filtrą arba padidink biudžetą. Paieškos tekstas išliks.",
      retry: "Bandyti dar kartą", errorTitle: "Nepavyko įkelti rezultatų.", errorLead: "Bandyk dar kartą. Paieškos sąlygos išsaugotos.",
      imageUnavailable: "Nuotrauka nepasiekiama", viewDetails: "Peržiūrėti", storeFallback: "Parduotuvė", currentPrice: "Kaina", previousPrice: "Ankstesnė kaina",
      saved: "Išsaugotos prekės", savedLead: "Tavo atradimai šioje naršyklėje.", saveItem: "Išsaugoti prekę", removeSaved: "Pašalinti išsaugotą prekę",
      localCollectionNote: "Išsaugota tik šioje naršyklėje. Prisijungti nereikia.",
      noSaved: "Kolekcija prasideda čia.", noSavedLead: "Išsaugok patikusias prekes paspausdamas širdelę prie nuotraukos. Jas rasi čia.",
      storageUnavailable: "Naršyklės saugykla nepasiekiama. Pasirinkimai išliks šio apsilankymo metu.",
      preferences: "Tavo erdvė", recentSearches: "Naujausios paieškos", noRecent: "Čia bus rodomos naujausios paieškos.",
      preview3d: "3D peržiūra", menu: "Atverti navigaciją", closeMenu: "Uždaryti navigaciją", home: "Weft pradinis puslapis", lightMode: "Įjungti šviesų režimą", darkMode: "Įjungti tamsų režimą",
      storeSummary: (items: number, categories: number) => `Prekių: ${items}. Kategorijų: ${categories}.`,
      next: "Kitas", previous: "Ankstesnis", pages: "Rezultatų puslapiai", perPage: "Prekių skaičius puslapyje", show: "Rodyti",
      examples: [
        { label: "Vilnonis paltas", query: "vilnonis paltas iki 150" },
        { label: "Jaukūs megztiniai", query: "megztiniai" },
        { label: "Balti sportbačiai", query: "balti sportbačiai iki 80" },
        { label: "Lininiai marškiniai", query: "lininiai marškiniai" },
        { label: "Plačios kelnės", query: "plačios kelnės" },
        { label: "Vasarinės suknelės", query: "vasarinė suknelė" },
        { label: "Odiniai batai", query: "odiniai batai" },
        { label: "Šiluma žiemai", query: "kažkas šilto žiemai" },
      ],
    },
    productDetail: {
      metadataDescription: (title: string) => `Peržiūrėk ${title} informaciją ir nuotraukas Weft svetainėje.`,
      breadcrumbAria: "Kelias", search: "Paieška", galleryAria: "Prekės nuotraukos", enlargeImage: "Padidinti nuotrauką",
      productView: "Prekės vaizdas", styledView: "Derinio vaizdas", styledAlt: (title: string) => `${title} stilizuotame derinyje`,
      sizesTitle: "Nurodyti dydžiai", sizesAria: "Dydžių sąrašas", colour: "Spalva", forLabel: "Skirta", category: "Kategorija",
      preview3d: "3D peržiūra", backToSearch: "Grįžti į paiešką", relatedAria: "Panašios prekės", relatedTitle: "Daugiau šioje kategorijoje",
      dialogAria: "Padidinta nuotrauka", close: "Uždaryti", zoomInHint: "Spustelėkite nuotrauką, kad priartintumėte", zoomOutHint: "Judinkite pelę · spustelėkite, kad sumažintumėte", storeFallback: "Parduotuvė",
    },
    common: {
      skipToContent: "Pereiti prie pagrindinio turinio",
    },
    cookieBanner: {
      title: "Slapukai šioje svetainėje",
      body: "Būtini slapukai užtikrina svetainės veikimą ir įsimena jūsų kalbą. Anoniminė analitika padeda pamatyti, kurios paieškos nieko neranda, kad galėtume tai pataisyti. Niekas čia jūsų asmeniškai neidentifikuoja.",
      accept: "Sutikti su analitika",
      reject: "Tik būtinieji",
      privacyLink: "Skaityti privatumo politiką",
      ariaLabel: "Sutikimas dėl slapukų",
    },
    header: {
      browse: "Naršyti",
      departmentsAria: "Skyriai",
      languageAria: "Kalba",
      mainNavAria: "Pagrindinė navigacija",
      nav: {
        about: "Apie",
        contact: "Kontaktai",
        search: "Paieška",
        sources: "Šaltiniai",
        stores: "Parduotuvės",
      },
      departments: {
        accessories: "Aksesuarai",
        men: "Vyrams",
        sneakers: "Sportbačiai",
        unisex: "Unisex",
        women: "Moterims",
      },
    },
    footer: {
      aria: "Apatinė navigacija",
      text:
        "Mados atradimų erdvė, skirta ieškoti pagal stilių, spalvą, kategoriją ir kainą.",
      links: {
        about: "Apie",
        affiliate: "Komercinės nuorodos",
        contact: "Kontaktai",
        dataSources: "Prekių šaltiniai",
        howItWorks: "Kaip tai veikia",
        privacy: "Privatumo politika",
        terms: "Naudojimo sąlygos",
      },
    },
    titlePage: {
      demoLabel: "Drabužių paieška",
      slogan: "Rask savo stilių.",
      lead: "Ieškok mados taip, kaip apie ją galvoji — pagal nuotaiką, progą ar tai, ką vos prisimeni mačiusi.",
      cta: "Pradėti paiešką",
    },
    search: {
      title: "Paieška",
      lead:
        "Ieškok pagal prekę, nuotaiką, spalvą, parduotuvę ar progą.",
      labels: {
        search: "Paieška",
        store: "Parduotuvė",
        department: "Skyrius",
        category: "Kategorija",
        color: "Spalva",
        status: "Būsena",
        sort: "Rūšiuoti",
        advanced: "Daugiau filtrų",
      },
      placeholders: {
        search: "juodi sportbačiai iki 100",
      },
      options: {
        allStores: "Visos parduotuvės",
        allDepartments: "Visi skyriai",
        allCategories: "Visos kategorijos",
        allColors: "Visos spalvos",
        allItems: "Visos prekės",
        availableFirst: "Pirmiausia turimos prekės",
        priceLow: "Kaina: nuo mažiausios",
        priceHigh: "Kaina: nuo didžiausios",
        bestSale: "Didžiausia nuolaida",
      },
      actions: {
        clearAll: "Išvalyti viską",
        showResults: "Rodyti rezultatus",
      },
      active: {
        aria: "Aktyvūs filtrai",
        availability: "Prieinamumas",
        category: "Kategorija",
        color: "Spalva",
        department: "Skyrius",
        search: "Paieška",
        store: "Parduotuvė",
      },
      interpretation: {
        aria: "Kaip suprasta jūsų paieška",
        ranked: "Rikiuota pagal tai, kiek prekė atitinka jūsų aprašymą.",
        approximate: "Tikslaus atitikmens nėra. Rodomos artimiausios alternatyvos nekeičiant kategorijos, spalvos, kainos ar prieinamumo.",
        relaxed: (words: string) => `Trūkstama pageidauta detalė: ${words}`,
        priceRange: (minimum: number, maximum: number) => `Kainos intervalas iš jūsų paieškos: ${minimum}–${maximum} €`,
        priceCeiling: (limit: number) => `Kainos riba iš jūsų paieškos: iki ${limit} €`,
        unknown: (words: string) => `Neatpažinta: ${words}`,
      },
      resultsFound: (count: number) => `Rasta prekių: ${count}`,
      sourceNoteAria: "Prekių šaltinių pastaba",
      sourceNoteTitle: "Pirkimo būsena",
      sourceNote:
        "Pirkimo nuorodos dar neįjungtos.",
      sourceNoteCta: "Kaip naudojami duomenys",
    },
    comparison: {
      title: "Palyginkite parduotuves",
      aria: "Ši prekė demo parduotuvėse",
      storeCount: (count: number) => `Turi ${count} demo parduotuvės`,
      inStores: (count: number) => `${count} parduotuvės`,
      from: "nuo",
      saving: (amount: string) => `Pigiausioje parduotuvėje sutaupysite iki ${amount}`,
      samePrice: "Visose parduotuvėse kaina vienoda.",
      columnStore: "Parduotuvė",
      columnPrice: "Kaina",
      columnSizes: "Dydžiai",
      columnAvailability: "Prieinamumas",
      best: "Mažiausia kaina",
      thisStore: "Peržiūrima",
      partialSizes: (sizes: string) => `Yra ne visose parduotuvėse: ${sizes}`,
      syntheticNote:
        "Šie pasiūlymai yra sintetiniai. Kainos ir likučiai sugeneruoti demonstracijai — tai nėra tikrų parduotuvių pasiūlymai.",
    },
    productGrid: {
      aria: "Prekių rezultatai",
      clearFilters: "Išvalyti filtrus",
      noResults: "Pagal šią paiešką prekių nerasta.",
      sale: "Išpardavimas",
      limited: "Ribotas kiekis",
      outOfStock: "Išparduota",
      soldOut: "Išparduota",
      sizes: "Dydžiai",
      viewAt: "Peržiūrėti",
      viewProduct: "Peržiūrėti",
      wishlistComingSoon: "Mėgstamiausi netrukus",
    },
    pages: {
      about: {
        title: "Apie Weft",
        paragraphs: [
          "Weft padeda ieškoti drabužių savais žodžiais. Apibūdink spalvą, medžiagą, progą ar biudžetą ir atrask skirtingų parduotuvių prekes vienoje vietoje.",
          "Weft nevaldo atsiskaitymo ir neperparduoda prekių. Svetainė skirta stilių paieškai, filtravimui ir palyginimui.",
          "Atverk prekės informaciją, išsaugok ją vėlesniam laikui arba patikslink paiešką. Pasirinktos sąlygos lieka tavo rankose.",
        ],
      },
      affiliate: {
        title: "Komercinės nuorodos",
        paragraphs: [
          "Dabartinėje versijoje nėra aktyvių pirkimo nuorodų.",
          "Jei ateityje bus įjungtos komercinės nuorodos, jos bus aiškiai pažymėtos. Pirkimas vyks parduotuvės svetainėje, o parduotuvė atsakys už kainą, likutį, atsiskaitymą, pristatymą, grąžinimą ir klientų aptarnavimą.",
        ],
      },
      contact: {
        title: "Kontaktai",
        intro:
          "Viešas kontaktinis adresas dar nepateiktas. Toliau gali sužinoti apie paslaugą, prekių informaciją ir privatumą.",
      },
      dataSources: {
        title: "Prekių šaltiniai",
        paragraphs: [
          "Weft rodys tik tuos realių parduotuvių prekių duomenis, kuriuos turi teisę naudoti.",
          "Dabartinis katalogas leidžia naršyti, ieškoti, filtruoti ir atrasti prekes pagal parduotuvę.",
          "Nenaudojame nukopijuotų parduotuvių nuotraukų, logotipų, prekių puslapių ar prekių ženklų.",
          "Viešas kontaktinis adresas pateikiamas kontaktų puslapyje, kai jis yra prieinamas.",
        ],
        reviewTitle: "Dabartinės katalogo taisyklės",
        reviewItems: [
          "Pirkimo nuorodos lieka išjungtos, kol bus paruoštos naudojimui.",
          "Nerodomos tikros parduotuvių prekės, nuotraukos, logotipai ar pirkimo nuorodos.",
          "Prekių nuorodos lieka Weft svetainėje ir neleidžia pirkti.",
          "Ateityje galutinė prekės informacija bus tikrinama parduotuvės svetainėje.",
        ],
      },
      howItWorks: {
        title: "Kaip tai veikia",
        shoppersTitle: "Pirkėjams",
        retailersTitle: "Parduotuvėms",
        shoppers: [
          "Ieškok pagal stilių, kategoriją, spalvą, dydį, kainą ar parduotuvę.",
          "Naršyk vizualias prekių korteles iš aiškiai pažymėtų parduotuvių.",
          "Atverk prekės informaciją arba išsaugok ją savo kolekcijoje šioje naršyklėje.",
        ],
        retailers: [
          "Realios prekės pridedamos tik turint leidimą.",
          "Norint pirkti, naudotojai bus nukreipiami į atitinkamą parduotuvės svetainę.",
          "Parduotuvė atsakys už atsiskaitymą ir užsakymo vykdymą.",
        ],
        reviewModeTitle: "Ką matote dabar",
        reviewMode: [
          "Prekių kortelės leidžia naudoti paiešką, filtrus, parduotuves ir prekių naršymą.",
          "Parduotuvių puslapiai sujungia prekes į lengvai naršomas atrankas.",
          "Pirkimo nuorodos dar neįjungtos.",
        ],
      },
      privacy: {
        title: "Privatumo politika",
        paragraphs: [
          "Weft gauna paieškos tekstą ir pasirinktus filtrus, kad pateiktų drabužių rezultatus. Prekės informacija atveriama Weft svetainėje; aktyvių parduotuvių pirkimo nuorodų ar kontaktinių žinučių formų nėra.",
          "Naršyklė siunčia paieškos ir prekės informacijos atvėrimo įvykius į Weft analitikos adresus. Jei Supabase saugykla įjungta, joje gali būti saugoma užklausa, filtrai, rezultatų skaičius, naršyklės identifikatorius ir techninė užklausos informacija. PostHog gauna suvestinius skaičius, paieškos trukmę ir prekės atvėrimo metaduomenis, bet ne paieškos tekstą, kūno išmatavimus ar nuotraukas. Tai nėra pirkimo ar apsilankymo parduotuvės svetainėje įrašai.",
          "Slapukas įsimena kalbą. Tema, išsaugotos prekės, naujausios paieškos, peržiūros išmatavimai ir naršyklės identifikatorius saugomi vietinėje naršyklės saugykloje. Jei analitikos saugykla įjungta, slapukai taip pat susieja paieškos ir prekės atvėrimo įvykius. 3D peržiūrai pasirinkta nuotrauka apdorojama naršyklėje ir nėra įkeliama į serverį. Vietoje saugomą informaciją galima pašalinti išvalius šios svetainės naršyklės duomenis.",
          "Galite prašyti susipažinti su savo asmens duomenimis, juos ištaisyti, ištrinti arba apriboti jų tvarkymą. Jei jums taikoma ES arba EEE teisė, taip pat galite nesutikti su duomenų tvarkymu, prašyti perkelti duomenis, atšaukti sutikimą, kai tvarkymas juo grindžiamas, ir pateikti skundą duomenų apsaugos priežiūros institucijai. Viešas kontaktas šiems prašymams dar nepateiktas.",
        ],
      },
      stores: {
        title: "Parduotuvės",
        lead:
          "Naršykite mados atrankas, suskirstytas pagal parduotuves.",
        reviewLead:
          "Pasirinkite parduotuvę ir peržiūrėkite jos atranką.",
        browseCta: "Naršyti prekes",
        demoNotice: "Pirkimo nuorodos dar neįjungtos.",
        fallbackDescription: "Peržiūrėk kolekciją.",
      },
      terms: {
        title: "Naudojimo sąlygos",
        paragraphs: [
          "Weft yra mados atradimų paslauga. Ateityje svetainė gali nukreipti į parduotuves pirkimui užbaigti.",
          "Weft nevaldo parduotuvių atsiskaitymo, neperparduoda prekių, nekontroliuoja galutinių kainų, negarantuoja prieinamumo ir netvarko parduotuvių užsakymų pristatymo, grąžinimo ar klientų aptarnavimo. Galutinė prekės informacija patvirtinama parduotuvės svetainėje.",
          "Dabartinėje versijoje nėra aktyvių pirkimo nuorodų. Būsimos komercinės nuorodos bus aiškiai pažymėtos.",
        ],
      },
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}
