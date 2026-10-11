/**
 * Maps backend team names → logo filenames in /public/.
 * Supports Premier League (EPL), La Liga, and UEFA Champions League (UCL) teams.
 * Includes accent-insensitive and substring fallback.
 */

const TEAM_LOGOS: Record<string, string> = {
  // --- Premier League ---
  "Arsenal": "/arsenal.png",
  "Aston Villa": "/aston_villa.png",
  "Bournemouth": "/bournemouth.png",
  "Brentford": "/brentford.png",
  "Brighton": "/brighton.png",
  "Burnley": "/burnley.png",
  "Chelsea": "/chelsea.png",
  "Coventry City": "/coventry_city.png",
  "Crystal Palace": "/crystal_palace.png",
  "Everton": "/everton.png",
  "Fulham": "/fulham.png",
  "Hull City": "/hull_city.png",
  "Ipswich Town": "/ipswich_town.png",
  "Leeds": "/leeds.png",
  "Leeds United": "/leeds.png",
  "Liverpool": "/liverpool.png",
  "Man City": "/manchester_city.png",
  "Man Utd": "/manchester_united.png",
  "Manchester City": "/manchester_city.png",
  "Manchester United": "/manchester_united.png",
  "Newcastle": "/newcastle_united.png",
  "Newcastle United": "/newcastle_united.png",
  "Nott'm Forest": "/nottingham_forest.png",
  "Nottingham Forest": "/nottingham_forest.png",
  "Spurs": "/tottenham_spurs.png",
  "Tottenham": "/tottenham_spurs.png",
  "Tottenham Hotspur": "/tottenham_spurs.png",
  "Sunderland": "/sunderland.png",
  "West Ham": "/west_ham.png",
  "Wolves": "/wolves.png",
  "Wolverhampton Wanderers": "/wolves.png",

  // --- La Liga ---
  "Alavés": "/alaves.png",
  "Alaves": "/alaves.png",
  "Deportivo Alavés": "/alaves.png",
  "Athletic Club": "/athletic_club.png",
  "Athletic Bilbao": "/athletic_club.png",
  "Atlético Madrid": "/atletico_madrid.png",
  "Atletico Madrid": "/atletico_madrid.png",
  "Atletico de Madrid": "/atletico_madrid.png",
  "Barcelona": "/barcelona.png",
  "FC Barcelona": "/barcelona.png",
  "Celta Vigo": "/celta_vigo.png",
  "Celta de Vigo": "/celta_vigo.png",
  "Deportivo": "/deportivo.png",
  "Deportivo La Coruña": "/deportivo.png",
  "Deportivo La Coruna": "/deportivo.png",
  "Elche": "/elche.png",
  "Elche CF": "/elche.png",
  "Espanyol": "/espanyol.png",
  "RCD Espanyol": "/espanyol.png",
  "Getafe": "/getafe.png",
  "Getafe CF": "/getafe.png",
  "Girona": "/girona.png",
  "Granada": "/granada.png",
  "Granada CF": "/granada.png",
  "Levante": "/levante.png",
  "Levante UD": "/levante.png",
  "Málaga": "/malaga.png",
  "Malaga": "/malaga.png",
  "Málaga CF": "/malaga.png",
  "Mallorca": "/mallorca.png",
  "RCD Mallorca": "/mallorca.png",
  "Osasuna": "/osasuna.png",
  "CA Osasuna": "/osasuna.png",
  "Racing Santander": "/racing_santander.png",
  "Real Racing Club": "/racing_santander.png",
  "Rayo Vallecano": "/rayo_vallecano.png",
  "Real Betis": "/real_betis.png",
  "Real Madrid": "/real_madrid.png",
  "Real Oviedo": "/real_oviedo.png",
  "Real Sociedad": "/real_sociedad.png",
  "Real Valladolid": "/valladolid.png",
  "Valladolid": "/valladolid.png",
  "Sevilla": "/sevilla.png",
  "Sevilla FC": "/sevilla.png",
  "Valencia": "/valencia.png",
  "Valencia CF": "/valencia.png",
  "Villarreal": "/villarreal.png",
  "Villarreal CF": "/villarreal.png",

  // --- UEFA Champions League (Europe) ---
  // Germany
  "Bayern Munich": "/bayern_munich.png",
  "FC Bayern München": "/bayern_munich.png",
  "Borussia Dortmund": "/borussia_dortmund.png",
  "Bayer Leverkusen": "/bayer_leverkusen.png",
  "RB Leipzig": "/rb_leipzig.png",
  "Stuttgart": "/stuttgart.png",
  "VfB Stuttgart": "/stuttgart.png",

  // Italy
  "Inter": "/inter_milan.png",
  "Inter Milan": "/inter_milan.png",
  "AC Milan": "/ac_milan.png",
  "Juventus": "/juventus.png",
  "Atalanta": "/atalanta.png",
  "Bologna": "/bologna.png",
  "Napoli": "/napoli.png",
  "Roma": "/roma.png",
  "AS Roma": "/roma.png",
  "Lazio": "/lazio.png",
  "Lazio Roma": "/lazio.png",

  // France
  "Paris SG": "/paris_sg.png",
  "Paris Saint-Germain": "/paris_sg.png",
  "PSG": "/paris_sg.png",
  "Monaco": "/monaco.png",
  "AS Monaco": "/monaco.png",
  "Lille": "/lille.png",
  "Stade Brestois": "/brest.png",
  "Brest": "/brest.png",
  "Olympique Marseille": "/marseille.png",
  "Marseille": "/marseille.png",

  // Portugal
  "Sporting CP": "/sporting_cp.png",
  "Benfica": "/benfica.png",
  "Porto": "/porto.png",
  "FC Porto": "/porto.png",

  // Netherlands
  "Feyenoord": "/feyenoord.png",
  "PSV": "/psv.png",
  "PSV Eindhoven": "/psv.png",
  "Ajax": "/ajax.png",

  // Scotland
  "Celtic": "/celtic.png",
  "Rangers": "/rangers.png",

  // Belgium
  "Club Brugge": "/club_brugge.png",
  "Anderlecht": "/anderlecht.png",

  // Austria
  "Sturm Graz": "/sturm_graz.png",
  "SK Sturm Graz": "/sturm_graz.png",
  "Salzburg": "/salzburg.png",
  "Red Bull Salzburg": "/salzburg.png",

  // Switzerland
  "Young Boys": "/young_boys.png",
  "BSC Young Boys": "/young_boys.png",

  // Czech Republic
  "Sparta Prague": "/sparta_prague.png",
  "Sparta Praha": "/sparta_prague.png",
  "Slavia Praha": "/slavia_prague.png",
  "Slavia Prague": "/slavia_prague.png",

  // Croatia & Serbia
  "Dinamo Zagreb": "/dinamo_zagreb.png",
  "Red Star Belgrade": "/red_star_belgrade.png",

  // Slovakia & Ukraine
  "Slovan Bratislava": "/slovan_bratislava.png",
  "Shakhtar Donetsk": "/shakhtar_donetsk.png",

  // Turkey
  "Galatasaray": "/galatasaray.png",
  "Fenerbahce": "/fenerbahce.png",
  "Fenerbahçe": "/fenerbahce.png",
  "Besiktas": "/besiktas.png",
  "Beşiktaş": "/besiktas.png",

  // Norway
  "Bodø/Glimt": "/bodo_glimt.png",
  "Bodo/Glimt": "/bodo_glimt.png",
  "Bodo Glimt": "/bodo_glimt.png",
  "Bodø Glimt": "/bodo_glimt.png",
  "Molde FK": "/molde.png",
  "Molde": "/molde.png",
  "Rosenborg BK": "/rosenborg.png",
  "Rosenborg": "/rosenborg.png",
};

export function getTeamLogo(teamName: string): string | undefined {
  if (!teamName) return undefined;
  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];

  // Case & Accent-insensitive fallback matching
  const normalized = teamName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  for (const [key, path] of Object.entries(TEAM_LOGOS)) {
    const keyNormalized = key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (keyNormalized === normalized) {
      return path;
    }
  }

  // Substring fallback
  for (const [key, path] of Object.entries(TEAM_LOGOS)) {
    const keyNormalized = key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (normalized.includes(keyNormalized) || keyNormalized.includes(normalized)) {
      return path;
    }
  }

  return undefined;
}
