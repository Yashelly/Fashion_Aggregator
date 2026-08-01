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
    unisex: "Unisex",
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
      demoLabel: "DEMO · SYNTHETIC CATALOG",
      slogan: "Find your vibe.",
      lead: "Search fashion the way you actually think about it — by mood, by occasion, by the thing you half-remember seeing.",
      cta: "Start searching",
    },
    search: {
      title: "Search Weft",
      lead:
        "Search by item, mood, color, store, or occasion.",
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
        search: "black sneakers under 100",
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
        clearAll: "Clear all",
        showResults: "Show results",
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
          "Weft is a visual fashion search and discovery site for Lithuanian shoppers. The service helps users browse styles, stores, colors, prices, and categories before clicking through to official retailer websites.",
          "Weft does not operate checkout or resell products. It focuses on helping shoppers search, filter, and compare styles.",
          "Live retailer catalogs are not enabled yet. Real products and links will appear only when Weft has permission to use them.",
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
          "Questions about this version, data use, corrections, or future collaboration will have a clear contact path before live catalogs are enabled.",
      },
      dataSources: {
        title: "Product Sources",
        paragraphs: [
          "Weft will show real retailer product data only when it has permission to use that information.",
          "The current catalog supports browsing, search, filters, and store-based discovery.",
          "We do not use scraped retailer photos, logos, product pages, or trademarks.",
          "Retailers can request a correction, removal, or conversation through the contact page.",
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
          "Click through to the official retailer page to buy.",
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
          "Weft processes only the information needed to operate fashion discovery, improve product search, answer contact messages, and measure outbound retailer clicks.",
          "This may include technical browser data, search events, saved preferences if enabled, outbound click events, UTM parameters, and messages sent through contact channels. Purchases happen on retailer websites, and retailer privacy policies apply to checkout, delivery, returns, and account activity on those sites.",
          "Cookies and similar technologies are used for essential site functionality and for anonymous analytics. Your language choice is remembered in a cookie so the site opens in the language you picked. If non-essential cookies are introduced later, you will be asked to consent first.",
          "You can ask to see, correct, delete, or restrict the processing of your personal data. If EU or EEA law applies to you, you can also object to processing, ask for your data in a portable form, withdraw consent where processing relies on it, and lodge a complaint with a data protection authority. Use the contact page to make any of these requests.",
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
        fallbackDescription: "A curated Weft selection.",
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
      demoLabel: "DEMO · SINTETINIS KATALOGAS",
      slogan: "Rask savo stilių.",
      lead: "Ieškok mados taip, kaip apie ją galvoji — pagal nuotaiką, progą ar tai, ką vos prisimeni mačiusi.",
      cta: "Pradėti paiešką",
    },
    search: {
      title: "Weft paieška",
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
          "Weft yra vizuali mados paieškos ir atradimo svetainė Lietuvos pirkėjams. Ji padeda naršyti stilius, parduotuves, spalvas, kainas ir kategorijas prieš pereinant į oficialias parduotuvių svetaines.",
          "Weft nevaldo atsiskaitymo ir neperparduoda prekių. Svetainė skirta stilių paieškai, filtravimui ir palyginimui.",
          "Tikri parduotuvių katalogai dar neįjungti. Realios prekės ir nuorodos atsiras tik turint leidimą jas naudoti.",
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
          "Prieš įjungiant realius katalogus čia bus aiškiai nurodyta, kur kreiptis dėl šios versijos, duomenų naudojimo, pataisymų ar bendradarbiavimo.",
      },
      dataSources: {
        title: "Prekių šaltiniai",
        paragraphs: [
          "Weft rodys tik tuos realių parduotuvių prekių duomenis, kuriuos turi teisę naudoti.",
          "Dabartinis katalogas leidžia naršyti, ieškoti, filtruoti ir atrasti prekes pagal parduotuvę.",
          "Nenaudojame nukopijuotų parduotuvių nuotraukų, logotipų, prekių puslapių ar prekių ženklų.",
          "Dėl pataisymo, pašalinimo ar bendradarbiavimo galima kreiptis kontaktų puslapyje.",
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
          "Norėdamas pirkti, pereik į oficialų parduotuvės puslapį.",
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
          "Weft tvarko tik informaciją, kurios reikia mados paieškai veikti, prekių paieškai gerinti, atsakyti į kontaktines žinutes ir matuoti išeinančius paspaudimus į parduotuves.",
          "Tai gali apimti techninius naršyklės duomenis, paieškos įvykius, išsaugotas nuostatas, jei jos įjungtos, išeinančių paspaudimų įvykius, UTM parametrus ir per kontaktinius kanalus atsiųstas žinutes. Pirkimai vyksta parduotuvių svetainėse, o jų privatumo politikos taikomos atsiskaitymui, pristatymui, grąžinimui ir paskyros veiklai tose svetainėse.",
          "Slapukai ir panašios technologijos naudojami būtinam svetainės veikimui ir anoniminei analitikai. Jūsų pasirinkta kalba įsimenama slapuke, kad svetainė atsidarytų ta kalba, kurią pasirinkote. Jei vėliau bus įdiegti nebūtini slapukai, pirmiausia bus paprašyta jūsų sutikimo.",
          "Galite prašyti susipažinti su savo asmens duomenimis, juos ištaisyti, ištrinti arba apriboti jų tvarkymą. Jei jums taikoma ES arba EEE teisė, taip pat galite nesutikti su duomenų tvarkymu, prašyti perkelti duomenis, atšaukti sutikimą, kai tvarkymas juo grindžiamas, ir pateikti skundą duomenų apsaugos priežiūros institucijai. Dėl bet kurio iš šių prašymų kreipkitės per kontaktų puslapį.",
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
        fallbackDescription: "Weft mados atranka.",
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
