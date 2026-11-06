# Foundation review — synthesis and Devil’s Advocate checkpoint 2

Reviewer: hospital-safety/source-verification agent. Date: 2026-11-06.

**Verdict: REVISE before formal drafting.** No critical claim of safety approval, fabricated clinical measurement, or hidden ground-truth detector input was found in the inspected foundation. The required revisions concern inferential traceability and the bounds of the synthetic experiment. This verdict is a research-foundation assessment; it does not approve a device, trial or hospital deployment.

## Material inspected

`00_scope.md` through `05_style_guide.md`; `qa_logs/checkpoint_1.md`; all three source dossiers; `state.json`; optical emulator and verifier source; result/verification structure and scenario summaries. No new external literature was searched for this review. This review inspected code and stored outputs rather than independently rerunning the emulator. The safety dossier remains this reviewer’s prior contribution; its source checks are not presented as an independent second audit of that dossier.

## Corrections required before drafting

### F1 — Close the comparative-scope gap

The scope asks about BLE/AoA/UWB, while the evidence and recommendation primarily establish general BLE feasibility and compare it with optical identity. Add one explicit statement in `00_scope.md`, `02_evidence_table.md` and `04_section_contracts.md`: UWB and BLE/AoA remain technical comparators whose hardware, operational cases and performance have not been established by this narrowed corpus. Either supply the missing primary evidence before treating them as evaluated alternatives, or retain them as unanswered questions. Do not imply a completed technology-ranking study.

**Severity: major. Acceptance:** the final report cannot rank UWB against BLE on accuracy, cost or clinical safety from the present corpus.

### F2 — Make the recommendation’s inferential chain explicit

`03_argument_map.md` calls BLE the more pragmatic operational candidate. Explain that this is an engineering proposal informed by visibility limitations and real BLE use, not measured superiority over optics or other radios. The corpus does not provide a matched comparison of Consta architectures, a cost model or hospital-wide room accuracy. A useful bounded formulation is: “BLE is the next operational candidate to evaluate for frequently occluded mobile assets; optical identity remains a separate passive P&D path.”

**Severity: major. Acceptance:** each recommendation states its mechanism, supporting source, unmeasured criteria and next falsifiable experiment.

### F3 — Promote coexistence counterevidence into the central map

The NHS MKUH event is accurately limited in C6 and in the safety dossier but needs an explicit row in `02_evidence_table.md` and a named operational counterargument in `03_argument_map.md`. It concerns BLE/Wi-Fi coexistence affecting Wi-Fi-dependent medical devices and restricting RTLS rollout; it is not evidence of MRI artifacts, machine damage or patient harm. Preserve this distinction in the final synthesis. The general NHS BLE infrastructure guidance and this event are not contradictory: resistance mechanisms do not establish immunity in every deployment.

**Severity: major. Acceptance:** the central evidence map includes both feasible use and observed failure, without shifting the latter into a distant disclaimer.

### F4 — Bind synthetic results to their exact image model

Add to the emulation section contract and canon:

- `small`/`tiny` are downsampled then upsampled images, not a physical camera-distance experiment.
- The elliptical normalization is an approximation; the tested stronger perspective scene was rejected. Do not call this projective robustness.
- The held-out seed changes transforms/noise on the same code family and renderer. It is not an independent camera, different marker family or field validation.
- The code’s negative corpus includes selected patterns/empty scenes, not a representative hospital-background false-positive test.
- The rotation/reflection audit establishes separation in a discrete dictionary. Accepted bit-error policy concerns decoded bits after geometry/sampling; it does not bound arbitrary optical corruption.
- No exhaustive corrupt-bit, perspective or occlusion claim follows from the chosen test samples. A passing “one-bit change” assertion uses selected perturbations, not every possible camera error.

**Severity: major. Acceptance:** result statements name scenario definitions; no physical-distance, general false-positive or universal error-correction claim appears.

### F5 — Preserve mobile-assembly and fixed-scanner distinction

The proposal to catalogue fixed scanners separately is sound as a data distinction. It does not eliminate tagged mobile pumps/monitors/ventilators entering the MR workflow. Keep the transport/assembly issue in the architecture itself, not just a caution box. A software exclusion zone is not a physical barrier, and a medical device’s MR Conditional label does not validate an added tag. The layout/fields and reader installation still require local assessment.

**Severity: major if omitted from final architecture; presently acknowledged in foundation. Acceptance:** a proposed workflow explicitly handles removal/exclusion, identity continuity, stale location and missed crossings without claiming they are validated safeguards.

### F6 — Carry evidence access and commercial participation into synthesis

The international dossier distinguishes full-text access, institutional abstracts, search-index-only passages, procurement records and supplier participation. The formal report must retain that qualification at least in a source matrix/methods note, especially for Lund and UC Davis. Evidence of deployment at a source’s documented date is not proof of current deployment, effectiveness or offline operation. A cloud-containing case can support the use case while contradicting an offline inference.

**Severity: minor while source notes are available; major if erased during drafting. Acceptance:** no upgrade of access level, study maturity or independence.

## Eight-dimension score status

The parent requested an eight-dimension rubric, but its dimension names and anchors were not present in the inspected foundation or in the loaded deep-research skill. The reviewer requested the exact rubric. To avoid fabricating a canonical scoring system, numerical scoring is pending binding to that rubric. No mean or aggregate has been calculated. The qualitative assessment above is complete and supports the REVISE verdict.

## Strengths that should survive revision

The foundation separates ID assignment, optical decoding, localization and safety. It preserves direct source URLs, mixed architectures and limits of institutional/vendor evidence. It records negative synthetic results rather than hiding perspective/occlusion rejection. It does not call the custom tag novel, clinically validated or a replacement for professional screening. The no-QR preference is interpreted as a format/workflow requirement, while the proposed visual identifier is honestly described as machine-readable coding.

## Checkpoint disposition

Proceed to composition only after F1–F4 are incorporated into the foundation or explicitly dispositioned with a defensible narrowed scope. F5–F6 are carry-forward constraints for the formal draft and final Devil’s Advocate checkpoint. No user approval is requested by this review; the required changes are within the authorized research scope.

# Recheck after foundation corrections — checkpoint 2 disposition

The parent supplied the exact rubric at `/Users/matheusbgodoi/.claude/skills/nature-proposal-writer/references/evaluation-rubric.md`; its companion `research-anti-slop.md` was also read. The eight dimensions below use that rubric, adapted from proposal writing to the present directed engineering research foundation. These are subjective reviewer ratings, not measured quantities, calibrated probabilities or clinical evidence. Dimensions were assessed separately; no mean was calculated by this reviewer.

The revised canon, evidence table, argument map and experiment README were re-read. Technical Bluetooth SIG direction-finding and FiRa UWB references now bound the mechanism comparison; they do not create hospital UWB validation. The main map now retains MKUH coexistence counterevidence. The argument distinguishes candidate preference from measured superiority. Synthetic scale/perspective and same-renderer limitations are explicit in the argument and experiment documentation.

| Dimension | Ordinal rating /10 | Basis and remaining boundary |
| --- | --- | --- |
| Research-question clarity | 9 | Dedicated scope and precise identification/localization/LAN questions; physical validation remains a separate next step. |
| Scientific tension | 9 | Concrete engineering conflict between visibility-dependent passive identity and RF coexistence/zone constraints, rather than a generic literature gap. |
| Evidence match | 8 | Published findings, source types, inference and synthetic results are separated; partial access for some cases limits strength. No outcome transfer to Consta. |
| Logic chain | 8 | The BLE preference now traces to mechanism/use cases and a proposed next test; technical AoA/UWB comparison is explicitly weaker than deployment evidence. |
| Method feasibility | 8 | Synthetic pipeline is reproducible from supplied code/seeds, with pixels separated from scoring truth; physical camera and clinical protocols remain undeveloped and explicitly excluded from claimed results. |
| Specific contribution | 8 | Concrete contribution is a finite identity demonstration plus architecture/validation decision framework, not novelty of fiducials or a hospital-ready invention. |
| Risk boundaries | 9 | Failed scenes, unknown environments, MR mobile assemblies, coexistence and internet/licensing caveats are retained; fallback and rejection are explicit. |
| Language quality | 8 | Clear and bounded terminology; foundation remains modular working notes rather than polished prose, which is appropriate before composition. Minor placement/formatting issues remain. |

**Rechecked verdict: PASS for formal drafting of a bounded research/engineering report.** This clears the research checkpoint only. It does not approve hospital safety, a pilot, clinical use or a device.

Disposition of earlier findings:

- **F1 addressed:** AoA/UWB are technical comparators; lack of sufficient verified hospital UWB cases is explicit. Do not upgrade this during composition.
- **F2 addressed:** operational BLE preference is an inference without measured superiority in cost, coverage or room accuracy.
- **F3 addressed:** MKUH coexistence counterevidence is now centrally visible with the correct limit: no inferred patient injury or MRI artifact.
- **F4 addressed:** argument map plus experiment README bind reduced/upsampled images, failed strong perspective, shared renderer and finite corpus. Carry the same language into the formal report.
- **F5/F6 remain mandatory carry-forward constraints:** mobile MR Conditional assemblies and source-access/COI limitations are not optional polish.

Minor editorial cleanup before/while composing: remove the blank line that splits the evidence table before the new coexistence row; move C7/C8 from below “Questões abertas” to the factual canon section. These do not change the scientific verdict.

Recommended stage: proceed to an internal formal draft, then editorial/integrity and final Devil’s Advocate checkpoint. Do not relabel the current research foundation as a finished clinical validation report.
