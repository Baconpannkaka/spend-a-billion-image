import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { luxuryRealProducts, everydayRealProducts } from "./real-product-seeds.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "data");
const PRODUCTS_PER_MODE = 10_000;
const PRODUCTS_PER_CATEGORY = 500;

const luxuryCategories = [
  { id: "fordon", label: "Fordon", description: "Superbilar, klassiker, motorcyklar och specialbyggda fordon.", subcategories: ["Superbilar", "Klassiska bilar", "SUV & limousine", "Motorcyklar", "Banbilar"], items: ["Hypercar", "Grand tourer", "Roadster", "Limousine", "Restomod", "Racingbil", "El-superbil", "Terräng-SUV", "Coupé", "Samlarbil"], min: 4_000_000, max: 700_000_000 },
  { id: "flyg", label: "Privatflyg", description: "Privatjet, helikoptrar och exklusiva luftfarkoster.", subcategories: ["Långdistansjet", "Midsize jet", "Helikopter", "Turboprop", "Historiskt flyg"], items: ["Privatjet", "Långdistansjet", "Affärsjet", "Helikopter", "Turboprop", "VIP-flygplan", "Amfibieflyg", "Jet trainer", "Historiskt propellerplan", "Luftskepp"], min: 120_000_000, max: 1_800_000_000 },
  { id: "batar", label: "Yachter & båtar", description: "Superyachter, segelbåtar och snabba tenderbåtar.", subcategories: ["Superyachter", "Motoryachter", "Segelyachter", "Tenderbåtar", "Explorer yachts"], items: ["Superyacht", "Explorer yacht", "Motoryacht", "Segelyacht", "Catamaran", "Tenderbåt", "Sportbåt", "Houseboat", "Classic yacht", "Daycruiser"], min: 20_000_000, max: 2_500_000_000 },
  { id: "fastigheter", label: "Fastigheter", description: "Takvåningar, privata öar, slott och spektakulära hem.", subcategories: ["Stadsvåningar", "Villor", "Öar", "Slott & gods", "Semesterhem"], items: ["Takvåning", "Klippvilla", "Privat ö", "Townhouse", "Skidchalet", "Slott", "Vingård", "Strandresidens", "Skärgårdsgård", "Ökenretreat"], min: 35_000_000, max: 3_000_000_000 },
  { id: "klockor", label: "Klockor", description: "Haute horlogerie, sportikoner och unika komplikationer.", subcategories: ["Haute horlogerie", "Sportklockor", "Vintage", "Tourbillon", "Juvelklockor"], items: ["Tourbillon", "Perpetual calendar", "Chronograph", "Minute repeater", "Skeleton watch", "Dykarklocka", "Pilotklocka", "Dress watch", "World timer", "Vintage chronograph"], min: 250_000, max: 220_000_000 },
  { id: "smycken", label: "Smycken", description: "Diamanter, ädelstenar och haute joaillerie.", subcategories: ["Ringar", "Halsband", "Armband", "Örhängen", "Unika stenar"], items: ["Diamantring", "Safirhalsband", "Smaragdarmband", "Rubinörhängen", "Tiaran", "Brosch", "Signetring", "Tennisarmband", "Pärlhalsband", "Ädelstenskollektion"], min: 300_000, max: 500_000_000 },
  { id: "mode", label: "Mode", description: "Couture, väskor, skor och sällsynta accessoarer.", subcategories: ["Couture", "Väskor", "Skor", "Ytterplagg", "Accessoarer"], items: ["Coutureklänning", "Skräddarsydd kostym", "Handväska", "Weekendbag", "Kashmirrock", "Sneakers", "Läderskor", "Silkessjal", "Solglasögon", "Resegarderob"], min: 25_000, max: 12_000_000 },
  { id: "teknik", label: "Teknik", description: "Specialbyggd teknik, hemmabio och framtidsprylar.", subcategories: ["Datorer", "Ljud & bild", "Mobilitet", "Robotik", "Smart home"], items: ["Arbetsstation", "Hemmabio", "Referenshögtalare", "Transparent TV", "Gamingrigg", "Servicerobot", "Smart glass-vägg", "VR-studio", "Satellittelefon", "Privat datacenter"], min: 80_000, max: 120_000_000 },
  { id: "konst", label: "Konst", description: "Målningar, skulpturer, fotografi och designobjekt.", subcategories: ["Modern konst", "Samtidskonst", "Skulptur", "Fotografi", "Design"], items: ["Modern målning", "Samtida målning", "Bronsskulptur", "Fotokonstverk", "Kinetisk installation", "Glaskonst", "Marmorskulptur", "Digital installation", "Designikon", "Konstsamling"], min: 500_000, max: 1_500_000_000 },
  { id: "samlarobjekt", label: "Samlarobjekt", description: "Samlarkort, memorabilia, fossiler och historiska föremål.", subcategories: ["Samlarkort", "Sportmemorabilia", "Film & musik", "Naturhistoria", "Historiska föremål"], items: ["Graderat samlarkort", "Signerat matchställ", "Filmkostym", "Turnégitarr", "Dinosauriefossil", "Historiskt dokument", "Rymdmemorabilia", "Myntsamling", "Första utgåva", "Prototyp"], min: 50_000, max: 900_000_000 },
  { id: "resor", label: "Resor", description: "Jorden runt, privata expeditioner och ikoniska hotellsviter.", subcategories: ["Jorden runt", "Expeditioner", "Hotell", "Tåg", "Safari"], items: ["Jorden runt-resa", "Polarexpedition", "Privat safari", "Ö-tur", "Grand tour", "Lyxtågsresa", "Rymdresa", "Kulturresa", "Matresa", "Familjeäventyr"], min: 1_000_000, max: 350_000_000 },
  { id: "upplevelser", label: "Upplevelser", description: "Konserter, premiärer och ögonblick som inte går att köpa vanligtvis.", subcategories: ["Musik", "Film", "Sport", "Äventyr", "Privata event"], items: ["Privat konsert", "Filmpremiär", "Grand Prix-helg", "Finalpaket", "Privat festival", "Ökenrally", "Djuphavsdyk", "Ballongexpedition", "Kockmiddag", "Museikväll"], min: 500_000, max: 100_000_000 },
  { id: "sport", label: "Sport & fritid", description: "Golf, racing, vintersport och privata träningsmiljöer.", subcategories: ["Golf", "Motorsport", "Vintersport", "Racketsport", "Vattensport"], items: ["Golfmedlemskap", "Racingsimulator", "Skidvecka", "Padelbana", "Tennisakademi", "Surfresa", "Seglingssäsong", "Cykelteam", "Privat gym", "Tränarläger"], min: 250_000, max: 80_000_000 },
  { id: "hem-design", label: "Hem & design", description: "Möbler, kök, belysning och skräddarsydda miljöer.", subcategories: ["Möbler", "Kök", "Belysning", "Textil", "Utomhus"], items: ["Designsoffa", "Matsalsgrupp", "Platsbyggt kök", "Kristallkrona", "Konstmattkollektion", "Bibliotek", "Vinkällare", "Poolområde", "Orangeri", "Hemmastudio"], min: 150_000, max: 75_000_000 },
  { id: "mat", label: "Mat & gastronomi", description: "Privata kockar, restaurangupplevelser och sällsynta råvaror.", subcategories: ["Privat kock", "Fine dining", "Råvaror", "Dessert", "Kaffe & te"], items: ["Privat kockår", "Chef's table", "Tryffelmiddag", "Kaviarpaket", "Sushiomakase", "Chokladkollektion", "Kaffereserv", "Teprovning", "Bageristudio", "Gourmetpicknick"], min: 20_000, max: 35_000_000 },
  { id: "wellness", label: "Wellness", description: "Spa, återhämtning, skönhet och personlig hälsa.", subcategories: ["Spa", "Träning", "Hudvård", "Retreat", "Återhämtning"], items: ["Privat spa", "Wellness-retreat", "Personlig tränare", "Hudvårdsprogram", "Sömnsvit", "Recovery room", "Meditationsstudio", "Biohackingpaket", "Massageår", "Hälsocoach"], min: 100_000, max: 25_000_000 },
  { id: "familj", label: "Familj & barn", description: "Drömrum, lek, lärande och stora familjeupplevelser.", subcategories: ["Barnrum", "Lek", "Utbildning", "Familjeresor", "Firanden"], items: ["Drömbarnrum", "Trädkoja", "Leksaksbibliotek", "Privat läger", "Familjeexpedition", "Födelsedagsfestival", "Musikstudio för barn", "Vetenskapsrum", "Minibio", "Ridläger"], min: 100_000, max: 40_000_000 },
  { id: "husdjur", label: "Husdjur", description: "Exklusiva hem, resor och service för fyrbenta familjemedlemmar.", subcategories: ["Hund", "Katt", "Häst", "Akvarium", "Service"], items: ["Hundhus", "Kattsvit", "Häststall", "Designakvarium", "Husdjursspa", "Privat hundpark", "Resepaket för djur", "Tränarår", "Veterinärconcierge", "Porträttsession"], min: 50_000, max: 30_000_000 },
  { id: "underhallning", label: "Musik & underhållning", description: "Studior, biografer, instrument och privata scener.", subcategories: ["Musik", "Film", "Spel", "Scen", "Samlingar"], items: ["Flygel", "Inspelningsstudio", "Privat biograf", "Arcadehall", "Konsertscen", "Gitarrsamling", "DJ-studio", "Podcaststudio", "Vinylbibliotek", "Karaokerum"], min: 150_000, max: 65_000_000 },
  { id: "service", label: "Service & medlemskap", description: "Concierge, personal, klubbar och skräddarsydd vardagsservice.", subcategories: ["Concierge", "Personal", "Klubbar", "Säkerhet", "Transport"], items: ["Conciergeår", "Privatchaufför", "Hushållsteam", "Privat säkerhet", "Medlemsklubb", "Jet concierge", "Reseplanerare", "Personal shopper", "Butlerservice", "Eventteam"], min: 250_000, max: 60_000_000 },
];

const everydayCategories = [
  { id: "mat", label: "Mat & dryck", description: "Frukost, middag, snacks och vardagsfavoriter.", subcategories: ["Skafferi", "Kylt", "Frukt & grönt", "Snacks", "Dryck"], items: ["Pastapaket", "Kaffepaket", "Fruktkorg", "Familjemiddag", "Glasspaket", "Tacoset", "Brödkorg", "Smoothiepaket", "Chokladask", "Matkasse"], min: 15, max: 2_500 },
  { id: "elektronik", label: "Elektronik", description: "TV, ljud, hörlurar och smarta prylar.", subcategories: ["TV", "Ljud", "Hörlurar", "Smart home", "Tillbehör"], items: ["Smart-TV", "Bluetoothhögtalare", "Trådlösa hörlurar", "Soundbar", "E-boksläsare", "Smartklocka", "Projektor", "Kamera", "Powerbank", "Smarthögtalare"], min: 199, max: 45_000 },
  { id: "mobil", label: "Mobiltelefoner", description: "Telefoner, skal, laddare och mobila tillbehör.", subcategories: ["Smartphones", "Budgetmobiler", "Skal", "Laddning", "Foto"], items: ["Smartphone", "Kompaktmobil", "Vikbar mobil", "Mobilskal", "Snabbladdare", "Trådlös laddare", "Mobilstativ", "Kameragrepp", "Skärmskydd", "Reseladdare"], min: 99, max: 28_000 },
  { id: "datorer", label: "Datorer", description: "Bärbart, stationärt och allt runt omkring.", subcategories: ["Laptop", "Stationärt", "Skärmar", "Tangentbord", "Tillbehör"], items: ["Laptop", "Stationär dator", "Bildskärm", "Mekaniskt tangentbord", "Datormus", "Dockningsstation", "Webbkamera", "SSD", "Router", "Kontorspaket"], min: 249, max: 55_000 },
  { id: "gaming", label: "Gaming", description: "Konsoler, spel, stolar och tillbehör.", subcategories: ["Konsoler", "Spel", "PC-gaming", "Tillbehör", "Retro"], items: ["Spelkonsol", "TV-spel", "Gamingstol", "Handkontroll", "Gamingheadset", "Racingratt", "Retro-konsol", "VR-headset", "Spelbord", "Presentkort"], min: 99, max: 30_000 },
  { id: "hem", label: "Hem", description: "Praktiska saker som gör hemmet enklare och trevligare.", subcategories: ["Städ", "Förvaring", "Textil", "Belysning", "Dekoration"], items: ["Dammsugare", "Förvaringslåda", "Bäddset", "Bordslampa", "Vas", "Gardiner", "Handduksset", "Spegel", "Doftljus", "Tvättkorg"], min: 39, max: 12_000 },
  { id: "mobler", label: "Möbler", description: "Soffor, bord, sängar och småmöbler.", subcategories: ["Vardagsrum", "Sovrum", "Matplats", "Kontor", "Utomhus"], items: ["Soffa", "Säng", "Matbord", "Kontorsstol", "Fåtölj", "Skrivbord", "Bokhylla", "Sängbord", "Utemöbel", "Pall"], min: 199, max: 45_000 },
  { id: "kok", label: "Kök", description: "Köksmaskiner, redskap och servering.", subcategories: ["Maskiner", "Kokkärl", "Knivar", "Servering", "Bakning"], items: ["Airfryer", "Kaffebryggare", "Stekpanna", "Knivset", "Tallriksset", "Mixer", "Vattenkokare", "Bakform", "Matlådeset", "Köksvåg"], min: 49, max: 18_000 },
  { id: "klader", label: "Kläder", description: "Basplagg, fest, ytterplagg och arbetskläder.", subcategories: ["Dam", "Herr", "Unisex", "Barn", "Ytterplagg"], items: ["T-shirt", "Jeans", "Skjorta", "Klänning", "Hoodie", "Jacka", "Kostym", "Träningsset", "Pyjamas", "Regnkläder"], min: 79, max: 8_000 },
  { id: "skor", label: "Skor", description: "Sneakers, vardagsskor, boots och sportskor.", subcategories: ["Sneakers", "Sport", "Boots", "Barnskor", "Sandaler"], items: ["Sneakers", "Löparskor", "Vandringskängor", "Vinterskor", "Sandaler", "Barnskor", "Fotbollsskor", "Arbetsskor", "Tofflor", "Gummistövlar"], min: 99, max: 4_500 },
  { id: "skonhet", label: "Skönhet & vård", description: "Hud, hår, doft och vardaglig egenvård.", subcategories: ["Hudvård", "Hårvård", "Makeup", "Doft", "Rakning"], items: ["Hudvårdsset", "Schampo", "Hårfön", "Makeupkit", "Parfym", "Rakapparat", "Ansiktsmask", "Nagelset", "Body lotion", "Stylingverktyg"], min: 29, max: 6_000 },
  { id: "halsa", label: "Hälsa", description: "Enkel hälsoutrustning, återhämtning och vardagsstöd.", subcategories: ["Mätning", "Sömn", "Återhämtning", "Ergonomi", "Första hjälpen"], items: ["Blodtrycksmätare", "Tyngdtäcke", "Massagepistol", "Ergonomisk kudde", "Första hjälpen-kit", "Ljusterapilampa", "Nackmassage", "Sovmask", "Ståmatta", "Värmedyna"], min: 49, max: 8_000 },
  { id: "traning", label: "Träning", description: "Gym, löpning, lagidrott och hemmaträning.", subcategories: ["Gym", "Löpning", "Bollsport", "Yoga", "Racketsport"], items: ["Hantlar", "Löparväst", "Fotboll", "Yogamatta", "Padelracket", "Träningsklocka", "Gummiband", "Gymkort", "Cykelhjälm", "Vattenflaska"], min: 49, max: 15_000 },
  { id: "friluftsliv", label: "Friluftsliv", description: "Camping, vandring, fiske och utflykter.", subcategories: ["Camping", "Vandring", "Fiske", "Cykel", "Vinter"], items: ["Tält", "Ryggsäck", "Fiskespö", "Cykel", "Sovsäck", "Stormkök", "Vandringsjacka", "Pannlampa", "Picknickset", "Pulkor"], min: 79, max: 35_000 },
  { id: "bocker-media", label: "Böcker & media", description: "Romaner, fakta, musik och streaming.", subcategories: ["Romaner", "Fakta", "Barnböcker", "Musik", "Abonnemang"], items: ["Roman", "Kokbok", "Barnbok", "Vinylskiva", "Streamingår", "Ljudboksår", "Seriebok", "Pusselbok", "Fotobok", "Tidningsprenumeration"], min: 19, max: 2_000 },
  { id: "barn-baby", label: "Barn & baby", description: "Barnvagnar, kläder, matning och trygg vardag.", subcategories: ["Baby", "Barnkläder", "Barnrum", "Matning", "Säkerhet"], items: ["Barnvagn", "Babygym", "Barnklädset", "Spjälsäng", "Matstol", "Bärsele", "Bilbarnstol", "Skötväska", "Nattlampa", "Babyvakt"], min: 49, max: 18_000 },
  { id: "leksaker-hobby", label: "Leksaker & hobby", description: "Bygg, pyssel, samlingar och kreativa intressen.", subcategories: ["Bygg", "Pyssel", "Spel", "Modeller", "Samlarkort"], items: ["Byggset", "Pysselkit", "Brädspel", "Modellbil", "Samlarkortspaket", "Radiostyrd bil", "Målarset", "Dockhus", "Trollerilåda", "Musikinstrument"], min: 29, max: 7_500 },
  { id: "husdjur", label: "Husdjur", description: "Mat, leksaker, bäddar och praktiska tillbehör.", subcategories: ["Hund", "Katt", "Smådjur", "Fisk", "Fågel"], items: ["Hundfoder", "Kattklös", "Husdjursbädd", "Akvarium", "Fågelbur", "Koppel", "Transportbur", "Aktiveringsleksak", "Pälsvård", "Vattenskål"], min: 29, max: 12_000 },
  { id: "transport", label: "Transport", description: "Cyklar, mopeder, biltillbehör och pendling.", subcategories: ["Cykel", "Moped", "Bil", "Pendling", "Säkerhet"], items: ["Elcykel", "Moped", "Cykellås", "Takbox", "Bilbarnstol", "Pendlarväska", "Cykelservice", "Dashcam", "Hjälm", "Däckset"], min: 99, max: 85_000 },
  { id: "resor-tjanster", label: "Resor & tjänster", description: "Weekend, hotell, vardagstjänster och små pauser.", subcategories: ["Weekend", "Hotell", "Transport", "Hemservice", "Upplevelser"], items: ["Weekendresa", "Hotellnatt", "Tågbiljett", "Städning", "Biokväll", "Spa-dag", "Restaurangmiddag", "Barnvakt", "Flyttstädning", "Fotografering"], min: 99, max: 25_000 },
];


const categoryNames = {
  luxury: {
    fordon: { en: "Vehicles", es: "Vehículos", zh: "车辆", hi: "वाहन", ar: "المركبات" },
    flyg: { en: "Private aviation", es: "Aviación privada", zh: "私人航空", hi: "निजी विमानन", ar: "الطيران الخاص" },
    batar: { en: "Yachts & boats", es: "Yates y barcos", zh: "游艇与船只", hi: "यॉट और नावें", ar: "اليخوت والقوارب" },
    fastigheter: { en: "Real estate", es: "Propiedades", zh: "房地产", hi: "रियल एस्टेट", ar: "العقارات" },
    klockor: { en: "Watches", es: "Relojes", zh: "腕表", hi: "घड़ियाँ", ar: "الساعات" },
    smycken: { en: "Jewellery", es: "Joyería", zh: "珠宝", hi: "आभूषण", ar: "المجوهرات" },
    mode: { en: "Fashion", es: "Moda", zh: "时尚", hi: "फैशन", ar: "الأزياء" },
    teknik: { en: "Technology", es: "Tecnología", zh: "科技", hi: "तकनीक", ar: "التقنية" },
    konst: { en: "Art", es: "Arte", zh: "艺术", hi: "कला", ar: "الفن" },
    samlarobjekt: { en: "Collectibles", es: "Coleccionables", zh: "收藏品", hi: "संग्रहणीय वस्तुएँ", ar: "المقتنيات" },
    resor: { en: "Travel", es: "Viajes", zh: "旅行", hi: "यात्रा", ar: "السفر" },
    upplevelser: { en: "Experiences", es: "Experiencias", zh: "体验", hi: "अनुभव", ar: "التجارب" },
    sport: { en: "Sport & leisure", es: "Deporte y ocio", zh: "运动与休闲", hi: "खेल और अवकाश", ar: "الرياضة والترفيه" },
    "hem-design": { en: "Home & design", es: "Hogar y diseño", zh: "家居与设计", hi: "घर और डिज़ाइन", ar: "المنزل والتصميم" },
    mat: { en: "Food & gastronomy", es: "Gastronomía", zh: "美食", hi: "भोजन और गैस्ट्रोनॉमी", ar: "الطعام وفنون الطهي" },
    wellness: { en: "Wellness", es: "Bienestar", zh: "健康生活", hi: "वेलनेस", ar: "العافية" },
    familj: { en: "Family & children", es: "Familia y niños", zh: "家庭与儿童", hi: "परिवार और बच्चे", ar: "العائلة والأطفال" },
    husdjur: { en: "Pets", es: "Mascotas", zh: "宠物", hi: "पालतू जानवर", ar: "الحيوانات الأليفة" },
    underhallning: { en: "Music & entertainment", es: "Música y entretenimiento", zh: "音乐与娱乐", hi: "संगीत और मनोरंजन", ar: "الموسيقى والترفيه" },
    service: { en: "Services & memberships", es: "Servicios y membresías", zh: "服务与会员", hi: "सेवाएँ और सदस्यताएँ", ar: "الخدمات والعضويات" },
  },
  everyday: {
    mat: { en: "Food & drink", es: "Comida y bebida", zh: "食品与饮料", hi: "खाना और पेय", ar: "الطعام والشراب" },
    elektronik: { en: "Electronics", es: "Electrónica", zh: "电子产品", hi: "इलेक्ट्रॉनिक्स", ar: "الإلكترونيات" },
    mobil: { en: "Mobile phones", es: "Teléfonos móviles", zh: "手机", hi: "मोबाइल फोन", ar: "الهواتف المحمولة" },
    datorer: { en: "Computers", es: "Ordenadores", zh: "电脑", hi: "कंप्यूटर", ar: "أجهزة الكمبيوتر" },
    gaming: { en: "Gaming", es: "Videojuegos", zh: "游戏", hi: "गेमिंग", ar: "الألعاب" },
    hem: { en: "Home", es: "Hogar", zh: "家居", hi: "घर", ar: "المنزل" },
    mobler: { en: "Furniture", es: "Muebles", zh: "家具", hi: "फर्नीचर", ar: "الأثاث" },
    kok: { en: "Kitchen", es: "Cocina", zh: "厨房", hi: "रसोई", ar: "المطبخ" },
    klader: { en: "Clothing", es: "Ropa", zh: "服装", hi: "कपड़े", ar: "الملابس" },
    skor: { en: "Shoes", es: "Calzado", zh: "鞋履", hi: "जूते", ar: "الأحذية" },
    skonhet: { en: "Beauty & care", es: "Belleza y cuidado", zh: "美容护理", hi: "सौंदर्य और देखभाल", ar: "الجمال والعناية" },
    halsa: { en: "Health", es: "Salud", zh: "健康", hi: "स्वास्थ्य", ar: "الصحة" },
    traning: { en: "Fitness", es: "Entrenamiento", zh: "健身", hi: "फिटनेस", ar: "اللياقة" },
    friluftsliv: { en: "Outdoors", es: "Aire libre", zh: "户外", hi: "आउटडोर", ar: "الأنشطة الخارجية" },
    "bocker-media": { en: "Books & media", es: "Libros y medios", zh: "图书与媒体", hi: "किताबें और मीडिया", ar: "الكتب والوسائط" },
    "barn-baby": { en: "Children & baby", es: "Niños y bebé", zh: "儿童与婴儿", hi: "बच्चे और शिशु", ar: "الأطفال والرضع" },
    "leksaker-hobby": { en: "Toys & hobbies", es: "Juguetes y aficiones", zh: "玩具与爱好", hi: "खिलौने और शौक", ar: "الألعاب والهوايات" },
    husdjur: { en: "Pets", es: "Mascotas", zh: "宠物", hi: "पालतू जानवर", ar: "الحيوانات الأليفة" },
    transport: { en: "Transport", es: "Transporte", zh: "交通", hi: "परिवहन", ar: "النقل" },
    "resor-tjanster": { en: "Travel & services", es: "Viajes y servicios", zh: "旅行与服务", hi: "यात्रा और सेवाएँ", ar: "السفر والخدمات" },
  },
};

const fantasyListings = [
  { mode: "luxury", categoryId: "fastigheter", subcategoryLabel: "Öar", priceSek: 500_000_000, names: { sv: "Privat ö i Bahamas", en: "Private island in the Bahamas", es: "Isla privada en las Bahamas", zh: "巴哈马私人岛屿", hi: "बहामास में निजी द्वीप", ar: "جزيرة خاصة في جزر البهاما" } },
  { mode: "luxury", categoryId: "fastigheter", subcategoryLabel: "Stadsvåningar", priceSek: 750_000_000, names: { sv: "Takvåning i Monaco", en: "Penthouse in Monaco", es: "Ático en Mónaco", zh: "摩纳哥顶层公寓", hi: "मोनाको में पेंटहाउस", ar: "بنتهاوس في موناكو" } },
  { mode: "luxury", categoryId: "fastigheter", subcategoryLabel: "Stadsvåningar", priceSek: 450_000_000, names: { sv: "Townhouse i Mayfair, London", en: "Townhouse in Mayfair, London", es: "Casa urbana en Mayfair, Londres", zh: "伦敦梅费尔联排别墅", hi: "मेफेयर, लंदन में टाउनहाउस", ar: "منزل تاون هاوس في مايفير، لندن" } },
  { mode: "luxury", categoryId: "fastigheter", subcategoryLabel: "Stadsvåningar", priceSek: 900_000_000, names: { sv: "Takvåning vid Central Park, New York", en: "Central Park penthouse in New York", es: "Ático junto a Central Park, Nueva York", zh: "纽约中央公园顶层公寓", hi: "न्यूयॉर्क के सेंट्रल पार्क के पास पेंटहाउस", ar: "بنتهاوس بجوار سنترال بارك في نيويورك" } },
  { mode: "luxury", categoryId: "fastigheter", subcategoryLabel: "Semesterhem", priceSek: 180_000_000, names: { sv: "Klippvilla på Ibiza", en: "Clifftop villa in Ibiza", es: "Villa sobre un acantilado en Ibiza", zh: "伊维萨悬崖别墅", hi: "इबीसा में चट्टान किनारे विला", ar: "فيلا على جرف في إيبيزا" } },
  { mode: "luxury", categoryId: "fastigheter", subcategoryLabel: "Semesterhem", priceSek: 250_000_000, names: { sv: "Skidchalet i Courchevel", en: "Ski chalet in Courchevel", es: "Chalet de esquí en Courchevel", zh: "高雪维尔滑雪木屋", hi: "कुर्शेवेल में स्की शैले", ar: "شاليه تزلج في كورشوفيل" } },
  { mode: "luxury", categoryId: "upplevelser", subcategoryLabel: "Musik", priceSek: 20_000_000, names: { sv: "Privat konsert med en världsstjärna", en: "Private concert with a global star", es: "Concierto privado con una estrella mundial", zh: "世界巨星私人演唱会", hi: "विश्व सितारे के साथ निजी कॉन्सर्ट", ar: "حفل خاص مع نجم عالمي" } },
  { mode: "luxury", categoryId: "upplevelser", subcategoryLabel: "Sport", priceSek: 10_000_000, names: { sv: "Formel 1-säsong för tio personer", en: "Formula 1 season for ten people", es: "Temporada de Fórmula 1 para diez personas", zh: "十人一级方程式赛季体验", hi: "दस लोगों के लिए फॉर्मूला 1 सीज़न", ar: "موسم فورمولا 1 لعشرة أشخاص" } },
  { mode: "luxury", categoryId: "resor", subcategoryLabel: "Jorden runt", priceSek: 5_000_000, names: { sv: "Förstaklassresa jorden runt för tio personer", en: "First-class trip around the world for ten", es: "Vuelta al mundo en primera clase para diez", zh: "十人头等舱环球旅行", hi: "दस लोगों के लिए प्रथम श्रेणी विश्व यात्रा", ar: "رحلة حول العالم بالدرجة الأولى لعشرة أشخاص" } },
];

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function priceBetween(min, max, index) {
  const t = ((index * 9301 + 49297) % 233280) / 233280;
  const curved = Math.pow(t, 2.25);
  const raw = min * Math.pow(max / min, curved);
  const magnitude = raw >= 100_000_000 ? 1_000_000 : raw >= 1_000_000 ? 100_000 : raw >= 100_000 ? 10_000 : raw >= 10_000 ? 1_000 : raw >= 1_000 ? 100 : raw >= 100 ? 10 : 1;
  return Math.max(1, Math.round(raw / magnitude) * magnitude);
}

function getCategory(mode, categoryId) {
  const categories = mode === "luxury" ? luxuryCategories : everydayCategories;
  return categories.find((entry) => entry.id === categoryId);
}


function makeCategoryLocalizations(mode, categoryId, existing = {}) {
  const labels = categoryNames[mode][categoryId] ?? {};
  return Object.fromEntries(["en", "es", "zh", "hi", "ar"].map((language) => [language, { ...(existing[language] ?? {}), categoryLabel: labels[language] } ]));
}

function makeRealProduct(entry, mode, index) {
  const category = getCategory(mode, entry.categoryId);
  const collectible = entry.collectible ? {
    franchise: entry.collectible[0], set: entry.collectible[1], year: entry.collectible[2], cardNumber: entry.collectible[3],
    language: entry.collectible[4], gradingCompany: entry.collectible[5], grade: entry.collectible[6],
  } : undefined;
  return {
    id: `${mode === "luxury" ? "lux" : "everyday"}-${String(index + 1).padStart(6, "0")}`,
    mode,
    slug: slugify(entry.name),
    name: entry.name,
    brand: entry.brand,
    categoryId: entry.categoryId,
    categoryLabel: category?.label ?? entry.categoryId,
    subcategoryId: slugify(entry.subcategoryLabel),
    subcategoryLabel: entry.subcategoryLabel,
    priceSek: entry.priceSek,
    shortDescription: collectible ? `${collectible.franchise}-kort graderat ${collectible.gradingCompany} ${collectible.grade}.` : "En verklig och igenkännbar produkt med ett ungefärligt spelpris.",
    description: `${entry.name} är en verklig produkt eller modell som lagts in med ett avrundat underhållningspris. Pris, tillgänglighet och konfiguration kan variera mellan marknader och över tid.`,
    facts: [
      `Kategori: ${category?.label ?? entry.categoryId}`,
      `Prisnivå: cirka ${entry.priceSek.toLocaleString("sv-SE")} kr`,
      entry.priceType === "market-estimate" ? "Prisgrund: uppskattat marknadsvärde." : "Prisgrund: ungefärligt konsument- eller listpris.",
    ],
    tags: [entry.name, entry.brand ?? "", category?.label ?? "", entry.subcategoryLabel].filter(Boolean).map((value) => String(value).toLowerCase()),
    featured: index < 80,
    collectible,
    nameKind: "official",
    localizations: makeCategoryLocalizations(mode, entry.categoryId),
    dataQuality: "verified",
    priceType: entry.priceType ?? "official-retail",
    priceCheckedAt: "2026-07-02",
    sourceUrls: entry.sourceUrl ? [entry.sourceUrl] : [],
  };
}

function makeFantasyListing(entry, index) {
  const category = getCategory(entry.mode, entry.categoryId);
  return {
    id: `${entry.mode === "luxury" ? "lux" : "everyday"}-${String(index + 1).padStart(6, "0")}`,
    mode: entry.mode,
    slug: slugify(entry.names.sv),
    name: entry.names.sv,
    categoryId: entry.categoryId,
    categoryLabel: category?.label ?? entry.categoryId,
    subcategoryId: slugify(entry.subcategoryLabel),
    subcategoryLabel: entry.subcategoryLabel,
    priceSek: entry.priceSek,
    shortDescription: "Ett tydligt märkt fantasierbjudande med uppskattat spelpris.",
    description: "Detta är ett fantasierbjudande och inte en verklig annons. Pris och innehåll används bara för underhållning.",
    facts: [`Kategori: ${category?.label ?? entry.categoryId}`, "Typ: fantasierbjudande", `Spelpris: cirka ${entry.priceSek.toLocaleString("sv-SE")} kr`],
    tags: [entry.names.sv, category?.label ?? "", entry.subcategoryLabel].map((value) => value.toLowerCase()),
    featured: true,
    nameKind: "translatable",
    localizations: makeCategoryLocalizations(entry.mode, entry.categoryId, Object.fromEntries(Object.entries(entry.names).filter(([language]) => language !== "sv").map(([language, name]) => [language, { name }]))),
    dataQuality: "curated",
    priceType: "fantasy-estimate",
    priceCheckedAt: "2026-07-02",
    sourceUrls: [],
  };
}

function makeGeneratedProduct({ mode, category, index, globalIndex }) {
  const series = String(index + 1).padStart(3, "0");
  const translations = categoryNames[mode][category.id] ?? {};
  const names = {
    sv: `${category.label} · fantasival ${series}`,
    en: `${translations.en ?? category.label} · fantasy pick ${series}`,
    es: `${translations.es ?? category.label} · opción de fantasía ${series}`,
    zh: `${translations.zh ?? category.label} · 梦想之选 ${series}`,
    hi: `${translations.hi ?? category.label} · फैंटेसी चयन ${series}`,
    ar: `${translations.ar ?? category.label} · اختيار خيالي ${series}`,
  };
  const subcategory = category.subcategories[index % category.subcategories.length];
  const priceSek = priceBetween(category.min, category.max, globalIndex + 1);
  return {
    id: `${mode === "luxury" ? "lux" : "everyday"}-${String(globalIndex + 1).padStart(6, "0")}`,
    mode,
    slug: slugify(names.sv),
    name: names.sv,
    categoryId: category.id,
    categoryLabel: category.label,
    subcategoryId: slugify(subcategory),
    subcategoryLabel: subcategory,
    priceSek,
    shortDescription: "Ett generiskt fantasival som fyller ut katalogen tills fler riktiga produkter har kvalitetssäkrats.",
    description: "Detta katalogobjekt är genererat för spelvariation och föreställer inte en specifik officiell produkt. Pris och detaljer används endast för underhållning.",
    facts: [`Kategori: ${category.label}`, `Underkategori: ${subcategory}`, "Datastatus: genererat fantasival"],
    tags: [category.label, subcategory, "fantasival", series].map((value) => value.toLowerCase()),
    featured: false,
    nameKind: "translatable",
    localizations: makeCategoryLocalizations(mode, category.id, Object.fromEntries(Object.entries(names).filter(([language]) => language !== "sv").map(([language, name]) => [language, { name }]))),
    dataQuality: "generated",
    priceType: "fantasy-estimate",
    priceCheckedAt: "2026-07-02",
    sourceUrls: [],
  };
}

function localizeCategories(mode, categories) {
  return categories.map(({ id, label, description, subcategories }) => ({
    id,
    label,
    description,
    localizedLabels: categoryNames[mode][id] ?? {},
    subcategories: subcategories.map((subcategory) => ({ id: slugify(subcategory), label: subcategory })),
  }));
}

function generateCatalog(mode, categories, realSeeds) {
  const products = realSeeds.map((entry, index) => makeRealProduct(entry, mode, index));
  let globalIndex = products.length;
  fantasyListings.filter((entry) => entry.mode === mode).forEach((entry) => {
    products.push(makeFantasyListing(entry, globalIndex));
    globalIndex += 1;
  });

  const targetPerCategory = PRODUCTS_PER_CATEGORY;
  for (const category of categories) {
    const existing = products.filter((product) => product.categoryId === category.id).length;
    const needed = Math.max(0, targetPerCategory - existing);
    for (let index = 0; index < needed; index += 1) {
      products.push(makeGeneratedProduct({ mode, category, index, globalIndex }));
      globalIndex += 1;
    }
  }

  if (products.length !== PRODUCTS_PER_MODE) {
    throw new Error(`${mode}: expected ${PRODUCTS_PER_MODE} products, got ${products.length}`);
  }
  const qualityStats = products.reduce((stats, product) => {
    stats[product.dataQuality] += 1;
    return stats;
  }, { verified: 0, curated: 0, generated: 0 });

  return {
    version: 2,
    mode,
    generatedAt: "2026-07-02",
    productCount: products.length,
    qualityStats,
    categories: localizeCategories(mode, categories),
    products,
  };
}

await mkdir(OUT_DIR, { recursive: true });
const luxuryCatalog = generateCatalog("luxury", luxuryCategories, luxuryRealProducts);
const everydayCatalog = generateCatalog("everyday", everydayCategories, everydayRealProducts);

await writeFile(path.join(OUT_DIR, "catalog-luxury.json"), JSON.stringify(luxuryCatalog));
await writeFile(path.join(OUT_DIR, "catalog-everyday.json"), JSON.stringify(everydayCatalog));
await writeFile(path.join(OUT_DIR, "catalog-report.json"), JSON.stringify({
  version: 1,
  generatedAt: "2026-07-02",
  modes: {
    luxury: luxuryCatalog.qualityStats,
    everyday: everydayCatalog.qualityStats,
  },
}, null, 2));

async function writeIfMissing(filename, value) {
  try { await access(filename); }
  catch { await writeFile(filename, JSON.stringify(value, null, 2)); }
}

await writeIfMissing(path.join(OUT_DIR, "image-manifest.json"), { version: 2, generatedAt: "2026-07-02", images: [] });
await writeIfMissing(path.join(OUT_DIR, "image-review.json"), { version: 2, generatedAt: "2026-07-02", items: [] });

console.log(`Generated ${luxuryCatalog.productCount} luxury (${luxuryCatalog.qualityStats.verified} verified) and ${everydayCatalog.productCount} everyday (${everydayCatalog.qualityStats.verified} verified) products.`);
