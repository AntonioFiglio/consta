# International evidence register — hospital equipment RTLS

Research date: 2026-11-06. Scope: US and Europe, explicitly separating EU countries from the UK; automated location of mobile equipment using tags and fixed infrastructure. This is a source register, not the final Consta report. No vendor effect size, hospital outcome, accuracy or latency is transferred to Consta. Statements describe the period documented by each source, not verified current deployment in 2026.

## Evidence and terminology rules

- `Operational report`: the institution describes an existing deployment. It does not necessarily supply independent outcome measurement.
- `Original field study`: authors report their own data from a real hospital. A study may be a limited pilot rather than routine deployment.
- `Procurement maintenance record`: useful evidence of installed infrastructure, but the requested service or future scope is not an observed result.
- `Active RFID`, `RF`, `Wi-Fi`, `BLE`, `IR`, `UWB` and `ultrasound` remain distinct. The generic term RTLS does not identify the radio technology. Where the primary document is underspecified, the register says so.
- Institution-owned and author-owned sources are primary for what their authors report. They are not automatically independent of the deployment or its commercial suppliers.

## US-01 — Johns Hopkins Hospital, Baltimore, United States

**Source:** Martinez et al. (2020), *Where is my infusion pump? Harnessing network dynamics for improved hospital equipment fleet management*, JAMIA, DOI `10.1093/jamia/ocaa033`. [Full original paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC7647311/) · [Johns Hopkins institutional record](https://pure.johnshopkins.edu/en/publications/where-is-my-infusion-pump-harnessing-network-dynamics-for-improve/).

**Claim/evidence:** The paper analyzes pump movements during 2017 using an installed RF+IR sensor network across care areas, clinical engineering and corridors. This is a concrete mobile-equipment deployment, **not evidence for BLE**. Its retrospective analysis informed a redistribution intervention; operational benefit reflects logistics changes as well as location data.

**Measurement limit:** The reported 93% tracking comparison uses purchasing/inventory counts; it must not be relabeled as 93% correct-room accuracy. Areas without coverage were excluded. No offline-WAN test or medical-device EMI/image-quality validation was reported for this question.

**Status/COI:** Original observational study plus quasi-experimental intervention. Funded by Johns Hopkins Health System; two authors disclose affiliation with an operations-improvement company and state it did not participate. The paper is stronger than a vendor success story but does not establish causal performance for another site.

**Verified access:** Full text opened; methods, measurement definition, funding and COI sections checked.

## US-02 — Duke University Medical Center, North Carolina, United States

**Source:** Østbye et al. (2003), *Evaluation of an infrared/radiofrequency equipment-tracking system in a tertiary care hospital*, J Med Syst, DOI `10.1023/A:1023709421380`, PMID `12846468`. [Institutional abstract at Duke](https://scholars.duke.edu/publication/742794) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/12846468/).

**Claim/evidence:** Prospective controlled evaluation on hospital wards tracked beds, sequential compression devices and infusion pumps using combined IR/RF. Ward allocation, intervention and control periods are described. This is an actual field evaluation, not just a proposed architecture.

**Measurement:** Against a trained surveyor, the abstract reports detection above 80%, but correct-room location of 60–80%. Pump utilization increased; corresponding improvement was not observed for every equipment category. This is useful counterevidence to “an installed RTLS always identifies the room correctly.”

**Status/COI/unknowns:** Original controlled study, historical technology. Full funding/COI and detailed sensor/backhaul arrangement were not established from the institutional abstract; do not assert no conflict or all-site deployment. No evidence of WAN-independent operation or exam-quality validation here.

**Verified access:** Duke institutional abstract retrieved; PubMed search metadata retrieved, while direct PubMed opening was intermittently incomplete.

## US-03 — UC Davis Health, California, United States

**Source:** Institutional RFP `10152025`, *RTLS Preventive Maintenance Support Services*, reissued 2026-01-12. [Official hospital PDF](https://health.ucdavis.edu/media-resources/supply-chain/documents/fy26/10152025_BJ_RFP_RTLS_Preventive_Maintenance-12.2026_Final.pdf).

**Claim/evidence:** Background states that UC Davis Health already operates RTLS tags for asset tracking and environmental/temperature monitoring across multiple locations; the procurement requests maintenance of tags, batteries, software and infrastructure. This supports installed and maintained real infrastructure, beyond a vendor assertion or plan to acquire a first system.

**Measurement/technology limits:** The aggregate tag count combines several functions; it is not a count solely of mobile clinical equipment. The opened material does not justify identifying all tags as BLE, nor turning the environmental-tag calibration requirement into certification of location accuracy. No controlled localization benefit or offline behavior was established.

**Status/COI:** Hospital procurement source; institutional customer with an interest in describing its installed estate. Maintenance requirements are requested services, not evidence those services were performed. Not an independent effectiveness study.

**Verified access:** Official PDF initially opened successfully, including title/date and indexed background; subsequent fetches timed out. URL is retained with this limitation.

## UK-01 — Mid Cheshire Hospitals / Leighton Hospital, England, United Kingdom

**Source:** NHS England Digital, *Implementing a Real Time Location Service for medical device tracking*, trial 2023/24; page last edited 2025-05-22. [Institutional case report](https://digital.nhs.uk/services/networks-and-connectivity-centre-of-excellence/innovation-and-strategy/wireless-trialist-case-studies/mid-cheshire-hospitals-nhs-foundation-trust//).

**Claim/evidence:** Implemented mobile equipment tracking includes infusion pumps, bladder scanners and theatre trolleys. The report labels tags RFID/BLE and describes Wi-Fi infrastructure; it does not allow every active tag to be relabeled BLE. Maps and access-point placement required corrections.

**Offline distinction:** Its diagram explicitly includes local WLAN controller → **cloud Cisco DNA Spaces** → AeroScout engine, with an on-premise database. Therefore a local database is not proof of end-to-end operation without Internet.

**Measurement/status/COI:** Institutional trial/operational case report, not randomized independent evaluation. Search-time and incident improvements are reported/estimated by the programme; methods are insufficient here for causal attribution. They are not Consta forecasts. The account separates active mobile tracking from scanned passive labels; only the former matches the automated-location requirement.

**Verified access:** Full page opened and topology description checked. UK is geographically European but **not an EU member**; retain the UK label.

## EU-01 — Radboudumc, Nijmegen, Netherlands (EU)

**Sources:** Radboudumc institutional annual-impact material, 2021. [ICT, huisvesting en bedrijfsvoering](https://www.radboudumc.nl/over-het-radboudumc/impact-2021/organisatie/bedrijfsvoering-2021) · [Hospital smart-technology explanation](https://www.radboudumc.nl/nieuws-en-verhalen/onze-nieuwe-campus/bekijk-de-nieuwbouw/toekomstbestendige-patientenkamer/smart-hospital/voorbeelden).

**Claim/evidence:** The hospital says it developed with Philips a track-and-trace system to locate and follow movable medical equipment and aids. The campus explanation also describes making equipment easier to find. This is credible institutional evidence of the use case in an EU hospital.

**Limits:** These institutional pages do not specify BLE, UWB, IR, ultrasound, anchor count, receiver-to-tag direction, positioning algorithm, local licensing or WAN-disconnection behavior. They do not provide a controlled accuracy/time-saving result. Avoid filling gaps with generic Philips/RTLS architecture.

**Status/COI:** Institutional report and explanatory material; hospital is deployment participant and Philips is named collaborator. No inference of independent evaluation or absence of commercial involvement.

**Verified access:** Annual-impact institutional page opened; companion institutional page retrieved by indexed source. A supplier Conscia case names Wi-Fi and discusses infrastructure, but it is a separate commercial source, not a substitute for hospital verification: [supplier case](https://conscia.com/nl/referenties/radboudumc-kan-niet-zonder-modern-netwerk/). No supplier benefit figures are imported.

## EU-02 — Skåne University Hospital / Lund emergency setting, Sweden (EU)

**Source:** Pendrill et al. (2021), *Reducing search times and entropy in hospital emergency departments with real-time location systems*, IISE Trans Healthcare Syst Eng, DOI `10.1080/24725579.2021.1881660`. [Lund University record](https://www.lunduniversity.lu.se/publication/f5d90e65-c531-4536-b4f8-2a9ba9d0667e) · [Original publisher article](https://www.tandfonline.com/doi/abs/10.1080/24725579.2021.1881660).

**Claim/evidence:** A field feasibility project tags equipment as well as people in an emergency department. Tags broadcast BLE identities; fixed observer modules measure received signal strength and forward results to a cloud-based positioning service. This is a real equipment-inclusive BLE case, not merely RF/IR relabeled BLE.

**Limits:** The use case is mixed equipment/patients/staff. It is not evidence of mature hospital-wide deployment, LAN-only operation, universally correct room identification or clinical non-interference. A “cloud” path is expressly part of the described architecture. Outcome claims remain study-specific.

**Status/COI:** Original feasibility research with industry participation: Sony authors/system-design contribution and a consortium including Sony, Region Skåne, universities and RISE; VINNOVA and other research funding reported. Not independent testing of an unrelated vendor.

**Verified access:** University record and original article passages retrieved through search index. Direct publisher access returned 403; university opening intermittently timed out. Full detailed methods were not independently re-audited from a downloaded copy.

## Claim disposition for the Consta synthesis

| Proposed claim | Supporting cases | Disposition |
| --- | --- | --- |
| Hospitals in the US and Europe actually locate mobile equipment using tags and fixed infrastructure | US-01/02/03; UK-01; EU-01/02 | Supported at each source's documented date and scope |
| All of those systems are BLE | None | Rejected; RF/IR, Wi-Fi and unspecified track-and-trace remain distinct |
| A system with an on-prem database necessarily works with Internet disconnected | UK-01 shows why this is invalid | Rejected; inspect the complete path and licensing |
| Equipment localization can support maintenance and redistribution workflows | US-01 and UK-01 | Supported as use cases; no Consta effect size follows |
| An operating hospital deployment proves no EMI or no exam artifacts | None | Unsupported; operational location evidence is not EMC/image validation |
| We have hospital-verified UWB or pure-ultrasound operational equipment cases in both regions | Not established in this search | Do not claim; leave evidence gap explicit |
| Deployment and maintenance have continuing infrastructure costs | US-03 maintenance scope; UK-01 coverage/map work | Supported qualitatively; no price extrapolation |

## Search log and exclusions

Searches run on 2026-11-06 with browser search/open; goal was primary institutional evidence plus original field studies. Representative exact queries:

- `site.nhs.uk equipment tracking RTLS RFID hospital medical equipment Wi-Fi`
- `site.va.gov real time location system equipment tracking hospital`
- `hospital real time locating equipment tracking implementation study BLE Netherlands equipment`
- `site.nhs.uk "Mid Cheshire" "Real Time" equipment`
- `site.health.ucdavis.edu "tracking" "equipment" "RFID"`
- `hospital equipment tracking RTLS implementation study United States infusion pump original study`
- `site.radboudumc.nl "track" "apparatuur"` and `site.radboudumc.nl "RTLS"`
- `"Reducing search times and entropy" Bluetooth Sony Lund`
- `"hospital" "ultrasound" "RTLS" "NHS"` and `"hospital" "UWB" "equipment" site.nhs.uk`

**Excluded/secondary leads:** vendor Blyott/SAS Jan Yperman material describes an EU Bluetooth case but was not used as independent hospital confirmation; no marketing ROI transferred. Korean BLE/Wi-Fi study [PMC6131815](https://pmc.ncbi.nlm.nih.gov/articles/PMC6131815/) is geographically outside this subtask. Delft/Rijnstate thesis [institutional record](https://repository.tudelft.nl/record/uuid%3A31da4059-5dac-4e60-93d7-36cad2d8ab46) investigates a hospital use case; it is not automatically routine deployment. Royal Wolverhampton [PMC9483226](https://pmc.ncbi.nlm.nih.gov/articles/PMC9483226/) primarily measures contact time, so it was not promoted to equipment-outcome evidence. VA tenders and archived contract PDFs gave valuable installed-system clues, but some direct URLs returned 404 and several documents describe planned expansion rather than completed outcomes. Product pages for UWB/ultrasound prove availability, not the required hospital case.

**Reproducibility limit:** This is a targeted evidence search, not a systematic review, current-site audit or regulatory assessment. Queries, source access failures, setting and COI are recorded so stronger follow-up evidence can replace provisional classifications.
