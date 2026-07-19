# Guide to Creating a Political Parties Document for Any Country
## Core 1A (Personal Autonomy) Version

This document provides a standardised method for producing a political parties analysis focused on **Core 1A – Personal Autonomy**. The structure is deliberately parallel to the generic/Cultural 1A guide so that the same overall document architecture can be used across axes. Elements that are specific to the Core 1A axis are clearly marked **(Core 1A)**.

**This guide is binding on any instance of the model that produces or revises a Core 1A political parties document.** Depth and analytical completeness take absolute priority over brevity, token-saving, or artificial compression. Producing thin, summary-level text when full analysis is required is a failure to follow this guide.

---

## 0. Overriding Instruction on Depth

Before any other rule, the following applies:

- **Proper depth is mandatory.** Every party and every significant faction must receive genuine analytical treatment, not placeholder or compressed text.
- **Artificial brevity is forbidden.** Do not shorten paragraphs, reduce bullet counts, or omit required elements in order to keep the overall document short.
- **Compression that forces later rework is a net waste.** Writing a thin version first and then expanding it later consumes more total resources than writing to the required depth on the first pass.
- **If a choice exists between a shorter response and a complete one, always choose completeness.**
- **Summary paragraphs must be real paragraphs** (normally 70–120 words). Two-sentence “summaries” are non-compliant.
- **Bullet lists must contain concrete policy/restriction language**, not abstract category labels alone.
- When in doubt about length, err on the side of greater depth and specificity.

Any future instance that produces under-depth text after reading this guide is violating an explicit instruction.

---

## 1. Purpose of the Document

The political parties document exists to:

- Identify the principal political parties (and, where relevant, significant internal factions) operating in a country.
- Analyse the concrete policies and restrictions each party supports, maintains, or would introduce that affect Core 1A Personal Autonomy.
- Produce consistent Core 1A scores (often with Endos/Xenos splits) that can be compared across parties and countries.
- Complement the corresponding Core 1A era/timeline document without duplicating its chronological analysis of enacted law.

The document is **not** a general encyclopaedia of party history, organisation, or electoral performance. It focuses on *what direct restrictions on voluntary individual action each party would maintain or add*.

**(Core 1A)** Scoring follows the locked Core 1A rules: Direct Restriction Only, Negative-Only Weighting, Punishment vs Restriction, Process vs Restriction discarded, Chilling Effects discarded, Score 4 Floor, and Scored Policy Inheritance from the master Scored Policies document.

---

## 2. Required Overall Structure

Every completed political parties document must contain the following elements in order:

1. **Title**
2. **Top-level Parties Table** (real parties only)
3. **Broad Summary** of the current party system on Core 1A
4. **Individual Party Sections**, ordered alphabetically by party name
5. Within each major party that has significant internal differentiation:  
   - Faction table  
   - Short summary of how the factions shape the party’s Core 1A profile  
   - Party-as-totality write-up  
   - Individual faction write-ups

Minor or unitary parties receive a single full write-up with no faction table.

---

## 3. Title Format

```
# Political Parties ([Country])
## Core 1A (Personal Autonomy) Analysis
```

**Example:**
```
# Political Parties (France)
## Core 1A (Personal Autonomy) Analysis
```

---

## 4. Top-level Parties Table

List **only real political parties** (not factions). Order alphabetically.

```markdown
| Party                                              | Endos Score | Xenos Score | Notes |
|----------------------------------------------------|-------------|-------------|-------|
| Party A                                            | XX          | XX / N/A    | ...   |
| Party B                                            | XX          | XX / N/A    | ...   |
| ...                                                | ...         | ...         | ...   |
```

**(Core 1A)** Use Endos/Xenos columns when a clear, stable, discretely targetable outgroup exists that receives markedly worse treatment under the party’s policies. If no split applies, place a single holistic score in the Endos column and mark Xenos as N/A.

Rules:
- Factions never appear in this table.
- Scores must be consistent with the detailed write-ups that follow.
- The table is the authoritative list of parties treated in the document.
- Scores are on the 0–100 Core 1A scale.

---

## 5. Broad Summary Paragraph(s)

Immediately after the table, write **1–2 substantial paragraphs** that characterise the overall configuration of the party system on Core 1A.

**Depth standard:** The summary must give a reader a clear map of the relative autonomy positions of the major parties, any systematic Endos/Xenos patterns, and the main sources of restriction that differentiate them. One thin sentence is non-compliant.

**(Core 1A)** Explicitly note which parties maintain or expand content-based speech restrictions, religious expression controls, association limits, or other direct restrictions, and whether any party applies markedly differential treatment to a stable outgroup.

---

## 6. How to Decide Whether a Party Requires Factional Breakdown

Apply the following test:

A party requires an internal factional breakdown when:

- It contains two or more currents that differ materially in the *set or intensity of Core 1A restrictions* they support, **and**
- Those currents have durable organisational or intellectual expression (named leaders, recognisable policy packages, recurring legislative or rhetorical patterns).

Do **not** create factions for:
- Mere tactical or personal rivalries that do not track differences in restrictive policy.
- Transient media labels without substantive policy content.
- Micro-currents too small to affect the party’s overall Core 1A profile.

When in doubt, prefer fewer, clearer factions over a proliferation of minor ones.

**Maximal useful splitting rule:** Split as far as necessary to capture real differences in the restrictions the currents would impose, but no further.

---

## 7. Faction Naming and Leadership Rule (Mandatory)

Every faction that receives its own write-up **must** be headed in the following format:

```markdown
## [Single Named Person], [Faction Name] ([Primary/Secondary/Tertiary] Faction)
```

**Examples:**
- `## Jordan Bardella, National Sovereignty / Anti-Islamist Current (Primary Faction)`
- `## Jean-Luc Mélenchon, Hard Left / Anti-System Current (Primary Faction)`
- `## Gabriel Attal, Centrist Republican / Laïcité Hardline (Primary Faction)`

**Hard rules:**
- The leader must be a **single identifiable person**, not a vague collective.
- Choose the most representative or currently prominent figure associated with that policy current.
- If a current is genuinely leaderless or historically diffuse, still select the single best-associated public figure; do not fall back to collective labels.
- Designation in parentheses must be one of: Primary Faction, Secondary Faction, or Tertiary Faction.

Tertiary factions may be treated more briefly and nested under their parent faction if appropriate.

---

## 8. Layout for a Party with Factions

For every party that meets the factional threshold, use this exact order:

```markdown
# [Party Name]

[Short opening description of the party as a whole – 2–4 sentences focusing on its overall stance toward personal autonomy / state restriction]

### Core 1A Relevant Policies / Elements
[4–8 concrete bullets listing the specific restrictions the party as a totality maintains or would introduce. Each bullet should name the policy area and the nature of the restriction.]

[Real summary paragraph for the party as a totality – normally 70–120 words – synthesising the restrictive profile]

### Why this produces Endos XX / Xenos XX (or holistic XX)
[2–4 substantive sentences linking the scores to the cumulative weight of the restrictions analysed, applying Negative-Only Weighting and any Endos/Xenos differential]

---

### Factions Inside the [Party Name]

| Faction                                    | Endos | Xenos | Designation          |
|--------------------------------------------|-------|-------|----------------------|
| ...                                        | ...   | ...   | Primary Faction      |
| ...                                        | ...   | ...   | Secondary Faction    |

[One short paragraph summarising how the internal factions pull the party’s overall Core 1A profile]

---

## [Leader], [Faction Name] (Primary Faction)
[Full-depth write-up following the same template as a unitary party]

## [Leader], [Faction Name] (Secondary Faction)
[Full-depth write-up]
```

The party-as-totality write-up comes **before** the individual faction write-ups and is never listed as one of the factions.

---

## 9. Layout for a Unitary Party (No Significant Factions)

```markdown
# [Party Name]

[2–4 sentence description of core goals and self-presentation, with emphasis on what restrictions it accepts or seeks]

### Core 1A Relevant Policies / Elements

* [Concrete restriction or policy element]
* [Concrete restriction or policy element]
* [Concrete restriction or policy element]
* [Concrete restriction or policy element]
* [Optional further bullets]

[Real summary paragraph – normally 70–120 words – synthesising the restrictive language, how it shapes the party’s goals, and the cumulative effect on personal autonomy]

### Why this produces Endos XX / Xenos XX (or holistic XX)
[2–4 substantive sentences linking the score(s) to the sources analysed, applying Negative-Only Weighting]
```

---

## 10. Depth Requirements for Every Party and Faction Write-up

The following minimums are non-negotiable.

### 10.1 Opening Description
2–4 substantive sentences stating the party’s or faction’s core goals, aims, and self-presentation, with explicit attention to its stance on state restriction of voluntary individual action.

### 10.2 Core 1A Relevant Policies / Elements Bullets
4–8 (occasionally more) bullets that:
- Name concrete policies or policy elements (speech, association, religious expression, movement, bodily autonomy, education content, etc.).
- Indicate whether the element is retained from the current era baseline, expanded, or newly proposed.
- Note inheritance from the master Scored Policies document where applicable.
- Flag any Endos/Xenos differential.

Abstract category labels alone (“supports free speech”, “tough on crime”) are non-compliant. Concrete characterisation of the restriction is required.

### 10.3 Summary Paragraph (Critical)
One coherent paragraph of **normally 70–120 words** that:
- Synthesises the restrictive profile.
- Explains the cumulative weight of the restrictions under Negative-Only Weighting.
- Notes any clear Endos/Xenos differential and its source.

**Hard rules:**
- Two-sentence versions are non-compliant.
- The paragraph must perform analytical synthesis; it is not a prose restatement of the bullets.
- This is the element most frequently delivered below standard. It must be checked before the document is considered finished.

### 10.4 Score Justification
2–4 substantive sentences that make the numerical score(s) transparent and defensible by reference to:
- The retained baseline restrictions.
- Any added or expanded restrictions.
- Inheritance from the master Scored Policies document.
- Application of the Endos/Xenos rule (or explicit statement that no split applies).
- Negative-Only Weighting (no credit for removals or “positive rights” language).

**(Core 1A)** Explicitly address whether the score reflects a broad restriction on the general population or a targeted differential against a stable outgroup.

---

## 11. Scoring Discipline **(Core 1A)**

- Scores measure only the cumulative weight of **direct restrictions** the party would maintain or introduce on voluntary individual actions.
- They are **not** measures of moral goodness, electability, organisational strength, policy success, or the quality of the party’s justifications.
- **Negative-Only Weighting is absolute**: removals of restrictions, expansions of “rights”, or liberalising language grant **no positive credit**. Only the presence of restrictions lowers the score.
- **Punishment vs Restriction**: Arrests, fines, prosecutions, and sentencing are discarded. Score only the underlying substantive restriction.
- **Process vs Restriction**: Licensing, notification, or bureaucratic processes are discarded unless they themselves constitute a direct prohibition or compulsion.
- **Chilling Effects / Self-Censorship**: Always discarded.
- **Endos/Xenos Split**: Apply only when there is a clear, stable, discretely targetable outgroup that receives markedly worse treatment under the party’s policies. Both scores use the same 0–100 Core 1A scale and bands.
- **Scored Policy Inheritance**: Always check the master Scored Policies document first. Inherit the score of any equivalent or closely equivalent element (with possible ±5 modifier if justified). Document the inheritance.
- **Score 4 Floor**: 4 is the practical minimum for real-world policies.
- Extreme low scores require clear evidence of multiple heavy restrictions (especially ideological/identity-based controls or system-protection measures applied broadly or differentially).

Typical interpretive bands (from the Core 1A slider definition):
- 90–100: Minimalist / near-anarchic (only direct harm protections)
- 70–89: High autonomy with limited paternalistic or betterment restrictions
- 50–69: Moderate restrictions (paternalism, early ideological controls, or significant speech/association limits)
- 30–49: Substantial ideological/identity-based or system-protection controls
- Below 30: Heavy multi-domain restrictions or strong differential targeting

---

## 12. Alphabetical Ordering and Completeness

- Parties appear in alphabetical order by commonly used name.
- All electorally or justificatorily significant parties should be included. When in doubt in multi-party systems, prefer inclusion over exclusion, provided each entry can be given proper depth.
- Regional parties may be grouped under a single heading only when their Core 1A restrictive profiles are sufficiently similar.
- Independent or loosely organised currents that lack a formal party structure but display a coherent restrictive pattern may be included under a clear descriptive label if they are analytically important.

---

## 13. Language and Analytical Standards

- Stay close to the actual policy language and concrete proposals of the party or faction.
- Distinguish formal rhetoric from operative restrictions when they diverge.
- Treat self-presentation as secondary evidence; the primary evidence is the set of restrictions the party would keep or add.
- Maintain analytical neutrality. The task is description and scoring of restrictions, not endorsement or condemnation.
- Generic or interchangeable text across different parties is a failure of analysis. Each entry must have distinctive concrete texture drawn from the party’s actual platform.
- Always reference inheritance from the master Scored Policies document where an equivalent exists.

---

## 14. Final Checklist Before Completion

Before considering a Core 1A political parties document finished, verify every item:

- [ ] Title and top-level parties table are present and correct (with Endos/Xenos columns where applicable)
- [ ] Broad summary characterises the overall Core 1A configuration of the system
- [ ] Parties are in alphabetical order
- [ ] Only real parties appear in the top-level table; factions appear only under their parent party
- [ ] Every faction that has a write-up is headed by a **single named person**
- [ ] Every party and every Primary/Secondary faction has: opening description, 4–8 concrete policy/restriction bullets, a real summary paragraph (≈70–120 words), and a multi-sentence score justification
- [ ] No summary paragraph is only two thin sentences
- [ ] Scores are consistent with the evidence, with Negative-Only Weighting, and with the Core 1A bands
- [ ] **(Core 1A)** Endos/Xenos rule is applied correctly or explicitly stated as inapplicable
- [ ] Scored Policy Inheritance has been checked and documented where used
- [ ] No section has been artificially shortened to reduce overall length
- [ ] Unitary parties and factionalised parties follow the correct respective layouts
- [ ] Punishment, process, and chilling-effect elements have been discarded

**If any item fails, the document is not finished.**

---

## 15. Explicit Instruction to Future Model Instances

You are required to follow the depth standards and Core 1A rules in this guide.

- Do not produce thin bullets, two-sentence summaries, or single-sentence score justifications.
- Do not prioritise keeping the total document short over meeting the analytical requirements of each section.
- Do not use collective or vague labels when a single named leader is required for a faction.
- Do not grant positive credit for removals of restrictions or “rights” language.
- Do not score punishment, process, or chilling effects.
- Always check the master Scored Policies document for inheritance before assigning a new score.
- If meeting the depth standard makes the document long, that is the correct outcome.
- Writing a compressed version first and expanding it only after correction is inefficient and violates the spirit of this guide.

Proper depth and strict application of the Core 1A rules on the first pass is the expected behaviour.

**End of Guide to Creating Political Parties Documents – Core 1A Version**
