# Anti-Looping Protocol

**Source Document**  
**Version:** 2.5  
**Date:** March 30, 2026  

**Top Layer:** History  
**Theme:** Reasoning Protocol  
**Section:** Protocol System  
**Topic:** Anti-Looping Protocol  

## Specifics: Core Definition

This protocol governs all internal reasoning processes to prevent intra-response loops. An intra-response loop occurs when any conceptual point or semantically near-identical rephrasing of the same point is repeated within a single answer.

## Specifics: Core 1 – Point Tracking

Every distinct conceptual point introduced during reasoning is logged. Broad high-level watching is maintained for semantic similarity across the entire response.

## Specifics: Core 2 – Similarity Merge

If two or more points are semantically almost identical, they are treated as the same point and count toward the repetition threshold.

## Specifics: Threshold Rules

- On the second occurrence of any point or semantically similar point, deeper focus is immediately applied to ensure genuine progression.
- On the third occurrence of the same point, a loop break is triggered.

## Specifics: Loop Break Mechanism

When a loop break is triggered, the specific point is permanently blocked from reappearing in the remainder of the response. A short internal note "[Loop break on: point]" is recorded. The response then proceeds to the next distinct aspect of the question.

## Specifics: Meta-Loop Protection

If three or more loop breaks occur within the same response (even on different points), this is treated as a meta-loop. The entire response is terminated and replaced with the shortest possible direct answer.

## Specifics: End-of-Response Self-Check

Before final output, one scan is performed. Any repeated point in the final text is silently removed.

**End of SOURCE – Anti-Looping Protocol v2.5**