from pathlib import Path
import json,re,base64
root=Path.cwd(); assets=root/'apps/crm/dist/assets'
css='\n'.join(p.read_text() for p in assets.glob('*.css'))
def embed(m):
 p=assets/Path(m[1].strip('\"\'')).name
 if not p.exists(): return m[0]
 mime='font/woff2' if p.suffix=='.woff2' else 'font/woff'
 return 'url(data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()+')'
css=re.sub(r'url\(([^)]+)\)',embed,css)
snap=json.loads(Path('pitch/demo/native/snapshots.json').read_text())
for key,html in snap.items():
 def img(m):
  path=root/'apps/crm/public'/m[1].lstrip('/')
  if not path.exists(): return m[0]
  return 'src="data:image/svg+xml;base64,'+base64.b64encode(path.read_bytes()).decode()+'"'
 snap[key]=re.sub(r'src="([^"]+)"',img,html)
payload={'css':css,'states':snap,'provenance':'DOM e CSS do CRM; API real SQLite :memory:; extração HTTP simulada; reprodução sem backend.'}
Path('pitch/demo/native/crm-dom.js').write_text('/* Generated from the actual CRM; explicitly simulated replay. */\nwindow.constaNativeDemo='+json.dumps(payload,ensure_ascii=False)+';\n')
