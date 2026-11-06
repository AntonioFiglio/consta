# V2 optical emulator — independent adversarial validation plan

Prepared 2026-11-06, before the V2 implementation was available. Scope: continue optical development as the primary experiment, preserve V1, and challenge the new detector using only synthetic image pixels. This plan does not implement or modify the detector and makes no clinical or physical-camera claim.

## Test contract

The detector receives a final camera-frame pixel array and the public finite dictionary. It may receive fixed public camera/detector calibration if declared in advance. It must not receive rendered tag ID, true corner coordinates, homography, object list, occluder mask, scene label or expected asset count. Ground truth is stored separately and consumed only by the scorer.

If a public camera calibration is used, distinguish that fixed calibration from a per-frame true pose supplied by the renderer. The latter would be leakage. Any threshold tuning must use the development split; the held-out split remains frozen until the candidate decoder is frozen. Changes after inspection invalidate the previous held-out status and require a fresh, explicitly recorded split.

Proposed independent seeds (configuration identifiers, not evidence): development `731`, held-out `20261106`, adversarial `91061`. Preserve V1 code/artifacts as separate experiment history.

## What must be improved over V1

V1 located an ellipse and decoded its annular payload but did not solve general perspective; its partial-cover fixture failed. V2 may add a projectively recoverable frame and redundant rings/erasures. These are engineering changes to test, not assumed improvements.

Essential new claims need direct demonstrations:

- The frame/corners used for rectification are detected in the final pixels.
- The decoder can recover identity for declared projective examples without receiving their true warp.
- Partial occlusion is handled only when sufficient frame/payload information survives.
- An unobservable or ambiguous payload is rejected rather than forcibly assigned to the nearest dictionary member.
- Native small tags are evaluated as small objects within a larger frame, without resizing each tag back to a standard image before candidate detection.

## Proposed corpus structure

Use the entire issued finite dictionary for baseline coverage. The number of assigned assets is the dictionary size, not an unlimited capacity claim. In addition to exact issued markers, construct independently generated nonmember words and malformed marker-like shapes.

Each sample must record scene seed, parameter vector, expected visible identities, true tag polygons and occluder geometry in the scoring record. Do not give this record to the detector. Save final camera-frame pixels and actual decoder output, including rejection diagnostics where implemented.

### Positive baseline and transformations

| Family | Proposed controlled variation | What counts as supported |
| --- | --- | --- |
| Clean | Each issued marker alone; then shuffled placement and rendering order | Exact identity and no extra accepted detections in these frames |
| Rotation | Full-angle random rotations, plus phases close to sector boundaries | Correct identity without an orientation hint |
| Native scale | Final marker-side presets `24`, `40`, `64`, `96`, `160` pixels inside a `960 × 720` camera frame | Report recovery/rejection per preset; no physical distance inference |
| Projective | Convex quadrilaterals with asymmetric corner displacements; both skew directions; varied location | Only frames decoded from detected corners support projective-recovery claims |
| Near-degenerate | Very thin quadrilateral, grazing appearance, clipped frame | Rejection is expected to be acceptable; no wrong accepted ID |
| Motion blur | Directional convolution in different orientations; vary blur relative to marker size | Report failure boundary; a Gaussian blur alone does not test directional motion blur |
| Defocus | Isotropic blur distinct from directional motion | Keep separate from motion-blur claims |
| Illumination | Global dimming plus horizontal/diagonal gradients and local shadows | Report exact image-domain conditions; no claim of real low-light validation |
| Noise | Independent pixel perturbations; optional sensor-like noise explicitly labeled | Do not equate an image-noise model to a tested camera |
| Combinations | Scale + projective skew + blur + gradient + noise with held-out draws | Prevent passing only isolated easy transformations |

All pixel counts and seed values above are proposed test settings, not measured performance or a minimum required physical marker size. Select ranges appropriate to the implemented geometry, retain failing extremes, and report the actual settings used.

### Multiple simultaneous candidates

Construct a camera frame with mixed marker scales, unrelated rotations and different projective warps. Shuffle asset order so dictionary order cannot become an association cue. Include repeated copies of the same marker in different positions to test duplicate policy, then several different IDs near one another.

Test both isolated nonoverlapping tags and overlapping tag pairs. Define the output unit: physical marker instances, unique asset IDs, or observations per camera. If the detector merges duplicates intentionally, scoring must not conceal wrong identity by comparing only sets of IDs. Assess each detected instance spatially against ground-truth polygons after decoding.

Do not restrict scene generation to the same large centered crop or repeated regular grid. Vary unused background area, location near edges and the distribution of marker sizes. Include decoys larger than real markers so choosing the largest contour is insufficient.

### Occlusion, redundant rings and erasures

Separate these conditions instead of using one generic “occluded” label:

- Payload-only obstruction with the projective frame visible.
- Frame-corner obstruction with payload mostly visible.
- Thin strip across both frame and payload.
- Small irregular patch, shadow-like dark patch, white patch and textured patch.
- Independent ring obstruction, then correlated obstruction across all redundant rings.
- Complete covering of the marker.
- Tag partly outside the camera frame.
- Tag with the detection frame visible but the payload entirely hidden.

A mask used to render occlusion must not become an erasure map passed into decoding. Erasures must be inferred from observed pixels/contradictions/contrast, or the method must be labeled mask-assisted.

Redundant rings are not independent evidence when one occluder covers them together. Agreement of duplicated payloads does not provide an empirically calibrated probability of correctness. Do not assume white occlusion is an erasure: it can look like a legitimate white symbol. Validate observable reference/structure and cap correction/erasure acceptance according to the actual dictionary.

A wrong ID accepted under heavy erasure is a critical failure. Rejecting a fixture where the frame is lost is an acceptable failure boundary, but it must remain visible. No claim of through-cloth or through-wall perception follows from partial-occlusion recovery.

### Hard negatives and identity-confusion traps

Use negatives independently from the issued marker generator where feasible:

- Disks, nested rings, clocks/dials, wheel-like spokes and rounded rectangles.
- Printed text and ordinary rectangle grids/checkers; circular/rectangular logos and borders.
- Discrete marker-like patterns not in the dictionary, including rotations/reflections.
- Correct frame with foreign payload and correct payload with invalid/missing frame.
- Deliberately contradictory redundant rings, assembled from different known identities.
- Clean valid-looking code exactly between plausible candidates, where the actual dictionary permits construction; decoder must reject ties or insufficient margin.
- Near-member corruption within the configured correction budget: score separately as intended correction, not automatically as false-positive acceptance.
- Corruption outside the allowed neighborhood, especially words close to more than one candidate.
- Full blank images, full texture/noise, high-contrast random blobs and no-asset clutter scenes.
- A copied valid marker: label as visual ID present but not authenticity proof. Do not demand the optical code detect physical attachment fraud.

If malformed patterns legitimately project to the same sampled code as a member, record that this exposes template/geometry validation limits. Do not relabel a foreign/background candidate as a known asset after seeing the decoder output.

## Acceptance gates and honest failure classification

### Mandatory integrity gates

REVISE if ground-truth IDs, object corners, transformations, occluder masks or scene identity flow into detector decisions. REVISE if the gallery substitutes the true ID for a rejected decoder output, or calls saved results live decoding. REVISE if any held-out failure disappears from artifacts or thresholds are relaxed after seeing it without recording a new version.

### Functional gates for the claimed scope

- The clean issued-family baseline must identify each member, with no unreported extra IDs.
- To claim new projective recovery, preserve actual successful projective frames and their detections, with homography estimated from pixels.
- To claim new partial-occlusion recovery, preserve successful frames, specify what remained visible, and retain failures.
- No wrong accepted identity or false asset in the declared adversarial validation suite may be silently counted as a miss or ignored. A discovered substitution triggers review before promoting reliability language; it does not automatically invalidate every narrower successful case.
- Full coverage and frame/payload absence should produce no new visual observation. Prior location may persist only as explicitly stale state in a separate tracker, not as a fresh camera detection.
- An unseen foreign word within the accepted correction neighborhood must be evaluated in light of the declared correction policy; legitimate correction is distinct from inventing a new ID.

Do not require all severe degradations to succeed. Define the supported operating envelope from actual observations and keep the “unknown/rejected” boundary explicit. Finite-suite success is not a general no-confusion guarantee.

## Reporting requirements

For each scenario, keep separate correct identity, missed visible marker, incorrect identity, extra detection and duplicate detection. A set-only comparison can hide extras or multiple assignments. Store expected and detected instances with spatial matching done by the scorer only.

Report native pixel scale and image-domain transform parameters instead of physical distances, real-world viewing angles or camera exposure values not modeled. Include exact code version, dictionary, decoder settings, package versions and seeds. Re-run after code/dictionary changes; retain prior results under versioned names.

Distinguish compute-time observations, if measured, from wall-clock tracker update rates. Neither a Python emulation nor a static gallery establishes live hospital latency. Any summary percentage or aggregate should be recomputed by the numerical verification workflow, not inferred from a handful of examples.

## Critical concerns to inspect in V2

1. **Projective frame discovery:** finding a quadrilateral is not proof it belongs to the annular payload. Check false pairing, nested contours and degenerate quads.
2. **Circular identity after rectification:** ensure the decoder does not use the true rendered geometry, even indirectly through a candidate crop supplied by evaluation.
3. **Erasures:** deletion of known sectors using the renderer’s mask is leakage. Unknown white paint may imitate data; detect or reject instead of assuming an erasure.
4. **Redundancy:** mismatch between rings can identify a bad candidate; blindly voting can assign a false known ID.
5. **Nearest-neighbor force:** every random word has a nearest dictionary entry; distance/margin/coverage limits must be explicit.
6. **Clipping and interpolation:** out-of-frame samples should not be silently clipped and reused as valid observations.
7. **Native size:** supersampling the renderer for antialiasing is legitimate, but candidate detection must run on the final camera-sized pixels without secretly enlarging each known tag crop using true bounds.
8. **Case selection:** use held-out parameter combinations and preserve failures; improvement over V1 must not mean a different easier test labeled with the same name.
9. **Source scope:** custom projective-frame/sector implementation cannot inherit CCTag/RUNE-Tag robustness claims.
10. **Clinical scope:** this work remains synthetic optical development. It does not test EMI, MR safety, material/cleaning suitability, patient privacy or physical hospital coverage.

## Next review

When V2 code and artifacts are available, inspect detector inputs and the complete render–degrade–detect–score boundary, independently challenge some saved/novel frames, and write a separate result audit. This file is the pre-result test plan; do not rewrite it retrospectively to match the outcomes.
