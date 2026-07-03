export type WealthProfile = {
  id: string;
  name: string;
  profession: string;
  netWorthUsd: number;
  initials: string;
  tier: "titan" | "icon" | "star";
};

// Rounded entertainment estimates. Fortunes fluctuate and are not financial data.
export const wealthProfiles: WealthProfile[] = [
  { id: "elon-musk", name: "Elon Musk", profession: "Tech & rymd", netWorthUsd: 1_100_000_000_000, initials: "EM", tier: "titan" },
  { id: "jeff-bezos", name: "Jeff Bezos", profession: "Amazon", netWorthUsd: 248_700_000_000, initials: "JB", tier: "titan" },
  { id: "mark-zuckerberg", name: "Mark Zuckerberg", profession: "Meta", netWorthUsd: 193_500_000_000, initials: "MZ", tier: "titan" },
  { id: "warren-buffett", name: "Warren Buffett", profession: "Investeringar", netWorthUsd: 147_800_000_000, initials: "WB", tier: "titan" },
  { id: "bill-gates", name: "Bill Gates", profession: "Microsoft & filantropi", netWorthUsd: 105_800_000_000, initials: "BG", tier: "titan" },
  { id: "steven-spielberg", name: "Steven Spielberg", profession: "Filmregissör", netWorthUsd: 7_100_000_000, initials: "SS", tier: "icon" },
  { id: "george-lucas", name: "George Lucas", profession: "Filmskapare", netWorthUsd: 5_300_000_000, initials: "GL", tier: "icon" },
  { id: "michael-jordan", name: "Michael Jordan", profession: "Basketikon", netWorthUsd: 4_300_000_000, initials: "MJ", tier: "icon" },
  { id: "oprah-winfrey", name: "Oprah Winfrey", profession: "Media & entreprenörskap", netWorthUsd: 3_400_000_000, initials: "OW", tier: "icon" },
  { id: "jay-z", name: "Jay-Z", profession: "Musik & affärer", netWorthUsd: 2_500_000_000, initials: "JZ", tier: "icon" },
  { id: "taylor-swift", name: "Taylor Swift", profession: "Musikartist", netWorthUsd: 2_100_000_000, initials: "TS", tier: "icon" },
  { id: "kim-kardashian", name: "Kim Kardashian", profession: "Media & mode", netWorthUsd: 1_700_000_000, initials: "KK", tier: "icon" },
  { id: "cristiano-ronaldo", name: "Cristiano Ronaldo", profession: "Fotbollsspelare", netWorthUsd: 1_400_000_000, initials: "CR", tier: "icon" },
  { id: "lebron-james", name: "LeBron James", profession: "Basketspelare", netWorthUsd: 1_300_000_000, initials: "LJ", tier: "icon" },
  { id: "rihanna", name: "Rihanna", profession: "Musik & skönhet", netWorthUsd: 1_000_000_000, initials: "RF", tier: "icon" },
  { id: "lionel-messi", name: "Lionel Messi", profession: "Fotbollsspelare", netWorthUsd: 850_000_000, initials: "LM", tier: "star" },
  { id: "ryan-reynolds", name: "Ryan Reynolds", profession: "Skådespelare & entreprenör", netWorthUsd: 350_000_000, initials: "RR", tier: "star" },
  { id: "zlatan-ibrahimovic", name: "Zlatan Ibrahimović", profession: "Fotbollsikon", netWorthUsd: 190_000_000, initials: "ZI", tier: "star" },
  { id: "ryan-gosling", name: "Ryan Gosling", profession: "Skådespelare", netWorthUsd: 70_000_000, initials: "RG", tier: "star" },
  { id: "pewdiepie", name: "PewDiePie", profession: "Kreatör", netWorthUsd: 45_000_000, initials: "PP", tier: "star" },
];

export const wealthProfileById = new Map(wealthProfiles.map((profile) => [profile.id, profile]));
