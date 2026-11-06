# Optical emulator audit — Phase 3

Reviewed on 2026-11-06. Scope: `experiments/optical-tags/emulate.py`, `verify.py`, `results.json`, `verification.json`, `codebook.json`, `build_gallery.py`, and the Phase 2 research canon/evidence/argument foundations. This is an independent source/code review by a subagent, not clinical validation or a second detector implementation. No emulator code was edited and no full family regeneration was run.

## Verdict

**Suitable as an explicitly limited pixel-based synthetic experiment.** I found no ground-truth identity/position/transform passed into the decoder. The detector finds candidate contours from pixels, estimates ellipses, samples the payload and searches the public dictionary. Synthetic results support identification under the tested clean and selected degraded conditions, plus meaningful rejection under the tested stronger degradations. They do not support general optical robustness, physical camera performance, hospital coverage or safety.

No blocker found for presenting the experiment with those boundaries. The wording corrections below matter before treating the gallery/report as evidence.

## Passed boundaries

### Ground truth and decoder inputs

`detect(image, family)` receives only the final grayscale image and dictionary. `candidate_ellipses` obtains contours/ellipses from thresholded pixels. `sample` uses those detected ellipse parameters. The render-time word/transform is not read by the decoder; the expected ID is formed in `evaluate` only for scoring the returned list.

The dictionary itself is a legitimate detector configuration, not leaked ground truth. The decoder must know which finite visual family it recognizes. The family order is used to form the returned Consta ID; this is an index-based ID mapping, not an encoded hospital serial number.

The gallery is an **offline viewer of precomputed decoder observations**: it embeds `results.json` and selects records. It does not perform browser decoding or acquire a camera. Its header discloses this clearly. The displayed accepted ID comes from the stored decoder result, rather than replacing rejection with the expected ID.

### Dictionary rotations and mirror policy

The generator compares prospective codewords with cyclic shifts and reflected cyclic shifts of existing words. It also excludes words near a different rotation/reflection of themselves. The verifier checks the same family constraints on the saved dictionary, not merely canonical distinctness.

Checking canonical representatives against complete shift/reflection orbits is sufficient for the intended discrete symmetry audit, because a common shift/reflection preserves Hamming comparisons. This does not cover errors introduced before a bit word is recovered from pixels.

The detector searches rotations but not mirrored identities. The saved mirror test reports rejection, consistent with the intended mirror-separated codebook. It is not evidence of rejecting every mirrored degraded scene or every foreign pattern.

### Conservative decoding behavior

The implementation requires contrast, limits near-threshold samples, accepts only a close dictionary match with separation from the next identity, and rejects an ellipse if different phase candidates produce different accepted IDs. These are useful deterministic safeguards. Returned `bit_errors` is the distance of a sampled candidate to a dictionary codeword, not a measurement of the physical image corruption or probability of correctness.

No confidence probability is output, and none should be inferred. An empty detection list does not classify the cause; it can result from candidate geometry, contrast, sampling, distance or phase disagreement.

## Required wording corrections

1. **No explicit orientation anchor was implemented.** `render` draws a common outer ring, annular payload and central circular dot. The dot/ring are rotationally symmetric. Orientation ambiguity is handled by cyclic codeword search and dictionary separation. The Phase 2 source note recommended an anchor as a design option; do not describe that recommendation as an implemented feature.
2. **Describe `verification.json` precisely.** It is a second seeded sequence of synthetic transformed/noisy images using the same renderer and decoder, plus dictionary and saved-result assertions. “Independent verification” is acceptable only with that qualifier; it is not an independent implementation or physical camera test.
3. **Describe `small`/`tiny` as downsample-and-upsample information-loss conditions.** The code shrinks the image and enlarges it back before detection. It does not demonstrate localization of an equivalently small marker directly in a large native sensor frame. Do not convert the labels into camera resolution, distance in meters or allowable marker dimensions.
4. **`low_light` is uniform numerical intensity/contrast scaling.** It does not model photon shot noise, exposure control, sensor saturation, color response, hospital lighting flicker or motion blur coupled to exposure. Prefer “synthetic dimming” rather than validated low-light performance.
5. **`oblique` is a particular affine warp.** The decoder uses ellipse normalization, not general projective rectification. The stronger projective case in the saved results was rejected throughout. Do not claim arbitrary viewing-angle or perspective support.
6. **The distance constant is a target/lower-bound audit.** Code checks require the family to meet the configured separation. The code does not save a separately measured exact minimum over the family. Phrase it as “audited to meet the configured separation” unless an exact minimum is independently computed and recorded.
7. **Keep zero-error observations tied to the finite suite.** Saved counts have no wrong IDs in these fixtures, but not all conditions identify the marker. “No identity substitutions observed in the finite synthetic suite” is defensible; “perfect distinction” and “zero probability of confusion” are not.

## Near-code correction is not automatically a false positive

`verify.py` flips a payload bit and expects the original identity. That is an intended correction test under the configured dictionary policy. A pattern outside the exact canonical dictionary but inside an allowed correction neighborhood may legitimately be accepted as that ID.

Therefore, hard-negative testing must distinguish:

- a deliberately corrupted known marker within the accepted correction budget;
- a foreign word outside all accepted neighborhoods;
- an unknown/malformed visual object whose sampled payload accidentally falls within an accepted neighborhood;
- an authentic-looking copied marker physically attached to the wrong asset.

The last case cannot be solved by visual coding alone: the marker is an identifier, not cryptographic authentication or proof of attachment.

## Short supplementary hard-negative audit

I ran a brief read-only Python check importing the saved dictionary and detector without calling `make_codebook` or `main`. The supplementary input generator used seed `91061` and a draw budget of `120` random payload words. It skipped exact/near-family words inside the configured accepted correction neighborhood, rendered the remaining words with the same marker renderer, and passed their pixels to `detect`.

Observed output: `false_accept_examples: []` for those outside-neighborhood generated candidates. Separate disk, ring, checker-pattern and grayscale-noise images also returned empty detection lists. This supports only those deterministic generated checks; it is not an estimated real-world false-positive rate. No physical hospital images or difficult real clutter were used.

The supplementary check did not modify code, generated datasets or verification artifacts. Its result is recorded here as a source-review observation, not added to the canonical experiment counts.

## Remaining technical gaps

- Main negative fixtures contain a reserved family-generated unknown word and an empty image; these are limited negatives. The supplementary cases broaden this slightly but remain simple synthetic images.
- Border/center structure is not comprehensively validated. A candidate passes a filled-contour/ellipse-area check and reference intensity tests, but the decoder does not verify all pixels of the designed template. Do not claim full shape authentication.
- Payload sampling uses a median across radial positions at a given angular phase, rather than area integration across each sector. It is still susceptible to narrow occlusions, interpolation and sampling artifacts.
- Coordinates are clipped to image boundaries. A truncated-marker test is needed before claiming robust rejection at frame edges; clipping can reuse border pixels rather than flag an invalid sample explicitly.
- Overlapping tags, varying-size tags within the same cluttered scene, curved/bent substrates, lens distortion, sensor noise models, and arbitrary illuminations are not established by the current fixtures.
- Current multi-tag scene demonstrates separate candidates on a plain background; it does not establish scalability to a hospital census or crowded storage conditions.
- The held-out sequence changes transformation/noise draws while retaining the same marker generator and dictionary. It tests generalization within that synthetic construction, not across physical cameras or independently designed markers.
- `verify.py` reads saved `results.json` for several assertions. Without code/result hashes, this alone does not prove the results correspond to the latest code revision. Keep code, parameters and artifacts together, and regenerate if implementation changes.
- The verifier records a generic pass string but not a full dependency/version manifest. Reproducibility is stronger if the README records the actual Python/OpenCV/NumPy/Pillow environment used.

These are research boundaries and next-test candidates, not reasons to disguise failures or inflate correction tolerance.

## Source-support check

The Phase 2 canon C1 and evidence table are appropriately narrow: CCTag/Calvet supports the possibility of circular families encoding individual IDs and explicitly handles projective geometry. Its paper does not substantiate this custom sector decoder’s exact performance or hardware safety. The local custom code and synthetic artifacts support only the custom experiment.

RUNE-Tag supports circular-feature coding and redundancy; TopoTag supports identity through topology/geometry; AprilTag/ArUco provide comparison principles for finite code dictionaries and rotation-aware separation. None supports universal identification, unlimited IDs or clinical safety of Consta. Existing source notes disclose license differences; no imported implementation was found in this emulator beyond general-purpose image/numerical libraries.

The canon’s distinctions between issued unique ID, estimated identity, observation, location and safety should remain in the final explanation. No source correction is needed to the narrow claim “a finite circular family can carry distinct IDs.”
