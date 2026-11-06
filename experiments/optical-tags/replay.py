"""Render an animated replay of pixel detections in fictional rooms."""
from pathlib import Path
import json
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from emulate import detect, render

ROOT=Path(__file__).resolve().parent
book=json.loads((ROOT/'codebook.json').read_text())
family=[int(tag['word'],2) for tag in book['tags']]
font=ImageFont.truetype(str(ROOT.parents[1]/'brand/fonts/Manrope-Variable.ttf'),15)
frames=[]
events=[]
for frame in range(32):
    pixels=np.full((360,720),248,dtype='uint8')
    truth=[]
    for index in range(3):
        x=35+int((frame/31 if index!=1 else 1-frame/31)*560)
        y=35+index*100
        marker=cv2.resize(render(family[index]),(90,90),interpolation=cv2.INTER_AREA)
        pixels[y:y+90,x:x+90]=marker
        hidden=index==1 and 11<=frame<=19
        if hidden:pixels[y:y+90,x:x+90]=225
        truth.append({'tag_id':book['tags'][index]['tag_id'],'covered':hidden})
    observations=detect(pixels,family)
    im=Image.fromarray(pixels).convert('RGB');draw=ImageDraw.Draw(im)
    draw.line((360,0,360,335),fill='#8EACBD',width=2)
    draw.text((12,8),'Ambiente A / fictício',fill='#154F6F',font=font)
    draw.text((380,8),'Ambiente B / fictício',fill='#154F6F',font=font)
    for obs in observations:
        x,y=obs['center'];room='A' if x<360 else 'B'
        draw.text((x-42,y+43),obs['tag_id']+' / '+room,fill='#154F6F',font=font)
        obs['room']=room
    draw.rectangle((0,336,720,360),fill='#154F6F')
    draw.text((10,338),'Replay sintético: rótulos vêm do detector; marca coberta não gera posição.',fill='white',font=font)
    frames.append(im)
    events.append({'frame':frame,'observations':observations,'ground_truth_for_audit_only':truth})
frames[0].save(ROOT/'replay.gif',save_all=True,append_images=frames[1:],duration=140,loop=0)
(ROOT/'replay.json').write_text(json.dumps({'synthetic_only':True,'events':events},indent=2))
# Verify the configured loss of visibility rather than silently inventing a read.
for event in events:
    found={item['tag_id'] for item in event['observations']}
    if 11<=event['frame']<=19:assert 'CONSTA-0002' not in found
    else:assert 'CONSTA-0002' in found
    assert 'CONSTA-0001' in found and 'CONSTA-0003' in found
print('Animated pixel replay built; visible identities and configured occlusion verified.')
