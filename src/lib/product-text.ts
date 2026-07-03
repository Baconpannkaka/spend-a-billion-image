import type { LanguageCode, Product } from "@/types";

export type LocalizedProductText = {
  name: string;
  shortDescription: string;
  description: string;
  facts: string[];
  categoryLabel: string;
  subcategoryLabel: string;
};

const genericCopy: Record<Exclude<LanguageCode, "sv">, { short: string; description: string; facts: (product: Product) => string[] }> = {
  en: {
    short: "An estimated listing designed for the fantasy shopping game.",
    description: "This is an approximate entertainment listing. The price is not a quote, and nothing is sold or ordered through this website.",
    facts: (product) => [product.brand ? `Brand: ${product.brand}` : "Type: fantasy listing", "Price: rounded entertainment estimate", product.dataQuality === "verified" ? "Data status: real product or model" : "Data status: curated or generated game entry"],
  },
  es: {
    short: "Una oferta estimada creada para el juego de compras ficticias.",
    description: "Esta es una oferta aproximada de entretenimiento. El precio no es una cotización y no se vende ni se pide nada a través de este sitio.",
    facts: (product) => [product.brand ? `Marca: ${product.brand}` : "Tipo: oferta ficticia", "Precio: estimación redondeada para entretenimiento", product.dataQuality === "verified" ? "Estado: producto o modelo real" : "Estado: entrada curada o generada para el juego"],
  },
  zh: {
    short: "为幻想购物游戏设计的估算商品。",
    description: "这是仅供娱乐的估算商品与价格，并非报价，本网站不会销售或订购任何商品。",
    facts: (product) => [product.brand ? `品牌：${product.brand}` : "类型：幻想商品", "价格：四舍五入的娱乐估值", product.dataQuality === "verified" ? "数据状态：真实产品或型号" : "数据状态：人工整理或生成的游戏条目"],
  },
  hi: {
    short: "फैंटेसी शॉपिंग गेम के लिए बनाया गया अनुमानित ऑफर।",
    description: "यह केवल मनोरंजन के लिए एक अनुमानित ऑफर है। कीमत कोई कोटेशन नहीं है और इस वेबसाइट से कुछ बेचा या ऑर्डर नहीं किया जाता।",
    facts: (product) => [product.brand ? `ब्रांड: ${product.brand}` : "प्रकार: फैंटेसी ऑफर", "कीमत: मनोरंजन के लिए गोल अनुमान", product.dataQuality === "verified" ? "डेटा स्थिति: वास्तविक उत्पाद या मॉडल" : "डेटा स्थिति: क्यूरेटेड या जनरेटेड गेम प्रविष्टि"],
  },
  ar: {
    short: "عرض تقديري صُمم للعبة التسوق الخيالية.",
    description: "هذا عرض تقديري للترفيه فقط. السعر ليس عرضاً رسمياً ولا يتم بيع أو طلب أي منتج عبر هذا الموقع.",
    facts: (product) => [product.brand ? `العلامة: ${product.brand}` : "النوع: عرض خيالي", "السعر: تقدير تقريبي للترفيه", product.dataQuality === "verified" ? "حالة البيانات: منتج أو طراز حقيقي" : "حالة البيانات: إدخال منسق أو مولد للعبة"],
  },
};

export function getProductText(product: Product, language: LanguageCode): LocalizedProductText {
  const localized = product.localizations?.[language];
  if (language === "sv") {
    return {
      name: localized?.name ?? product.name,
      shortDescription: localized?.shortDescription ?? product.shortDescription,
      description: localized?.description ?? product.description,
      facts: localized?.facts ?? product.facts,
      categoryLabel: localized?.categoryLabel ?? product.categoryLabel,
      subcategoryLabel: localized?.subcategoryLabel ?? product.subcategoryLabel,
    };
  }

  const fallback = genericCopy[language];
  return {
    name: localized?.name ?? product.name,
    shortDescription: localized?.shortDescription ?? fallback.short,
    description: localized?.description ?? fallback.description,
    facts: localized?.facts ?? fallback.facts(product),
    categoryLabel: localized?.categoryLabel ?? product.categoryLabel,
    subcategoryLabel: localized?.subcategoryLabel ?? product.subcategoryLabel,
  };
}

export function getProductSearchText(product: Product): string {
  const localizedValues = Object.values(product.localizations ?? {}).flatMap((entry) => entry ? [entry.name, entry.categoryLabel, entry.subcategoryLabel].filter(Boolean) : []);
  return [
    product.name,
    product.brand ?? "",
    product.categoryLabel,
    product.subcategoryLabel,
    ...localizedValues,
    ...product.tags,
  ].join(" ");
}
