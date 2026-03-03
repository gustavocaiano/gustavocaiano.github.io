# Implementation Plan — Portfolio Hireability + Messaging Refresh

## 1) Problem framing

### Objective
Reposition the existing static portfolio to improve hiring conversion for **Laravel full-stack roles** while communicating a **pragmatic AI-first approach** (AI-assisted delivery + verification/reliability, no hype), using only truthful, supportable claims.

### Why now
Current copy is broad/generalist and under-communicates role fit, delivery style, and credibility signals for hiring managers scanning quickly.

### Constraints
- Keep the site honest: no fabricated metrics, outcomes, or titles.
- Keep the Projects section mostly as-is (no large case-study expansion required).
- Scope-lock work into small executable batches.
- Preserve current visual language and bilingual support (EN/PT).
- QA is read-only and validates against Dev-reported verification output.

### Done criteria
- Hero and top sections clearly state: Laravel full-stack focus + pragmatic AI-first engineering.
- Messaging emphasizes reliability/verification (tests, review, observability mindset) over AI hype.
- Work/Services copy is outcome-oriented but factual and conservative.
- EN/PT translation parity is maintained for all edited/new strings.
- Contact intent options include Laravel role/collaboration-relevant subjects.
- Existing projects list remains functionally unchanged.

## 2) Assumptions
- The current role details at NovaForensic are accurate and can be described qualitatively without new sensitive details.
- No CMS/build pipeline exists; edits are direct in static files.
- English and Portuguese remain the only supported languages.
- No new external dependencies are required.

## 3) Codebase context
- `index.html`: Section structure and all content placeholders via `data-translate` keys.
- `translations.js`: Source of truth for EN/PT copy and contact subject options.
- `script.js`: Initializes language system and populates contact subjects from translation keys.
- `styles.css`: Existing visual system and reusable card/section styles; can be extended for any lightweight proof/value blocks.

Current convention: copy should primarily live in `translations.js`; `index.html` should reference keys instead of hardcoded text when possible.

## 4) Proposed design
- Keep information architecture intact (Hero → About → Skills → Experience → Services → Projects → Contact) to minimize risk.
- Refocus messaging in place rather than redesigning layout:
  - Hero: explicit value proposition for Laravel full-stack hiring.
  - About: concise positioning statement on shipping robust web products with AI-assisted workflows and verification discipline.
  - Skills: narrow emphasis to Laravel/PHP ecosystem + full-stack delivery + pragmatic AI engineering practices.
  - Experience: rewrite job description toward ownership, delivery, and reliability responsibilities (factual, non-inflated).
  - Services/Help: align to hiring and contract language (Laravel feature delivery, modernization, AI-assisted productivity with guardrails).
  - Projects intro: keep concise, frame as representative public work (no forced extra examples).
  - Contact subjects: include Laravel role/collaboration intents to reduce friction.
- Add minimal visual support only if needed (e.g., compact “working style” chips/list), avoiding structural churn.

## 5) Contracts and interfaces
- Translation contract:
  - Every `data-translate` key used in `index.html` must exist in both `translations.en` and `translations.pt`.
  - Any new key added for messaging must be mirrored EN/PT in the same commit.
- Contact subject contract:
  - `script.js` datalist population must continue to render valid localized options from translation keys.
- Content contract:
  - No quantitative claims unless explicitly verifiable from user-provided evidence.
  - Language for AI positioning must describe process (“AI-assisted + human verification”) rather than unprovable outcomes.

## 6) Risks and tradeoffs
- **Risk: over-claiming impact** without evidence.
  - Mitigation: use qualitative, responsibility-based wording.
- **Risk: translation drift** between EN/PT.
  - Mitigation: paired edits and QA key-by-key parity review.
- **Risk: copy edits break UX** (overflow/line wraps on mobile).
  - Mitigation: targeted responsive review in QA criteria.
- **Tradeoff: limited project evidence expansion** by request.
  - Impact: messaging must carry more of the proof burden in hero/about/experience.

## 7) Dev checklist

### Batch 1 — Messaging baseline (copy-only)
1. Update high-impact EN/PT copy keys in `translations.js`:
   - `title`, `subtitle`, `aboutText`, `skillWebText`, `skillArchitectureText`, `skillAI`/`skillAIText`, `skillToolsText`, `jobDescription`, `personalProjects`, `personalProjectsText`, `softwareConsulting`, `softwareConsultingText`, `projectsShowcaseIntro`, `jobOpportunity`, `generalInquiry`.
2. Keep claims conservative and factual; avoid unverifiable numbers.
3. Ensure both language objects contain identical edited key set.
4. Run verification command and report output: `node --check script.js && node --check translations.js`.

Expected files changed (Batch 1):
- `translations.js`

### Batch 2 — Structural messaging cues in markup
1. Update `index.html` section labels/inline fallback text where needed to match new positioning (still using translation keys).
2. Add one compact “working style”/“delivery approach” content block (if missing) near About or Experience, wired through `data-translate` keys.
3. Keep Projects list links/count unchanged; only adjust framing copy if needed.
4. Preserve accessibility attributes and existing anchor/navigation behavior.
5. Re-run verification command and report output: `node --check script.js && node --check translations.js`.

Expected files changed (Batch 2):
- `index.html`
- `translations.js`

### Batch 3 — Lightweight style support (only if required by Batch 2)
1. Add minimal CSS for any newly introduced block/chips in `index.html`.
2. Ensure mobile readability (no clipped text, no overflow in cards).
3. Do not alter global theme direction or introduce new dependencies.
4. Re-run verification command and report output: `node --check script.js && node --check translations.js`.

Expected files changed (Batch 3):
- `styles.css`

### Batch 4 — Contact intent polish
1. Ensure contact subject options and labels reflect Laravel hiring/collaboration intents in EN/PT (via `translations.js`; update `script.js` only if new keys require logic changes).
2. Confirm subject datalist still populates correctly after language switch.
3. Re-run verification command and report output: `node --check script.js && node --check translations.js`.

Expected files changed (Batch 4):
- `translations.js`
- `script.js` (only if needed)

## 8) QA checklist (read-only release gate)
1. Validate scope per batch by checking only expected files changed in Dev report; fail if unexpected files are modified.
2. Confirm Dev included verification output for `node --check script.js && node --check translations.js`; fail if output missing or shows syntax errors.
3. Review `translations.js` parity: every edited/new EN key has PT counterpart with aligned meaning.
4. Review `index.html` messaging areas (hero/about/experience/services/contact subjects) for Laravel full-stack focus and pragmatic AI-first tone (AI-assisted + verification), without hype claims.
5. Verify Projects section remains structurally unchanged (same link set/count unless explicitly justified in Dev report).
6. Verify mobile-safe copy fit by inspecting class usage and text length hotspots in changed sections; fail on obvious overflow-risk patterns.

## Open questions that would block shipping
- None blocking for implementation.
- Optional (non-blocking) input that would improve credibility copy: 1–2 verified impact statements from current role that can be safely published.
