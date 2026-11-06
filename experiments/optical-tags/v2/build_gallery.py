"""Offline V2 results viewer; saved observations are never presented as live reads."""
from pathlib import Path
import json
import cv2
from PIL import Image,ImageDraw,ImageFont
from optical import render

ROOT=Path(__file__).resolve().parent
result=json.loads((ROOT/'results.json').read_text())
independent=json.loads((ROOT/'qa/independent_results.json').read_text())
catalog=json.loads((ROOT/'catalog32.json').read_text())
(ROOT/'tags').mkdir(exist_ok=True)
samples=[]
for row in result['observations']:
    if row['scenario']=='clean' or row['scenario']=='multiple':continue
    sequence=int(row['case_id'].rsplit('-',1)[-1])
    if sequence<3 and row['scenario']!='clutter':
        samples.append({**row,'frame':f'examples/{row["scenario"]}-{sequence}.png'})
for row in samples:
    for identity in row['expected']:
        word=next(t['word'] for t in catalog['tags'] if t['tag_id']==identity)
        cv2.imwrite(str(ROOT/f'tags/{identity}.png'),render(int(word,2)))
font=ImageFont.truetype(str(ROOT.parents[2]/'brand/fonts/Manrope-Variable.ttf'),20)
board=Image.new('RGB',(1120,720),'#D3EFFF');draw=ImageDraw.Draw(board)
draw.text((24,20),'consta / óptica v2 — identidades próprias e leitura por pixels',font=font,fill='#154F6F')
for i,tag in enumerate(catalog['tags'][:8]):
    x=35+(i%4)*275;y=80+(i//4)*290
    image=Image.fromarray(render(int(tag['word'],2))).convert('RGB');image.thumbnail((220,220))
    board.paste(image,(x,y));draw.text((x+28,y+225),tag['tag_id'],font=font,fill='#154F6F')
draw.text((24,680),'Moldura comum + referências geométricas + código redundante individual.',font=font,fill='#154F6F')
board.save(ROOT/'overview.png')
data={'samples':samples,'summary':result['summary'],'independent':independent['summary_raw_counts'],
      'failures':[row for row in independent['observations'] if row['missing'] or row['extras']]}
template=(ROOT/'index.template.html').read_text()
(ROOT/'index.html').write_text(template.replace('__RESULTS__',json.dumps(data)))
print('V2 offline gallery and identity overview built.')
