export interface DomesticLeagueOption {
  label: string;
  value: string;
  flag?: string;
  hasLimitedData?: boolean;
}

export const DOMESTIC_LEAGUES: DomesticLeagueOption[] = [
  { label: "England", value: "england", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { label: "Spain", value: "spain", flag: "🇪🇸" },
  { label: "Italy", value: "italy", flag: "🇮🇹" },
  { label: "Germany", value: "germany", flag: "🇩🇪" },
  { label: "France", value: "france", flag: "🇫🇷" },
  { label: "Netherlands", value: "netherlands", flag: "🇳🇱" },
  { label: "Portugal", value: "portugal", flag: "🇵🇹" },
  { label: "Norway", value: "norway", flag: "🇳🇴" },
  { label: "Turkey", value: "turkey", flag: "🇹🇷" },
  { label: "Belgium", value: "belgium", flag: "🇧🇪" },
  { label: "Czech Republic", value: "czech-republic", flag: "🇨🇿", hasLimitedData: true },
  { label: "Ukraine", value: "ukraine", flag: "🇺🇦", hasLimitedData: true },
  { label: "Austria", value: "austria", flag: "🇦🇹" },
  { label: "Greece", value: "greece", flag: "🇬🇷" },
  { label: "Slovakia", value: "slovakia", flag: "🇸🇰", hasLimitedData: true },
  { label: "Azerbaijan", value: "azerbaijan", flag: "🇦🇿", hasLimitedData: true },
];

export type DomesticLeague = (typeof DOMESTIC_LEAGUES)[number]["value"];

/**
 * 2024/2025 UEFA Champions League 36 league-phase clubs.
 * These are pinned at the top of the selector for quick and intuitive selection.
 */
export const UCL_CURRENT_SEASON_TEAMS = [
  "Real Madrid",
  "Manchester City",
  "Bayern Munich",
  "Arsenal",
  "Barcelona",
  "Liverpool",
  "Paris SG",
  "Inter",
  "Borussia Dortmund",
  "Bayer Leverkusen",
  "Atletico Madrid",
  "Atalanta",
  "Juventus",
  "AC Milan",
  "Sporting CP",
  "Benfica",
  "RB Leipzig",
  "Aston Villa",
  "Monaco",
  "Lille",
  "Feyenoord",
  "PSV",
  "Stuttgart",
  "Stade Brestois",
  "Celtic",
  "Bologna",
  "Girona",
  "Club Brugge",
  "Sparta Prague",
  "Dinamo Zagreb",
  "Salzburg",
  "Young Boys",
  "Red Star Belgrade",
  "Sturm Graz",
  "Slovan Bratislava",
  "Shakhtar Donetsk",
  "Bodø/Glimt", // Mapped via proxy model team
] as const;

/**
 * Proxy mapping for teams this season that are missing from the model's training dataset.
 * For example, Bodø/Glimt can use a generic/historic Norwegian club (e.g. Rosenborg BK).
 */
export const UCL_PROXY_TEAMS: Record<string, { modelTeam: string; league: DomesticLeague; note: string }> = {
  "Bodø/Glimt": {
    modelTeam: "Rosenborg BK",
    league: "norway",
    note: "Bodø/Glimt (simulated via Rosenborg BK)",
  },
  "Bodo/Glimt": {
    modelTeam: "Rosenborg BK",
    league: "norway",
    note: "Bodø/Glimt (simulated via Rosenborg BK)",
  },
};

export function resolveModelTeam(displayTeam: string): { modelTeam: string; league?: DomesticLeague } {
  if (UCL_PROXY_TEAMS[displayTeam]) {
    return {
      modelTeam: UCL_PROXY_TEAMS[displayTeam].modelTeam,
      league: UCL_PROXY_TEAMS[displayTeam].league,
    };
  }
  return { modelTeam: displayTeam };
}

// Known club-to-domestic-league mapping for UCL clubs
const CLUB_DOMESTIC_MAP: Record<string, DomesticLeague> = {
  // Spain
  "real madrid": "spain",
  "barcelona": "spain",
  "atletico madrid": "spain",
  "atlético madrid": "spain",
  "athletic bilbao": "spain",
  "athletic club": "spain",
  "real sociedad": "spain",
  "girona": "spain",
  "sevilla": "spain",
  "villarreal": "spain",
  "real betis": "spain",
  "celta vigo": "spain",
  "osasuna": "spain",
  "rcd mallorca": "spain",
  "valencia": "spain",
  "malaga cf": "spain",
  "deportivo la coruna": "spain",
  "espanyol": "spain",
  "alaves": "spain",
  "getafe": "spain",
  "rayo vallecano": "spain",

  // England
  "manchester city": "england",
  "man city": "england",
  "arsenal": "england",
  "liverpool": "england",
  "aston villa": "england",
  "chelsea": "england",
  "manchester united": "england",
  "man utd": "england",
  "newcastle": "england",
  "newcastle united": "england",
  "tottenham": "england",
  "tottenham hotspur": "england",
  "everton": "england",
  "leicester city": "england",
  "leeds united": "england",
  "nottingham forest": "england",
  "west ham": "england",
  "wolves": "england",
  "celtic": "england", // Fallback to nearest major UK domestic league
  "rangers": "england",

  // Germany
  "bayern munich": "germany",
  "borussia dortmund": "germany",
  "bayer leverkusen": "germany",
  "rb leipzig": "germany",
  "eintracht frankfurt": "germany",
  "frankfurt": "germany",
  "vfb stuttgart": "germany",
  "stuttgart": "germany",
  "werder bremen": "germany",
  "wolfsburg": "germany",
  "1. fc union berlin": "germany",
  "1899 hoffenheim": "germany",
  "schalke 04": "germany",
  "fc schalke 04": "germany",
  "bor. mönchengladbach": "germany",
  "borussia monchengladbach": "germany",
  "hamburger sv": "germany",
  "hertha bsc": "germany",
  "kaiserslautern": "germany",
  "koln": "germany",
  "young boys": "germany", // Fallback for Switzerland

  // Italy
  "inter": "italy",
  "inter milan": "italy",
  "ac milan": "italy",
  "juventus": "italy",
  "atalanta": "italy",
  "napoli": "italy",
  "roma": "italy",
  "lazio": "italy",
  "lazio roma": "italy",
  "bologna": "italy",
  "acf fiorentina": "italy",
  "torino": "italy",
  "udinese": "italy",
  "sampdoria": "italy",
  "parma": "italy",
  "hellas verona": "italy",
  "cagliari calcio": "italy",

  // France
  "paris sg": "france",
  "psg": "france",
  "monaco": "france",
  "lille": "france",
  "stade brestois": "france",
  "brest": "france",
  "olympique marseille": "france",
  "marseille": "france",
  "olympique lyon": "france",
  "lyon": "france",
  "stade rennais": "france",
  "rc lens": "france",
  "racing club de lens": "france",
  "rc strasbourg": "france",
  "nice": "france",
  "nantes": "france",
  "montpellier hsc": "france",
  "toulouse": "france",
  "girondins bordeaux": "france",

  // Netherlands
  "psv": "netherlands",
  "feyenoord": "netherlands",
  "ajax": "netherlands",
  "az alkmaar": "netherlands",
  "twente": "netherlands",
  "willem ii": "netherlands",
  "sc heerenveen": "netherlands",

  // Portugal
  "sporting cp": "portugal",
  "benfica": "portugal",
  "porto": "portugal",
  "sporting braga": "portugal",
  "sporting clube de braga": "portugal",
  "vitoria guimaraes": "portugal",
  "boavista": "portugal",

  // Turkey
  "galatasaray": "turkey",
  "fenerbahce": "turkey",
  "besiktas": "turkey",
  "beşiktaş": "turkey",
  "trabzonspor": "turkey",
  "istanbul basaksehir": "turkey",
  "i̇stanbul başakşehir": "turkey",
  "sivasspor": "turkey",
  "bursaspor": "turkey",

  // Belgium
  "club brugge": "belgium",
  "anderlecht": "belgium",
  "genk": "belgium",
  "gent": "belgium",
  "royal antwerp fc": "belgium",
  "union saint-gilloise": "belgium",
  "standard liege": "belgium",

  // Austria
  "salzburg": "austria",
  "sturm graz": "austria",
  "sk sturm graz": "austria",
  "austria wien": "austria",
  "rapid wien": "austria",
  "grazer ak": "austria",
  "fc tirol": "austria",

  // Czech Republic
  "sparta prague": "czech-republic",
  "sparta praha": "czech-republic",
  "slavia praha": "czech-republic",
  "viktoria plzen": "czech-republic",
  "viktoria plzeň": "czech-republic",
  "slovan liberec": "czech-republic",
  "banik ostrava": "czech-republic",
  "mlada boleslav": "czech-republic",

  // Ukraine
  "shakhtar donetsk": "ukraine",
  "dinamo kiev": "ukraine",
  "dynamo kiev": "ukraine",
  "dnepr dnepropetrovsk": "ukraine",
  "metalist kharkiv": "ukraine",

  // Slovakia
  "slovan bratislava": "slovakia",
  "msk zilina": "slovakia",
  "as trencin": "slovakia",
  "spartak taz trnava": "slovakia",
  "petrzalka akademia": "slovakia",

  // Azerbaijan
  "qarabag fk": "azerbaijan",
  "qarabağ fk": "azerbaijan",
  "neftchi pfc baku": "azerbaijan",
  "inter baku pik": "azerbaijan",
  "baku": "azerbaijan",

  // Greece
  "olympiacos": "greece",
  "olympiakos piraeus": "greece",
  "paok": "greece",
  "panathinaikos": "greece",
  "aek athens": "greece",
  "aek athen": "greece",

  // Norway
  "bodø/glimt": "norway",
  "bodo/glimt": "norway",
  "bodo glimt": "norway",
  "molde fk": "norway",
  "rosenborg bk": "norway",
  "brann": "norway",
  "viking fk": "norway",
  "lillestrom": "norway",
  "valerenga if": "norway",

  // Balkans
  "dinamo zagreb": "italy", // Closest regional league
  "red star belgrade": "greece",
};

export function getDefaultDomesticLeague(teamName: string, fallback: DomesticLeague = "spain"): DomesticLeague {
  if (!teamName) return fallback;
  const normalized = teamName.trim().toLowerCase();
  if (CLUB_DOMESTIC_MAP[normalized]) {
    return CLUB_DOMESTIC_MAP[normalized];
  }

  // Substring matching fallback
  for (const [club, league] of Object.entries(CLUB_DOMESTIC_MAP)) {
    if (normalized.includes(club) || club.includes(normalized)) {
      return league;
    }
  }

  return fallback;
}

export function isFallbackExpectedLeague(league: string): boolean {
  return ["czech-republic", "ukraine", "slovakia", "azerbaijan"].includes(league);
}
