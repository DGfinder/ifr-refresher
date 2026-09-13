# Holding migration review

Reviewed 13 September 2026 against supplied IFR Cheat Sheet V7.1 pages 38–40. This is an editorial audit of candidates for migration, not a complete audit of the live content.

## Existing material is not the starting lesson

The current implementation contains `CS-011`, `HLD-001`, `HLD-002` and a separate visual holding lesson. The reset will have a single Holding chapter with the source's Sector Entries and Holding Limitations subtopics. Questions and any eventual visual will belong to those topics.

| Existing item | Finding | Migration decision |
|---|---|---|
| HLD-001 direct-entry timing “trap” | Replaces the source's fallback when the abeam position cannot be determined with a generic “whichever is later” statement. The specific entry wording and general limitation need to remain distinguishable. | Rewrite from the source; retain the qualification. |
| CS-011 timing “trap” | Categorical “not from directly overhead” obscures the different entry procedures described on page 38. | Replace with a question that identifies which procedure/phase applies. |
| HLD-001 boundary/FMS answers | Guarantee protected airspace and prescribe manual entry when a database hold is absent without a sufficient aircraft/procedure-specific reference. | Do not migrate these assertions. |
| HLD-001 teardrop scenario | Gives a single heading without a stated wind assumption and requires independent verification of the sector and holding-side construction. | Replace with an explicitly assumed, independently checked worked example. |
| HLD-002 wind scenario | Infers wind direction and prescribes a new outbound time from ambiguous “20 seconds early” information, without defining the target or supplying enough observations. | Do not migrate. Teach what must be observed before choosing a correction. |
| HLD-002 speed “trap” | Claims a pilot at 265 KIAS/FL210 must slow, while its own table permits that speed in the stated altitude band; no additional limiting condition is supplied. | Remove this question rather than inventing a missing restriction. |
| HLD-002 “AIP overrides AFM” answer | Frames aircraft/procedure limitations as a blanket hierarchy rather than specifying the constraints that must all be met. | Do not migrate; any aircraft-specific case needs its actual source. |
| Separate Holding geometry visual | Its stated scope excludes entry and does not teach departing as cleared. | Do not count it as curriculum coverage or migrate it as the holding lesson. |

These findings explain the fresh-authoring decision. They have not changed the live JSON banks in this review pass. Their presence is a reason to keep the old app as a reference/backup rather than an approved source for the reset.
