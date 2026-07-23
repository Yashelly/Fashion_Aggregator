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

export function formatStoreName(slug: string) {
  return slug
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bLt\b/g, "LT");
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
    header: {
      browse: "Browse",
      departmentsAria: "Departments",
      languageAria: "Language",
      mainNavAria: "Main navigation",
      nav: {
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
        "Fashion discovery from selected retailer sources. Purchases happen on official retailer websites.",
      links: {
        affiliate: "Affiliate disclosure",
        contact: "Contact",
        dataSources: "Data sources",
        howItWorks: "How it works",
        privacy: "Privacy",
        terms: "Terms",
      },
    },
    hero: {
      proof: ["New in", "Style search", "Selected stores"],
      title: "Shop by vibe",
      lead: "Find fashion from selected stores by mood, item, brand, or occasion.",
      searchAria: "Search fashion catalog",
      searchPlaceholder: "black sneakers under 100",
      submit: "Go",
      departments: [
        { label: "Woman", href: "/search?gender=women" },
        { label: "Man", href: "/search?gender=men" },
        { label: "Unisex", href: "/search?gender=unisex" },
        { label: "Sneakers", href: "/search?query=sneakers" },
      ],
    },
    home: {
      editorialAria: "Editorial index",
      catalogAria: "Catalog navigation",
      editorialLinks: [
        { number: "01", title: "New in", href: "/search" },
        { number: "02", title: "Trending now", href: "/search?query=streetwear" },
        { number: "03", title: "Sneakers", href: "/search?query=sneakers" },
        { number: "04", title: "Summer edit", href: "/search?query=summer" },
        { number: "05", title: "Sale edit", href: "/search?sale=on" },
      ],
      categoryColumns: [
        {
          title: "Discover",
          links: [
            { label: "New in", href: "/search" },
            { label: "City black", href: "/search?query=black" },
            { label: "Soft office", href: "/search?query=office" },
            { label: "Summer minimal", href: "/search?query=summer minimal" },
            { label: "Stores", href: "/stores" },
          ],
        },
        {
          title: "Collection",
          links: [
            { label: "Dresses", href: "/search?query=dress" },
            { label: "T-shirts", href: "/search?query=tshirt" },
            { label: "Trousers", href: "/search?category=bottoms" },
            { label: "Hoodies", href: "/search?query=hoodie" },
            { label: "Jackets", href: "/search?query=jacket" },
          ],
        },
        {
          title: "Shoes | Accessories",
          links: [
            { label: "Trainers", href: "/search?query=sneakers" },
            { label: "Bags", href: "/search?category=bags" },
            { label: "Belts", href: "/search?query=belt" },
            { label: "Socks", href: "/search?query=socks" },
            { label: "Jewelry", href: "/search?query=jewelry" },
          ],
        },
        {
          title: "Stores",
          links: [
            { label: "Reserved", href: "/search?store=reserved_lt" },
            { label: "Sinsay", href: "/search?store=sinsay_lt" },
            { label: "Sizeer", href: "/search?store=sizeer_lt" },
            { label: "Modivo", href: "/search?store=modivo_lt" },
            { label: "About data", href: "/data-sources" },
          ],
        },
      ],
      collection: {
        eyebrow: "Curated edit",
        title: "Streetwear selection",
        text: "Sneakers, layers, and clean everyday pieces from selected store sources.",
        cta: "View all",
        href: "/search?query=sneakers",
      },
      trust: {
        aria: "Shopping transparency",
        text:
          "VIBEWEAR helps you discover products from selected retailer sources. Purchases happen on official retailer sites, where final prices, availability, delivery, and returns are confirmed.",
        cta: "How product data works",
      },
    },
    search: {
      title: "Search VIBEWEAR",
      lead:
        "Discover pieces by item, mood, color, store, or occasion. Final prices and availability are confirmed on the retailer site.",
      labels: {
        search: "Search",
        store: "Store",
        department: "Department",
        category: "Category",
        color: "Color",
        status: "Status",
        sort: "Sort",
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
      resultsFound: (count: number) => `${count} ${count === 1 ? "piece" : "pieces"} found`,
      sourceNoteAria: "Product source note",
      sourceNote:
        "VIBEWEAR uses approved retailer feeds, deeplinks, merchant exports, or direct permission for live product data.",
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
      affiliate: {
        title: "Affiliate Disclosure",
        paragraphs: [
          "Some product links may be affiliate links. If a user clicks a product link and buys from a retailer, this site may earn a commission at no extra cost to the user.",
          "Purchases happen on official retailer websites. Retailers are responsible for prices, availability, checkout, delivery, returns, and customer service.",
        ],
      },
      contact: {
        title: "Contact",
        intro:
          "For partnership, retailer source questions, product data corrections, or removal requests, contact the VIBEWEAR team.",
        partnerships: "Partnerships",
        legal: "Legal and data requests",
      },
      dataSources: {
        title: "Product Sources",
        paragraphs: [
          "VIBEWEAR is designed to show retailer product data only when there is permission, an approved partner feed, or retailer-provided product information.",
          "We do not present scraped retailer checkout pages as our own catalog. Product details should always be checked on the retailer website before purchase.",
          "Retailers can request corrections, removal, or partnership discussion through the contact page.",
        ],
      },
      howItWorks: {
        title: "How it works",
        shoppersTitle: "For shoppers",
        retailersTitle: "For retailers",
        shoppers: [
          "Search by vibe, category, color, size, price, or store.",
          "Browse visual product cards across approved sources.",
          "Click through to the official retailer page to buy.",
        ],
        retailers: [
          "Products are added through approved feeds or direct permission.",
          "Users are sent to official product pages.",
          "Outbound clicks can be tracked through approved affiliate links.",
        ],
      },
      privacy: {
        title: "Privacy Policy",
        paragraphs: [
          "VIBEWEAR processes only the information needed to operate fashion discovery, improve product search, answer contact messages, and measure outbound retailer clicks.",
          "This may include technical browser data, search events, saved preferences if enabled, outbound click events, UTM parameters, and messages sent through contact channels. Purchases happen on retailer websites, and retailer privacy policies apply to checkout, delivery, returns, and account activity on those sites.",
          "Product data corrections, removal requests, or privacy questions can be sent to",
        ],
      },
      stores: {
        title: "Stores",
        lead:
          "VIBEWEAR helps shoppers discover products from selected fashion, footwear, beauty, and lifestyle retailers. Availability, pricing, delivery, and returns are confirmed on each retailer website.",
        retailerSource: "retailer source",
        fallbackDescription: "Selected retailer source for VIBEWEAR discovery.",
        checkDetails: "Product details are checked on the retailer website before purchase.",
        explore: "Explore pieces",
        descriptions: {
          modivo_lt:
            "Broad fashion, footwear, and accessories source with strong catalogue depth for elevated everyday edits.",
          reserved_lt:
            "Everyday apparel source for clean basics, office pieces, outerwear, and seasonal wardrobe updates.",
          sinsay_lt:
            "Accessible fashion and accessories source for casual looks, playful edits, and trend-led pieces.",
          sizeer_lt:
            "Sneakers and streetwear source for footwear-led outfits, sporty layers, and casual accessories.",
        },
      },
      terms: {
        title: "Terms of Use",
        paragraphs: [
          "VIBEWEAR is a fashion discovery service. It helps users find products from selected retailer sources and may direct users to official retailer websites to complete purchases.",
          "VIBEWEAR does not operate retailer checkout, resell products, control final prices, guarantee availability, or handle delivery, returns, or customer service for retailer orders. Final product information is confirmed on the retailer website.",
          "Product links may include affiliate tracking. Affiliate relationships do not change the price paid by the user.",
        ],
      },
    },
  },
  lt: {
    common: {
      skipToContent: "Pereiti prie pagrindinio turinio",
    },
    header: {
      browse: "Naršyti",
      departmentsAria: "Skyriai",
      languageAria: "Kalba",
      mainNavAria: "Pagrindinė navigacija",
      nav: {
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
        "Mados paieška iš atrinktų parduotuvių šaltinių. Pirkimas vyksta oficialiose parduotuvių svetainėse.",
      links: {
        affiliate: "Partnerystės nuorodos",
        contact: "Kontaktai",
        dataSources: "Prekių šaltiniai",
        howItWorks: "Kaip tai veikia",
        privacy: "Privatumo politika",
        terms: "Naudojimo sąlygos",
      },
    },
    hero: {
      proof: ["Naujienos", "Stiliaus paieška", "Atrinktos parduotuvės"],
      title: "Rask savo stilių",
      lead: "Rask madą iš atrinktų parduotuvių pagal nuotaiką, prekę, ženklą ar progą.",
      searchAria: "Ieškoti mados kataloge",
      searchPlaceholder: "juodi sportbačiai iki 100",
      submit: "Ieškoti",
      departments: [
        { label: "Moterims", href: "/search?gender=women" },
        { label: "Vyrams", href: "/search?gender=men" },
        { label: "Unisex", href: "/search?gender=unisex" },
        { label: "Sportbačiai", href: "/search?query=sneakers" },
      ],
    },
    home: {
      editorialAria: "Redakcinis indeksas",
      catalogAria: "Katalogo navigacija",
      editorialLinks: [
        { number: "01", title: "Naujienos", href: "/search" },
        { number: "02", title: "Šiuo metu populiaru", href: "/search?query=streetwear" },
        { number: "03", title: "Sportbačiai", href: "/search?query=sneakers" },
        { number: "04", title: "Vasaros atranka", href: "/search?query=summer" },
        { number: "05", title: "Išpardavimas", href: "/search?sale=on" },
      ],
      categoryColumns: [
        {
          title: "Atrask",
          links: [
            { label: "Naujienos", href: "/search" },
            { label: "Juoda miestui", href: "/search?query=black" },
            { label: "Rami biuro apranga", href: "/search?query=office" },
            { label: "Vasaros minimalizmas", href: "/search?query=summer minimal" },
            { label: "Parduotuvės", href: "/stores" },
          ],
        },
        {
          title: "Kolekcija",
          links: [
            { label: "Suknelės", href: "/search?query=dress" },
            { label: "Marškinėliai", href: "/search?query=tshirt" },
            { label: "Kelnės", href: "/search?category=bottoms" },
            { label: "Džemperiai", href: "/search?query=hoodie" },
            { label: "Striukės", href: "/search?query=jacket" },
          ],
        },
        {
          title: "Avalynė | Aksesuarai",
          links: [
            { label: "Sportbačiai", href: "/search?query=sneakers" },
            { label: "Rankinės", href: "/search?category=bags" },
            { label: "Diržai", href: "/search?query=belt" },
            { label: "Kojinės", href: "/search?query=socks" },
            { label: "Papuošalai", href: "/search?query=jewelry" },
          ],
        },
        {
          title: "Parduotuvės",
          links: [
            { label: "Reserved", href: "/search?store=reserved_lt" },
            { label: "Sinsay", href: "/search?store=sinsay_lt" },
            { label: "Sizeer", href: "/search?store=sizeer_lt" },
            { label: "Modivo", href: "/search?store=modivo_lt" },
            { label: "Apie duomenis", href: "/data-sources" },
          ],
        },
      ],
      collection: {
        eyebrow: "Atrinkta redakcija",
        title: "Gatvės stiliaus atranka",
        text: "Sportbačiai, sluoksniai ir kasdieniai deriniai iš atrinktų parduotuvių šaltinių.",
        cta: "Peržiūrėti viską",
        href: "/search?query=sneakers",
      },
      trust: {
        aria: "Apsipirkimo skaidrumas",
        text:
          "VIBEWEAR padeda atrasti prekes iš atrinktų parduotuvių šaltinių. Pirkimas vyksta oficialiose parduotuvių svetainėse, kur patvirtinamos galutinės kainos, prieinamumas, pristatymas ir grąžinimas.",
        cta: "Kaip veikia prekių duomenys",
      },
    },
    search: {
      title: "VIBEWEAR paieška",
      lead:
        "Atrask prekes pagal daiktą, nuotaiką, spalvą, parduotuvę ar progą. Galutinės kainos ir prieinamumas patvirtinami parduotuvės svetainėje.",
      labels: {
        search: "Paieška",
        store: "Parduotuvė",
        department: "Skyrius",
        category: "Kategorija",
        color: "Spalva",
        status: "Būsena",
        sort: "Rūšiuoti",
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
      resultsFound: (count: number) => `Rasta prekių: ${count}`,
      sourceNoteAria: "Prekių šaltinių pastaba",
      sourceNote:
        "VIBEWEAR naudoja patvirtintus parduotuvių prekių duomenų kanalus, partnerių nuorodas, parduotuvių eksportus arba tiesioginį leidimą gyviems prekių duomenims.",
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
      affiliate: {
        title: "Partnerystės nuorodos",
        paragraphs: [
          "Kai kurios prekių nuorodos gali būti partnerystės nuorodos. Jei naudotojas paspaudžia prekės nuorodą ir perka iš parduotuvės, ši svetainė gali gauti komisinį mokestį be papildomos kainos naudotojui.",
          "Pirkimai vyksta oficialiose parduotuvių svetainėse. Parduotuvės atsako už kainas, prieinamumą, atsiskaitymą, pristatymą, grąžinimą ir klientų aptarnavimą.",
        ],
      },
      contact: {
        title: "Kontaktai",
        intro:
          "Dėl partnerystės, parduotuvių šaltinių, prekių duomenų pataisymų ar pašalinimo užklausų susisiekite su VIBEWEAR komanda.",
        partnerships: "Partnerystės",
        legal: "Teisinės ir duomenų užklausos",
      },
      dataSources: {
        title: "Prekių šaltiniai",
        paragraphs: [
          "VIBEWEAR sukurtas rodyti parduotuvių prekių duomenis tik tada, kai yra leidimas, patvirtintas partnerio prekių duomenų kanalas arba parduotuvės pateikta prekių informacija.",
          "Mes nepateikiame nukopijuotų parduotuvių atsiskaitymo puslapių kaip savo katalogo. Prieš perkant prekės informaciją visada reikia patikrinti parduotuvės svetainėje.",
          "Parduotuvės gali kreiptis dėl pataisymų, pašalinimo arba partnerystės aptarimo per kontaktų puslapį.",
        ],
      },
      howItWorks: {
        title: "Kaip tai veikia",
        shoppersTitle: "Pirkėjams",
        retailersTitle: "Parduotuvėms",
        shoppers: [
          "Ieškok pagal stilių, kategoriją, spalvą, dydį, kainą ar parduotuvę.",
          "Naršyk vizualias prekių korteles iš patvirtintų šaltinių.",
          "Norėdamas pirkti, pereik į oficialų parduotuvės puslapį.",
        ],
        retailers: [
          "Prekės pridedamos per patvirtintus prekių duomenų kanalus arba gavus tiesioginį leidimą.",
          "Naudotojai nukreipiami į oficialius prekių puslapius.",
          "Išeinantys paspaudimai gali būti sekami per patvirtintas partnerystės nuorodas.",
        ],
      },
      privacy: {
        title: "Privatumo politika",
        paragraphs: [
          "VIBEWEAR tvarko tik informaciją, kurios reikia mados paieškai veikti, prekių paieškai gerinti, atsakyti į kontaktines žinutes ir matuoti išeinančius paspaudimus į parduotuves.",
          "Tai gali apimti techninius naršyklės duomenis, paieškos įvykius, išsaugotas nuostatas, jei jos įjungtos, išeinančių paspaudimų įvykius, UTM parametrus ir per kontaktinius kanalus atsiųstas žinutes. Pirkimai vyksta parduotuvių svetainėse, o jų privatumo politikos taikomos atsiskaitymui, pristatymui, grąžinimui ir paskyros veiklai tose svetainėse.",
          "Prekių duomenų pataisymus, pašalinimo užklausas ar privatumo klausimus galima siųsti adresu",
        ],
      },
      stores: {
        title: "Parduotuvės",
        lead:
          "VIBEWEAR padeda pirkėjams atrasti prekes iš atrinktų mados, avalynės, grožio ir gyvenimo būdo parduotuvių. Prieinamumas, kainos, pristatymas ir grąžinimas patvirtinami kiekvienos parduotuvės svetainėje.",
        retailerSource: "prekių šaltinis",
        fallbackDescription: "Atrinktas parduotuvės šaltinis VIBEWEAR paieškai.",
        checkDetails: "Prieš perkant prekės informaciją patikrinkite parduotuvės svetainėje.",
        explore: "Peržiūrėti prekes",
        descriptions: {
          modivo_lt:
            "Platus mados, avalynės ir aksesuarų šaltinis su giliu katalogu kasdieniams ir labiau išskirtiniams deriniams.",
          reserved_lt:
            "Kasdienės aprangos šaltinis baziniams drabužiams, biuro deriniams, viršutiniams drabužiams ir sezoniniams garderobo atnaujinimams.",
          sinsay_lt:
            "Prieinamos mados ir aksesuarų šaltinis kasdieniams deriniams, žaismingoms atrankoms ir trendinėms prekėms.",
          sizeer_lt:
            "Sportbačių ir gatvės stiliaus šaltinis avalynės pagrindo deriniams, sportiškiems sluoksniams ir kasdieniams aksesuarams.",
        },
      },
      terms: {
        title: "Naudojimo sąlygos",
        paragraphs: [
          "VIBEWEAR yra mados paieškos paslauga. Ji padeda naudotojams rasti prekes iš atrinktų parduotuvių šaltinių ir gali nukreipti naudotojus į oficialias parduotuvių svetaines pirkimui užbaigti.",
          "VIBEWEAR nevaldo parduotuvių atsiskaitymo, neperparduoda prekių, nekontroliuoja galutinių kainų, negarantuoja prieinamumo ir netvarko parduotuvių užsakymų pristatymo, grąžinimo ar klientų aptarnavimo. Galutinė prekės informacija patvirtinama parduotuvės svetainėje.",
          "Prekių nuorodose gali būti partnerystės sekimas. Partnerystės ryšiai nekeičia naudotojo mokamos kainos.",
        ],
      },
    },
  },
} as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}
