"""Behavior checks for the disposable optical experiment, not clinical tests."""
import json
import random
from pathlib import Path
import cv2
import numpy as np
from emulate import BITS, SEPARATION, detect, render, rotations, reverse_word

ROOT=Path(__file__).resolve().parent
book=json.loads((ROOT/'codebook.json').read_text())
family=[int(item['word'],2) for item in book['tags']]
assert len(set(family))==len(family)
for index,word in enumerate(family):
    comparisons=rotations(word)[1:]+rotations(reverse_word(word))
    for other in family[index+1:]:
        comparisons+=rotations(other)+rotations(reverse_word(other))
    assert all((word^other).bit_count()>=SEPARATION for other in comparisons)

rng=random.Random(20261106)
held_out=[]
for index,word in enumerate(family):
    angle=rng.uniform(-180,180)
    matrix=cv2.getRotationMatrix2D((128,128),angle,rng.uniform(.65,.95))
    matrix[:,2]+=np.array([rng.uniform(-8,8),rng.uniform(-8,8)])
    scene=cv2.warpAffine(render(word),matrix,(256,256),borderValue=255)
    noise=np.random.default_rng(index+119).normal(0,3,scene.shape)
    scene=np.clip(scene.astype(float)+noise,0,255).astype('uint8')
    expected=f'CONSTA-{index+1:04d}'
    found=[item['tag_id'] for item in detect(scene,family)]
    assert found==[expected], (expected,found)
    # A local bit substitution should not silently assign a different asset.
    changed=word^(1<<rng.randrange(BITS))
    found_corrupt=[item['tag_id'] for item in detect(render(changed),family)]
    assert found_corrupt==[expected], (expected,found_corrupt)
    held_out.append({'expected':expected,'detected':found,'one_bit_change':found_corrupt})

results=json.loads((ROOT/'results.json').read_text())
assert all(row['status']=='correct' for row in results['observations'] if row['scenario']=='clean')
assert not any(row['detected'] for row in results['observations']
               if row['scenario'] in ['covered','mirror','unknown','empty'])
assert {item['tag_id'] for item in results['multiple_scene_detections']}=={
    'CONSTA-0001','CONSTA-0002','CONSTA-0003'}
(ROOT/'verification.json').write_text(json.dumps({
    'synthetic_only':True,'dictionary_rotation_and_mirror_audit':'passed',
    'held_out_seed':20261106,'held_out':held_out,
    'boundary_cases':'assertions passed'},indent=2))
print('Dictionary, independent transformed pixels, bit substitutions and boundary cases passed.')
