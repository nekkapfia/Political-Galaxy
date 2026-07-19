# Guide to Creating a Political Parties Document for Any Country

This document provides a standardised method for producing a political parties analysis focused on sources of moral and political justification. The structure is deliberately generic so that it can be applied to any analytical axis or framework. Elements that are specific to the Cultural 1A axis are clearly marked **(Cultural 1A)**.

**This guide is binding on any instance of the model that produces or revises a political parties document.** Depth and analytical completeness take absolute priority over brevity, token-saving, or artificial compression. Producing thin, summary-level text when full analysis is required is a failure to follow this guide.

---

## 0. Overriding Instruction on Depth

Before any other rule, the following applies:

- **Proper depth is mandatory.** Every party and every significant faction must receive genuine analytical treatment, not placeholder or compressed text.
- **Artificial brevity is forbidden.** Do not shorten paragraphs, reduce bullet counts, or omit required elements in order to keep the overall document short.
- **Compression that forces later rework is a net waste.** Writing a thin version first and then expanding it later consumes more total resources than writing to the required depth on the first pass.
- **If a choice exists between a shorter response and a complete one, always choose completeness.**
- **Summary paragraphs must be real paragraphs** (normally 70–120 words). Two-sentence “summaries” are non-compliant.
- **Bullet lists must contain concrete justificatory language**, not abstract category labels alone.
- When in doubt about length, err on the side of greater depth and specificity.

Any future instance that produces under-depth text after reading this guide is violating an explicit instruction.

---

## 1. Purpose of the Document

The political parties document exists to:

- Identify the principal political parties (and, where relevant, significant internal factions) operating in a country.
- Analyse the dominant sources of moral and political justification used by each party or faction.
- Enable systematic comparison of justificatory profiles across parties within a country and across countries.
- Complement the corresponding era/timeline document without duplicating its chronological analysis.

The document is not a general encyclopaedia of party history, organisation, or electoral performance. It focuses on *how each party or faction justifies moral and political authority*.

---

## 2. Required Overall Structure

Every completed political parties document must contain the following elements in order:

1. **Title**
2. **Top-level Parties Table** (real parties only)
3. **Broad Summary** of the current party system on the relevant axis
4. **Individual Party Sections**, ordered alphabetically by party name
5. Within each major party that has significant internal differentiation:  
   - Faction table  
   - Short summary of how the factions shape the party  
   - Party-as-totality write-up  
   - Individual faction write-ups

Minor or unitary parties receive a single full write-up with no faction table.

---

## 3. Title Format

```
# Political Parties ([Country])
## [Axis Name] Analysis
```

**Example:**
```
# Political Parties (Great Britain)
## Cultural 1A Analysis
```

---

## 4. Top-level Parties Table

List **only real political parties** (not factions). Order alphabetically.

```markdown
| Party                                              | Final Score |
|----------------------------------------------------|-------------|
| Party A                                            | XX          |
| Party B                                            | XX          |
| ...                                                | ...         |
```

**(Cultural 1A)** Include a short “Source of Moral Authority” column only if it adds clarity; the detailed analysis belongs in the individual sections.

Rules:
- Factions never appear in this table.
- Scores must be consistent with the detailed write-ups that follow.
- The table is the authoritative list of parties treated in the document.

---

## 5. Broad Summary Paragraph(s)

Immediately after the table, write **1–2 substantial paragraphs** that characterise the overall configuration of the party system on the relevant axis.

**Depth standard:** The summary must give a reader a clear map of the main justificatory poles and the relative positions of the major parties. One thin sentence is non-compliant.

**(Cultural 1A)** Explicitly locate the main parties on the transcendent–mundane spectrum and note any extreme or distinctive profiles.

---

## 6. How to Decide Whether a Party Requires Factional Breakdown

Apply the following test:

A party requires an internal factional breakdown when:

- It contains two or more currents that differ materially in the *sources* of moral justification they treat as primary, **and**
- Those currents have durable organisational or intellectual expression (named leaders, recognisable language, recurring policy or rhetorical patterns).

Do **not** create factions for:
- Mere tactical or personal rivalries that do not track justificatory differences.
- Transient media labels without substantive justificatory content.
- Micro-currents too small to affect the party’s overall profile.

When in doubt, prefer fewer, clearer factions over a proliferation of minor ones.

**Maximal useful splitting rule:** Split as far as necessary to capture real justificatory differences, but no further.

---

## 7. Faction Naming and Leadership Rule (Mandatory)

Every faction that receives its own write-up **must** be headed in the following format:

```markdown
## [Single Named Person], [Faction Name] ([Primary/Secondary/Tertiary] Faction)
```

**Examples:**
- `## Kemi Badenoch, National / Populist Conservatives (Primary Faction)`
- `## Alexandria Ocasio-Cortez, Progressive Left, Justice Democrats (Primary Faction)`
- `## John McDonnell, Hard Left / Socialist Residual (Secondary Faction)`

**Hard rules:**
- The leader must be a **single identifiable person**, not a vague collective (“One-Nation residual leadership”, “the Soft Left”, etc.).
- Choose the most representative or currently prominent figure associated with that justificatory current.
- If a current is genuinely leaderless or historically diffuse, still select the single best-associated public figure; do not fall back to collective labels.
- Designation in parentheses must be one of: Primary Faction, Secondary Faction, or Tertiary Faction.

Tertiary factions may be treated more briefly and nested under their parent faction if appropriate.

---

## 8. Layout for a Party with Factions

For every party that meets the factional threshold, use this exact order:

```markdown
# [Party Name]

[Short opening description of the party as a whole – 2–4 sentences]

### Moral Justification
[4–6 concrete bullets for the party as a totality]

[Real summary paragraph for the party as a totality]

### Why this produces a final score of XX
[2–4 substantive sentences]

---

### Factions Inside the [Party Name]

| Faction                                    | Final Score | Designation          |
|--------------------------------------------|-------------|----------------------|
| ...                                        | ...         | Primary Faction      |
| ...                                        | ...         | Secondary Faction    |

[One short paragraph summarising how the internal factions pull the party’s overall justificatory profile]

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

[2–4 sentence description of core goals and self-presentation]

### Moral Justification

* [Concrete justificatory bullet]
* [Concrete justificatory bullet]
* [Concrete justificatory bullet]
* [Concrete justificatory bullet]
* [Optional further bullets]

[Real summary paragraph – normally 70–120 words – synthesising the language, how it shapes goals, and how the party presents itself]

### Why this produces a final score of XX
[2–4 substantive sentences linking the score to the sources analysed]
```

---

## 10. Depth Requirements for Every Party and Faction Write-up

The following minimums are non-negotiable.

### 10.1 Opening Description
2–4 substantive sentences stating the party’s or faction’s core goals, aims, and self-presentation (what is broken, what must be restored or achieved).

### 10.2 Moral Justification Bullets
4–6 (occasionally up to 7) bullets that:
- Capture the actual justificatory language used.
- Cover the key domains relevant to the party (e.g., nation, economy, justice, ecology, religion, sovereignty, competence).
- Indicate relative priority where possible.

Abstract category labels alone (“justice is important”, “popular sovereignty matters”) are non-compliant. Concrete characterisation is required.

### 10.3 Summary Paragraph (Critical)
One coherent paragraph of **normally 70–120 words** that:
- Synthesises the justificatory language.
- Explains how that language shapes the party’s/faction’s goals.
- Explains how the party/faction presents itself.

**Hard rules:**
- Two-sentence versions are non-compliant.
- The paragraph must perform analytical synthesis; it is not a prose restatement of the bullets.
- This is the element most frequently delivered below standard. It must be checked before the document is considered finished.

### 10.4 Score Justification
2–4 substantive sentences that make the numerical score transparent and defensible by reference to the relative weight of the sources analysed.

**(Cultural 1A)** Explicitly address the presence, partial presence, or absence of transcendent versus mundane sources.

---

## 11. Scoring Discipline **(Cultural 1A)**

- Scores measure only the relative weight of transcendent versus mundane sources of justification.
- They are not measures of moral goodness, electability, organisational strength, or policy success.
- Extreme scores (below 15 or above 85) require clear evidence of near-total dominance of one type of source.
- A party that uses justice or ecological language instrumentally while organising around popular sovereignty or competence should not receive a high transcendent score.
- A party that retains formal transcendent language while operating primarily on performance or consent should be scored according to operative, not merely formal, sources.

Typical bands:
- 0–20: Extremely strong mundane dominance
- 21–40: Clear mundane lean
- 41–60: Mixed
- 61–80: Clear transcendent lean
- 81–100: Extremely strong transcendent dominance

---

## 12. Alphabetical Ordering and Completeness

- Parties appear in alphabetical order by commonly used name.
- All electorally or justificatorily significant parties should be included. When in doubt in multi-party systems, prefer inclusion over exclusion, provided each entry can be given proper depth.
- Regional parties may be grouped under a single heading (e.g., “Regional Nationalist Parties (SNP + Plaid Cymru)”) only when their justificatory sources are sufficiently similar.
- Independent or loosely organised currents that lack a formal party structure but display a coherent justificatory pattern may be included under a clear descriptive label (e.g., “Generic Islamic / Muslim-Interest Independents”) if they are analytically important.

---

## 13. Language and Analytical Standards

- Stay close to the justificatory language actually used by the party or faction.
- Distinguish formal doctrine from operative justification when they diverge.
- Treat self-presentation as evidence: how a party describes what is broken and what it is restoring or achieving reveals its sources of authority.
- Maintain analytical neutrality. The task is description of justificatory sources, not endorsement or condemnation.
- Generic or interchangeable text across different parties is a failure of analysis. Each entry must have distinctive concrete texture.

---

## 14. Final Checklist Before Completion

Before considering a political parties document finished, verify every item:

- [ ] Title and top-level parties table are present and correct
- [ ] Broad summary characterises the overall justificatory configuration of the system
- [ ] Parties are in alphabetical order
- [ ] Only real parties appear in the top-level table; factions appear only under their parent party
- [ ] Every faction that has a write-up is headed by a **single named person**
- [ ] Every party and every Primary/Secondary faction has: opening description, 4–6 concrete bullets, a real summary paragraph (≈70–120 words), and a multi-sentence score justification
- [ ] No summary paragraph is only two thin sentences
- [ ] Scores are consistent with the evidence and with the axis scoring bands
- [ ] **(Cultural 1A)** Transcendent vs mundane balance is explicitly addressed
- [ ] No section has been artificially shortened to reduce overall length
- [ ] Unitary parties and factionalised parties follow the correct respective layouts

**If any item fails, the document is not finished.**

---

## 15. Explicit Instruction to Future Model Instances

You are required to follow the depth standards in this guide.

- Do not produce thin bullets, two-sentence summaries, or single-sentence score justifications.
- Do not prioritise keeping the total document short over meeting the analytical requirements of each section.
- Do not use collective or vague labels when a single named leader is required for a faction.
- If meeting the depth standard makes the document long, that is the correct outcome.
- Writing a compressed version first and expanding it only after correction is inefficient and violates the spirit of this guide.

Proper depth on the first pass is the expected behaviour.
