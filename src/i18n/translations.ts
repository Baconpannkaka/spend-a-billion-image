import type { LanguageCode } from "@/types";

export const languageOptions: Array<{ code: LanguageCode; label: string; nativeLabel: string; locale: string; direction: "ltr" | "rtl" }> = [
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", locale: "sv-SE", direction: "ltr" },
  { code: "en", label: "English", nativeLabel: "English", locale: "en-US", direction: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", locale: "es-ES", direction: "ltr" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", locale: "zh-CN", direction: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", locale: "hi-IN", direction: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", locale: "ar", direction: "rtl" },
];

const sv = {
  "nav.start": "Start",
  "nav.shop": "Shop",
  "nav.how": "Så fungerar det",
  "nav.about": "Om",
  "header.remaining": "Kvar",
  "header.cart": "Varukorg",
  "header.openMenu": "Öppna meny",
  "header.closeMenu": "Stäng meny",
  "select.currency": "Välj valuta",
  "select.language": "Välj språk",
  "landing.eyebrow": "Fantasishopping för alla budgetar",
  "landing.title": "Hur vill du shoppa i dag?",
  "landing.intro": "Välj extrem lyx eller en mer igenkännbar kundvagn. Samma spelmotor, två helt olika dopaminkickar.",
  "landing.products": "10 000 produkter",
  "landing.luxury": "Miljardärsläge",
  "landing.luxuryTitle": "Privatjet, samlarkort och fullständig orimlighet.",
  "landing.luxuryCopy": "Välj en känd förmögenhet, den klassiska miljarden eller din egen aktiedröm.",
  "landing.chooseWealth": "Välj förmögenhet",
  "landing.everyday": "Vardagsläge",
  "landing.everydayTitle": "Mobil, mat, möbler och allt du faktiskt känner igen.",
  "landing.everydayCopy": "Välj en shoppingkassa och se hur långt den räcker bland vardagens frestelser.",
  "landing.chooseBudget": "Välj budget",
  "landing.dreamTitle": "Välj en dröm",
  "landing.dreamCopy": "Känd förmögenhet, egen budget eller en aktie som går till månen.",
  "landing.searchTitle": "Sök bland 20 000 saker",
  "landing.searchCopy": "Tydliga kategorier, underkategorier och fri sökning i två kataloger.",
  "landing.shareTitle": "Dela resultatet",
  "landing.shareCopy": "Skicka en skrivskyddad sammanställning eller utmana en vän med samma budget.",
  "starter.luxuryTitle": "Hur rik vill du vara?",
  "starter.everydayTitle": "Hur stor är shoppingkassan?",
  "starter.luxuryCopy": "Välj en uppskattad förmögenhet, ta miljarden direkt eller räkna på din aktiedröm.",
  "starter.everydayCopy": "Välj en färdig vardagsbudget, ange ett eget belopp eller låt en aktiedröm finansiera kundvagnen.",
  "starter.profiles": "Be as rich as",
  "starter.customLuxury": "Egen budget",
  "starter.customEveryday": "Välj budget",
  "starter.stock": "Get rich on stock",
  "starter.disclaimer": "Förmögenheter, priser och växelkurser är avrundade underhållningsvärden. Inga finansiella råd eller riktiga köp.",
  "starter.classic": "Klassikern",
  "starter.oneBillion": "En miljard",
  "starter.customAmount": "Eget belopp i {currency}",
  "starter.startAmount": "Starta med beloppet",
  "starter.stockName": "Aktie eller bolag",
  "starter.shares": "Antal aktier",
  "starter.targetPrice": "Drömkurs per aktie",
  "starter.quoteCurrency": "Aktiens valuta",
  "starter.shoppingBudget": "Du får att handla för",
  "starter.startStock": "Starta aktiedrömmen",
  "starter.invalid": "Kontrollera beloppet och försök igen.",
  "starter.loading": "Laddar 10 000 produkter…",
  "shop.chooseMode": "Välj ett shoppingläge först",
  "shop.chooseModeCopy": "Vi behöver veta vilken katalog och budget du vill använda.",
  "shop.toStart": "Till startsidan",
  "shop.luxuryTitle": "Shoppa utan rimliga gränser",
  "shop.everydayTitle": "Hur långt räcker din kassa?",
  "shop.newGame": "Nytt spel",
  "shop.searchLuxury": "Sök Bugatti, PSA 10, yacht…",
  "shop.searchEveryday": "Sök mobil, mat, soffa…",
  "shop.allCategories": "Alla kategorier",
  "shop.allSubcategories": "Alla underkategorier",
  "shop.recommended": "Rekommenderat",
  "shop.cheapest": "Billigast först",
  "shop.expensive": "Dyrast först",
  "shop.name": "Namn",
  "shop.affordable": "Visa bara sådant jag har råd med",
  "shop.clear": "Rensa filter",
  "shop.results": "{count} träffar · sida {page} av {pages}",
  "shop.batch": "Katalogen laddas 48 produkter åt gången",
  "shop.empty": "Inga produkter hittades",
  "shop.emptyCopy": "Rensa något filter eller prova en bredare sökning.",
  "shop.previous": "Föregående",
  "shop.next": "Nästa",
  "shop.confirmTitle": "Starta ett nytt spel?",
  "shop.confirmCopy": "Varukorgen och det färdiga resultatet rensas. Din valda valuta ligger kvar.",
  "shop.confirm": "Ja, börja om",
  "budget.budget": "Budget",
  "budget.spent": "Spenderat",
  "budget.remaining": "Kvar",
  "budget.used": "Använt",
  "budget.items": "{count} saker",
  "product.add": "Lägg till",
  "product.open": "Öppna produkt",
  "product.canAfford": "Du har råd med {count} till.",
  "product.outside": "Utanför återstående budget.",
  "product.added": "{count} × {name} lades i varukorgen.",
  "product.missing": "Budgeten saknar {amount}.",
  "product.back": "Tillbaka till shoppen",
  "product.notFound": "Produkten hittades inte",
  "product.notFoundCopy": "Produkt-id:t finns inte i den valda katalogen.",
  "product.addCollection": "Lägg till i samlingen",
  "product.realModel": "Verklig produkt eller modell",
  "product.curatedOffer": "Kurerat fantasierbjudande",
  "product.catalogVariation": "Genererat katalogval",
  "product.priceOfficial": "Ungefärligt list- eller konsumentpris",
  "product.priceMarket": "Uppskattat marknadsvärde",
  "product.priceFantasy": "Fantasipris för spelet",
  "product.source": "Produktkälla",
  "product.openSource": "Öppna produktkällan",
  "product.priceChecked": "Prisunderlag kontrollerat {date}",
  "product.startMatchingMode": "Starta rätt shoppingläge för att köpa produkten.",
  "cart.title": "Överblick före kassan",
  "cart.eyebrow": "Din fantasivarukorg",
  "cart.continue": "Fortsätt shoppa",
  "cart.empty": "Varukorgen väntar",
  "cart.emptyCopy": "Du har ännu inte lagt till något. Det är ovanligt återhållsamt.",
  "cart.product": "Produkt",
  "cart.quantity": "Antal",
  "cart.subtotal": "Delsumma",
  "cart.summary": "Summering",
  "cart.total": "Totalt",
  "cart.shareUsed": "Andel använd",
  "cart.checkout": "Till fantasikassan",
  "checkout.lastStep": "Sista steget",
  "checkout.title": "Genomför fantasiköpet",
  "checkout.copy": "Detta är ett fantasiköp. Inga pengar dras och inga produkter beställs.",
  "checkout.resultName": "Namn på resultatet",
  "checkout.mode": "Spelläge",
  "checkout.order": "Att fantasibeställa",
  "checkout.holder": "Kortinnehavare",
  "checkout.valid": "Giltigt",
  "checkout.submit": "Genomför fantasiköpet",
  "checkout.empty": "Kassan är tom",
  "checkout.emptyCopy": "Lägg till något innan du försöker genomföra fantasiköpet.",
  "checkout.status1": "Kontrollerar shoppingstatus…",
  "checkout.status2": "Kontaktar katalogens leverantörer…",
  "checkout.status3": "Packar 20 000 möjliga drömmar…",
  "checkout.status4": "Polerar ditt resultat…",
  "footer.copy": "Ett oberoende fantasishopping-spel. Inga köp, betalningar eller beställningar genomförs. Speldata sparas bara lokalt i din webbläsare.",
  "footer.legal": "Juridiskt",
  "footer.images": "Bildkällor",
  "footer.about": "Om projektet",
  "ad.label": "Annons",
} as const;

export type TranslationKey = keyof typeof sv;

const en: Partial<Record<TranslationKey, string>> = {
  "nav.start":"Home","nav.shop":"Shop","nav.how":"How it works","nav.about":"About","header.remaining":"Remaining","header.cart":"Cart","header.openMenu":"Open menu","header.closeMenu":"Close menu","select.currency":"Choose currency","select.language":"Choose language",
  "landing.eyebrow":"Fantasy shopping for every budget","landing.title":"How do you want to shop today?","landing.intro":"Choose extreme luxury or a more familiar cart. One game engine, two very different dopamine hits.","landing.products":"10,000 products","landing.luxury":"Billionaire mode","landing.luxuryTitle":"Private jets, graded cards and complete absurdity.","landing.luxuryCopy":"Choose a famous fortune, the classic billion or your own stock-market dream.","landing.chooseWealth":"Choose a fortune","landing.everyday":"Everyday mode","landing.everydayTitle":"Phones, food, furniture and everything you actually recognize.","landing.everydayCopy":"Choose a shopping budget and see how far it goes among everyday temptations.","landing.chooseBudget":"Choose a budget","landing.dreamTitle":"Choose a dream","landing.dreamCopy":"A famous fortune, your own budget or a stock going to the moon.","landing.searchTitle":"Search 20,000 things","landing.searchCopy":"Clear categories, subcategories and free search across two catalogs.","landing.shareTitle":"Share the result","landing.shareCopy":"Send a read-only haul or challenge a friend with the same budget.",
  "starter.luxuryTitle":"How rich do you want to be?","starter.everydayTitle":"How big is your shopping budget?","starter.luxuryCopy":"Choose an estimated fortune, take the billion or calculate your stock dream.","starter.everydayCopy":"Choose a preset budget, enter your own amount or fund the cart with a stock dream.","starter.profiles":"Be as rich as","starter.customLuxury":"Custom budget","starter.customEveryday":"Choose budget","starter.stock":"Get rich on stock","starter.disclaimer":"Fortunes, prices and exchange rates are rounded entertainment values. No financial advice or real purchases.","starter.classic":"The classic","starter.oneBillion":"One billion","starter.customAmount":"Custom amount in {currency}","starter.startAmount":"Start with this amount","starter.stockName":"Stock or company","starter.shares":"Number of shares","starter.targetPrice":"Dream price per share","starter.quoteCurrency":"Stock currency","starter.shoppingBudget":"You can shop for","starter.startStock":"Start the stock dream","starter.invalid":"Check the amount and try again.","starter.loading":"Loading 10,000 products…",
  "shop.chooseMode":"Choose a shopping mode first","shop.chooseModeCopy":"We need to know which catalog and budget to use.","shop.toStart":"Go to home","shop.luxuryTitle":"Shop without reasonable limits","shop.everydayTitle":"How far will your budget go?","shop.newGame":"New game","shop.searchLuxury":"Search Bugatti, PSA 10, yacht…","shop.searchEveryday":"Search phone, food, sofa…","shop.allCategories":"All categories","shop.allSubcategories":"All subcategories","shop.recommended":"Recommended","shop.cheapest":"Cheapest first","shop.expensive":"Most expensive first","shop.name":"Name","shop.affordable":"Only show what I can afford","shop.clear":"Clear filters","shop.results":"{count} results · page {page} of {pages}","shop.batch":"The catalog loads 48 products at a time","shop.empty":"No products found","shop.emptyCopy":"Clear a filter or try a broader search.","shop.previous":"Previous","shop.next":"Next","shop.confirmTitle":"Start a new game?","shop.confirmCopy":"The cart and completed result will be cleared. Your currency stays selected.","shop.confirm":"Yes, start over",
  "budget.budget":"Budget","budget.spent":"Spent","budget.remaining":"Remaining","budget.used":"Used","budget.items":"{count} items",
  "product.add":"Add","product.open":"Open product","product.canAfford":"You can afford {count} more.","product.outside":"Outside your remaining budget.","product.added":"{count} × {name} added to cart.","product.missing":"You are short by {amount}.","product.back":"Back to shop","product.notFound":"Product not found","product.notFoundCopy":"The product ID does not exist in the selected catalog.","product.addCollection":"Add to collection",
  "cart.title":"Review before checkout","cart.eyebrow":"Your fantasy cart","cart.continue":"Continue shopping","cart.empty":"Your cart is waiting","cart.emptyCopy":"You have not added anything yet. Remarkably restrained.","cart.product":"Product","cart.quantity":"Quantity","cart.subtotal":"Subtotal","cart.summary":"Summary","cart.total":"Total","cart.shareUsed":"Share used","cart.checkout":"Go to fantasy checkout",
  "checkout.lastStep":"Final step","checkout.title":"Complete the fantasy purchase","checkout.copy":"This is a fantasy purchase. No money is charged and no products are ordered.","checkout.resultName":"Name on the result","checkout.mode":"Mode","checkout.order":"Fantasy order","checkout.holder":"Cardholder","checkout.valid":"Valid thru","checkout.submit":"Complete fantasy purchase","checkout.empty":"Checkout is empty","checkout.emptyCopy":"Add something before trying to complete the fantasy purchase.","checkout.status1":"Checking shopping status…","checkout.status2":"Contacting catalog suppliers…","checkout.status3":"Packing 20,000 possible dreams…","checkout.status4":"Polishing your result…",
  "footer.copy":"An independent fantasy-shopping game. No purchases, payments or orders are made. Game data is stored only in your browser.","footer.legal":"Legal","footer.images":"Image credits","footer.about":"About the project","ad.label":"Advertisement",
};

const es: Partial<Record<TranslationKey, string>> = {
  "nav.start":"Inicio","nav.shop":"Tienda","nav.how":"Cómo funciona","nav.about":"Acerca de","header.remaining":"Queda","header.cart":"Carrito","select.currency":"Elegir moneda","select.language":"Elegir idioma",
  "landing.eyebrow":"Compras de fantasía para todos los presupuestos","landing.title":"¿Cómo quieres comprar hoy?","landing.intro":"Elige lujo extremo o un carrito más cotidiano. Un motor, dos dosis de dopamina.","landing.products":"10.000 productos","landing.luxury":"Modo multimillonario","landing.luxuryTitle":"Jets privados, cartas graduadas y absoluta locura.","landing.luxuryCopy":"Elige una fortuna famosa, el clásico billón o tu sueño bursátil.","landing.chooseWealth":"Elegir fortuna","landing.everyday":"Modo cotidiano","landing.everydayTitle":"Móviles, comida, muebles y todo lo que reconoces.","landing.everydayCopy":"Elige un presupuesto y descubre hasta dónde llega.","landing.chooseBudget":"Elegir presupuesto","landing.dreamTitle":"Elige un sueño","landing.dreamCopy":"Una fortuna famosa, tu presupuesto o una acción que llegue a la luna.","landing.searchTitle":"Busca entre 20.000 cosas","landing.searchCopy":"Categorías claras, subcategorías y búsqueda libre.","landing.shareTitle":"Comparte el resultado","landing.shareCopy":"Envía un resultado de solo lectura o reta a un amigo.",
  "shop.luxuryTitle":"Compra sin límites razonables","shop.everydayTitle":"¿Hasta dónde llega tu presupuesto?","shop.newGame":"Nuevo juego","shop.searchLuxury":"Buscar Bugatti, PSA 10, yate…","shop.searchEveryday":"Buscar móvil, comida, sofá…","shop.allCategories":"Todas las categorías","shop.allSubcategories":"Todas las subcategorías","shop.recommended":"Recomendado","shop.cheapest":"Más barato primero","shop.expensive":"Más caro primero","shop.name":"Nombre","shop.affordable":"Solo lo que puedo pagar","shop.clear":"Borrar filtros","shop.results":"{count} resultados · página {page} de {pages}","shop.batch":"El catálogo carga 48 productos cada vez","shop.empty":"No se encontraron productos","shop.emptyCopy":"Quita un filtro o prueba una búsqueda más amplia.","shop.previous":"Anterior","shop.next":"Siguiente",
  "budget.budget":"Presupuesto","budget.spent":"Gastado","budget.remaining":"Queda","budget.used":"Usado","budget.items":"{count} artículos","product.add":"Añadir","product.open":"Abrir producto","product.canAfford":"Puedes permitirte {count} más.","product.outside":"Fuera del presupuesto restante.","product.back":"Volver a la tienda","cart.continue":"Seguir comprando","cart.summary":"Resumen","cart.total":"Total","cart.checkout":"Ir a la caja de fantasía","checkout.submit":"Completar compra de fantasía","footer.legal":"Legal","footer.images":"Créditos de imágenes","footer.about":"Acerca del proyecto","ad.label":"Publicidad",
};

const zh: Partial<Record<TranslationKey, string>> = {
  "nav.start":"首页","nav.shop":"商店","nav.how":"玩法说明","nav.about":"关于","header.remaining":"剩余","header.cart":"购物车","select.currency":"选择货币","select.language":"选择语言",
  "landing.eyebrow":"适合各种预算的幻想购物","landing.title":"今天想怎么购物？","landing.intro":"选择极致奢华或熟悉的日常购物车。同一套玩法，两种不同的快乐。","landing.products":"10,000 件商品","landing.luxury":"亿万富翁模式","landing.luxuryTitle":"私人飞机、评级卡牌和彻底的疯狂。","landing.luxuryCopy":"选择名人财富、经典十亿或你的股票梦想。","landing.chooseWealth":"选择财富","landing.everyday":"日常模式","landing.everydayTitle":"手机、食物、家具和你熟悉的一切。","landing.everydayCopy":"选择购物预算，看看能买多少。","landing.chooseBudget":"选择预算","landing.dreamTitle":"选择梦想","landing.dreamCopy":"名人财富、自定义预算或一只冲上月球的股票。","landing.searchTitle":"搜索 20,000 件商品","landing.searchCopy":"清晰的分类、子分类和自由搜索。","landing.shareTitle":"分享结果","landing.shareCopy":"发送只读购物结果，或用相同预算挑战朋友。",
  "shop.luxuryTitle":"无视合理界限地购物","shop.everydayTitle":"你的预算能走多远？","shop.newGame":"新游戏","shop.searchLuxury":"搜索 Bugatti、PSA 10、游艇…","shop.searchEveryday":"搜索手机、食物、沙发…","shop.allCategories":"所有分类","shop.allSubcategories":"所有子分类","shop.recommended":"推荐","shop.cheapest":"价格从低到高","shop.expensive":"价格从高到低","shop.name":"名称","shop.affordable":"只显示买得起的","shop.clear":"清除筛选","shop.results":"{count} 个结果 · 第 {page}/{pages} 页","shop.batch":"每次加载 48 件商品","shop.empty":"没有找到商品","shop.emptyCopy":"清除筛选或扩大搜索范围。","shop.previous":"上一页","shop.next":"下一页",
  "budget.budget":"预算","budget.spent":"已花费","budget.remaining":"剩余","budget.used":"已使用","budget.items":"{count} 件","product.add":"加入","product.open":"打开商品","product.canAfford":"还可以买 {count} 件。","product.outside":"超出剩余预算。","product.back":"返回商店","cart.continue":"继续购物","cart.summary":"汇总","cart.total":"总计","cart.checkout":"前往幻想结账","checkout.submit":"完成幻想购买","footer.legal":"法律声明","footer.images":"图片来源","footer.about":"关于项目","ad.label":"广告",
};

const hi: Partial<Record<TranslationKey, string>> = {
  "nav.start":"होम","nav.shop":"शॉप","nav.how":"यह कैसे काम करता है","nav.about":"परिचय","header.remaining":"बाकी","header.cart":"कार्ट","select.currency":"मुद्रा चुनें","select.language":"भाषा चुनें",
  "landing.eyebrow":"हर बजट के लिए काल्पनिक खरीदारी","landing.title":"आज आप कैसे खरीदारी करना चाहते हैं?","landing.intro":"अत्यधिक विलासिता या परिचित रोज़मर्रा की कार्ट चुनें। एक गेम, दो अलग अनुभव।","landing.products":"10,000 उत्पाद","landing.luxury":"अरबपति मोड","landing.luxuryTitle":"निजी जेट, ग्रेडेड कार्ड और पूरी तरह बेहिसाब खरीदारी।","landing.luxuryCopy":"किसी प्रसिद्ध संपत्ति, क्लासिक अरब या अपने स्टॉक सपने को चुनें।","landing.chooseWealth":"संपत्ति चुनें","landing.everyday":"रोज़मर्रा मोड","landing.everydayTitle":"मोबाइल, खाना, फर्नीचर और वह सब जो आप पहचानते हैं।","landing.everydayCopy":"बजट चुनें और देखें वह कितनी दूर जाता है।","landing.chooseBudget":"बजट चुनें","landing.dreamTitle":"एक सपना चुनें","landing.dreamCopy":"प्रसिद्ध संपत्ति, अपना बजट या चाँद तक जाने वाला स्टॉक।","landing.searchTitle":"20,000 चीज़ों में खोजें","landing.searchCopy":"स्पष्ट श्रेणियाँ, उपश्रेणियाँ और मुक्त खोज।","landing.shareTitle":"परिणाम साझा करें","landing.shareCopy":"रीड-ओनली परिणाम भेजें या दोस्त को चुनौती दें।",
  "shop.luxuryTitle":"बिना उचित सीमा के खरीदारी","shop.everydayTitle":"आपका बजट कितनी दूर जाएगा?","shop.newGame":"नया गेम","shop.searchLuxury":"Bugatti, PSA 10, yacht खोजें…","shop.searchEveryday":"मोबाइल, खाना, सोफ़ा खोजें…","shop.allCategories":"सभी श्रेणियाँ","shop.allSubcategories":"सभी उपश्रेणियाँ","shop.recommended":"अनुशंसित","shop.cheapest":"सबसे सस्ता पहले","shop.expensive":"सबसे महंगा पहले","shop.name":"नाम","shop.affordable":"केवल वही दिखाएँ जो मैं खरीद सकता हूँ","shop.clear":"फ़िल्टर साफ़ करें","shop.results":"{count} परिणाम · पेज {page}/{pages}","shop.batch":"कैटलॉग एक बार में 48 उत्पाद लोड करता है","shop.empty":"कोई उत्पाद नहीं मिला","shop.emptyCopy":"फ़िल्टर हटाएँ या व्यापक खोज करें।","shop.previous":"पिछला","shop.next":"अगला",
  "budget.budget":"बजट","budget.spent":"खर्च","budget.remaining":"बाकी","budget.used":"उपयोग","budget.items":"{count} चीज़ें","product.add":"जोड़ें","product.open":"उत्पाद खोलें","product.canAfford":"आप {count} और खरीद सकते हैं।","product.outside":"बाकी बजट से बाहर।","product.back":"शॉप पर वापस","cart.continue":"खरीदारी जारी रखें","cart.summary":"सारांश","cart.total":"कुल","cart.checkout":"काल्पनिक चेकआउट","checkout.submit":"काल्पनिक खरीद पूरी करें","footer.legal":"कानूनी","footer.images":"चित्र स्रोत","footer.about":"परियोजना के बारे में","ad.label":"विज्ञापन",
};

const ar: Partial<Record<TranslationKey, string>> = {
  "nav.start":"الرئيسية","nav.shop":"المتجر","nav.how":"كيف يعمل","nav.about":"حول","header.remaining":"المتبقي","header.cart":"السلة","select.currency":"اختر العملة","select.language":"اختر اللغة",
  "landing.eyebrow":"تسوق خيالي لكل الميزانيات","landing.title":"كيف تريد أن تتسوق اليوم؟","landing.intro":"اختر الرفاهية القصوى أو سلة يومية مألوفة. لعبة واحدة وتجربتان مختلفتان.","landing.products":"10,000 منتج","landing.luxury":"وضع الملياردير","landing.luxuryTitle":"طائرات خاصة وبطاقات مصنفة وجنون كامل.","landing.luxuryCopy":"اختر ثروة مشهورة أو المليار الكلاسيكي أو حلم الأسهم.","landing.chooseWealth":"اختر الثروة","landing.everyday":"الوضع اليومي","landing.everydayTitle":"هواتف وطعام وأثاث وكل ما تعرفه.","landing.everydayCopy":"اختر ميزانية واكتشف إلى أي مدى تكفي.","landing.chooseBudget":"اختر الميزانية","landing.dreamTitle":"اختر حلماً","landing.dreamCopy":"ثروة مشهورة أو ميزانيتك أو سهم يصل إلى القمر.","landing.searchTitle":"ابحث بين 20,000 شيء","landing.searchCopy":"فئات وفئات فرعية وبحث حر.","landing.shareTitle":"شارك النتيجة","landing.shareCopy":"أرسل نتيجة للقراءة فقط أو تحدَّ صديقاً بنفس الميزانية.",
  "shop.luxuryTitle":"تسوق بلا حدود منطقية","shop.everydayTitle":"إلى أي مدى تكفي ميزانيتك؟","shop.newGame":"لعبة جديدة","shop.searchLuxury":"ابحث عن Bugatti أو PSA 10 أو يخت…","shop.searchEveryday":"ابحث عن هاتف أو طعام أو أريكة…","shop.allCategories":"كل الفئات","shop.allSubcategories":"كل الفئات الفرعية","shop.recommended":"مقترح","shop.cheapest":"الأرخص أولاً","shop.expensive":"الأغلى أولاً","shop.name":"الاسم","shop.affordable":"اعرض ما أستطيع شراءه فقط","shop.clear":"مسح عوامل التصفية","shop.results":"{count} نتيجة · الصفحة {page} من {pages}","shop.batch":"يتم تحميل 48 منتجاً في كل مرة","shop.empty":"لم يتم العثور على منتجات","shop.emptyCopy":"امسح أحد عوامل التصفية أو جرّب بحثاً أوسع.","shop.previous":"السابق","shop.next":"التالي",
  "budget.budget":"الميزانية","budget.spent":"تم الإنفاق","budget.remaining":"المتبقي","budget.used":"المستخدم","budget.items":"{count} عناصر","product.add":"أضف","product.open":"افتح المنتج","product.canAfford":"يمكنك شراء {count} إضافية.","product.outside":"خارج الميزانية المتبقية.","product.back":"العودة إلى المتجر","cart.continue":"متابعة التسوق","cart.summary":"الملخص","cart.total":"الإجمالي","cart.checkout":"الذهاب إلى الدفع الخيالي","checkout.submit":"إتمام الشراء الخيالي","footer.legal":"قانوني","footer.images":"مصادر الصور","footer.about":"حول المشروع","ad.label":"إعلان",
};


Object.assign(es, {
  "header.openMenu":"Abrir menú","header.closeMenu":"Cerrar menú",
  "starter.luxuryTitle":"¿Qué tan rico quieres ser?","starter.everydayTitle":"¿De cuánto es tu presupuesto?","starter.luxuryCopy":"Elige una fortuna estimada, toma el billón o calcula tu sueño bursátil.","starter.everydayCopy":"Elige un presupuesto preparado, introduce tu cantidad o financia el carrito con un sueño bursátil.","starter.profiles":"Ser tan rico como","starter.customLuxury":"Presupuesto propio","starter.customEveryday":"Elegir presupuesto","starter.stock":"Hazte rico con acciones","starter.disclaimer":"Fortunas, precios y tipos de cambio son valores aproximados para entretenimiento. No es asesoramiento financiero ni una compra real.","starter.classic":"El clásico","starter.oneBillion":"Un billón","starter.customAmount":"Cantidad propia en {currency}","starter.startAmount":"Empezar con esta cantidad","starter.stockName":"Acción o empresa","starter.shares":"Número de acciones","starter.targetPrice":"Precio soñado por acción","starter.quoteCurrency":"Moneda de la acción","starter.shoppingBudget":"Podrás comprar por","starter.startStock":"Empezar el sueño bursátil","starter.invalid":"Comprueba la cantidad e inténtalo de nuevo.","starter.loading":"Cargando 10.000 productos…",
  "shop.chooseMode":"Primero elige un modo de compra","shop.chooseModeCopy":"Necesitamos saber qué catálogo y presupuesto usar.","shop.toStart":"Ir al inicio","shop.confirmTitle":"¿Empezar un juego nuevo?","shop.confirmCopy":"Se vaciarán el carrito y el resultado. La moneda elegida se mantiene.","shop.confirm":"Sí, empezar de nuevo",
  "product.added":"{count} × {name} añadido al carrito.","product.missing":"Te faltan {amount}.","product.notFound":"Producto no encontrado","product.notFoundCopy":"El identificador no existe en el catálogo seleccionado.","product.addCollection":"Añadir a la colección",
  "cart.title":"Revisión antes de pagar","cart.eyebrow":"Tu carrito de fantasía","cart.empty":"Tu carrito está esperando","cart.emptyCopy":"Todavía no has añadido nada. Sorprendentemente prudente.","cart.product":"Producto","cart.quantity":"Cantidad","cart.subtotal":"Subtotal","cart.shareUsed":"Parte utilizada",
  "checkout.lastStep":"Último paso","checkout.title":"Completa la compra de fantasía","checkout.copy":"Esta es una compra ficticia. No se cobra dinero ni se piden productos.","checkout.resultName":"Nombre del resultado","checkout.mode":"Modo","checkout.order":"Pedido de fantasía","checkout.holder":"Titular","checkout.valid":"Válida hasta","checkout.empty":"La caja está vacía","checkout.emptyCopy":"Añade algo antes de completar la compra ficticia.","checkout.status1":"Comprobando el estado de compra…","checkout.status2":"Contactando con proveedores…","checkout.status3":"Empaquetando 20.000 sueños posibles…","checkout.status4":"Puliendo tu resultado…",
  "footer.copy":"Un juego independiente de compras ficticias. No se realizan compras, pagos ni pedidos. Los datos se guardan solo en tu navegador."
});

Object.assign(zh, {
  "header.openMenu":"打开菜单","header.closeMenu":"关闭菜单",
  "starter.luxuryTitle":"你想多有钱？","starter.everydayTitle":"你的购物预算有多少？","starter.luxuryCopy":"选择估算财富、直接拿十亿，或计算你的股票梦想。","starter.everydayCopy":"选择预设预算、输入自定义金额，或用股票梦想为购物车买单。","starter.profiles":"像他们一样富有","starter.customLuxury":"自定义预算","starter.customEveryday":"选择预算","starter.stock":"靠股票变富","starter.disclaimer":"财富、价格和汇率均为四舍五入的娱乐参考值，不构成投资建议，也不会产生真实购买。","starter.classic":"经典选择","starter.oneBillion":"十亿","starter.customAmount":"以 {currency} 输入金额","starter.startAmount":"用此金额开始","starter.stockName":"股票或公司","starter.shares":"持股数量","starter.targetPrice":"每股梦想价格","starter.quoteCurrency":"股票货币","starter.shoppingBudget":"可用于购物","starter.startStock":"开始股票梦想","starter.invalid":"请检查金额后重试。","starter.loading":"正在加载 10,000 件商品…",
  "shop.chooseMode":"请先选择购物模式","shop.chooseModeCopy":"我们需要知道使用哪个目录和预算。","shop.toStart":"返回首页","shop.confirmTitle":"开始新游戏？","shop.confirmCopy":"购物车和已完成结果将被清空，所选货币会保留。","shop.confirm":"是，重新开始",
  "product.added":"已将 {count} × {name} 加入购物车。","product.missing":"还差 {amount}。","product.notFound":"未找到商品","product.notFoundCopy":"所选目录中不存在该商品 ID。","product.addCollection":"加入收藏",
  "cart.title":"结账前检查","cart.eyebrow":"你的幻想购物车","cart.empty":"购物车正在等待","cart.emptyCopy":"你还没有添加任何商品，意外地克制。","cart.product":"商品","cart.quantity":"数量","cart.subtotal":"小计","cart.shareUsed":"已用比例",
  "checkout.lastStep":"最后一步","checkout.title":"完成幻想购买","checkout.copy":"这是一次幻想购买，不会扣款，也不会下单。","checkout.resultName":"结果名称","checkout.mode":"模式","checkout.order":"幻想订单","checkout.holder":"持卡人","checkout.valid":"有效期","checkout.empty":"结账页为空","checkout.emptyCopy":"请先添加商品，再完成幻想购买。","checkout.status1":"正在检查购物状态…","checkout.status2":"正在联系目录供应商…","checkout.status3":"正在打包 20,000 个可能的梦想…","checkout.status4":"正在润色你的结果…",
  "footer.copy":"独立的幻想购物游戏。不会产生购买、付款或订单。游戏数据只保存在你的浏览器中。"
});

Object.assign(hi, {
  "header.openMenu":"मेनू खोलें","header.closeMenu":"मेनू बंद करें",
  "starter.luxuryTitle":"आप कितना अमीर बनना चाहते हैं?","starter.everydayTitle":"आपका शॉपिंग बजट कितना है?","starter.luxuryCopy":"अनुमानित संपत्ति चुनें, सीधे एक अरब लें या अपने स्टॉक सपने की गणना करें।","starter.everydayCopy":"तैयार बजट चुनें, अपनी राशि डालें या स्टॉक सपने से कार्ट भरें।","starter.profiles":"इतने अमीर बनें","starter.customLuxury":"अपना बजट","starter.customEveryday":"बजट चुनें","starter.stock":"स्टॉक से अमीर बनें","starter.disclaimer":"संपत्ति, कीमतें और विनिमय दरें मनोरंजन के लिए अनुमानित हैं। यह वित्तीय सलाह या वास्तविक खरीद नहीं है।","starter.classic":"क्लासिक","starter.oneBillion":"एक अरब","starter.customAmount":"{currency} में अपनी राशि","starter.startAmount":"इस राशि से शुरू करें","starter.stockName":"स्टॉक या कंपनी","starter.shares":"शेयरों की संख्या","starter.targetPrice":"प्रति शेयर सपना मूल्य","starter.quoteCurrency":"स्टॉक की मुद्रा","starter.shoppingBudget":"आप खरीदारी कर सकते हैं","starter.startStock":"स्टॉक सपना शुरू करें","starter.invalid":"राशि जाँचें और फिर प्रयास करें।","starter.loading":"10,000 उत्पाद लोड हो रहे हैं…",
  "shop.chooseMode":"पहले शॉपिंग मोड चुनें","shop.chooseModeCopy":"हमें कैटलॉग और बजट जानना होगा।","shop.toStart":"होम पर जाएँ","shop.confirmTitle":"नया गेम शुरू करें?","shop.confirmCopy":"कार्ट और पूरा परिणाम साफ़ हो जाएगा। चुनी मुद्रा बनी रहेगी।","shop.confirm":"हाँ, फिर से शुरू करें",
  "product.added":"{count} × {name} कार्ट में जोड़ा गया।","product.missing":"आपके पास {amount} कम हैं।","product.notFound":"उत्पाद नहीं मिला","product.notFoundCopy":"चुने गए कैटलॉग में यह उत्पाद आईडी नहीं है।","product.addCollection":"संग्रह में जोड़ें",
  "cart.title":"चेकआउट से पहले समीक्षा","cart.eyebrow":"आपकी काल्पनिक कार्ट","cart.empty":"आपकी कार्ट इंतज़ार कर रही है","cart.emptyCopy":"आपने अभी तक कुछ नहीं जोड़ा। आश्चर्यजनक संयम।","cart.product":"उत्पाद","cart.quantity":"मात्रा","cart.subtotal":"उप-योग","cart.shareUsed":"उपयोग का हिस्सा",
  "checkout.lastStep":"अंतिम चरण","checkout.title":"काल्पनिक खरीद पूरी करें","checkout.copy":"यह काल्पनिक खरीद है। कोई पैसा नहीं कटता और कोई उत्पाद ऑर्डर नहीं होता।","checkout.resultName":"परिणाम का नाम","checkout.mode":"मोड","checkout.order":"काल्पनिक ऑर्डर","checkout.holder":"कार्डधारक","checkout.valid":"मान्य अवधि","checkout.empty":"चेकआउट खाली है","checkout.emptyCopy":"खरीद पूरी करने से पहले कुछ जोड़ें।","checkout.status1":"शॉपिंग स्थिति जाँची जा रही है…","checkout.status2":"कैटलॉग आपूर्तिकर्ताओं से संपर्क हो रहा है…","checkout.status3":"20,000 संभावित सपने पैक हो रहे हैं…","checkout.status4":"आपका परिणाम चमकाया जा रहा है…",
  "footer.copy":"एक स्वतंत्र काल्पनिक शॉपिंग गेम। कोई खरीद, भुगतान या ऑर्डर नहीं होता। डेटा केवल आपके ब्राउज़र में सहेजा जाता है।"
});

Object.assign(ar, {
  "header.openMenu":"فتح القائمة","header.closeMenu":"إغلاق القائمة",
  "starter.luxuryTitle":"ما مدى الثراء الذي تريده؟","starter.everydayTitle":"كم تبلغ ميزانية التسوق؟","starter.luxuryCopy":"اختر ثروة تقديرية أو ابدأ بالمليار أو احسب حلم الأسهم.","starter.everydayCopy":"اختر ميزانية جاهزة أو أدخل مبلغك أو موّل السلة بحلم الأسهم.","starter.profiles":"كن غنياً مثل","starter.customLuxury":"ميزانية خاصة","starter.customEveryday":"اختر الميزانية","starter.stock":"ازدد ثراءً بالأسهم","starter.disclaimer":"الثروات والأسعار وأسعار الصرف تقديرات للترفيه فقط. ليست نصيحة مالية ولا شراءً حقيقياً.","starter.classic":"الخيار الكلاسيكي","starter.oneBillion":"مليار واحد","starter.customAmount":"مبلغ خاص بعملة {currency}","starter.startAmount":"ابدأ بهذا المبلغ","starter.stockName":"السهم أو الشركة","starter.shares":"عدد الأسهم","starter.targetPrice":"السعر الحلم للسهم","starter.quoteCurrency":"عملة السهم","starter.shoppingBudget":"يمكنك التسوق بمبلغ","starter.startStock":"ابدأ حلم الأسهم","starter.invalid":"تحقق من المبلغ وحاول مرة أخرى.","starter.loading":"جارٍ تحميل 10,000 منتج…",
  "shop.chooseMode":"اختر وضع التسوق أولاً","shop.chooseModeCopy":"نحتاج إلى معرفة الكتالوج والميزانية.","shop.toStart":"العودة للرئيسية","shop.confirmTitle":"بدء لعبة جديدة؟","shop.confirmCopy":"سيتم مسح السلة والنتيجة المكتملة، وستبقى العملة المختارة.","shop.confirm":"نعم، ابدأ من جديد",
  "product.added":"تمت إضافة {count} × {name} إلى السلة.","product.missing":"ينقصك {amount}.","product.notFound":"المنتج غير موجود","product.notFoundCopy":"معرّف المنتج غير موجود في الكتالوج المختار.","product.addCollection":"أضف إلى المجموعة",
  "cart.title":"مراجعة قبل الدفع","cart.eyebrow":"سلة التسوق الخيالية","cart.empty":"السلة في انتظارك","cart.emptyCopy":"لم تضف شيئاً بعد. ضبط نفس مثير للإعجاب.","cart.product":"المنتج","cart.quantity":"الكمية","cart.subtotal":"المجموع الفرعي","cart.shareUsed":"النسبة المستخدمة",
  "checkout.lastStep":"الخطوة الأخيرة","checkout.title":"إتمام الشراء الخيالي","checkout.copy":"هذه عملية شراء خيالية. لن يتم خصم أموال أو طلب منتجات.","checkout.resultName":"اسم النتيجة","checkout.mode":"الوضع","checkout.order":"الطلب الخيالي","checkout.holder":"حامل البطاقة","checkout.valid":"صالحة حتى","checkout.empty":"صفحة الدفع فارغة","checkout.emptyCopy":"أضف شيئاً قبل إتمام الشراء الخيالي.","checkout.status1":"جارٍ التحقق من حالة التسوق…","checkout.status2":"جارٍ التواصل مع الموردين…","checkout.status3":"جارٍ تعبئة 20,000 حلم محتمل…","checkout.status4":"جارٍ تلميع نتيجتك…",
  "footer.copy":"لعبة تسوق خيالية مستقلة. لا تتم أي عمليات شراء أو دفع أو طلب. تُحفظ بيانات اللعبة في متصفحك فقط."
});

Object.assign(en, {
  "product.realModel":"Real product or model","product.curatedOffer":"Curated fantasy offer","product.catalogVariation":"Generated catalog choice","product.priceOfficial":"Approximate retail or list price","product.priceMarket":"Estimated market value","product.priceFantasy":"Fantasy price for the game","product.source":"Product source","product.openSource":"Open product source","product.priceChecked":"Price basis checked {date}","product.startMatchingMode":"Start the matching shopping mode to buy this product."
});
Object.assign(es, {
  "product.realModel":"Producto o modelo real","product.curatedOffer":"Oferta de fantasía seleccionada","product.catalogVariation":"Opción generada del catálogo","product.priceOfficial":"Precio aproximado de venta o lista","product.priceMarket":"Valor de mercado estimado","product.priceFantasy":"Precio ficticio del juego","product.source":"Fuente del producto","product.openSource":"Abrir fuente del producto","product.priceChecked":"Referencia de precio revisada el {date}","product.startMatchingMode":"Inicia el modo de compra correspondiente para comprar este producto."
});
Object.assign(zh, {
  "product.realModel":"真实产品或型号","product.curatedOffer":"精选幻想商品","product.catalogVariation":"生成的目录选项","product.priceOfficial":"近似零售价或标价","product.priceMarket":"估算市场价值","product.priceFantasy":"游戏幻想价格","product.source":"产品来源","product.openSource":"打开产品来源","product.priceChecked":"价格依据核对于 {date}","product.startMatchingMode":"请启动对应的购物模式后购买此商品。"
});
Object.assign(hi, {
  "product.realModel":"वास्तविक उत्पाद या मॉडल","product.curatedOffer":"चुना हुआ काल्पनिक ऑफर","product.catalogVariation":"जनरेट किया गया कैटलॉग विकल्प","product.priceOfficial":"अनुमानित खुदरा या सूची मूल्य","product.priceMarket":"अनुमानित बाजार मूल्य","product.priceFantasy":"गेम का काल्पनिक मूल्य","product.source":"उत्पाद स्रोत","product.openSource":"उत्पाद स्रोत खोलें","product.priceChecked":"मूल्य आधार {date} को जाँचा गया","product.startMatchingMode":"इस उत्पाद को खरीदने के लिए संबंधित शॉपिंग मोड शुरू करें।"
});
Object.assign(ar, {
  "product.realModel":"منتج أو طراز حقيقي","product.curatedOffer":"عرض خيالي منسق","product.catalogVariation":"خيار مولّد في الكتالوج","product.priceOfficial":"سعر تجزئة أو قائمة تقريبي","product.priceMarket":"قيمة سوقية تقديرية","product.priceFantasy":"سعر خيالي للعبة","product.source":"مصدر المنتج","product.openSource":"فتح مصدر المنتج","product.priceChecked":"تمت مراجعة أساس السعر في {date}","product.startMatchingMode":"ابدأ وضع التسوق المطابق لشراء هذا المنتج."
});

const translations: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = { sv, en, es, zh, hi, ar };

export function getLanguageOption(code: LanguageCode) {
  return languageOptions.find((entry) => entry.code === code) ?? languageOptions[0];
}

export function translate(language: LanguageCode, key: TranslationKey, variables?: Record<string, string | number>): string {
  let value = translations[language][key] ?? sv[key];
  if (variables) {
    for (const [name, replacement] of Object.entries(variables)) value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
}
