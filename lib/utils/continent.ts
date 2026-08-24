export const CONTINENTS = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
] as const;

export type ContinentType = (typeof CONTINENTS)[number];

const COUNTRY_CONTINENT_MAP: Record<string, string> = {
  // Asia
  "india": "Asia",
  "china": "Asia",
  "japan": "Asia",
  "vietnam": "Asia",
  "south korea": "Asia",
  "korea": "Asia",
  "thailand": "Asia",
  "indonesia": "Asia",
  "taiwan": "Asia",
  "malaysia": "Asia",
  "singapore": "Asia",
  "pakistan": "Asia",
  "bangladesh": "Asia",
  "turkey": "Asia",
  "saudi arabia": "Asia",
  "uae": "Asia",
  "united arab emirates": "Asia",
  "philippines": "Asia",
  "sri lanka": "Asia",

  // Europe
  "germany": "Europe",
  "italy": "Europe",
  "france": "Europe",
  "spain": "Europe",
  "united kingdom": "Europe",
  "uk": "Europe",
  "england": "Europe",
  "netherlands": "Europe",
  "switzerland": "Europe",
  "belgium": "Europe",
  "poland": "Europe",
  "sweden": "Europe",
  "austria": "Europe",
  "portugal": "Europe",
  "czech republic": "Europe",
  "turkiye": "Europe",
  "greece": "Europe",

  // North America
  "usa": "North America",
  "united states": "North America",
  "canada": "North America",
  "mexico": "North America",

  // South America
  "brazil": "South America",
  "argentina": "South America",
  "colombia": "South America",
  "chile": "South America",
  "peru": "South America",

  // Africa
  "egypt": "Africa",
  "south africa": "Africa",
  "nigeria": "Africa",
  "kenya": "Africa",
  "morocco": "Africa",
  "tunisia": "Africa",

  // Oceania
  "australia": "Oceania",
  "new zealand": "Oceania",
};

export function getContinentFromCountry(country?: string): string | undefined {
  if (!country) return undefined;
  const normalized = country.trim().toLowerCase();
  return COUNTRY_CONTINENT_MAP[normalized];
}

export function getCountriesForContinent(continent?: string): string[] {
  if (!continent) return [];
  const normalized = continent.trim().toLowerCase();
  return Object.entries(COUNTRY_CONTINENT_MAP)
    .filter(([_, cont]) => cont.toLowerCase() === normalized)
    .map(([country]) => country);
}
