"""V2 optical candidate: pixel-derived homography, repeated payload, erasures.

No renderer coordinates, identity, homography or occlusion mask enter Detector.
This is computer-vision engineering under simulation, not clinical validation.
"""
from itertools import combinations
from pathlib import Path
import json
import math
import cv2
import numpy as np

SIZE=256
BITS=32
FINDERS=np.float32([[30,30],[226,30],[226,226],[30,226]])


def load_family(path=None):
    path=Path(path) if path else Path(__file__).parent/'catalog32.json'
    book=json.loads(path.read_text())
    if book.get('bits')!=BITS or book.get('schema_version')!=2:
        raise ValueError('V2 requires the version-2 32-bit catalogue; V1 printed tags are incompatible.')
    if any(tag['tag_id']!=f'CONSTA-{index+1:04d}' for index,tag in enumerate(book['tags'])):
        raise ValueError('Catalogue identity order does not match this detector schema.')
    return [int(tag['word'],2) for tag in book['tags']]


def render(word):
    image=np.full((SIZE,SIZE),255,dtype='uint8')
    cv2.rectangle(image,(8,8),(248,248),0,-1)
    cv2.rectangle(image,(13,13),(243,243),255,-1)
    yy,xx=np.indices(image.shape)
    dx,dy=xx-128,yy-128
    radius=np.sqrt(dx*dx+dy*dy)/SIZE
    sector=(np.mod(np.arctan2(dy,dx),2*np.pi)*BITS/(2*np.pi)).astype(int)
    active=np.array([(word>>bit)&1 for bit in range(BITS)])[sector]
    for low,high in [(.19,.27),(.31,.39)]:
        image[(radius>=low)&(radius<=high)&(active==1)]=0
    cv2.circle(image,(128,128),10,0,-1)
    for x,y in FINDERS.astype(int):
        cv2.circle(image,(x,y),10,0,-1)
        cv2.circle(image,(x,y),6,255,-1)
        cv2.circle(image,(x,y),3,0,-1)
    return image


def order_quad(points):
    points=np.asarray(points,dtype='float32')
    center=points.mean(axis=0)
    angle=np.arctan2(points[:,1]-center[1],points[:,0]-center[0])
    ordered=points[np.argsort(angle)]
    # Clockwise in image coordinates; the remaining quarter-turn is decoded.
    return np.roll(ordered,-int(np.argmin(ordered.sum(axis=1))),axis=0)


def plausible_quad(points):
    quad=order_quad(points)
    contour=quad.reshape(-1,1,2)
    if not cv2.isContourConvex(contour.astype('int32')):
        return False
    sides=np.linalg.norm(quad-np.roll(quad,1,axis=0),axis=1)
    if min(sides)<14 or min(sides)/max(sides)<.23:
        return False
    return cv2.contourArea(contour)>300


def candidates(image):
    # Threshold variants are observations, not GT masks. Otsu handles global
    # scenes; adaptive threshold helps nonuniform lighting.
    _,global_mask=cv2.threshold(image,0,255,cv2.THRESH_BINARY_INV|cv2.THRESH_OTSU)
    masks=[global_mask,cv2.adaptiveThreshold(image,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                            cv2.THRESH_BINARY_INV,41,8)]
    quads=[];finders=[]
    for mask in masks:
        contours,hierarchy=cv2.findContours(mask,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
        if hierarchy is None:continue
        h=hierarchy[0]
        for index,contour in enumerate(contours):
            area=cv2.contourArea(contour)
            if area<30:continue
            perimeter=cv2.arcLength(contour,True)
            approx=cv2.approxPolyDP(contour,.025*perimeter,True)
            if len(approx)==4 and area>400 and plausible_quad(approx[:,0,:]):
                q=order_quad(approx[:,0,:])
                if not any(np.mean(np.linalg.norm(q-old,axis=1))<3 for old in quads):
                    quads.append(q)
            child=h[index][2]
            if child<0 or h[child][2]<0 or len(contour)<5:continue
            grandchild=h[child][2]
            if cv2.contourArea(contours[grandchild])/area<.035:continue
            (cx,cy),(a,b),_=cv2.fitEllipse(contour)
            if min(a,b)<7 or min(a,b)/max(a,b)<.3:continue
            ellipse_area=np.pi*a*b/4
            if not .75<area/ellipse_area<1.2:continue
            moments=cv2.moments(contours[grandchild])
            if not moments['m00']:continue
            core=np.array([moments['m10']/moments['m00'],moments['m01']/moments['m00']])
            if np.linalg.norm(core-[cx,cy])>min(a,b)*.22:continue
            if not any(np.linalg.norm(np.array([cx,cy])-old)<4 for old in finders):
                finders.append(np.array([cx,cy],dtype='float32'))
    return quads,finders


class Detector:
    def __init__(self,family):
        if len(family)<2 or len(set(family))!=len(family) or any(word<0 or word>=(1<<BITS) for word in family):
            raise ValueError('Expected distinct, in-range 32-bit words for at least two identities.')
        self.family=family
        rotations=[];ids=[]
        mask=(1<<BITS)-1
        for index,word in enumerate(family):
            for shift in range(BITS):
                rotated=((word<<shift)|(word>>(BITS-shift)))&mask
                rotations.append([(rotated>>bit)&1 for bit in range(BITS)])
                ids.append(index)
        self.codes=np.asarray(rotations,dtype='uint8')
        self.ids=np.asarray(ids)
        self.diagnostics={}

    def decode(self,patch):
        black=np.array([np.median(patch[y-1:y+2,x-1:x+2]) for x,y in FINDERS.astype(int)])
        white_points=np.array([[48,48],[208,48],[208,208],[48,208]])
        white=np.array([np.median(patch[y-2:y+3,x-2:x+3]) for x,y in white_points])
        if np.median(white)-np.median(black)<45:return None
        # Planar illumination estimates use only known reference regions
        # located in the rectified image, not the rendering parameters.
        black_plane=np.linalg.lstsq(np.c_[FINDERS,np.ones(4)],black,rcond=None)[0]
        white_plane=np.linalg.lstsq(np.c_[white_points,np.ones(4)],white,rcond=None)[0]
        # Infer ONLY straight occlusion bands evidenced by matching interruptions
        # of opposite black frame edges. This is observed geometry, not a true
        # occlusion mask from the renderer. Arbitrary white occluders remain hard.
        threshold=(np.median(white)+np.median(black))/2
        columns=(np.median(patch[9:12,:],axis=0)>threshold)&(np.median(patch[245:248,:],axis=0)>threshold)
        rows=(np.median(patch[:,9:12],axis=1)>threshold)&(np.median(patch[:,245:248],axis=1)>threshold)
        def interrupted_bands(values):
            values=values.copy();values[:16]=False;values[240:]=False
            changes=np.diff(np.r_[False,values,False].astype(int))
            return [(int(a),int(b)) for a,b in zip(np.where(changes==1)[0],np.where(changes==-1)[0]) if 3<=b-a<=50]
        xbands=interrupted_bands(columns);ybands=interrupted_bands(rows)
        matches=[]
        for phase in [.5,.35,.65]:
            angle=(np.arange(BITS)+phase)*2*np.pi/BITS
            ring_bits=[]
            for radius in [(.205,.23,.255),(.325,.35,.375)]:
                measurements=[]
                for r in radius:
                    x=128+np.cos(angle)*r*SIZE;y=128+np.sin(angle)*r*SIZE
                    values=cv2.remap(patch,x.astype('float32')[None,:],y.astype('float32')[None,:],cv2.INTER_LINEAR)[0]
                    bp=black_plane[0]*x+black_plane[1]*y+black_plane[2]
                    wp=white_plane[0]*x+white_plane[1]*y+white_plane[2]
                    measurements.append((values-bp)/np.maximum(wp-bp,25))
                level=np.median(measurements,axis=0)
                bits=np.where(level<.25,1,np.where(level>.75,0,-1))
                mid_radius=float(np.mean(radius))
                mid_x=128+np.cos(angle)*mid_radius*SIZE
                mid_y=128+np.sin(angle)*mid_radius*SIZE
                blocked=np.zeros(BITS,dtype=bool)
                for low,high in xbands:blocked|=(mid_x>=low-1)&(mid_x<=high+1)
                for low,high in ybands:blocked|=(mid_y>=low-1)&(mid_y<=high+1)
                bits[blocked]=-1
                ring_bits.append(bits)
            first,second=ring_bits
            observed=np.where(first==second,first,
                              np.where(first<0,second,np.where(second<0,first,-1)))
            known=observed>=0
            erasures=int(np.count_nonzero(~known))
            if erasures>5:continue
            distances=np.count_nonzero(self.codes[:,known]!=observed[known],axis=1)
            per_id=distances.reshape(len(self.family),BITS).min(axis=1)
            ranked=np.argsort(per_id)
            errors=int(per_id[ranked[0]])
            if errors>1 or 2*errors+erasures>=6:continue
            if per_id[ranked[1]]-errors<2:continue
            matches.append((int(ranked[0]),errors,erasures))
        if not matches or len({item[0] for item in matches})!=1:return None
        identity,errors,erasures=min(matches,key=lambda item:(item[1],item[2]))
        return {'tag_id':f'CONSTA-{identity+1:04d}','bit_errors':errors,'erasures':erasures}

    def detect(self,image):
        quads,finders=candidates(image)
        detections=[];accepted_quads=[];attempts=0
        def attempt(quad,reference,method):
            nonlocal attempts
            attempts+=1
            H=cv2.getPerspectiveTransform(order_quad(quad),reference)
            patch=cv2.warpPerspective(image,H,(SIZE,SIZE),borderValue=255)
            decoded=self.decode(patch)
            if decoded is None:return
            center=np.mean(quad,axis=0)
            if any(np.linalg.norm(center-np.array(old['center']))<20 for old in detections):return
            decoded.update(center=center.tolist(),method=method,quad=quad.tolist())
            detections.append(decoded);accepted_quads.append(quad)
        square=np.float32([[8,8],[248,8],[248,248],[8,248]])
        for quad in quads:
            if any(np.linalg.norm(quad.mean(axis=0)-np.array(old['center']))<20 for old in detections):continue
            attempt(quad,square,'frame_homography')
        remaining=[point for point in finders if not any(
            cv2.pointPolygonTest(quad,tuple(map(float,point)),False)>=0 for quad in accepted_quads)]
        seen=set();budget_hit=False
        # Local geometric hypotheses keep clutter from causing unbounded work.
        for origin,point in enumerate(remaining):
            neighbors=sorted((j for j in range(len(remaining)) if j!=origin),
                             key=lambda j:np.linalg.norm(remaining[j]-point))[:8]
            for others in combinations(neighbors,3):
                key=tuple(sorted((origin,*others)))
                if key in seen:continue
                seen.add(key)
                quad=order_quad([remaining[j] for j in key])
                if not plausible_quad(quad):continue
                if attempts>=800:budget_hit=True;break
                attempt(quad,FINDERS,'finder_homography')
            if budget_hit:break
        self.diagnostics={'quad_attempts':attempts,'finder_count':len(finders),
                          'candidate_budget_hit':budget_hit}
        return detections
