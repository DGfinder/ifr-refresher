/**
 * Sample IFR-capable aircraft callsigns used by the radio drill generator.
 * Each template × location combination expands across these to vary the
 * callsign on practice cards.
 *
 * `short` is the typical Australian-convention abbreviation pilots use
 * after the first call. The matcher accepts either form so the learner
 * can shorten naturally.
 */
export interface RadioCallsign {
  full: string;
  short: string;
  aircraftType: string;
}

export const radioCallsigns: RadioCallsign[] = [
  {
    full: "Lima Echo Foxtrot",
    short: "LEF",
    aircraftType: "PA-31 Chieftain",
  },
  {
    full: "Mike X-ray Golf",
    short: "MXG",
    aircraftType: "King Air 350",
  },
  {
    full: "Bravo Romeo Alpha",
    short: "BRA",
    aircraftType: "Cessna 208 Caravan",
  },
  {
    full: "Juliet Tango Hotel",
    short: "JTH",
    aircraftType: "Beech B58 Baron",
  },
  {
    full: "Sierra Whiskey Yankee",
    short: "SWY",
    aircraftType: "Piper PA-44 Seminole",
  },
];
