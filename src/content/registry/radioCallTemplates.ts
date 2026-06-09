import type { RadioCallTemplate } from "@/content/model/radioTemplate";

/**
 * Controlled-airspace templates apply to Class C and Class D aerodromes
 * (and to Class E en-route IFR where relevant). CTAF templates apply to
 * Class G non-towered aerodromes — completely different phraseology
 * (broadcasts to other pilots, no ATC).
 *
 * Slot tokens are documented on `RadioCallTemplate`. The generator fills
 * them at realisation time from each location + callsign pair.
 */
export const radioCallTemplates: RadioCallTemplate[] = [
  // ── Controlled-airspace templates ───────────────────────────────────────
  {
    templateId: "ctl-clearance-request",
    phase: "pre-departure",
    applicableClasses: ["C", "D"],
    title: "Request IFR clearance — {city}",
    prompt: "Make the initial call to {tower} to request your IFR clearance.",
    summaryTemplate:
      "Pre-flight complete at {city}. ATIS information {atisCode} received. Ready to copy IFR clearance to {destination}.",
    expectedTextTemplate:
      "{tower}, {callsign}, IFR clearance to {destination}, information {atisCode}.",
    elements: [
      {
        label: "Addressed station",
        acceptTemplates: ["{tower}", "{shortName} Tower", "{shortName}"],
        required: true,
        hint: "Addressed station goes first per AIP GEN 3.4 initial-call format.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Request type",
        acceptTemplates: ["IFR clearance", "instrument clearance"],
        required: true,
      },
      {
        label: "Destination",
        acceptTemplates: ["{destination}", "{destinationShort}"],
        required: true,
      },
      {
        label: "ATIS code",
        acceptTemplates: ["information {atisCode}", "{atisCode}", "with {atisCode}"],
        required: true,
        hint: "Confirm the ATIS so Tower doesn't have to ask.",
      },
    ],
    fixedSlots: {
      destination: "Coffs Harbour",
      destinationShort: "Coffs",
    },
    explanation:
      "AIP GEN 3.4 initial-call format: addressed station, callsign, request type with destination, ATIS code.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. IFR clearance request format.",
      },
    ],
  },
  {
    templateId: "ctl-taxi-request",
    phase: "pre-departure",
    applicableClasses: ["C", "D"],
    title: "Request taxi — {city}",
    prompt: "Make the initial call to {ground} to request taxi.",
    summaryTemplate:
      "Clearance copied and readback confirmed at {city}. Switched to Ground. Ready to taxi. ATIS {atisCode} still current.",
    expectedTextTemplate: "{ground}, {callsign}, ready for taxi, information {atisCode}.",
    elements: [
      {
        label: "Addressed station",
        acceptTemplates: ["{ground}", "{shortName} Ground", "Ground"],
        required: true,
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Request",
        acceptTemplates: ["ready for taxi", "request taxi", "ready to taxi"],
        required: true,
      },
      {
        label: "ATIS code",
        acceptTemplates: ["information {atisCode}", "{atisCode}", "with {atisCode}"],
        required: false,
        hint: "Recommended: confirming ATIS saves a back-and-forth.",
      },
    ],
    explanation: "AIP GEN 3.4: addressed station, callsign, request, ATIS confirmation.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. Taxi request format.",
      },
    ],
  },
  {
    templateId: "ctl-takeoff-readback",
    phase: "pre-departure",
    applicableClasses: ["C", "D"],
    title: "Read back takeoff clearance — {city}",
    prompt: "Read back the takeoff clearance Tower has just issued.",
    summaryTemplate:
      "Holding short of runway {runwayNumeric} at {city}, ready for departure. Tower has just issued your takeoff clearance.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "tower",
      textTemplate:
        "{callsign}, runway {runway}, cleared for take-off, wind two eight zero at ten.",
    },
    expectedTextTemplate: "Cleared for take-off runway {runway}, {callsign}.",
    elements: [
      {
        label: "Clearance",
        acceptTemplates: [
          "cleared for take-off",
          "cleared for takeoff",
          "cleared takeoff",
        ],
        required: true,
      },
      {
        label: "Runway",
        acceptTemplates: ["runway {runway}", "{runway}", "runway {runwayNumeric}"],
        required: true,
        hint: "Read back the runway number — required per MATS Part 4.",
      },
      {
        label: "Callsign at end",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "MATS Part 4: takeoff clearance readback is the clearance + runway in use + callsign. Wind is not part of the mandatory readback.",
    refs: [
      {
        source: "MATS Part 4",
        chapter: "Pilots' radio standards",
        note: "Source/access date 2026-06-09. Mandatory readback — takeoff clearance and runway.",
      },
    ],
  },
  {
    templateId: "ctl-landing-readback",
    phase: "final",
    applicableClasses: ["C", "D"],
    title: "Read back landing clearance — {city}",
    prompt: "Read back the landing clearance Tower just issued.",
    summaryTemplate:
      "Established on final at {city}, runway {runwayNumeric} in sight. Tower has just cleared you to land.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "tower",
      textTemplate:
        "{callsign}, runway {runway}, cleared to land, wind three two zero at eight.",
    },
    expectedTextTemplate: "Cleared to land runway {runway}, {callsign}.",
    elements: [
      {
        label: "Clearance",
        acceptTemplates: ["cleared to land"],
        required: true,
        hint: "Use 'cleared to land' — not 'landing' or 'on final'.",
      },
      {
        label: "Runway",
        acceptTemplates: ["runway {runway}", "{runway}", "runway {runwayNumeric}"],
        required: true,
      },
      {
        label: "Callsign at end",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "MATS Part 4: landing clearance is mandatory readback. Include 'cleared to land' verbatim and the runway. Wind isn't part of the readback.",
    refs: [
      {
        source: "MATS Part 4",
        chapter: "Pilots' radio standards",
        note: "Source/access date 2026-06-09. Mandatory readback — landing clearance.",
      },
    ],
  },
  {
    templateId: "ctl-approach-checkin",
    phase: "arrival",
    applicableClasses: ["C", "D"],
    title: "Initial Approach contact — {city}",
    prompt: "Make the initial call to {approach}.",
    summaryTemplate:
      "Just been handed off to {approach}. Descending FL150 for 9000. ATIS {atisCode} received.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "centre",
      textTemplate: "{callsign}, contact {approach}.",
    },
    expectedTextTemplate:
      "{approach}, {callsign}, descending flight level one five zero for nine thousand, information {atisCode}.",
    elements: [
      {
        label: "Addressed station",
        acceptTemplates: ["{approach}", "{shortName} Approach", "Approach"],
        required: true,
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Current level + state",
        acceptTemplates: [
          "descending flight level one five zero",
          "descending FL one five zero",
          "descending one five zero",
          "descending FL150",
        ],
        required: true,
      },
      {
        label: "Cleared level",
        acceptTemplates: ["for nine thousand", "to nine thousand", "for 9000"],
        required: true,
      },
      {
        label: "ATIS code",
        acceptTemplates: ["information {atisCode}", "{atisCode}", "with {atisCode}"],
        required: true,
        hint: "Confirm ATIS on initial Approach contact.",
      },
    ],
    explanation:
      "AIP GEN 3.4 initial-contact format: station, callsign, current state + level, assigned level, ATIS.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. Initial Approach contact format.",
      },
    ],
  },
  {
    templateId: "ctl-centre-checkin",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "Initial Centre check-in — {city}",
    prompt: "Make the initial call to {centre} after the handoff.",
    summaryTemplate:
      "Climbing through FL180 for cruise FL220. {centre} just took the handoff.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "tower",
      textTemplate: "{callsign}, contact {centre}.",
    },
    expectedTextTemplate:
      "{centre}, {callsign}, climbing flight level one eight zero for flight level two two zero.",
    elements: [
      {
        label: "Addressed station",
        acceptTemplates: ["{centre}", "Centre"],
        required: true,
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Current level + state",
        acceptTemplates: [
          "climbing flight level one eight zero",
          "climbing FL one eight zero",
          "climbing one eight zero",
          "passing FL180",
        ],
        required: true,
      },
      {
        label: "Cleared level",
        acceptTemplates: [
          "for flight level two two zero",
          "for FL two two zero",
          "for two two zero",
          "for FL220",
        ],
        required: true,
      },
    ],
    explanation: "AIP GEN 3.4 initial-contact format after a handoff.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. Initial Centre contact.",
      },
    ],
  },
  // ── CTAF templates — broadcasts to other pilots, no ATC ─────────────────
  {
    templateId: "ctaf-taxi-broadcast",
    phase: "pre-departure",
    applicableClasses: ["CTAF"],
    title: "Taxiing broadcast — {city}",
    prompt:
      "Make the CTAF taxi broadcast announcing your intentions to other traffic at the aerodrome.",
    summaryTemplate:
      "Pre-flight complete at {city}, a non-towered CTAF aerodrome. About to taxi to the holding point for runway {runwayNumeric} for an IFR departure.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, {aircraftType}, taxiing for runway {runway}, IFR departure, {city}.",
    elements: [
      {
        label: "CTAF prefix",
        acceptTemplates: ["{ctaf}", "{city} traffic"],
        required: true,
        hint: "CTAF broadcasts open with '[Aerodrome] traffic' — addressing all traffic, not ATC.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Aircraft type",
        acceptTemplates: ["{aircraftType}"],
        required: false,
        hint: "Recommended: aircraft type helps other pilots judge speed/size.",
      },
      {
        label: "Intentions",
        acceptTemplates: [
          "taxiing for runway {runway}",
          "taxi runway {runway}",
          "taxiing runway {runway}",
          "taxi for {runway}",
        ],
        required: true,
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
        hint: "CTAF broadcasts END with the aerodrome name (not callsign) per AIP ENR 1.4.",
      },
    ],
    explanation:
      "AIP ENR 1.4 / CASR Part 91: CTAF broadcast format — addressed prefix, callsign, type, intentions, aerodrome at end. There's no ATC; you're informing other pilots.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF broadcast format and required calls.",
      },
      {
        source: "CASR Part 91",
        chapter: "General operating and flight rules",
        note: "Source/access date 2026-06-09. Carriage and use of radio at non-towered aerodromes.",
      },
    ],
  },
  {
    templateId: "ctaf-departing-broadcast",
    phase: "departure",
    applicableClasses: ["CTAF"],
    title: "Departing broadcast — {city}",
    prompt: "Make the CTAF departing broadcast as you line up to roll.",
    summaryTemplate:
      "Lined up runway {runwayNumeric} at {city}, ready to roll. Make the departing broadcast.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, departing runway {runway}, IFR to the north, {city}.",
    elements: [
      {
        label: "CTAF prefix",
        acceptTemplates: ["{ctaf}", "{city} traffic"],
        required: true,
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Departing + runway",
        acceptTemplates: [
          "departing runway {runway}",
          "departing {runway}",
          "rolling runway {runway}",
          "rolling {runway}",
        ],
        required: true,
      },
      {
        label: "Intentions / direction",
        acceptTemplates: ["IFR", "to the north", "departure", "climbing"],
        required: false,
        hint: "Recommended: tell other traffic your direction or flight type.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: the departing broadcast warns other CTAF traffic that you're entering the runway and rolling. Always end with the aerodrome name.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF departing broadcast.",
      },
    ],
  },
  {
    templateId: "ctaf-inbound-broadcast",
    phase: "arrival",
    applicableClasses: ["CTAF"],
    title: "Inbound broadcast — {city}",
    prompt:
      "Make the CTAF inbound broadcast 10 NM out so traffic in the circuit knows you're coming.",
    summaryTemplate:
      "Inbound to {city}, 10 nautical miles to the south, descending through 4500.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, {aircraftType}, ten miles south, four thousand five hundred, inbound for landing runway {runway}, {city}.",
    elements: [
      {
        label: "CTAF prefix",
        acceptTemplates: ["{ctaf}", "{city} traffic"],
        required: true,
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Position",
        acceptTemplates: [
          "ten miles south",
          "10 miles south",
          "ten nautical miles south",
          "ten south",
        ],
        required: true,
        hint: "Distance + bearing — gives others a position fix without GPS coords.",
      },
      {
        label: "Altitude",
        acceptTemplates: [
          "four thousand five hundred",
          "4500",
          "passing four thousand five hundred",
        ],
        required: true,
      },
      {
        label: "Intentions",
        acceptTemplates: [
          "inbound for landing runway {runway}",
          "inbound runway {runway}",
          "joining downwind runway {runway}",
        ],
        required: true,
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: inbound broadcast at 10 NM is mandatory at CTAF aerodromes — gives circuit traffic time to sequence. Include position, altitude, intended runway.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF inbound broadcast required at 10 NM.",
      },
    ],
  },
  {
    templateId: "ctaf-downwind-broadcast",
    phase: "final",
    applicableClasses: ["CTAF"],
    title: "Downwind broadcast — {city}",
    prompt: "Make the CTAF downwind broadcast as you turn downwind.",
    summaryTemplate:
      "Joined circuit at {city}, turning downwind for runway {runwayNumeric}. Make the downwind broadcast.",
    expectedTextTemplate: "{ctaf}, {callsign}, downwind runway {runway}, full stop, {city}.",
    elements: [
      {
        label: "CTAF prefix",
        acceptTemplates: ["{ctaf}", "{city} traffic"],
        required: true,
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
      {
        label: "Position in circuit",
        acceptTemplates: ["downwind"],
        required: true,
      },
      {
        label: "Runway",
        acceptTemplates: ["runway {runway}", "{runway}", "runway {runwayNumeric}"],
        required: true,
      },
      {
        label: "Intentions",
        acceptTemplates: ["full stop", "touch and go", "to land"],
        required: false,
        hint: "Recommended: tell circuit traffic if you'll vacate or stay in the pattern.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: downwind broadcast warns following circuit traffic of your spacing and intentions. Always end with the aerodrome name.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF circuit broadcasts.",
      },
    ],
  },
];
