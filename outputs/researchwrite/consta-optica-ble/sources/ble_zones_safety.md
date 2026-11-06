# Evidence dossier — BLE zones, hospital coexistence and MRI boundaries

Verified 2026-11-06. Phase 2 source investigation only; this is not the formal research draft, a systematic review, a device safety assessment or permission for deployment. Author: hospital-safety/source-verification subagent.

## Narrow hypothesis and verdict

**Hypothesis under investigation:** autonomous BLE tags on mobile assets, gateways in approved corridors/wards, fixed scanners and MRI rooms excluded, with local processing.

**Verdict:** technically plausible as a delimited deployment; exclusion of scanners is insufficient by itself to establish safety. Mobile medical devices remain near tags/gateways, RF coexistence can affect network-dependent clinical equipment, and mobile tagged assets can enter excluded areas. MRI RF shielding and static magnetic fringe-field management are separate concerns. No universal safe distance is supported by the reviewed sources.

## Verified primary evidence

### S1 — ACR Manual on MR Safety, updated March 2026

- Official landing page: https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Radiology-Safety/MR-Safety
- Current manual linked from that page: https://edge.sitecorecloud.io/americancoldf5f-acrorgf92a-productioncb02-3650/media/ACR/Files/Clinical/Radiology-Safety/Manual-on-MR-Safety.pdf
- Official change summary: https://edge.sitecorecloud.io/americancoldf5f-acrorgf92a-productioncb02-3650/media/ACR/Files/Clinical/Radiology-Safety/Changes-to-ACR-Manual-on-MR-Safety.pdf
- Access: landing page and summary via browser; full current PDF exceeded web parser size, so downloaded from the official link and extracted relevant pages with pypdf. Selected sections read; not every page reviewed. Legacy `acr.org/-/media/...` search results still showed the 2024 manual and were not treated as the current edition.
- **Fact:** Zone III is a controlled interface and includes relevant peripheral MR-field areas beyond the room; access is supervised. Portable objects of unknown MR status must not receive unrestricted access. Stationary electronics in Zone III are treated differently from portable items intended for Zone IV. The manual discusses mobile patient-support devices and checking their conditions. Relevant printed pages: 23, 82, 84–85, 133.
- **Inference for Consta:** the room door or a map polygon alone cannot define the approved installation. An MR Conditional pump/ventilator does not confer status on an added tag. The tagged assembly and transport workflow need assessment. RF shielding does not establish that the static field stops at the wall.
- **Counterevidence to blanket exclusion logic:** equipment and people move; fields can extend beyond the physical room. A stationary scanner does not create a stationary boundary for every associated risk.

### S2 — GE HealthCare, RF Shielded Room preinstallation requirements

- URL: https://www.gehealthcare.com/content/dam/gehc/global/support/site-planning/documents/RF-Shielded-Room-Preinstallation-Requirements-for-MR-Systems-PIM-5850260-1EN-9-ds-en.pdf
- Exact document: `5850260-1EN`, Revision 9; copyright 2020–2025.
- Access: official PDF text and relevant RF-interference sections verified, particularly printed page 19 and shielding requirements. Not a test report for Consta or a specific local installation.
- **Fact:** MR reception is highly sensitive; correct operation depends on limiting ambient RF interference. Potential sources include intentional transmitters and clocked digital circuitry. Door/window/wall shielding seals and installation details matter.
- **Inference:** a corridor transmitter can only be accepted after considering the actual shield, installation and emissions. The source does not show that a particular compliant BLE tag outside a closed room will create an artifact. It also does not provide blanket permission for all such tags.
- **Evidence gap:** shielding attenuation is frequency/configuration dependent; no measurements of the HCFMUSP suite or Consta hardware are available.

### S3 — Siemens Healthineers, Artifacts: Brief Overview

- URL: https://academy.siemens-healthineers.com/_/en-us/artifacts-brief-overview/
- Exact training material identified on page: job aid effective 19 July 2021, `HOOD05162003208932`; electromagnetic-interference-artifact section.
- Access: manufacturer page with embedded extracted job-aid text.
- **Fact:** the manufacturer instructs that the RF-sealed examination-room door remain closed during measurement, discusses defective shields/electrical equipment and shows examples involving an injector and a defective monitoring camera.
- **Inference:** outside RF can couple through an inadequate boundary; camera/electronic devices inside the suite can be sources too. A BLE-free tag does not make an electronic reader universally acceptable.
- **Limit:** training content, not the current operating instructions or a BLE-specific experiment; no source–distance threshold for our system.

### S4 — NHS England, actual BLE/Wi-Fi coexistence issue at MKUH

- URL: https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/internet-of-things-implementation-lessons-learned/lessons-learned/
- Access: official page, Technical section, lines 46–47 in the browser extraction; last edited 4 November 2026.
- **Fact:** the NHS reports that MKUH BLE access points interfered with medical devices and restricted RTLS rollout. It explains interference with older Wi-Fi sharing the spectrum and an impact on Wi-Fi-reliant medical devices, then reports mitigation using different Wi-Fi spectrum and Bluetooth capabilities.
- **Interpretation boundary:** this is operational coexistence counterevidence, not proof that BLE damaged a ventilator, caused an MRI artifact, or created patient harm. Exact equipment models, measured fields and clinical outcomes are not supplied on the public page. The extended report requires FutureNHS login and was not accessed.
- **Inference:** “outside MRI” does not dispose of the clinical-network coexistence problem. Validate the local network and clinical clients; do not merely repeat the version label as a remedy.

### S5 — NHS England, BLE as a hospital RTLS infrastructure option

- URL: https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/knowledge-products-and-artefacts/advice-and-guidance/rtls-guidance/overview-of-infrastructure-required-to-provide-location-data/
- Access: official page, BLE section; last edited 28 March 2025.
- **Fact:** describes BLE as an RTLS option and frequency hopping as a resistance mechanism against packet interference, with gateway/access-point infrastructure needed to sense asset tags.
- **Interpretation boundary:** resistance is not immunity; this general implementation guidance does not contradict the MKUH event or certify compatibility with arbitrary devices. Not all BLE packet types or tracking implementations have identical channel behavior.

### S6 — HAMILTON-MR1, mobile MR Conditional patient-support example

- URL: https://www.hamilton-medical.com/dam/jcr%3Aabaa4d6d-b577-4ecd-adee-39896d7bf527/HAMILTON-MR1_ops-manual_v2.2.x_en_624495.04.pdf
- Exact document: operator manual/addendum v2.2.x, `624495.04`.
- Access: official manufacturer PDF, MRI safety section.
- **Fact:** the ventilator is MR Conditional under specified scanner/field/mounting/accessory conditions; requires MR Safe/Conditional components, prescribed mounting and braking conditions. The manual treats use during transport and in the MR environment.
- **Inference:** a mobile asset may genuinely enter the MRI workflow even though the scanner is fixed. Adding an unassessed radio tag changes the assembly under consideration; the ventilator label cannot validate it.
- **Limit:** example model/revision, not the hospital inventory or a claim that every ventilator enters MRI.

### S7 — HAMILTON-C6, proximity restrictions remain outside MRI

- URL: https://www.hamilton-medical.com/dam/jcr%3A32ec370d-3b9e-45b4-92d4-0f40fef81bd3/HAMILTON-C6_ops-manual_v1.2.x_en_10197564.00.pdf
- Exact document: v1.2.x, `10197564.00`, Electromagnetic susceptibility section, printed page 22.
- Access: official manufacturer PDF, relevant warnings verified.
- **Fact:** warns about nearby RF sources and connected accessories; prescribes separation for portable RF communications equipment and a particular RFID category. Also warns that unspecified accessories/cables can affect immunity/emissions.
- **Inference:** a blanket hospital-corridor distance does not replace device instructions. A tag mounted directly to a device needs an explicit compatibility/mounting decision. The manual does not prove this specific BLE tag is incompatible.
- **Limit:** do not transfer this model’s prescribed distances to every hospital device or substitute its warnings for a test protocol.

### S8 — Positive experimental Bluetooth evidence, limited generalization

- URL: https://pubmed.ncbi.nlm.nih.gov/14980934/
- Original study: *Evaluation of Bluetooth as a replacement for cables in intensive care and surgery*, 2004.
- Access: original PubMed abstract and metadata; full text not examined.
- **Fact:** the investigated Bluetooth link was electromagnetically compatible with the tested equipment under study conditions.
- **Interpretation boundary:** this is evidence of feasibility for a tested configuration, not a BLE/AoA product, all tag densities, hospital Wi-Fi coexistence, or freedom from MRI artifacts.

## Directed search log

Database/tool: web search, official sites followed to source documents; search execution 2026-11-06. Searches were purposive and iterative, not exhaustive; no PRISMA claim or complete retrieval count.

Queries executed:

- `site.acr.org MR Safety Manual 2026 Zone III IV RF shielding doors`
- `site.acr.org "fringe field" "RF" "Manual"`
- `site.digital.nhs.uk Bluetooth RTLS hospital interference`
- `site.hamilton-medical.com MR1 MRI conditional ventilator distance magnet`
- `site.siemens-healthineers.com MRI RF shielding doors closed interference`
- `site.gehealthcare.com MRI RF shielding door interference`
- `site.philips.com MRI RF interference door shield`
- `site.mrivideo.com RF door open interference MRI`

Previously retrieved primary sources rechecked for this narrowed hypothesis: NHS RTLS overview, NHS lessons learned, official clinical-device manuals and the Bluetooth original abstract. A broad review about MRI RF leakage was found but not used as the primary basis when GE and Siemens first-party technical material supplied the needed mechanism. No unverified marketing statement was promoted into a clinical safety result.

## Devil’s Advocate — unresolved failure paths

**DA1 — silent boundary crossing.** A software geofence reacts after detection and can miss the transition; it does not stop a tag from entering Zone III/IV. Proposed control: institution-approved transport procedure, screening and physical separation/removal where required; a tag-removal event must preserve the equipment’s identity and history. This is a proposed workflow, not a demonstrated safeguard.

**DA2 — “we excluded fixed scanners.”** Nearby pumps, ventilators, implant-bearing patients and network-dependent monitors still move through wards/corridors. Test representative clinical-device configurations and network performance, not only scanner-room boundaries.

**DA3 — intact shield assumed.** Door position, contacts, penetrations and maintenance can change. Do not drill or route ad hoc cabling through an RF boundary. Installation approval and image-QA evidence belong to the local MRI/facilities teams.

**DA4 — different RF bands treated as proof.** Separation between nominal BLE and MR frequencies can reduce certain direct interactions but does not establish absence of emissions at relevant frequencies, receiver susceptibility, harmonics or broadband noise. Characterize the complete product and environment.

**DA5 — gateway backhaul mistaken for radio silence.** Ethernet can remove Wi-Fi backhaul while tags/gateways may still transmit BLE. Receiver-only positioning claims need verification of firmware/configuration, not assumptions from the diagram.

**DA6 — location success mistaken for clinical compatibility.** An accurate tag position is not an EMC result, proof of normal therapy, or proof of acceptable image quality.

## What would falsify the proposed deployment

Predefine approved conditions and acceptance criteria with engineering/IT/physics. A reproducible clinical-device performance change, relevant image-quality degradation, unacceptable clinical-network coexistence, or inability to enforce the exclusion workflow would falsify the claim that the tested configuration is acceptable for that area. A missed tag read falsifies a detection claim in its tested scenario, not automatically the medical safety claim; keep the two outputs separate.

No measurements, clinical tests, hardware procurement or deployment were performed for this dossier. No universal BLE-safe distance or MRI permission was inferred.
