"""Native-resolution simulated camera corpus. Labels score outputs only."""
from pathlib import Path
from collections import Counter
import json
import hashlib
import time
import cv2
import numpy as np
from optical import Detector,load_family,render,SIZE,BITS

ROOT=Path(__file__).resolve().parent
SCENARIOS=['clean','perspective','combined','gradient','motion_blur','stripe_gray',
           'stripe_white','outer_ring_cover','mixed_payload','covered','mirror',
           'native_64','native_96','native_128','native_192']


def create_scene(word,scenario,rng,other=None):
    marker=render(word)
    if scenario in ['stripe_gray','stripe_white']:
        marker[:,115:141]=140 if scenario=='stripe_gray' else 255
    if scenario=='outer_ring_cover':
        yy,xx=np.indices(marker.shape)
        marker[((xx-128)**2+(yy-128)**2>=78**2)&((xx-128)**2+(yy-128)**2<=101**2)]=140
    if scenario=='mixed_payload':
        yy,xx=np.indices(marker.shape)
        mask=(xx-128)**2+(yy-128)**2>77**2
        marker[mask]=render(other)[mask]
    if scenario=='covered':marker[:]=235
    if scenario=='mirror':marker=np.fliplr(marker).copy()
    side=int(scenario.split('_')[1]) if scenario.startswith('native_') else 210
    canvas=np.full((420,600),245,dtype='uint8')
    x=int(rng.integers(30,600-side-30));y=int(rng.integers(30,420-side-30))
    quad=np.float32([[x,y],[x+side,y],[x+side,y+side],[x,y+side]])
    if scenario in ['perspective','combined']:
        # Held-out non-affine quadrilaterals; no inverse is supplied to Detector.
        quad+=np.float32([[side*.14,0],[-side*.08,side*.12],[0,-side*.12],[-side*.08,side*.04]])
        quad+=rng.uniform(-side*.02,side*.02,(4,2)).astype('float32')
    matrix=cv2.getPerspectiveTransform(np.float32([[0,0],[255,0],[255,255],[0,255]]),quad)
    warped=cv2.warpPerspective(marker,matrix,(600,420),borderValue=245)
    coverage=cv2.warpPerspective(np.full_like(marker,255),matrix,(600,420))>0
    canvas[coverage]=warped[coverage]
    if scenario in ['gradient','combined']:
        gradient=np.linspace(.45,.95,600)[None,:]
        canvas=np.clip(canvas*gradient+8,0,255).astype('uint8')
    if scenario=='combined':
        canvas=cv2.GaussianBlur(canvas,(0,0),.7)
        canvas=np.clip(canvas.astype(float)+rng.normal(0,3,canvas.shape),0,255).astype('uint8')
    if scenario=='motion_blur':
        kernel=np.zeros((5,5));kernel[2,:]=.2
        canvas=cv2.filter2D(canvas,-1,kernel)
    return canvas


def evaluate_case(detector,image,expected,case_id,scenario):
    start=time.perf_counter()
    found=detector.detect(image)
    elapsed=time.perf_counter()-start
    ids=[item['tag_id'] for item in found]
    counts=Counter(ids);truth=Counter(expected)
    correct=sum((counts&truth).values())
    extras=list((counts-truth).elements())
    missing=list((truth-counts).elements())
    return {'case_id':case_id,'scenario':scenario,'expected':expected,
            'detected':ids,'matched':correct,'missing':missing,'extras':extras,
            'elapsed_seconds_observed':elapsed,'diagnostics':detector.diagnostics,
            'detections':found}


def main():
    family=load_family(ROOT/'catalog32.json')
    detector=Detector(family)
    rng=np.random.default_rng(202611071)
    (ROOT/'examples').mkdir(exist_ok=True)
    observations=[]
    for index,word in enumerate(family):
        image=create_scene(word,'clean',rng)
        observation=evaluate_case(detector,image,[f'CONSTA-{index+1:04d}'],
                                  f'clean-{index}','clean')
        observations.append(observation)
    # Hold-out conditions reuse the issued dictionary but change native images.
    sample=rng.choice(len(family),size=min(96,len(family)),replace=False)
    for scenario in SCENARIOS[1:]:
        for sequence,index in enumerate(sample):
            image=create_scene(family[index],scenario,rng,other=family[(index+1)%len(family)])
            expected=[] if scenario in ['covered','mirror','mixed_payload'] else [f'CONSTA-{index+1:04d}']
            observation=evaluate_case(detector,image,expected,f'{scenario}-{sequence}',scenario)
            observations.append(observation)
            if sequence<3:
                cv2.imwrite(str(ROOT/f'examples/{scenario}-{sequence}.png'),image)
    # Natural-looking simple distractors are not codewords from the generator.
    for sequence in range(96):
        image=np.full((420,600),245,dtype='uint8')
        for _ in range(12):
            x,y=map(int,rng.integers([10,10],[590,410]))
            radius=int(rng.integers(4,50))
            cv2.circle(image,(x,y),radius,int(rng.integers(0,220)),int(rng.integers(1,5)))
        observations.append(evaluate_case(detector,image,[],f'clutter-{sequence}','clutter'))
        if sequence==0:cv2.imwrite(str(ROOT/'examples/clutter.png'),image)
    # Simultaneous native markers, scored as multisets to expose duplicates.
    for sequence in range(24):
        image=np.full((720,1280),245,dtype='uint8');expected=[]
        chosen=rng.choice(len(family),size=6,replace=False)
        for slot,index in enumerate(chosen):
            x=40+(slot%3)*410;y=30+(slot//3)*350
            marker=cv2.resize(render(family[index]),(220,220),interpolation=cv2.INTER_AREA)
            image[y:y+220,x:x+220]=marker
            expected.append(f'CONSTA-{index+1:04d}')
        observation=evaluate_case(detector,image,expected,f'multiple-{sequence}','multiple')
        observations.append(observation)
        if sequence==0:
            cv2.imwrite(str(ROOT/'examples/multiple.png'),image)
    summary={}
    for row in observations:
        s=summary.setdefault(row['scenario'],{'cases':0,'expected':0,'matched':0,'missed':0,'extra_ids':0,'budget_hits':0})
        s['cases']+=1;s['expected']+=len(row['expected']);s['matched']+=row['matched']
        s['missed']+=len(row['missing']);s['extra_ids']+=len(row['extras'])
        s['budget_hits']+=row['diagnostics']['candidate_budget_hit']
    result={'synthetic_only':True,'native_resolution':True,'seed':202611071,
            'dictionary_size':len(family),'payload_bits':BITS,'summary':summary,'observations':observations,
            'detector_sha256':hashlib.sha256((ROOT/'optical.py').read_bytes()).hexdigest(),
            'catalog_sha256':hashlib.sha256((ROOT/'catalog32.json').read_bytes()).hexdigest()}
    (ROOT/'results.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(summary,indent=2))


if __name__=='__main__':main()
