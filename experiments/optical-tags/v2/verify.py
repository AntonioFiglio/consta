"""Regression gates for the declared optical envelope, with failures preserved."""
from pathlib import Path
import hashlib
import json
from optical import Detector,load_family,render

ROOT=Path(__file__).resolve().parent
family=load_family()
book=json.loads((ROOT/'catalog32.json').read_text())
assert book['generation']['target_count']==book['generation']['actual_count']==len(family)
assert book['audit']['passed'] and not book['generation']['separation_relaxed']
try:load_family(ROOT.parent/'codebook.json')
except ValueError:pass
else:raise AssertionError('Incompatible V1 dictionary was silently accepted')
try:Detector([family[0],family[0]])
except ValueError:pass
else:raise AssertionError('Duplicate issued identity words were accepted')
detector=Detector(family)
assert [d['tag_id'] for d in detector.detect(render(family[0]))]==['CONSTA-0001']

main=json.loads((ROOT/'results.json').read_text())
for row in main['observations']:
    assert not row['extras'],row['case_id']
    assert not row['missing'],row['case_id']
    assert not row['diagnostics']['candidate_budget_hit'],row['case_id']
independent=json.loads((ROOT/'qa/independent_results.json').read_text())
assert independent['hashes']['optical.py']==hashlib.sha256((ROOT/'optical.py').read_bytes()).hexdigest()
for row in independent['observations']:
    assert not row['extras'],(row['scenario'],row['sequence'])
    assert not row['spatial_mismatches_scoring_only'],(row['scenario'],row['sequence'])
    # These are documented unsupported boundaries, not converted into positives.
    if row['missing']:
        assert row['scenario'] in ['white_diagonal','subnative']
assert any(row['missing'] for row in independent['observations']), 'Hard boundary fixtures unexpectedly absent'
print('V2 catalogue, native-frame regressions, no-extra-ID gates and preserved hard-case failures verified.')
