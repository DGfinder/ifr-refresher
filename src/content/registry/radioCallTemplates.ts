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
  // ── Standard phrases (Wilco / Unable / Say again) ──────────────────────
  {
    templateId: "ctl-wilco-comply",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "Wilco — short compliance — {city}",
    prompt:
      "ATC has given an instruction that doesn't require a readback. Acknowledge that you'll comply.",
    summaryTemplate:
      "En-route from {city}, working {centre}. ATC has asked you to resume own navigation.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "centre",
      textTemplate: "{callsign}, resume own navigation.",
    },
    expectedTextTemplate: "Wilco, {callsign}.",
    elements: [
      {
        label: "Wilco",
        acceptTemplates: ["Wilco", "will comply"],
        required: true,
        hint: "'Wilco' (will comply) signals you'll do what was asked. It's only used when readback isn't required (e.g. resume own nav, expedite, report passing).",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "AIP GEN 3.4: 'Wilco' = 'will comply'. Use it only when the instruction does NOT require a readback. Mandatory-readback items (levels, headings, speeds, frequencies, runway, QNH, squawk) always get a verbatim readback instead.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. Standard phrases — Wilco usage.",
      },
    ],
  },
  {
    templateId: "ctl-unable-decline",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "Unable — decline an instruction — {city}",
    prompt:
      "ATC has issued an instruction you can't comply with (performance / weight / terrain). Decline and offer an alternative.",
    summaryTemplate:
      "Cruising near {city}, working {centre}. ATC wants you to climb higher than your aircraft can manage today.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "centre",
      textTemplate: "{callsign}, climb to flight level two eight zero.",
    },
    expectedTextTemplate:
      "Unable flight level two eight zero, request flight level two two zero, {callsign}.",
    elements: [
      {
        label: "Unable",
        acceptTemplates: ["Unable"],
        required: true,
        hint: "Open with 'Unable' so ATC immediately knows the instruction was not accepted. Don't readback then refuse — that wastes airtime.",
      },
      {
        label: "Alternative request",
        acceptTemplates: [
          "request flight level two two zero",
          "request FL two two zero",
          "request lower",
          "request FL220",
        ],
        required: true,
        hint: "Always offer ATC a workable alternative — they can re-plan around you immediately.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "AIP GEN 3.4: 'Unable' is the standard phrase to refuse an instruction. Follow with a brief reason or — preferably — a workable counter-request so ATC can re-plan in one exchange.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. Standard phrases — Unable.",
      },
    ],
  },
  {
    templateId: "ctl-say-again",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "Say again — request repeat — {city}",
    prompt:
      "ATC's last transmission was partially blocked / garbled. Ask them to repeat.",
    summaryTemplate:
      "Working {centre} near {city}. Their last transmission was unreadable.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "centre",
      textTemplate: "{callsign}, *garbled* climb *garbled* level *garbled*.",
    },
    expectedTextTemplate: "Say again your last, {callsign}.",
    elements: [
      {
        label: "Say again",
        acceptTemplates: ["say again"],
        required: true,
        hint: "Standard phrase. Don't say 'repeat' (that has a military meaning) or 'come again'.",
      },
      {
        label: "Scope (recommended)",
        acceptTemplates: ["your last", "last instruction", "last transmission", "all after"],
        required: false,
        hint: "Tell ATC what to repeat — 'your last' is the common scope.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "AIP GEN 3.4: 'Say again' is the standard phrase to request a repeat. Add the scope ('your last', 'all after [word]', 'all before [word]') so ATC knows what part to repeat.",
    refs: [
      {
        source: "AIP Australia GEN 3.4",
        section: "Communications — General radiotelephony procedures",
        note: "Source/access date 2026-06-09. Standard phrases — Say again.",
      },
    ],
  },
  // ── QNH / transition altitude ───────────────────────────────────────────
  {
    templateId: "ctl-qnh-readback",
    phase: "arrival",
    applicableClasses: ["C", "D"],
    title: "Read back QNH setting — {city}",
    prompt: "Read back the QNH ATC just passed you.",
    summaryTemplate:
      "Descending into {city}. Approach has just passed you the current QNH.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "approach",
      textTemplate: "{callsign}, QNH one zero zero eight.",
    },
    expectedTextTemplate: "QNH one zero zero eight, {callsign}.",
    elements: [
      {
        label: "QNH value",
        acceptTemplates: [
          "QNH one zero zero eight",
          "one zero zero eight",
          "1008",
          "QNH 1008",
        ],
        required: true,
        hint: "QNH is a MATS Part 4 mandatory readback item — read it back digit-by-digit, exactly as passed.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "MATS Part 4: QNH is a mandatory readback item. Read it back digit-by-digit (not '1008' said as 'one thousand eight'). Setting an incorrect QNH on descent is one of the most common contributors to altitude busts.",
    refs: [
      {
        source: "MATS Part 4",
        chapter: "Pilots' radio standards",
        note: "Source/access date 2026-06-09. Mandatory readback items — QNH.",
      },
      {
        source: "AIP Australia ENR 1.7",
        section: "Altimeter setting procedures",
        note: "Source/access date 2026-06-09. QNH passing and the 10,000 ft transition altitude.",
      },
    ],
  },
  // ── Standalone squawk change ────────────────────────────────────────────
  {
    templateId: "ctl-squawk-change",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "Read back standalone squawk change — {city}",
    prompt: "Read back the new transponder code ATC just assigned.",
    summaryTemplate:
      "En-route near {city}, working {centre}. ATC has just issued a new squawk code.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "centre",
      textTemplate: "{callsign}, squawk five six four three.",
    },
    expectedTextTemplate: "Squawk five six four three, {callsign}.",
    elements: [
      {
        label: "Squawk code",
        acceptTemplates: [
          "squawk five six four three",
          "5643",
          "squawk 5643",
          "five six four three",
        ],
        required: true,
        hint: "Read back digit-by-digit — 'five six four three', not 'fifty-six forty-three'.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "MATS Part 4: transponder codes are mandatory readback. Digit-by-digit so ATC knows you have the right code before you set it.",
    refs: [
      {
        source: "MATS Part 4",
        chapter: "Pilots' radio standards",
        note: "Source/access date 2026-06-09. Mandatory readback — transponder code.",
      },
    ],
  },
  // ── TCAS Resolution Advisory ────────────────────────────────────────────
  {
    templateId: "ctl-tcas-ra",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "TCAS Resolution Advisory — {city}",
    prompt:
      "Your TCAS just commanded a Resolution Advisory. Announce it to ATC so they know you're deviating from clearance.",
    summaryTemplate:
      "Cruising near {city}, working {centre}. TCAS has just commanded a 'CLIMB' RA in response to a converging aircraft.",
    expectedTextTemplate: "TCAS RA, {callsign}.",
    elements: [
      {
        label: "TCAS RA call",
        acceptTemplates: ["TCAS RA"],
        required: true,
        hint: "Standard ICAO + AIP GEN 3.6 phrase. NOT 'TCAS climb' or 'avoiding traffic'. Three words — 'TCAS RA' — that's it. ATC knows what to do.",
      },
      {
        label: "Callsign",
        acceptTemplates: ["{callsign}", "{callsignShort}"],
        required: true,
      },
    ],
    explanation:
      "AIP GEN 3.6 + ICAO Doc 4444: 'TCAS RA' is the mandatory standard phrase when you're following a Resolution Advisory and deviating from clearance. Don't try to describe the manoeuvre — just 'TCAS RA, callsign'. Follow up with 'Clear of conflict, returning to [assigned level], callsign' once the RA clears.",
    refs: [
      {
        source: "AIP Australia GEN 3.6",
        section: "Distress and urgency communications",
        note: "Source/access date 2026-06-09. TCAS RA phraseology.",
      },
      {
        source: "ICAO Doc 4444",
        chapter: "PANS-ATM — pilot phraseology",
        note: "Source/access date 2026-06-09. Standard TCAS RA call.",
      },
    ],
  },
  // ── Visual approach request ─────────────────────────────────────────────
  {
    templateId: "ctl-visual-approach-request",
    phase: "arrival",
    applicableClasses: ["C", "D"],
    title: "Request visual approach — {city}",
    prompt:
      "You have the airfield in sight and want to request a visual approach rather than the published instrument approach.",
    summaryTemplate:
      "Inbound to {city}, being vectored by Approach for the published instrument approach. Conditions are CAVOK, airfield in sight at 12 miles.",
    lastTransmissionTemplate: {
      speaker: "atc",
      station: "approach",
      textTemplate: "{callsign}, descend to four thousand.",
    },
    expectedTextTemplate:
      "{approach}, {callsign}, airfield in sight, request visual approach runway {runway}.",
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
        label: "Field in sight",
        acceptTemplates: [
          "airfield in sight",
          "field in sight",
          "airport in sight",
          "visual with the field",
        ],
        required: true,
        hint: "ATC needs to know you can see the field — that's the prerequisite for a visual approach.",
      },
      {
        label: "Request visual",
        acceptTemplates: [
          "request visual approach runway {runway}",
          "request visual runway {runway}",
          "request visual approach",
          "visual approach runway {runway}",
        ],
        required: true,
        hint: "Name the runway so ATC can confirm the right one and sequence other traffic.",
      },
    ],
    explanation:
      "AIP ENR 1.5: a visual approach can be requested when you have the field in sight and conditions permit. Tell ATC the runway you intend so they sequence correctly. Visual ≠ VFR — you're still on an IFR plan, just not flying the published procedure.",
    refs: [
      {
        source: "AIP Australia ENR 1.5",
        section: "Holding, approach and departure procedures — visual approaches",
        note: "Source/access date 2026-06-09. Visual approach request format.",
      },
    ],
  },
  // ── SARTIME submit / cancel ─────────────────────────────────────────────
  {
    templateId: "ctl-sartime-submit",
    phase: "enroute",
    applicableClasses: ["C", "D", "E"],
    title: "Submit SARTIME — {city}",
    prompt:
      "Working Centre. You need to submit a SARTIME so SAR is initiated if you don't arrive.",
    summaryTemplate:
      "Cruising en-route from {city}. ETA destination is 0400Z. Submitting SARTIME for 0430Z so SAR triggers at 30 minutes overdue.",
    expectedTextTemplate: "{centre}, {callsign}, submit SARTIME zero four three zero.",
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
        label: "Submit SARTIME phrase",
        acceptTemplates: ["submit SARTIME", "submitting SARTIME"],
        required: true,
        hint: "Use the explicit phrase 'submit SARTIME' — Centre needs to log this against your callsign so SAR triggers automatically if you go overdue.",
      },
      {
        label: "Time (UTC)",
        acceptTemplates: [
          "zero four three zero",
          "0430",
          "zero four three zero Zulu",
          "0430Z",
        ],
        required: true,
        hint: "Time in UTC, digit-by-digit. The SARTIME is when SAR will be triggered if you haven't cancelled.",
      },
    ],
    explanation:
      "AIP ENR 1.1: SARTIME is the time at which SAR action will be initiated if you haven't cancelled. Submit it to Centre before reaching the area where you'd otherwise be uncontactable. Cancel it once you've landed safely.",
    refs: [
      {
        source: "AIP Australia ENR 1.1",
        section: "General rules and procedures — flight notification and SAR",
        note: "Source/access date 2026-06-09. SARTIME submission format and effect.",
      },
    ],
  },
  {
    templateId: "ctl-sartime-cancel",
    phase: "non-normal",
    applicableClasses: ["C", "D", "E"],
    title: "Cancel SARTIME — {city}",
    prompt:
      "You've landed safely. Cancel the SARTIME with Centre before SAR triggers.",
    summaryTemplate:
      "On the ground at destination after a flight from {city}. SARTIME 0430Z still active and needs cancelling.",
    expectedTextTemplate: "{centre}, {callsign}, cancel SARTIME.",
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
        label: "Cancel SARTIME phrase",
        acceptTemplates: ["cancel SARTIME", "cancelling SARTIME"],
        required: true,
        hint: "Explicit cancel phrase. Forget this and SAR mobilises at the SARTIME — costly false alarm.",
      },
    ],
    explanation:
      "AIP ENR 1.1: cancel SARTIME promptly on arrival. Failing to cancel triggers an unnecessary SAR response — controllers send aircraft, units stand-up. Make the call before you start shutting down.",
    refs: [
      {
        source: "AIP Australia ENR 1.1",
        section: "General rules and procedures — flight notification and SAR",
        note: "Source/access date 2026-06-09. SARTIME cancellation requirement and procedure.",
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
    templateId: "ctaf-crossing-runway",
    phase: "pre-departure",
    applicableClasses: ["CTAF"],
    title: "Crossing runway broadcast — {city}",
    prompt:
      "Make the CTAF broadcast as you taxi across an active runway, warning other traffic.",
    summaryTemplate:
      "Taxiing at {city} CTAF and need to cross runway {runwayNumeric} to reach the other side of the field.",
    expectedTextTemplate: "{ctaf}, {callsign}, crossing runway {runway}, {city}.",
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
        label: "Crossing + runway",
        acceptTemplates: [
          "crossing runway {runway}",
          "crossing {runway}",
          "crossing runway {runwayNumeric}",
        ],
        required: true,
        hint: "Always name the runway you're crossing — other traffic may be lined up to depart or on short final.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: a runway crossing at a CTAF requires a broadcast — there's no controller sequencing taxi against approach traffic, so the broadcast is the only thing keeping a separation conflict from becoming a runway incursion.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF runway-crossing broadcast requirement.",
      },
    ],
  },
  {
    templateId: "ctaf-joining-overhead",
    phase: "arrival",
    applicableClasses: ["CTAF"],
    title: "Joining circuit overhead — {city}",
    prompt:
      "Make the CTAF broadcast as you arrive overhead the field for an overhead-join descent into the circuit.",
    summaryTemplate:
      "Arrived overhead {city} at 2500 ft AAL. About to descend dead side, then join crosswind for runway {runwayNumeric}.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, overhead the field two thousand five hundred, descending dead side for runway {runway}, {city}.",
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
        label: "Overhead position",
        acceptTemplates: ["overhead the field", "overhead", "above the field"],
        required: true,
      },
      {
        label: "Altitude",
        acceptTemplates: [
          "two thousand five hundred",
          "2500",
          "two thousand five",
        ],
        required: true,
      },
      {
        label: "Intentions",
        acceptTemplates: [
          "descending dead side for runway {runway}",
          "joining circuit runway {runway}",
          "dead side for {runway}",
          "for runway {runway}",
        ],
        required: true,
        hint: "Tell circuit traffic which side you're descending and the runway you'll join for.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: an overhead join arriving at a CTAF aerodrome requires a broadcast naming altitude and the dead-side descent so circuit traffic can sequence and stay clear.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF overhead-join broadcast.",
      },
    ],
  },
  {
    templateId: "ctaf-joining-straight-in",
    phase: "arrival",
    applicableClasses: ["CTAF"],
    title: "Straight-in approach broadcast — {city}",
    prompt:
      "Make the CTAF broadcast as you turn final for a straight-in approach (not the usual circuit join).",
    summaryTemplate:
      "Inbound to {city}, established on final approach 5 NM out for runway {runwayNumeric} — a straight-in instead of a circuit join.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, five miles final runway {runway}, straight-in approach, {city}.",
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
        label: "Distance + position",
        acceptTemplates: [
          "five miles final",
          "5 miles final",
          "five mile final",
          "five miles out",
        ],
        required: true,
        hint: "Give circuit traffic distance to run — they can judge spacing without seeing you.",
      },
      {
        label: "Runway",
        acceptTemplates: ["runway {runway}", "{runway}", "runway {runwayNumeric}"],
        required: true,
      },
      {
        label: "Straight-in phrase",
        acceptTemplates: ["straight-in approach", "straight in approach", "straight in"],
        required: true,
        hint: "Distinguish from a normal circuit join — circuit traffic needs to know you're not joining downwind.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: straight-in approach broadcasts at CTAF must declare both the distance and the 'straight-in' intent so circuit traffic can give way per CASR 91.385 (right-of-way at non-towered aerodromes).",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF straight-in approach broadcast.",
      },
      {
        source: "CASR Part 91",
        chapter: "General operating and flight rules — right of way",
        note: "Source/access date 2026-06-09. Right-of-way at non-towered aerodromes.",
      },
    ],
  },
  {
    templateId: "ctaf-base",
    phase: "final",
    applicableClasses: ["CTAF"],
    title: "Base broadcast — {city}",
    prompt: "Make the CTAF base broadcast as you turn base.",
    summaryTemplate:
      "In the circuit at {city}, just turned base for runway {runwayNumeric}.",
    expectedTextTemplate: "{ctaf}, {callsign}, base runway {runway}, {city}.",
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
        acceptTemplates: ["base"],
        required: true,
      },
      {
        label: "Runway",
        acceptTemplates: ["runway {runway}", "{runway}", "runway {runwayNumeric}"],
        required: true,
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: base broadcast warns following circuit traffic of your spacing — particularly important when straight-in arrivals are using the same runway.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF circuit position broadcasts.",
      },
    ],
  },
  {
    templateId: "ctaf-final",
    phase: "final",
    applicableClasses: ["CTAF"],
    title: "Final broadcast — {city}",
    prompt: "Make the CTAF final broadcast as you establish on final.",
    summaryTemplate:
      "In the circuit at {city}, established on final for runway {runwayNumeric}.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, final runway {runway}, full stop, {city}.",
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
        acceptTemplates: ["final"],
        required: true,
      },
      {
        label: "Runway",
        acceptTemplates: ["runway {runway}", "{runway}", "runway {runwayNumeric}"],
        required: true,
      },
      {
        label: "Intentions",
        acceptTemplates: ["full stop", "touch and go", "to land", "low approach"],
        required: false,
        hint: "Recommended: tell circuit traffic if you're vacating or staying in the pattern.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: final broadcast is the last chance for any traffic considering entering the runway to see you. Always end with the aerodrome name, not the callsign.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF final broadcast.",
      },
    ],
  },
  {
    templateId: "ctaf-clear-of-runway",
    phase: "final",
    applicableClasses: ["CTAF"],
    title: "Clear of runway broadcast — {city}",
    prompt:
      "Make the CTAF broadcast announcing that you have vacated the runway after landing.",
    summaryTemplate:
      "Just landed at {city} on runway {runwayNumeric}, now vacated onto the taxiway.",
    expectedTextTemplate: "{ctaf}, {callsign}, clear of runway {runway}, {city}.",
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
        label: "Clear of runway",
        acceptTemplates: [
          "clear of runway {runway}",
          "clear of {runway}",
          "vacated runway {runway}",
          "runway clear",
        ],
        required: true,
        hint: "Tells any traffic on short final or holding-point that the runway is now available.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: at controlled aerodromes Tower sees you clear the runway. At CTAF nobody does — the broadcast is your only way to release the runway to following traffic.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF clear-of-runway broadcast.",
      },
    ],
  },
  {
    templateId: "ctaf-going-around",
    phase: "final",
    applicableClasses: ["CTAF"],
    title: "Going around broadcast (CTAF) — {city}",
    prompt:
      "Make the CTAF broadcast announcing that you are going around — warning circuit traffic and anyone considering using the runway.",
    summaryTemplate:
      "On final at {city} for runway {runwayNumeric}. An unexpected runway incursion ahead — you commit to a go-around.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, going around runway {runway}, climbing upwind, {city}.",
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
        label: "Going around + runway",
        acceptTemplates: [
          "going around runway {runway}",
          "going around {runway}",
          "going around runway {runwayNumeric}",
        ],
        required: true,
        hint: "At controlled fields you just say 'going around'. At CTAF you name the runway so other traffic knows which one you're not landing on.",
      },
      {
        label: "Intentions",
        acceptTemplates: [
          "climbing upwind",
          "upwind",
          "rejoining downwind",
          "rejoining circuit",
        ],
        required: false,
        hint: "Recommended: tell traffic where you're going next so they can sequence around you.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: CTAF go-around is broadcast format (vs the controlled 'Going around, [callsign]' to Tower). Includes the runway and ideally a position so following circuit traffic adjusts.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF missed-approach / go-around broadcast.",
      },
    ],
  },
  {
    templateId: "ctaf-overflying",
    phase: "enroute",
    applicableClasses: ["CTAF"],
    title: "Overflying broadcast — {city}",
    prompt:
      "Make the CTAF overflying broadcast as you transit through the CTAF zone at altitude (within 10 NM, above 3000 AGL).",
    summaryTemplate:
      "Transiting overhead {city} at FL085, en-route. Within 10 NM of the CTAF aerodrome — required broadcast.",
    expectedTextTemplate:
      "{ctaf}, {callsign}, overhead the field, flight level zero eight five, transiting, {city}.",
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
        acceptTemplates: ["overhead the field", "overhead", "above the field"],
        required: true,
      },
      {
        label: "Altitude",
        acceptTemplates: [
          "flight level zero eight five",
          "FL085",
          "FL zero eight five",
          "eight thousand five hundred",
        ],
        required: true,
      },
      {
        label: "Transit intent",
        acceptTemplates: ["transiting", "transit", "not landing", "en-route"],
        required: true,
        hint: "Make explicit that you're not joining the circuit — circuit traffic doesn't need to give way.",
      },
      {
        label: "Aerodrome at end",
        acceptTemplates: ["{city}"],
        required: true,
      },
    ],
    explanation:
      "AIP ENR 1.4: aircraft transiting within 10 NM of a CTAF aerodrome and below 5000 ft AGL should broadcast on the CTAF. Stating 'transiting' or 'not landing' avoids ambiguity with circuit-joining traffic.",
    refs: [
      {
        source: "AIP Australia ENR 1.4",
        section: "ATS airspace classification — Class G procedures",
        note: "Source/access date 2026-06-09. CTAF overflying/transit broadcast requirements.",
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
