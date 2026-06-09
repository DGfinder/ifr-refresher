import type { AirspaceClass } from "@/content/model/radio";

/**
 * One Australian aerodrome (or piece of airspace) used by the radio drill
 * generator to realise call templates. Tower/ground/delivery/approach/centre
 * fields are present for controlled aerodromes; `ctaf` is set for
 * non-towered fields.
 *
 * `runway` is the spoken form of the primary runway used in templates
 * (e.g. "two nine right" for 29R). It's pronounced the way pilots say it
 * so the matcher sees the same tokens.
 *
 * `spellings` carry common short callsigns the matcher should also accept —
 * Australian convention abbreviates after the first call.
 */
export interface RadioLocation {
  icao: string;
  city: string;
  airspaceClass: AirspaceClass;
  /** Full ATC unit names, where they exist. */
  tower?: string;
  ground?: string;
  delivery?: string;
  approach?: string;
  departure?: string;
  centre?: string;
  /** CTAF broadcast prefix, e.g. "Mudgee traffic". */
  ctaf?: string;
  /** Primary runway in spoken form, e.g. "two nine right". */
  runway: string;
  /** Numeric form of the runway (e.g. "29R") for `expectedText` exemplars. */
  runwayNumeric: string;
  /** Common short name accepted by matcher (e.g. "Sydney" for Sydney Tower). */
  shortName: string;
}

export const radioLocations: RadioLocation[] = [
  // ── Class C major (capital city primary aerodromes) ─────────────────────
  {
    icao: "YSSY",
    city: "Sydney",
    airspaceClass: "C",
    tower: "Sydney Tower",
    ground: "Sydney Ground",
    delivery: "Sydney Delivery",
    approach: "Sydney Approach",
    departure: "Sydney Departures",
    centre: "Sydney Centre",
    runway: "one six right",
    runwayNumeric: "16R",
    shortName: "Sydney",
  },
  {
    icao: "YBBN",
    city: "Brisbane",
    airspaceClass: "C",
    tower: "Brisbane Tower",
    ground: "Brisbane Ground",
    delivery: "Brisbane Delivery",
    approach: "Brisbane Approach",
    departure: "Brisbane Departures",
    centre: "Brisbane Centre",
    runway: "zero one left",
    runwayNumeric: "01L",
    shortName: "Brisbane",
  },
  {
    icao: "YMML",
    city: "Melbourne",
    airspaceClass: "C",
    tower: "Melbourne Tower",
    ground: "Melbourne Ground",
    delivery: "Melbourne Delivery",
    approach: "Melbourne Approach",
    departure: "Melbourne Departures",
    centre: "Melbourne Centre",
    runway: "three four",
    runwayNumeric: "34",
    shortName: "Melbourne",
  },
  {
    icao: "YPPH",
    city: "Perth",
    airspaceClass: "C",
    tower: "Perth Tower",
    ground: "Perth Ground",
    delivery: "Perth Delivery",
    approach: "Perth Approach",
    departure: "Perth Departures",
    centre: "Melbourne Centre",
    runway: "zero three",
    runwayNumeric: "03",
    shortName: "Perth",
  },
  {
    icao: "YPAD",
    city: "Adelaide",
    airspaceClass: "C",
    tower: "Adelaide Tower",
    ground: "Adelaide Ground",
    delivery: "Adelaide Delivery",
    approach: "Adelaide Approach",
    departure: "Adelaide Departures",
    centre: "Melbourne Centre",
    runway: "two three",
    runwayNumeric: "23",
    shortName: "Adelaide",
  },
  // ── Class D regional (towered) ──────────────────────────────────────────
  {
    icao: "YSCB",
    city: "Canberra",
    airspaceClass: "D",
    tower: "Canberra Tower",
    ground: "Canberra Ground",
    approach: "Canberra Approach",
    centre: "Melbourne Centre",
    runway: "three five",
    runwayNumeric: "35",
    shortName: "Canberra",
  },
  {
    icao: "YBCS",
    city: "Cairns",
    airspaceClass: "D",
    tower: "Cairns Tower",
    ground: "Cairns Ground",
    approach: "Cairns Approach",
    centre: "Brisbane Centre",
    runway: "one five",
    runwayNumeric: "15",
    shortName: "Cairns",
  },
  {
    icao: "YBTL",
    city: "Townsville",
    airspaceClass: "D",
    tower: "Townsville Tower",
    ground: "Townsville Ground",
    approach: "Townsville Approach",
    centre: "Brisbane Centre",
    runway: "zero one",
    runwayNumeric: "01",
    shortName: "Townsville",
  },
  {
    icao: "YPDN",
    city: "Darwin",
    airspaceClass: "D",
    tower: "Darwin Tower",
    ground: "Darwin Ground",
    approach: "Darwin Approach",
    centre: "Brisbane Centre",
    runway: "two nine",
    runwayNumeric: "29",
    shortName: "Darwin",
  },
  {
    icao: "YBHM",
    city: "Hamilton Island",
    airspaceClass: "D",
    tower: "Hamilton Tower",
    approach: "Brisbane Centre",
    centre: "Brisbane Centre",
    runway: "one four",
    runwayNumeric: "14",
    shortName: "Hamilton",
  },
  {
    icao: "YSBK",
    city: "Bankstown",
    airspaceClass: "D",
    tower: "Bankstown Tower",
    ground: "Bankstown Ground",
    approach: "Sydney Approach",
    centre: "Sydney Centre",
    runway: "two nine right",
    runwayNumeric: "29R",
    shortName: "Bankstown",
  },
  {
    icao: "YMMB",
    city: "Moorabbin",
    airspaceClass: "D",
    tower: "Moorabbin Tower",
    ground: "Moorabbin Ground",
    approach: "Melbourne Approach",
    centre: "Melbourne Centre",
    runway: "one three left",
    runwayNumeric: "13L",
    shortName: "Moorabbin",
  },
  {
    icao: "YBAF",
    city: "Archerfield",
    airspaceClass: "D",
    tower: "Archerfield Tower",
    ground: "Archerfield Ground",
    approach: "Brisbane Approach",
    centre: "Brisbane Centre",
    runway: "two eight left",
    runwayNumeric: "28L",
    shortName: "Archerfield",
  },
  // ── Class E (en-route controlled IFR, no surface tower) ─────────────────
  {
    icao: "ENR-E-TAS",
    city: "Tasmania en-route",
    airspaceClass: "E",
    centre: "Melbourne Centre",
    runway: "—",
    runwayNumeric: "—",
    shortName: "Melbourne",
  },
  {
    icao: "ENR-E-NTH",
    city: "Top End en-route",
    airspaceClass: "E",
    centre: "Brisbane Centre",
    runway: "—",
    runwayNumeric: "—",
    shortName: "Brisbane",
  },
  // ── CTAF (non-towered) — broadcasts on the common traffic frequency ─────
  {
    icao: "YMDG",
    city: "Mudgee",
    airspaceClass: "CTAF",
    ctaf: "Mudgee traffic",
    runway: "two two",
    runwayNumeric: "22",
    shortName: "Mudgee",
  },
  {
    icao: "YORG",
    city: "Orange",
    airspaceClass: "CTAF",
    ctaf: "Orange traffic",
    runway: "one zero",
    runwayNumeric: "10",
    shortName: "Orange",
  },
  {
    icao: "YSDU",
    city: "Dubbo",
    airspaceClass: "CTAF",
    ctaf: "Dubbo traffic",
    runway: "two four",
    runwayNumeric: "24",
    shortName: "Dubbo",
  },
  {
    icao: "YMAY",
    city: "Albury",
    airspaceClass: "CTAF",
    ctaf: "Albury traffic",
    runway: "two five",
    runwayNumeric: "25",
    shortName: "Albury",
  },
  {
    icao: "YLIS",
    city: "Lismore",
    airspaceClass: "CTAF",
    ctaf: "Lismore traffic",
    runway: "three three",
    runwayNumeric: "33",
    shortName: "Lismore",
  },
  {
    icao: "YBUD",
    city: "Bundaberg",
    airspaceClass: "CTAF",
    ctaf: "Bundaberg traffic",
    runway: "one four",
    runwayNumeric: "14",
    shortName: "Bundaberg",
  },
  {
    icao: "YBMA",
    city: "Mount Isa",
    airspaceClass: "CTAF",
    ctaf: "Mount Isa traffic",
    runway: "one six",
    runwayNumeric: "16",
    shortName: "Mount Isa",
  },
  {
    icao: "YPLC",
    city: "Port Lincoln",
    airspaceClass: "CTAF",
    ctaf: "Port Lincoln traffic",
    runway: "two three",
    runwayNumeric: "23",
    shortName: "Port Lincoln",
  },
  {
    icao: "YPKG",
    city: "Kalgoorlie",
    airspaceClass: "CTAF",
    ctaf: "Kalgoorlie traffic",
    runway: "two nine",
    runwayNumeric: "29",
    shortName: "Kalgoorlie",
  },
  {
    icao: "YGEL",
    city: "Geraldton",
    airspaceClass: "CTAF",
    ctaf: "Geraldton traffic",
    runway: "one four",
    runwayNumeric: "14",
    shortName: "Geraldton",
  },
];
