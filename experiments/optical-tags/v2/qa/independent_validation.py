"""Independent bounded synthetic challenge: final pixels only enter Detector.

Separate harness from benchmark.py. All failures remain in the results and PNGs.
No clinical, physical-camera, optical-range, or hospital facts are inferred.
"""
from pathlib import Path
from collections import Counter
import hashlib
import json
import sys
import time

import cv2
import numpy as np

HERE=Path(__file__).resolve().parent
V2=HERE.parent
sys.path.insert(0,str(V2))
from optical import Detector, load_family, render, SIZE, BITS

SEED=381117
FRAMES=(800,600)

def checksum(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def add_marker(canvas,marker,center,side,angle,rng,projective=False):
    # Per-frame true geometry is consumed exclusively by rendering/scoring.
    offsets=np.float32([[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]])*side
    if projective:
        offsets+=np.float32([[.10,.02],[-.10,.13],[.02,-.08],[-.03,-.02]])*side
        offsets+=rng.uniform(-.025,.025,(4,2)).astype('float32')*side
    a=np.deg2rad(angle); rotation=np.float32([[np.cos(a),-np.sin(a)],[np.sin(a),np.cos(a)]])
    quad=offsets@rotation.T+np.float32(center)
    H=cv2.getPerspectiveTransform(np.float32([[0,0],[255,0],[255,255],[0,255]]),quad)
    w,h=canvas.shape[1],canvas.shape[0]
    warped=cv2.warpPerspective(marker,H,(w,h),borderValue=245)
    coverage=cv2.warpPerspective(np.full(marker.shape,255,np.uint8),H,(w,h))>0
    canvas[coverage]=warped[coverage]
    return quad.tolist()


def main():
    rng=np.random.default_rng(SEED)
    family=load_family(V2/'catalog32.json')
    detector=Detector(family)
    images=HERE/'independent_frames';images.mkdir(exist_ok=True)
    observations=[]
    def check(image,expected,scenario,sequence,truth_geometry,config):
        start=time.perf_counter()
        found=detector.detect(image) # ONLY final pixels; no expected/corners/mask.
        elapsed=time.perf_counter()-start
        actual=[d['tag_id'] for d in found]
        spatial_mismatches=[]
        if expected:
            for d in found:
                if d['tag_id'] not in expected:continue
                if truth_geometry and isinstance(truth_geometry[0],dict):
                    polygons=[g['polygon'] for g in truth_geometry if g['id_render_only']==d['tag_id']]
                else:polygons=truth_geometry
                if not any(cv2.pointPolygonTest(np.asarray(p,np.float32),tuple(map(float,d['center'])),False)>=0 for p in polygons):
                    spatial_mismatches.append(d)
        truth,seen=Counter(expected),Counter(actual)
        row={'scenario':scenario,'sequence':sequence,'expected':expected,
             'detected':actual,'missing':list((truth-seen).elements()),
             'extras':list((seen-truth).elements()),'detections':found,
             'spatial_mismatches_scoring_only':spatial_mismatches,
             'diagnostics':dict(detector.diagnostics),'seconds_observed':elapsed,
             'render_only_geometry':truth_geometry,'configuration':config}
        file=images/f'{scenario}-{sequence:02d}.png';cv2.imwrite(str(file),image)
        row['frame']=str(file.relative_to(HERE))
        row['pixel_sha256']=hashlib.sha256(image.tobytes()).hexdigest()
        observations.append(row)
        if row['extras']:
            print(json.dumps({'ALERT':'unexpected accepted ID','case':row}),flush=True)
    groups=['native','projective_rotated','combined','partial_payload',
            'payload_unobservable','mirror','mixed_rings','negative',
            'white_straight','white_diagonal','payload_all_white','broken_frame_unknown',
            'subnative','fully_covered']
    for group in groups:
        for sequence in range(4 if group in ['white_straight','white_diagonal','payload_all_white',
                                           'broken_frame_unknown','subnative','fully_covered'] else 8):
            index=int(rng.integers(0,len(family)));word=family[index]
            expected=[f'CONSTA-{index+1:04d}'];marker=render(word)
            canvas=np.full((FRAMES[1],FRAMES[0]),245,np.uint8)
            side=[48,64,96,144][sequence%4] if group=='native' else 210
            if group=='subnative':side=[20,24,32,40][sequence]
            angle=float(rng.uniform(-180,180))
            config={'side_preset_pixels':side,'rotation_render_degrees':angle}
            if group=='white_straight':
                marker[:,115:141]=255
            if group=='white_diagonal':
                cv2.line(marker,(35,0),(220,255),255,18)
            if group=='payload_all_white':
                yy,xx=np.indices(marker.shape);r=np.hypot(xx-128,yy-128)
                marker[(r>43)&(r<103)]=255;expected=[]
            if group=='fully_covered':marker[:]=235;expected=[]
            if group=='broken_frame_unknown':
                while True:
                    foreign=int(rng.integers(0,1<<BITS))
                    bits=np.array([(foreign>>bit)&1 for bit in range(BITS)])
                    distance=np.count_nonzero(detector.codes!=bits,axis=1).min()
                    if distance>3:break
                marker=render(foreign);expected=[]
                marker[8:14,115:141]=255;marker[243:249,115:141]=255
                config['foreign_word_render_only']=f'{foreign:032b}'
                config['nearest_discrete_distance_render_only']=int(distance)
            if group=='partial_payload':
                # Does not destroy frame/finder: diagonal-ish patch across payload.
                cv2.rectangle(marker,(112,92),(130,164),140,-1)
            if group=='payload_unobservable':
                yy,xx=np.indices(marker.shape);r=np.hypot(xx-128,yy-128)
                marker[(r>43)&(r<103)]=140
                expected=[]
            if group=='mirror':marker=np.fliplr(marker).copy();expected=[]
            if group=='mixed_rings':
                other=int(rng.integers(0,len(family)-1));other+=other>=index
                yy,xx=np.indices(marker.shape);r=np.hypot(xx-128,yy-128)
                band=(r>.30*SIZE)&(r<.40*SIZE)
                marker[band]=render(family[other])[band]
                expected=[];config['other_id_render_only']=f'CONSTA-{other+1:04d}'
            if group=='negative':
                expected=[]
                if sequence<4:
                    # Independent clutter, not generated by marker renderer.
                    for _ in range(14):
                        x,y=map(int,rng.integers([20,20],[780,580]))
                        radius=int(rng.integers(8,65))
                        cv2.circle(canvas,(x,y),radius,int(rng.integers(0,200)),int(rng.integers(1,5)))
                    cv2.putText(canvas,'O0 CONST A 1088',(120,200),cv2.FONT_HERSHEY_SIMPLEX,1.2,0,2)
                    for j in range(4):
                        cv2.rectangle(canvas,(75+j*110,360),(160+j*110,450),0,4)
                    check(canvas,expected,group,sequence,[],{'type':'clutter'})
                    continue
                while True:
                    foreign=int(rng.integers(0,1<<BITS))
                    bits=np.array([(foreign>>bit)&1 for bit in range(BITS)])
                    distance=np.count_nonzero(detector.codes!=bits,axis=1).min()
                    if distance>1:break
                marker=render(foreign)
                config['type']='foreign_outside_correction_neighborhood'
                config['foreign_word_render_only']=f'{foreign:032b}'
                config['nearest_discrete_distance_render_only']=int(distance)
            quad=add_marker(canvas,marker,(float(rng.integers(220,580)),float(rng.integers(180,420))),
                            side,angle,rng,projective=group in ['projective_rotated','combined'])
            if group=='combined':
                yy,xx=np.indices(canvas.shape)
                illumination=.35+.45*(xx/canvas.shape[1])+.12*(yy/canvas.shape[0])
                canvas=np.clip(canvas*illumination+7,0,255).astype('uint8')
                kernel=np.zeros((5,5));kernel[:,2]=.2
                canvas=cv2.filter2D(canvas,-1,kernel)
                canvas=np.clip(canvas.astype(float)+rng.normal(0,4,canvas.shape),0,255).astype('uint8')
            check(canvas,expected,group,sequence,[quad],config)
        print('Completed '+group,flush=True)
    for sequence in range(4):
        canvas=np.full((720,1280),245,np.uint8);expected=[];geometry=[]
        chosen=rng.choice(len(family),size=4,replace=False)
        for slot,index in enumerate(chosen):
            side=[96,144,192,128][slot]
            q=add_marker(canvas,render(family[index]),(200+slot%2*650,180+slot//2*370),
                         side,float(rng.uniform(-180,180)),rng,projective=True)
            geometry.append({'id_render_only':f'CONSTA-{index+1:04d}','polygon':q})
            expected.append(f'CONSTA-{index+1:04d}')
        check(canvas,expected,'multi_mixed_native',sequence,geometry,{'type':'four_separate_native_markers'})
    summaries={}
    for row in observations:
        s=summaries.setdefault(row['scenario'],{'cases':0,'missing_ids':0,'extra_ids':0,'budget_hits':0,'spatial_mismatches':0})
        s['cases']+=1;s['missing_ids']+=len(row['missing']);s['extra_ids']+=len(row['extras'])
        s['budget_hits']+=int(row['diagnostics']['candidate_budget_hit'])
        s['spatial_mismatches']+=len(row['spatial_mismatches_scoring_only'])
    result={'synthetic_only':True,'independent_harness':True,'same_base_marker_renderer':True,
            'seed':SEED,'versions':{'opencv':cv2.__version__,'numpy':np.__version__},
            'hashes':{'optical.py':checksum(V2/'optical.py'),'catalog32.json':checksum(V2/'catalog32.json'),
                      'independent_validation.py':checksum(__file__)},
            'native_camera_frames':True,'summary_raw_counts':summaries,'observations':observations}
    (HERE/'independent_results.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(summaries,indent=2))

if __name__=='__main__':main()
