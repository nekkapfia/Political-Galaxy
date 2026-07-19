# Guide to Creating a Historical Timeline Document for Any Country
## Core 1A (Personal Autonomy) Version

This document provides a standardised method for producing a historical timeline analysis of a country’s direct state restrictions on personal autonomy from a defined starting point to the present (or to a defined end point). The structure is deliberately parallel to the generic/Cultural 1A guide so that the same overall document architecture can be used across axes. Elements that are specific to the Core 1A axis are clearly marked **(Core 1A)**.

**This guide is binding on any instance of the model that produces or revises a Core 1A timeline document.** Depth and analytical completeness take absolute priority over brevity, token-saving, or artificial compression. Producing thin, summary-level text when full analysis is required is a failure to follow this guide.

---

## 0. Overriding Instruction on Depth

Before any other rule, the following applies:

- **Proper depth is mandatory.** Every section that requires analysis must contain genuine analytical content, not placeholder or compressed text.
- **Artificial brevity is forbidden.** Do not shorten paragraphs, reduce bullet counts, or omit required elements in order to keep the overall document short.
- **Compression that forces later rework is a net waste.** Writing a thin version first and then expanding it later consumes more total resources than writing to the required depth on the first pass.
- **If a choice exists between a shorter response and a complete one, always choose completeness.**
- **Summary paragraphs must be real paragraphs** (normally 70–120 words). Two-sentence “summaries” are non-compliant.
- **Bullet lists must contain concrete restriction language**, not abstract category labels alone.
- When in doubt about length, err on the side of greater depth and specificity.

Any future instance that produces under-depth text after reading this guide is violating an explicit instruction.

---

## 1. Purpose of the Document

The timeline document exists to:

- Divide a country’s modern political history into analytically coherent eras defined by shifts in the set, intensity, or targeting of direct restrictions on personal autonomy.
- Identify the concrete policies and legal instruments that restricted (or, under Negative-Only Weighting, reduced the weight of restrictions on) voluntary individual action in each era.
- Track continuity and change in the cumulative restrictive weight over time.
- Allow systematic comparison of Core 1A trajectories across countries and across historical regimes.

The document is **not** a general political history. It focuses specifically on *what direct restrictions the state imposed, maintained, or intensified* on speech, association, movement, bodily autonomy, religious expression, education content, and related domains of voluntary individual action.

**(Core 1A)** Scoring and analysis follow the locked Core 1A rules: Direct Restriction Only, Negative-Only Weighting, Punishment vs Restriction, Process vs Restriction discarded, Chilling Effects discarded, Score 4 Floor, Scored Policy Inheritance from the master Scored Policies document, and Endos/Xenos Split only when a clear, stable, discretely targetable outgroup receives markedly worse treatment.

---

## 2. Required Overall Structure

Every completed Core 1A timeline document must contain the following elements in order:

1. **Title**
2. **Introductory Overview** (1–3 full paragraphs)
3. **Converted Final Scores Table**
4. **Individual Era Sections** (one for each defined era)
5. (Optional) Brief concluding note on long-term trajectory

Omitting any required element, or reducing it below the depth standards set out below, renders the document incomplete.

---

## 3. Title Format

```
# Core 1A: Eras of Personal Autonomy in [Country] ([Start Year]–[End Year or Present])
```

**Examples:**
- `# Core 1A: Eras of Personal Autonomy in France (1945–Present)`
- `# Core 1A: Eras of Personal Autonomy in the United States (1945–Present)`
- `# Core 1A: Eras of Personal Autonomy in the People’s Republic of China (1949–Present)`

---

## 4. Introductory Overview – Depth Requirements

Write **1–3 full paragraphs** that:

- Summarise the country’s overall trajectory on Core 1A across the whole period (high autonomy → tightening, liberalisation → re-restriction, persistent dual structure, etc.).
- Identify the major long-term pattern in the cumulative weight of direct restrictions.
- Note any extreme peaks of restriction, recoveries, or persistent Endos/Xenos differentials.
- Avoid detailed era-by-era description (that belongs in the individual sections).

**Depth standard:** The overview must be substantial enough to give a reader who knows nothing about the country a clear sense of the long-term autonomy trajectory. One thin paragraph is normally insufficient for complex countries.

**(Core 1A)** Explicitly characterise the movement of the Base Score (and any Endos/Xenos scores) and the principal drivers (hate-speech expansions, emergency powers, religious-expression controls, online content rules, movement restrictions, etc.).

---

## 5. Converted Final Scores Table

Immediately after the overview, insert a markdown table:

```markdown
## Converted Final Scores

| Era | Period          | Base / Endos Score | Xenos Score (if applicable) | Key Drivers |
|-----|-----------------|--------------------|-----------------------------|-------------|
| Era 1 | YYYY–YYYY       | XX                 | XX / N/A                    | Short characterisation of the main restrictions or their reduction. |
| Era 2 | YYYY–YYYY       | XX                 | XX / N/A                    | Short characterisation of the main restrictions or their reduction. |
| ... | ...             | ...                | ...                         | ... |
```

Rules for the table:

- Every era that appears later in the document must appear in the table.
- The “Key Drivers” column should be a concise (one-line) summary of the principal restrictive instruments or their removal, not a full analysis.
- Scores must be consistent with the detailed justifications given in the era sections.
- Use Endos/Xenos columns only when a clear, stable outgroup differential exists in that era; otherwise mark Xenos as N/A and report a single Base/Endos score.

**(Core 1A)** Scores run from 0 (extreme multi-domain restriction) to 100 (near-anarchic minimal restriction). Typical interpretive bands (from the Core 1A slider):
- 90–100: Minimalist / near-anarchic (only direct-harm protections)
- 70–89: High autonomy with limited paternalistic or betterment restrictions
- 50–69: Moderate restrictions (paternalism, early ideological controls, or significant speech/association limits)
- 30–49: Substantial ideological/identity-based or system-protection controls
- Below 30: Heavy multi-domain restrictions or strong differential targeting

---

## 6. Defining Eras

### 6.1 Principles for Periodisation

Eras should be defined by **durable shifts in the set, intensity, or targeting of direct Core 1A restrictions**, not merely by changes of government, election results, or external events.

An era boundary is justified when there is a durable and observable change in:

- Which concrete restrictions are active (new statutes, major expansions, or significant repeals).
- The intensity or scope of existing restrictions (e.g., from narrow application to broad ideological enforcement).
- The appearance or disappearance of a stable Endos/Xenos differential.

Short-term crises that do not produce lasting change in the restrictive architecture should not create new eras. Temporary emergency measures may be scored inside an existing era or carved out as a short block only when their weight is large enough to move the Base Score by more than ~0.5 points for a sustained period (see COVID protocol).

### 6.2 Number and Length of Eras

- Most modern countries from 1945 (or 1917, 1949, etc.) to the present will have between 5 and 9 eras.
- Very short or highly intense regimes may have only 1–2 eras.
- Long regimes with internal evolution should be broken into multiple analytically distinct phases when the restrictive profile changes materially.

### 6.3 Naming Eras

Era titles should be descriptive and neutral, combining a chronological label with a short characterising phrase:

```
## **YYYY–YYYY: [Descriptive Title] – Base/Endos Score: XX (Xenos: XX / N/A)**
```

---

## 7. Structure of Each Individual Era Section – Depth Requirements

Every era section must contain the following subsections in order. **Each has a non-negotiable minimum depth.**

### 7.1 Opening Description (2–4 substantive sentences)

State what the period was and what its dominant political or legal project was with respect to personal autonomy. Do not yet analyse individual restrictions in detail.

**Depth standard:** Must give a clear orientation. One sentence is almost always insufficient.

### 7.2 Core 1A Relevant Restrictions / Elements – Expanded Analysis

Use a level-3 heading:

```markdown
### Core 1A Relevant Restrictions / Elements – Expanded Analysis
```

Provide **4–8 bullet points** that identify the concrete restrictions (or their material reduction) actually operative in the period. Each bullet must:

- Name a specific statute, policy, or administrative practice.
- Indicate whether it was newly introduced, expanded, retained from the previous era, or narrowed/repealed.
- Note inheritance from the master Scored Policies document where applicable.
- Flag any Endos/Xenos differential.
- Stay close to the actual legal or administrative language where possible.

**Depth standard:** Four thin or generic bullets are non-compliant. The bullets must collectively give a reader a precise picture of the restrictive architecture of the era.

**(Core 1A)** Explicitly apply Direct Restriction Only. Discard punishment, process, and chilling-effect elements. Note Negative-Only Weighting: removals raise the score only by reducing negative weight; they never generate positive credit.

### 7.3 Summary Paragraph – Critical Depth Requirement

After the bullets, write **one coherent paragraph of normally 70–120 words** that:

- Synthesises the restrictive profile of the era.
- Explains the cumulative weight under Negative-Only Weighting.
- Notes any clear Endos/Xenos differential and its source.
- Draws the bullets together into an analytical whole.

**This paragraph is mandatory and is the most frequently under-delivered element.**

**Hard rules:**
- Two-sentence “paragraphs” are non-compliant.
- The paragraph must do real analytical work; it is not a restatement of the bullets in prose form.
- If the paragraph is shorter than approximately 70 words or fails to synthesise, it must be rewritten before the document is considered finished.

### 7.4 Key Shift

One or two sentences, introduced by the bold label:

```markdown
**Key Shift:** 
```

State the most important change in the restrictive architecture that defines the beginning of this era relative to the previous one (or that defines the era as a whole if it is the first).

### 7.5 Why This Produces a Final Score of XX

Use a level-3 heading:

```markdown
### Why this produces a final score of XX (Endos XX / Xenos XX if split)
```

Write **2–4 substantive sentences** that directly link the score(s) to the cumulative weight of the restrictions analysed above. The justification must be consistent with the Core 1A scoring bands, Negative-Only Weighting, and any Endos/Xenos differential.

**Depth standard:** A single vague sentence is non-compliant. The justification must make the scoring decision transparent and defensible by reference to specific restrictions and inheritance where used.

**(Core 1A)** Explicitly address whether the score reflects broad restrictions on the general population or a targeted differential against a stable outgroup.

---

## 8. Scoring Discipline **(Core 1A)**

- Scores measure only the cumulative weight of **direct restrictions** on voluntary individual action.
- They are **not** measures of moral goodness, regime success, electability, or the quality of justifications offered for the restrictions.
- **Negative-Only Weighting is absolute**: removals of restrictions, expansions of “rights”, or liberalising language grant **no positive credit**. Only the presence of restrictions lowers the score; their removal raises the score solely by reducing negative weight.
- **Punishment vs Restriction**: Arrests, fines, prosecutions, and sentencing are discarded. Score only the underlying substantive restriction.
- **Process vs Restriction**: Licensing, notification, or bureaucratic processes are discarded unless they themselves constitute a direct prohibition or compulsion.
- **Chilling Effects / Self-Censorship**: Always discarded.
- **Endos/Xenos Split**: Apply only when there is a clear, stable, discretely targetable outgroup that receives markedly worse treatment under the era’s policies. Both scores use the same 0–100 Core 1A scale.
- **Scored Policy Inheritance**: Always check the master Scored Policies document first. Inherit the score of any equivalent or closely equivalent element (with possible ±5 modifier if justified). Document the inheritance.
- **Score 4 Floor**: 4 is the practical minimum for real-world policies.
- Extreme low scores require clear evidence of multiple heavy restrictions (especially ideological/identity-based controls or system-protection measures applied broadly or differentially).
- COVID and similar temporary but sweeping blocks are treated as single-era blocks per the established UK/Germany/France protocol when their weight is large enough to move the score materially.

---

## 9. Language and Analytical Standards

- Stay as close as possible to the actual legal and administrative language of the restrictions.
- Avoid anachronistic projection of later categories.
- Distinguish formal statute from operative enforcement intensity when they diverge, but score only the direct restriction itself.
- Treat self-presentation as secondary; the primary evidence is the set of restrictions that were in force.
- Maintain neutrality of tone. The task is analytical description and scoring of restrictions, not moral evaluation of regimes or parties.

**Depth implication:** Generic or boilerplate language is a failure. Each era’s restrictive profile must be rendered with enough concrete texture that a reader can distinguish it from neighbouring eras.

---

## 10. Handling Special Cases

### 10.1 Single-Party or Highly Centralised Systems
Focus on the ruling party or leadership’s restrictive framework. Note subordinate entities only if they possess distinct and consequential restrictive logics.

### 10.2 Short, Intense Regimes
It is acceptable to have only one or two eras. Do not artificially multiply periods. Depth within the existing eras remains mandatory.

### 10.3 Occupied, Puppet, or Collapsing Regimes
Note the degree of autonomy. Restrictions that are merely residual or externally imposed should be scored and described accordingly.

### 10.4 Highly Plural or Contested Systems
When multiple strong restrictive currents coexist, the era score should reflect the overall balance of the political system, while the text notes the principal competing currents. Apply Endos/Xenos only when a clear outgroup differential is present at the system level.

### 10.5 Temporary Emergency or Crisis Blocks (including COVID)
Treat as a single block when the cumulative weight of movement, association, and bodily-autonomy restrictions is large enough to justify a distinct era or a clearly flagged intra-era adjustment. Follow the established COVID protocol used in UK, Germany, and France documents.

---

## 11. Final Checklist Before Completion

Before considering a Core 1A timeline document finished, verify every item:

- [ ] Title follows the standard Core 1A format
- [ ] Introductory overview is 1–3 substantial paragraphs and characterises the long-term autonomy trajectory
- [ ] Converted Final Scores table is complete and consistent with the era sections (including Endos/Xenos where applicable)
- [ ] Every era has a clear restrictive-architecture rationale for its boundaries
- [ ] Every era contains: opening description, 4–8 concrete restriction bullets, a real summary paragraph (≈70–120 words), Key Shift, and a multi-sentence score justification
- [ ] No summary paragraph is only two thin sentences
- [ ] Scores are consistent with the evidence, with Negative-Only Weighting, and with the Core 1A bands
- [ ] **(Core 1A)** Endos/Xenos rule is applied correctly or explicitly stated as inapplicable
- [ ] Scored Policy Inheritance has been checked and documented where used
- [ ] Punishment, process, and chilling-effect elements have been discarded
- [ ] Language remains analytical, concrete, and close to the actual restrictive instruments
- [ ] No section has been artificially shortened to reduce overall length

**If any item fails, the document is not finished.**

---

## 12. Relationship to Party Sections

This guide covers **era / timeline documents** only. Political party or faction analyses are separate documents and follow the Core 1A Political Parties guide (party totality + optional faction tables + individual faction write-ups). Era documents and party documents may cross-reference each other but should not be merged into a single file.

---

## 13. Explicit Instruction to Future Model Instances

You are required to follow the depth standards and Core 1A rules in this guide.

- Do not produce thin bullets, two-sentence summaries, or single-sentence score justifications.
- Do not prioritise keeping the total document short over meeting the analytical requirements of each section.
- Do not grant positive credit for removals of restrictions or “rights” language.
- Do not score punishment, process, or chilling effects.
- Always check the master Scored Policies document for inheritance before assigning a new score.
- If meeting the depth standard makes the document long, that is the correct outcome.
- Writing a compressed version first and expanding it only after correction is inefficient and violates the spirit of this guide.

Proper depth and strict application of the Core 1A rules on the first pass is the expected behaviour.

**End of Guide to Creating Historical Timeline Documents – Core 1A Version**
