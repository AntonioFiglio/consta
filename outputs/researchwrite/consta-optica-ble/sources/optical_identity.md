# Source note — optical identity, finite marker families and pixel-based emulation

Research date: 2026-11-06. This is a technical source note for Phase 2, not a final product specification. The user requires automatic identification by fixed sensors, no QR and no staff scanning. No code was implemented in this subtask.

## Recommended scope for the authorial demonstration

Build a **custom circular sector marker** with common visual structure across the family: outer detection ring, explicit asymmetric orientation anchor, a payload annulus containing black/white sectors, and known reference regions for estimating contrast. Assign each registered asset its own codeword in a finite local dictionary. Repeated views/faces attached to the same asset can intentionally share the same ID. Two different assets must not share an issued codeword.

This is a deliberate machine-readable visual identifier; it is not a QR format and requires no operator scan, but describing it as “not a code” would be misleading. Calling it authorial means the demonstration layout/implementation is designed for Consta. Circular coded markers and error-separated dictionaries are established prior work; no novelty or patentability claim follows.

A ring-sector layout is a **proposed simplification for a demo**, not a replication of CCTag: CCTag encodes identity through ring-width ratios and uses a dedicated projective detector. It is also not RUNE-Tag, whose dot arrangements and cyclic-code construction have their own algorithms.

## Primary sources and licensing evidence

| Source | What is directly supported | Implication and limit | License evidence |
| --- | --- | --- | --- |
| Calvet, Gurdjos, Griwodz, Gasparini, **Detection and Accurate Localization of Circular Fiducials Under Highly Challenging Conditions**, CVPR 2016. [Original paper](https://www.cv-foundation.org/openaccess/content_cvpr_2016/papers/Calvet_Detection_and_Accurate_CVPR_2016_paper.pdf), DOI [10.1109/CVPR.2016.67](https://doi.org/10.1109/CVPR.2016.67) | Concentric circular rings support detection and identification; thickness can encode ID. Projective geometry is explicitly addressed. | Evidence for circular, non-QR identity, not for a hospital-ready Consta marker. Simple ellipse normalization does not reproduce the paper’s perspective handling. | [Authors’ implementation](https://github.com/alicevision/cctag) states MPL v2; [actual COPYING.md](https://raw.githubusercontent.com/alicevision/CCTag/develop/COPYING.md). Preserve applicable notices if reusing. |
| Bergamasco, Albarelli, Rodolà, Torsello, **RUNE-Tag: A High Accuracy Fiducial Marker With Strong Occlusion Resilience**, CVPR 2011. [University-hosted original](https://iris.unive.it/bitstream/10278/33533/1/2011-CVPR-runetag-published.pdf), DOI [10.1109/CVPR.2011.5995544](https://doi.org/10.1109/CVPR.2011.5995544) | Marker design combines circular features and cyclic coding; detection/identity is an algorithmic system, not simply a printed logo. | Relevant precedent for redundancy and rotation-aware circular identity. Claimed occlusion robustness applies to tested conditions; total concealment remains invisible. | [Available repository/fork](https://github.com/artursg/RUNEtag) README reproduces an MIT notice credited to Filippo Bergamasco; [LICENSE file in that fork](https://github.com/artursg/RUNEtag/blob/master/LICENSE) instead credits Artur Sagitov, also MIT. Do not conflate paper copyright, upstream code and fork modifications; audit exact files before reuse. |
| Yu, Hu, Dai, **TopoTag: A Robust and Scalable Topological Fiducial Marker System**, TVCG 2021; [author page](https://herohuyongtao.github.io/research/publications/topo-tag/), [original preprint](https://arxiv.org/abs/1908.01450) | Topological and geometrical information support detection and ID decoding; shape flexibility is explored. | Shows that an ID family can share overall structure while internal geometry differs. Published scalability does not give Consta an unlimited dictionary or guaranteed robustness. | [Authors’ release](https://github.com/herohuyongtao/topotag), Terms of use: research purposes only, commercial use prohibited. Do not include its library in a commercial product based merely on repository visibility. |
| Olson, **AprilTag: A Robust and Flexible Visual Fiducial System**, ICRA 2011. [Original lab-hosted paper](https://april.eecs.umich.edu/pdfs/olson2011a.pdf), DOI [10.1109/ICRA.2011.5979561](https://doi.org/10.1109/ICRA.2011.5979561) | Detector and coding stages are separate; finite code families use separation between codewords and rotated versions. Rejection and correction involve tradeoffs. | Comparison and coding reference only: user does not want a QR-like square solution. Reuse principles, not a claim that custom design inherits AprilTag’s performance. | [Official source](https://github.com/AprilRobotics/apriltag), [LICENSE.md](https://raw.githubusercontent.com/AprilRobotics/apriltag/master/LICENSE.md): BSD 2-Clause. |
| Garrido-Jurado, Muñoz-Salinas, Madrid-Cuevas, Marín-Jiménez, **Automatic generation and detection of highly reliable fiducial markers under occlusion**, Pattern Recognition 2014. [University manuscript](https://helvia.uco.es/xmlui/bitstream/handle/10396/14094/2016000001532.pdf?isAllowed=y&sequence=1), DOI [10.1016/j.patcog.2014.01.005](https://doi.org/10.1016/j.patcog.2014.01.005) | Dictionary construction optimizes inter-marker separation; detection and decoding are distinct. | Reference for finite dictionary engineering. Not the chosen marker format. | [Original project page](https://www.uco.es/investiga/grupos/ava/portfolio/aruco/) states GPLv3 for personal/research/educational use and asks commercial users to contact authors. OpenCV’s implementation is a separate distribution; verify its exact version/license rather than treating every ArUco package as the same. |
| OpenCV **Detection of ArUco Markers**, [primary documentation](https://docs.opencv.org/4.13.0/d5/dae/tutorial_aruco_detection.html) | A dictionary is a set of binary codes; ID is a dictionary index. It discusses inter-marker distance, rotations and limiting correction to reduce false positives. | Useful explanation of ID mapping and correction policy; no need to ship ArUco in the Consta demo. | Documentation/reference only in this note; audit installed source distribution if reused. |

The table reports observed license notices and is not a legal determination about the complete dependency graph or patents.

## N assets do not require N unrelated designs

The printed family can look consistent—same rings, spacing convention and anchor—while each asset’s payload differs. The asset database maps the decoded dictionary ID to the physical device; neither a human-readable model name nor the shared Consta flower uniquely identifies an individual pump.

The following distinctions should be explicit in the explanation:

- **Visual frame/family:** the repeated layout that lets a detector find likely markers.
- **Marker codeword:** the actual pattern issued to one asset.
- **Dictionary ID:** local key for that pattern, not necessarily the numeric value of its bits.
- **Asset identity:** hospital/institution, inventory ID and physical serial/patrimony association.
- **Observation:** detector ID, timestamp, source, decoded codeword/ID and diagnostics. Observing an ID is not a cryptographic proof that the tag is attached to the right asset.

No pairwise distinct clean images is sufficient to claim robustness. Code generation must audit separation under the transformations the detector may accept. A rotated ring code can resemble a different unrotated ring code; an orientation anchor helps, but anchor corruption must cause rejection rather than silent reassignment.

## Dictionary and rejection policy

For the circular binary sector proposal, audit **minimum Hamming distance** over all accepted cyclic sector shifts, not just the canonical printed orientation. If reflections may occur through imaging optics or mirrors, either include them in the dictionary audit or detect/reject them with an explicit asymmetry. Also exclude ambiguous self-symmetric patterns and trivially uniform patterns.

Choose correction/rejection limits from the actual generated family and verify them. Do not invent a distance or error-correction budget before computing the dictionary. Hamming distance describes bit substitutions after correct localization/sampling; it does not cover missed geometry, merged markers, incorrect rectification, unknown camera behavior or arbitrary occlusion.

Recommended conservative behavior:

- Reject failed frame geometry, missing anchor or insufficient black/white contrast.
- Treat low-confidence sectors as erased/unknown, not automatically white or black. Correction must be designed to handle erasures or else reject them.
- Search the finite dictionary and require an unambiguous best candidate within the measured/allowed correction budget.
- Reject ties and weak separation from the next candidate.
- Expose `unknown`, `ambiguous`, `too_small`, `low_contrast`, `occluded` and `out_of_dictionary` outcomes where supported by the actual implementation.
- Report correction count, observed contrast and match margin as diagnostics; do not label them calibrated probabilities of identity correctness.
- Do not enlarge the correction budget to make a degraded example “work”: that may increase incorrect ID assignments.

A codebook audit proves a property of the clean discrete family. It does not prove error-free operation of a camera in all environments. Do not claim “100% distinction” or “impossible to confuse”.

## Minimum honest pixel-based emulation

A meaningful optical emulation should render a scene and then identify markers from the pixels of the rendered camera image. Keep the generated asset IDs, positions and transforms in a **ground-truth channel used only for scoring**, not as detector input.

Proposed sequence, without prescribing a code implementation:

1. Generate the finite codebook and verify its claimed separation/rotational exclusions before scene generation.
2. Render tag geometry to an independent image, then compose tags into a scene with background distractors.
3. Apply supported camera transformations and degradations to the image: movement/rotation, scale, lighting, blur, noise and partial obstruction.
4. Give the detector only the final pixel buffer and published family/detector configuration.
5. Find candidate marker geometry in the pixels. Estimate center, scale and orientation from visual evidence.
6. Normalize the image under the detector’s supported model, read sector regions from pixels, then decode/reject against the dictionary.
7. Display decoded ID and diagnostic result from that output; compare against hidden ground truth after decoding.

Supplying true centers/radii/corners/warps from the renderer produces a **localized-crop or renderer-assisted decoding demonstration**, not an autonomous camera detector. That narrower demonstration is valid if labeled clearly. Reading `data-id`, SVG element names, object keys or an asset list is not optical decoding.

Sampling a single pixel at each expected sector center is brittle. Region-based sampling with contrast estimates and uncertainty tests is a better candidate, while still requiring validation. Never display a ground-truth label as though it was the decoder’s result.

### Perspective caveat

A circle in an oblique image becomes a conic. Naively scaling an ellipse back into a circle is not, in general, a complete projective rectification of its plane. The concentric-ring CCTag paper explicitly treats projective geometry. For a simple custom marker, either restrict and label the demo to frontal/similarity or supported affine conditions, or add independently detectable geometrical landmarks and implement/verify projective recovery. Do not expose an arbitrary perspective slider while using its true transform to secretly invert the image and call that autonomous perception.

CCTag’s full detector would be a reasonable benchmark if its build/license requirements fit, but a custom small demo can be more reviewable. The latter must use its own measured results and must not borrow the paper’s precision, range or robustness claims.

## Test advice for the root implementation

### Dictionary checks

- All issued canonical codewords distinct.
- Separation audit covers all supported cyclic shifts/rotations and the explicit mirror policy.
- No member becomes a different issued ID under a permitted rotation.
- Record actual dictionary size, observed minimum distance and decoding policy in the test artifact.

### Detector checks from rendered pixels

- Clean scene with each family member, then scenes with several simultaneous members.
- Independent image translation/rotation/scaling within supported limits, without giving transforms to detector.
- Blur, contrast gradient, noise, obstruction and backgrounds resembling circles or sector patterns.
- Unknown valid-looking patterns, deliberately invalid anchor, codes outside the issued family and ambiguous near matches.
- Same appearance at different positions and orientations; different issued tags in similar surroundings.
- No marker, fully hidden marker, undersized marker, overlapping tags and a marker partly outside image bounds.
- Deliberately corrupted identity: make sure the program reports unknown/rejection or actual decoded result, rather than copying a scene label.

### Evaluation artifacts

Save original scene pixels, decoder detections/rejections, and scoring output. Separate false positive, missed detection and incorrect identity; a detection count alone hides ID substitutions. List unsupported transformations. Use reproducible seeds but also independent held-out scenes; passing a finite synthetic suite proves only that suite.

There is no physical camera validation, no tag material/MRI approval and no real hospital result in this source note. A successful synthetic optical emulator demonstrates a decoding pipeline and handling of uncertainty, not clinical compatibility or field coverage.
