# Final editorial and source review

Date: 2026-11-06. Reviewer: tracking/source-verification subagent. Target: `exports/proposal_final.md`. Read full report, rubric and anti-slop reference, international source register, previous source-verification log, and optical review. No report/code edits made.

## Verdict: PASS

The report is suitable for delivery as a bounded research report and next-proof-of-concept proposal. It is not suitable for representation as a clinical approval, device specification or validated hospital product; the report states those boundaries clearly. No mandatory factual correction was identified in the international cases or clinical-source interpretation. Source-review pass does not independently certify the numerical emulator results; those have separate optical/numerical audit artifacts.

## Case/source traceability

| Report reference | Check against source and register | Result |
| --- | --- | --- |
| R3 Johns Hopkins | RF+IR, mobile pumps, care areas/corridors, retrospective study and redistribution intervention. Institutional abstract and original article support the narrow case statement. The report does not mislabel inventory-based tracking coverage as room accuracy or transfer outcome size. | PASS |
| R4 Duke | Institutional abstract supports controlled IR/RF tracking and room-localization limitations. Historical scope is explicit. | PASS |
| R5 UC Davis | Hospital RFP is maintenance of an installed mixed-use RTLS estate, not an effectiveness trial or proof every tag is BLE. Reissue year is correctly described as 2026. The source-access caveat is retained. | PASS |
| R6 Mid Cheshire | NHS institutional case explicitly names cloud Cisco DNA Spaces and local database. The report preserves the mixed RFID/BLE/Wi-Fi description and does not claim LAN-only operation. The exact single-trailing-slash reference URL was reopened successfully in this review. | PASS |
| R7 Radboudumc | Institutional 2021 report supports track-and-trace with Philips but does not identify the precise radio or offline capability; report preserves the unknowns. Netherlands is correctly grouped with EU. | PASS |
| R8 Lund/Skåne | Publisher-indexed original section 2 supports BLE identity broadcasts, fixed RSS observers and cloud processing. The report labels it feasibility/industrial participation and records access restriction rather than claiming independent full-text audit. Sweden/EU and UK remain separate. | PASS |
| R9–R12 MRI/coexistence | Report separates static-field/access concerns from RF shielding; it does not infer injury, image artifacts or universal compatibility from MKUH coexistence. The local-field/hardware uncertainty and added-tag assembly issue remain explicit. Previously independently checked ACR/GE/NHS propositions match the text. | PASS |
| R13–R14 | AoA antenna/payload specificity and UWB arrival-time/anchor mechanism are appropriately technical descriptions, not observed Consta performance or hospital success claims. | PASS |
| R1–R2 | Published circular-marker work supports the narrow identity-family argument, not custom-decoder performance. CCTag is distinguished from the sector marker. CVF primary landing page and CCTag actual MPL-2.0 license were reopened successfully. DOI resolver access failed in this tool and university RUNE PDF returned 403 in this pass; that is an access limit, not evidence the references do not exist. | PASS with retrieval limitation |

No clinical success figures or vendor ROI are imported into Consta. The international table is deliberately modest and historical; the method explicitly says source-era deployment is not a current-site audit.

## Incorporation of prior critical editorial conditions

- The custom dot is correctly described as **not** an orientation anchor.
- The codebook separation is a target/lower-bound audit, not an unmeasured exact minimum.
- `small`/`tiny`, uniform dimming, affine warp and projective failure are distinguished.
- Additional sequence uses the same renderer/family/detector; it is not called an independently implemented detector.
- The gallery is identified as a precomputed viewer, not live camera decoding.
- “No wrong IDs in these fixtures” is not converted into perfect reading or zero real-world false positives.
- BLE recommendation is an engineering inference, not user-approved procurement or measured superiority.
- Local processing includes authentication, maps and licensing, not only a local database.

## Optional exact polishing, not required for this PASS

1. To remove any implication that Consta areas have already been approved, change the summary phrase **“avaliar BLE em áreas previamente aprovadas”** to **“avaliar BLE em áreas que venham a ser aprovadas pela instituição”**. The following paragraphs already establish conditional approval, so this is clarification rather than a blocking correction.
2. Improve reader navigation by linking source/audit paths instead of rendering them only as inline code. This affects usability, not factual support. A suitable replacement for the last sentence is: **“Notas de acesso, financiamento e limites: [casos internacionais](../sources/international_cases.md), [BLE e RM](../sources/ble_zones_safety.md) e [identidade óptica](../sources/optical_identity.md).”** Paths are relative to the exported report.
3. Add the directly retrievable primary landing page to R1 after the DOI: `https://www.cv-foundation.org/openaccess/content_cvpr_2016/html/Calvet_Detection_and_Accurate_CVPR_2016_paper.html`. This provides a useful alternate retrieval path without asserting that the DOI is invalid.

## Eight independent ordinal rubric ratings

These are subjective editorial judgments on the rubric's 0–10 ordinal scale, adapted from doctoral-proposal anchors to this targeted engineering research report. They are not measured quantities, probabilities, calibrated scores or an arithmetic aggregate. No mean is computed.

| Dimension | Rating | Independent rationale |
| --- | --- | --- |
| Research question clarity | 9 | Dedicated question/method section defines identity, real deployments and zoning; readers can distinguish what the work answers from what a physical pilot must answer. |
| Scientific/engineering tension | 9 | The report makes the real tradeoff explicit: finite ID assignment versus degraded optical observation, and optical visibility versus radio/coexistence requirements. |
| Evidence matching | 9 | Source types and access limits are named; proposals, literature and synthetic results stay separate. Numerical field-success claims are not borrowed. |
| Logical chain | 8 | Question, mechanisms, synthetic results, international cases, safety and next proof of concept connect coherently. The operational preference is reasoned but not physically compared, which is correctly disclosed. |
| Method feasibility/reproducibility | 8 | Synthetic artifacts and audit locations make the demonstration challengeable; next physical BLE/optical comparison still needs concrete devices, dimensions and acceptance thresholds, acknowledged as future work. |
| Contribution specificity/novelty | 7 | The custom finite family and uncertainty/integration contributions are specific; no proven literature-level novelty is established or claimed. This score concerns maturity of contribution evidence, not need for a patent claim. |
| Risk boundaries/alternatives | 9 | Multiple failure classes, rejection results, environment exclusion limits and conditions for rejecting the BLE hypothesis are explicit. Failure of Internet is separated from LAN/power/server failure. |
| Language quality | 8 | Direct and technically careful; limited repetition of nonclinical boundaries is justified by the audience and stakes. The optional navigation and approval-wording edits would improve final reading. |

Recommendation: final polish and delivery within the declared research scope; no restructuring or source-driven foundation reset required.
