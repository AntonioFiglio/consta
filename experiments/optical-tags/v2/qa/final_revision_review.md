# V2 final guarded-input revision review

Reviewed 2026-11-06. **PASS — the final revision preserves the reviewed optical decoding behavior and its disclosed failure boundaries.** This approval is for the synthetic optical-primary prototype, not clinical use or physical-camera performance.

## Revision inspected

A direct diff between `optical_reviewed_snapshot.py` and current `optical.py` shows only input guards:

- `load_family` checks the declared catalog bit width/schema and sequential identity mapping.
- `Detector` rejects undersized, duplicate or out-of-range supplied word families.

No candidate extraction, homography estimation, sample positions, erasure inference, error allowance, identity margin or deduplication behavior was changed by this revision. For the valid issued catalog and saved valid image arrays, this is a guarded-input-only change.

Current implementation SHA-256:

`ef23338b057384238f5dfca0ea3991779a003cc093a63afe7d23dab037970373`

The current `independent_results.json` records that same implementation hash. Its catalog hash is also recorded in that artifact. The previous reviewed result and source snapshot remain separate provenance artifacts.

## Meaning of the rerun

The independent harness was rerun after adding input guards. It uses the **same previously frozen scene seed and parameters**, not an entirely new held-out dataset. It remains a confirmation against the revised valid-input path, not new evidence of broader distributional generalization.

The saved observations retain the earlier omissions: the diagonal-white-occluder case and the smallest native marker examples. No extra accepted IDs or spatial identity mismatches appear in the rerun summary. I did not tune cases, tests or detector to remove those failures.

The main benchmark was being rerun by the root agent on the guarded revision. Its final result/hash verification remains the root agent's responsibility; this review independently checked the current held-out artifact hash and source diff, not a new full-core execution.

## README and gallery correspondence

The current README and `index.template.html` now accurately explain:

- Optical-primary development, including pixel-derived projective rectification and redundant payload observations.
- Straight-band inference from opposite frame interruptions, with no renderer mask and no arbitrary-occlusion claim.
- Native full-frame candidate detection before rectification, with no true-coordinate crop.
- Catalog migration incompatibility with V1 and finite identity capacity.
- The separate synthetic validation, its preserved missed detections and the absence of a universal guarantee.
- Offline precomputed replay/gallery rather than live camera capture.
- Absence of physical camera, material and clinical tests.

The gallery construction consumes saved decoded outputs and separately displays reference identities for evaluation. Its failure cards include saved failed images and omissions. It does not fill a missing decode with the renderer's known ID. The independent scene generator and base renderer sharing are disclosed.

The numeric aggregate assertions in the README cite the numerical audit artifact. This review did not recompute those aggregates; the root's numeric verification remains the source of those totals.

## Local-image CLI review

`detect_image.py` reads a user-supplied grayscale image, loads the declared catalog, calls `detect(image)` with the image only, annotates the actual returned detections, and emits JSON diagnostics. It does not receive ground-truth tags/corners/occlusion masks and does not contact an internet service.

The CLI refuses a resolved input/output path collision and refuses an already existing output path. It checks image decoding and output writing. This enables future local-image bench testing; no successful physical capture or clinical installation is implied.

## Remaining boundaries

No critical misleading claim was found in the reviewed final README/gallery. Keep the existing qualifications about diagonal occlusion, native small-tag losses, close/overlapping tags, non-global work budget, image privacy and clinical compatibility. Catalog schema guards do not themselves prove discrete code separation for arbitrary third-party catalogs; the shipped catalog's generator/audit supplies that evidence.

No implementation or tests were edited during this final review. Any further detector/catalog behavior change requires matching fresh artifacts and a new review of the affected boundary.
