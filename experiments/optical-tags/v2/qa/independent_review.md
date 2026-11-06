# Independent V2 optical validation

Reviewed 2026-11-06. **PASS for continued optical-primary synthetic development with declared boundaries.** No claim of clinical safety or physical camera performance. This review does not demote the optical path to a future optional line; it tests the optical-primary implementation directly.

## Artifacts and frozen inputs

- `independent_validation.py`: independent challenge harness, separate from `benchmark.py`.
- `independent_results.json`: every generated case, expected IDs, decoded IDs, omissions/extras, spatial scoring, diagnostics, configuration, input hashes and measured per-call time.
- `independent_frames/`: final native camera-frame PNGs, including failed cases.
- `optical_reviewed_snapshot.py`: source bytes matching the current reviewed implementation hash, when available.
- `independent_results_before_band_revision.json`: earlier run retained as historical JSON; its superseded frame files were not retained and are explicitly marked as historical filenames only. It must not be treated as current code validation.
- `independent_validation_before_band_revision.py`: earlier harness retained for provenance.

The held-out seed is `381117`, selected after the straight-frame-interruption revision. A scoring-only spatial check was added afterward and the identical scenes were rerun; no detector threshold or case parameter was changed. All observed failures remain in the current results and images. The suite reuses the base marker renderer but supplies its own camera composition, arbitrary rotations, projective quadrilaterals, degradation combinations and negative scenes.

## Input-boundary audit

`Detector.detect(image)` receives final grayscale pixels only. The public dictionary is initialized separately. True corners, homographies, identity lists and occluder geometry are held by the harness for rendering and scoring and are not passed to candidate extraction, rectification or decoding. No GT leak was found.

The projective warp consumed by the decoder is estimated from pixel-detected frame quads or finder hypotheses. It is not the inverse render warp. Rectification is therefore a real simulated-image processing step, unlike a renderer-assisted crop.

Native-scale markers are projected into a full camera frame and detection runs on that final frame, without ground-truth cropping or tag enlargement before candidate finding. The internal warp of an already detected candidate to canonical dimensions is normal rectification and is not itself a leak.

Spatial scoring uses a returned center against the correct expected marker polygon only after decoding. This prevents merely finding a correct set of IDs from hiding association to another spatial object in the multi-marker fixtures. It does not measure precise physical coordinates or pose error.

## Dictionary and erasure safeguards

The reviewed catalog uses its declared V2 layout and optical words; the detector searches the supplied family, including IDs beyond V1. V2 is not bit-compatible with V1. Preserving asset ID strings across the migration does not preserve printed optical patterns.

Catalog generation records an independent exhaustive integer-bit-count audit against cyclic/reflected transformations. The detector's correction/erasure acceptance is tied to the declared minimum discrete separation and adds a next-identity margin. These are bounds on recovered discrete words, not a probability of optical correctness.

The duplicated-ring logic derives observations from sampled patch intensities. Disagreement or low confidence can become an erasure; no true occluder mask is supplied. The new straight-band rule infers paired interruptions of opposite frame edges from pixels and invalidates sample locations crossing the inferred band. **It assumes a straight band in the rectified marker coordinates; it is not general arbitrary white-occluder segmentation.** A diagonal white patch can remain difficult, as the preserved failure demonstrates.

White paint can resemble legitimate white data, and duplicated rings can be corrupted together. The mixed-ring, all-payload-white/gray, fully covered and broken-frame foreign-code fixtures challenge those failure mechanisms, but do not establish universal detection of corruption.

## Raw observed summary

The following is copied directly from the result artifact, not converted to percentages or physical-performance claims:

```json
{
  "native": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "projective_rotated": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "combined": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "partial_payload": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "payload_unobservable": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "mirror": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "mixed_rings": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "negative": {
    "cases": 8,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "white_straight": {
    "cases": 4,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "white_diagonal": {
    "cases": 4,
    "missing_ids": 1,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "payload_all_white": {
    "cases": 4,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "broken_frame_unknown": {
    "cases": 4,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "subnative": {
    "cases": 4,
    "missing_ids": 3,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "fully_covered": {
    "cases": 4,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  },
  "multi_mixed_native": {
    "cases": 4,
    "missing_ids": 0,
    "extra_ids": 0,
    "budget_hits": 0,
    "spatial_mismatches": 0
  }
}
```

Negative cases have empty expected-ID lists: their `missing_ids: 0` does not mean successful identification; it means no expected identity was omitted. `extra_ids: 0` means no undesired accepted output was recorded in these particular fixtures.

## Preserved failures

- `independent_frames/white_diagonal-01.png`: expected `CONSTA-0063`; decoder returned no ID. This is a failure of the tested diagonal-white-occluder condition, not a wrong identity.
- `independent_frames/subnative-00.png`: expected `CONSTA-0685`; no ID.
- `independent_frames/subnative-01.png`: expected `CONSTA-0670`; no ID.
- `independent_frames/subnative-02.png`: expected `CONSTA-0617`; no ID.

The native side presets and arbitrary render rotations for these cases are stored in `configuration`. They are image-domain settings, not measured physical viewing angles, distances, required label sizes or clinical capture conditions. Do not tune this held-out seed to erase those failures while retaining the same held-out claim.

## What the evidence now supports

The tested V2 implementation can recover issued identities from these native full-frame images with arbitrary in-plane rotation and selected non-affine perspective, including selected combined blur/gradient/noise and partial payload obstructions. This is direct optical-primary progress beyond the earlier ellipse-only method's limitations. It is supported by actual decoded pixels rather than source labels.

The finite suite recorded no extra accepted IDs, spatial identity mismatches or hypothesis-budget hits. This observation is limited to the saved scenes; it is not a no-false-positive guarantee or real-clutter rate estimate. The corpus is not a random sample of hospital scenes.

## Advisory implementation concerns

1. `load_family()` initially defaulted to the V1 dictionary; this was corrected before the current run. Continue checking catalog bit/layout version when loading user-provided paths. The detector assumes sequential ID mapping by dictionary index; arbitrary reordering/renaming is not a general supported API.
2. The hypothesis budget limits finder-combination attempts after frame hypotheses. The earlier frame-quad loop can already consume many attempts; do not call it a strict cap on total candidate work for arbitrarily cluttered inputs.
3. Output deduplication uses proximity of estimated centers, and accepted polygons suppress finder reuse. Very close, overlapping or nested tags require dedicated tests beyond the separated multi-tag fixtures here.
4. The straight-band inference is a structural hypothesis, not actual semantic occlusion recognition. Broken frame decorations and shadows should remain in future adversarial fixtures.
5. Mixed-ring rejection was observed for the tested pairs. It is not a proof that every possible collage, adversarial pattern or correlated sensor artifact is rejected.
6. This harness scores instance identity and coarse center containment, not homography accuracy, calibrated pose, timing requirements or tracker continuity.
7. Physical imaging, substrate bending/cleaning, privacy, exposure/lens effects, actual distance, EMC and MR compatibility remain untested. Continued optical development should next confront real camera capture in an authorized non-assistential bench setting, while preserving the current optical-primary objective.

## Outcome

No critical wrong-identity acceptance was observed in this validation. Preserve the missing-detection cases as supported operating-boundary evidence. Any detector/catalog change after the recorded hashes requires a fresh validation artifact; this review applies only to its recorded implementation and input family.
