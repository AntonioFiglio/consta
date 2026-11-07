"""Bundle the existing pitch and local assets into one offline HTML file."""
from pathlib import Path
from bs4 import BeautifulSoup
import re,mimetypes,base64,hashlib,json
ROOT=Path(__file__).resolve().parents[2]
PITCH=ROOT/'pitch'
OUT=PITCH/'entrega'/'CONSTA-Pitch-Animado.html'
cache={}
def uri(source,base):
 source=source.strip().strip('\"\'')
 if not source or source.startswith(('data:','http:','https:','#','//','about:')):return source
 fragment=''
 if '#' in source:source,fragment=source.split('#',1);fragment='#'+fragment
 target=(base/source.split('?')[0]).resolve()
 if not target.is_file():raise FileNotFoundError(target)
 if target not in cache:
  mime=mimetypes.guess_type(target.name)[0] or 'application/octet-stream'
  cache[target]='data:'+mime+';base64,'+base64.b64encode(target.read_bytes()).decode()
 return cache[target]+fragment
def css(text,base):
 return re.sub(r'url\(([^)]+)\)',lambda m:'url("'+uri(m.group(1),base)+'")',text)
soup=BeautifulSoup((PITCH/'deck.html').read_text(),'html.parser')
for link in list(soup.select('link[rel="stylesheet"]')):
 path=(PITCH/link['href']).resolve();style=soup.new_tag('style');style.string=css(path.read_text(),path.parent);link.replace_with(style)
for style in soup.find_all('style'):
 if style.string:style.string=css(str(style.string),PITCH)
for tag in soup.select('[style]'):tag['style']=css(tag['style'],PITCH)
for tag in soup.find_all(['img','source','video','audio','link']):
 for attribute in ['src','poster','href']:
  if tag.has_attr(attribute) and not(tag.name=='link' and attribute!='href'):tag[attribute]=uri(tag[attribute],PITCH)
for tag in soup.find_all('script',src=True):
 target=(PITCH/tag['src']).resolve();code=target.read_text();tag.attrs.pop('src')
 tag.string=code.replace('</script','<\\/script')
# Native replay is normally loaded dynamically. Supply it before product-demo.js.
native=soup.new_tag('script');native.string=(PITCH/'demo/native/crm-dom.js').read_text().replace('</script','<\\/script')
soup.head.append(native)
# Related documents open the canonical public repository rather than missing local files.
for tag in soup.select('a[href]'):
 href=tag['href']
 if href.startswith(('http:','https:','mailto:','tel:','#','data:')):continue
 target=(PITCH/href.split('#')[0]).resolve()
 try:relative=target.relative_to(ROOT)
 except ValueError:continue
 tag['href']='https://github.com/matheusbgodoi/consta/blob/main/'+relative.as_posix()
OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(str(soup))
print(json.dumps({'file':str(OUT),'bytes':OUT.stat().st_size,'embedded_assets':len(cache),'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()}))
