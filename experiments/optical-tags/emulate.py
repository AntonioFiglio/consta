"""Disposable synthetic optical-ID experiment; no hospital or EMC validation.

The detector receives pixels and the public codebook only. Ground-truth IDs and
rendering transforms are used exclusively by the evaluation harness.
"""
from pathlib import Path
import json
import math
import random

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
BITS = 24
SIZE = 256
FAMILY_SIZE = 64
SEPARATION = 6
MAX_ERRORS = 1
MASK = (1 << BITS) - 1


def rotations(word):
    return [((word << shift) | (word >> (BITS - shift))) & MASK
            for shift in range(BITS)]


def reverse_word(word):
    return int(f'{word:0{BITS}b}'[::-1], 2)


def make_codebook():
    rng = random.Random(731)
    family = []
    forbidden = []
    while len(family) < FAMILY_SIZE + 1:
        word = rng.randrange(1 << BITS)
        if not 8 <= word.bit_count() <= 16:
            continue
        orbit = rotations(word)
        mirrored = rotations(reverse_word(word))
        if min((word ^ other).bit_count() for other in orbit[1:] + mirrored) < SEPARATION:
            continue
        if any((word ^ other).bit_count() < SEPARATION for other in forbidden):
            continue
        family.append(word)
        forbidden.extend(orbit + mirrored)
    return family


def render(word):
    scale = 3
    canvas = Image.new('L', (SIZE * scale, SIZE * scale), 255)
    draw = ImageDraw.Draw(canvas)
    center = SIZE * scale / 2
    def circle(radius, color):
        r = radius * SIZE * scale
        draw.ellipse((center-r, center-r, center+r, center+r), fill=color)
    circle(.46, 0)
    circle(.425, 255)
    r = .37 * SIZE * scale
    for bit in range(BITS):
        if word & (1 << bit):
            draw.pieslice((center-r,center-r,center+r,center+r),
                          start=bit*360/BITS, end=(bit+1)*360/BITS, fill=0)
    circle(.27, 255)
    circle(.08, 0)
    return np.array(canvas.resize((SIZE,SIZE), Image.Resampling.LANCZOS))


def candidate_ellipses(image):
    _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    result = []
    for contour in contours:
        if len(contour) < 20 or cv2.contourArea(contour) < 200:
            continue
        center, axes, angle = cv2.fitEllipse(contour)
        if min(axes) < 16 or min(axes)/max(axes) < .35:
            continue
        expected = math.pi * axes[0] * axes[1] / 4
        if not .8 <= cv2.contourArea(contour)/expected <= 1.15:
            continue
        result.append((center, axes, angle))
    return result


def sample(image, ellipse, radius, phase):
    (cx,cy),(dx,dy),angle = ellipse
    theta = np.arange(BITS) * 2*math.pi/BITS + phase
    # Normalize each candidate ellipse detected in the input pixels.
    x = np.cos(theta) * dx/2 * radius
    y = np.sin(theta) * dy/2 * radius
    a = math.radians(angle)
    px = np.rint(cx + x*math.cos(a) - y*math.sin(a)).astype(int)
    py = np.rint(cy + x*math.sin(a) + y*math.cos(a)).astype(int)
    px = np.clip(px,0,image.shape[1]-1)
    py = np.clip(py,0,image.shape[0]-1)
    return image[py,px].astype(float)


def detect(image, family):
    orbits = [rotations(word) for word in family]
    accepted = []
    for ellipse in candidate_ellipses(image):
        black = np.median(sample(image,ellipse,.98,0))
        white = np.median(sample(image,ellipse,.48,0))
        if white-black < 50:
            continue
        threshold = (white+black)/2
        possibilities = []
        for phase in np.linspace(0,2*math.pi/BITS,16,endpoint=False):
            values = np.median([sample(image,ellipse,r,phase) for r in [.66,.69,.72]],axis=0)
            if np.count_nonzero(np.abs(values-threshold)<(white-black)*.12)>1:
                continue
            word = sum(int(value<threshold)<<bit for bit,value in enumerate(values))
            distances = [min((word^candidate).bit_count() for candidate in orbit) for orbit in orbits]
            ranked = sorted(enumerate(distances),key=lambda item:item[1])
            if ranked[0][1] <= MAX_ERRORS and ranked[1][1]-ranked[0][1] >= 2:
                possibilities.append((ranked[0][0],ranked[0][1]))
        identities = {item[0] for item in possibilities}
        if len(identities)==1:
            index = next(iter(identities))
            accepted.append({'tag_id':f'CONSTA-{index+1:04d}',
                             'bit_errors':min(error for candidate,error in possibilities if candidate==index),
                             'center':[round(v,1) for v in ellipse[0]]})
    return accepted


def transform(image, scenario):
    if scenario=='clean':
        return image.copy()
    if scenario=='rotation':
        return cv2.warpAffine(image,cv2.getRotationMatrix2D((128,128),37,1),
                              (SIZE,SIZE),borderValue=255)
    if scenario=='blur':
        return cv2.GaussianBlur(image,(0,0),2.5)
    if scenario=='low_light':
        return (image.astype(float)*.45+12).astype('uint8')
    if scenario in ['small','tiny']:
        side = 48 if scenario=='small' else 16
        reduced = cv2.resize(image,(side,side),interpolation=cv2.INTER_AREA)
        return cv2.resize(reduced,(SIZE,SIZE),interpolation=cv2.INTER_LINEAR)
    if scenario=='oblique':
        matrix=np.float32([[.8,.12,12],[0,.58,48]])
        return cv2.warpAffine(image,matrix,(SIZE,SIZE),borderValue=255)
    if scenario=='perspective':
        matrix=cv2.getPerspectiveTransform(np.float32([[0,0],[255,0],[255,255],[0,255]]),
                                          np.float32([[42,25],[225,55],[250,208],[15,240]]))
        return cv2.warpPerspective(image,matrix,(SIZE,SIZE),borderValue=255)
    if scenario=='partial_cover':
        result=image.copy(); result[0:SIZE,115:155]=235; return result
    if scenario=='covered':
        return np.full_like(image,235)
    if scenario=='mirror':
        return np.fliplr(image).copy()
    raise ValueError(scenario)


def evaluate(family, unknown):
    scenarios=['clean','rotation','blur','low_light','small','tiny','oblique',
               'perspective','partial_cover','covered','mirror']
    observations=[]
    for index,word in enumerate(family):
        truth=f'CONSTA-{index+1:04d}'
        for scenario in scenarios:
            pixels=transform(render(word),scenario)
            found=detect(pixels,family)
            ids=[item['tag_id'] for item in found]
            status='correct' if ids==[truth] else 'rejected' if not ids else 'wrong'
            observations.append({'expected':truth,'scenario':scenario,'detected':ids,'status':status})
            if index<8:
                Image.fromarray(pixels).save(ROOT/f'assets/{truth}-{scenario}.png')
        Image.fromarray(render(word)).save(ROOT/f'tags/{truth}.png')
    for scenario,pixels in [('unknown',render(unknown)),('empty',np.full((SIZE,SIZE),255,dtype='uint8'))]:
        found=detect(pixels,family)
        observations.append({'expected':None,'scenario':scenario,
                             'detected':[item['tag_id'] for item in found],
                             'status':'rejected' if not found else 'wrong'})
        Image.fromarray(pixels).save(ROOT/f'assets/{scenario}.png')
    # A composite scene tests localization from multiple independent candidates.
    scene=np.full((600,900),245,dtype='uint8')
    for index,(x,y) in enumerate([(30,30),(340,40),(640,300)]):
        scene[y:y+SIZE,x:x+SIZE]=transform(render(family[index]),'rotation')
    found=detect(scene,family)
    Image.fromarray(scene).save(ROOT/'assets/multiple.png')
    return observations,found


def main():
    (ROOT/'assets').mkdir(exist_ok=True)
    (ROOT/'tags').mkdir(exist_ok=True)
    words=make_codebook()
    family,unknown=words[:-1],words[-1]
    (ROOT/'codebook.json').write_text(json.dumps({
        'experimental':True,'bits':BITS,'minimum_separation_target':SEPARATION,
        'maximum_accepted_bit_errors':MAX_ERRORS,
        'tags':[{'tag_id':f'CONSTA-{index+1:04d}','word':f'{word:0{BITS}b}'}
                for index,word in enumerate(family)]},indent=2))
    observations,multiple=evaluate(family,unknown)
    totals={scenario:{status:sum(row['scenario']==scenario and row['status']==status for row in observations)
                      for status in ['correct','rejected','wrong']}
            for scenario in dict.fromkeys(row['scenario'] for row in observations)}
    result={'synthetic_only':True,'seed':731,'observations':observations,
            'scenario_counts':totals,'multiple_scene_detections':multiple}
    (ROOT/'results.json').write_text(json.dumps(result,indent=2))
    print(json.dumps({'scenario_counts':totals,'multiple_scene_detections':multiple},indent=2))


if __name__=='__main__':
    main()
