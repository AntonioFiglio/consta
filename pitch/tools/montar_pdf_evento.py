"""Assemble lossless captured slides, searchable text and clickable source links."""
from pathlib import Path
import json,fitz,shutil
from urllib.parse import urlparse,unquote
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'pitch/entrega'
manifest=json.loads((OUT/'manifesto.json').read_text())
doc=fitz.open();toc=[];font='/System/Library/Fonts/Supplemental/Arial.ttf'
for i,entry in enumerate(manifest['pages']):
 p=doc.new_page(width=960,height=540)
 p.insert_image(p.rect,filename=str(OUT/'quadros'/entry['file']))
 p.insert_font(fontname='searchtext',fontfile=font)
 for text in entry['texts']:
  rect=fitz.Rect(*[v/2 for v in text['box']]);rect.y1=min(538,rect.y1+2)
  size=max(3,text['size']/2*.92)
  for _ in range(8):
   shape=p.new_shape();result=shape.insert_textbox(rect,text['text'],fontsize=size,fontname='searchtext',render_mode=3)
   if result>=0:shape.commit();break
   size*=.86
 for link in entry['links']:
  href=link['href'];uri=href
  if href.startswith('#'):continue
  if not urlparse(href).scheme:
   local=(ROOT/'pitch'/unquote(href.split('#')[0])).resolve()
   try:relative=local.relative_to(ROOT).as_posix()
   except ValueError:continue
   uri='https://github.com/matheusbgodoi/consta/blob/main/'+relative
  if uri.startswith(('http://','https://','mailto:')):
   p.insert_link({'kind':fitz.LINK_URI,'from':fitz.Rect(*[v/2 for v in link['box']]),'uri':uri})
 toc.append([1,entry['title'],i+1])
doc.set_toc(toc)
doc.set_metadata({'title':'CONSTA — Pitch | III Hackathon Saúde HCFMUSP','author':'Equipe Consta','subject':'Apresentação completa para envio: estados finais, etapas da demonstração e agenda distribuída','creator':'Consta — exportação WebKit e PyMuPDF','keywords':'Consta, HCFMUSP, hackathon, engenharia clínica, manutenção preventiva'})
doc.set_pagelayout('SinglePage')
name='CONSTA-Pitch-Hackathon-HCFMUSP.pdf';target=OUT/name
doc.save(target,garbage=4,deflate=True,deflate_images=True,deflate_fonts=True)
doc.close()
verified=fitz.open(target)
assert len(verified)==len(manifest['pages'])
assert all(abs(p.rect.width/p.rect.height-16/9)<.001 for p in verified)
assert 'CONSTA' in verified[0].get_text()
cta_index=next(i for i,e in enumerate(manifest['pages']) if e['beat']==21)
assert any(l.get('uri')=='https://consta2.vercel.app' for l in verified[cta_index].get_links())
verified[cta_index].get_pixmap(matrix=fitz.Matrix(2,2)).save(OUT/'qa-qr-pdf.png')
# Contact sheet for human visual inspection, outside the submission PDF.
from PIL import Image,ImageOps,ImageDraw
thumbs=[]
for i,e in enumerate(manifest['pages']):
 im=Image.open(OUT/'quadros'/e['file']).convert('RGB');im.thumbnail((480,270))
 canvas=Image.new('RGB',(480,298),'#dedede');canvas.paste(im,(0,0));ImageDraw.Draw(canvas).text((8,276),f'{i+1:02d} {e["title"]}',fill='black');thumbs.append(canvas)
rows=(len(thumbs)+3)//4;sheet=Image.new('RGB',(1920,rows*298),'white')
for i,im in enumerate(thumbs):sheet.paste(im,((i%4)*480,(i//4)*298))
sheet.save(OUT/'qa-contato.png')
shutil.copy2(target,Path.home()/'Downloads'/name)
shutil.copy2(OUT/'CONSTA-Pitch-Animado.html',Path.home()/'Downloads'/'CONSTA-Pitch-Animado.html')
print(json.dumps({'pdf':str(target),'downloads':str(Path.home()/'Downloads'/name),'pages':len(verified),'bytes':target.stat().st_size,'all_pages_have_searchable_text':all(bool(p.get_text().strip()) for p in verified)},ensure_ascii=False))
