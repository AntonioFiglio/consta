"""Moving synthetic objects; labels and room transitions derive from pixel reads."""
from pathlib import Path
import json
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from optical import Detector,load_family,render

ROOT=Path(__file__).resolve().parent
family=load_family();detector=Detector(family)
font=ImageFont.truetype(str(ROOT.parents[2]/'brand/fonts/Manrope-Variable.ttf'),16)
frames=[];events=[];last_seen={}
for frame in range(48):
    pixels=np.full((600,1100),245,dtype='uint8')
    for index in range(3):
        progress=frame/47 if index!=1 else 1-frame/47
        x=35+int(progress*850);y=35+index*170
        quad=np.float32([[x+18,y],[x+160,y+12],[x+175,y+150],[x,y+165]])
        M=cv2.getPerspectiveTransform(np.float32([[0,0],[255,0],[255,255],[0,255]]),quad)
        marker=render(family[index])
        if index==0 and 12<=frame<=20:marker[:,115:141]=255
        if index==1 and 26<=frame<=37:marker[:]=235
        warped=cv2.warpPerspective(marker,M,(1100,600),borderValue=245)
        mask=cv2.warpPerspective(np.full_like(marker,255),M,(1100,600))>0
        pixels[mask]=warped[mask]
    detections=detector.detect(pixels)
    for item in detections:
        item['room']='A' if item['center'][0]<550 else 'B'
        last_seen[item['tag_id']]={'frame':frame,'room':item['room']}
    image=Image.fromarray(pixels).convert('RGB');draw=ImageDraw.Draw(image)
    draw.line((550,0,550,550),fill='#8EACBD',width=2)
    draw.text((20,7),'Ambiente A / simulado',font=font,fill='#154F6F')
    draw.text((570,7),'Ambiente B / simulado',font=font,fill='#154F6F')
    for item in detections:
        x,y=item['center'];draw.text((x-55,y+76),item['tag_id']+' / '+item['room'],font=font,fill='#154F6F')
    draw.rectangle((0,550,1100,600),fill='#154F6F')
    current={item['tag_id'] for item in detections}
    statuses={}
    for index in range(3):
        identity=f'CONSTA-{index+1:04d}'
        state='observado agora' if identity in current else 'SEM LEITURA ATUAL'
        statuses[identity]=state
        draw.text((12+index*365,558),identity+': '+state,font=font,fill='white')
    events.append({'frame':frame,'observations':detections,'states':statuses})
    frames.append(image)
frames[0].save(ROOT/'replay.gif',save_all=True,append_images=frames[1:],duration=120,loop=0)
(ROOT/'replay.json').write_text(json.dumps({'synthetic_only':True,'events':events},indent=2))
assert all('CONSTA-0002' not in [d['tag_id'] for d in e['observations']] for e in events if 26<=e['frame']<=37)
print('V2 motion replay rendered from pixel detections, including actual no-read states.')
