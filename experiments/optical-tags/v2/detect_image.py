"""Decode a supplied local image without any scene truth or internet service."""
import argparse
import json
from pathlib import Path
import cv2
import numpy as np
from optical import Detector,load_family

parser=argparse.ArgumentParser()
parser.add_argument('image',type=Path)
parser.add_argument('--output',type=Path,required=True,help='New annotated image path')
parser.add_argument('--catalog',type=Path)
args=parser.parse_args()
if args.image.resolve()==args.output.resolve():parser.error('Output must differ from input')
if args.output.exists():parser.error('Output already exists; choose a new path')
image=cv2.imread(str(args.image),cv2.IMREAD_GRAYSCALE)
if image is None:parser.error('Input image could not be decoded')
detector=Detector(load_family(args.catalog))
found=detector.detect(image)
annotated=cv2.cvtColor(image,cv2.COLOR_GRAY2BGR)
for item in found:
    quad=np.array(item['quad'],dtype='int32')
    cv2.polylines(annotated,[quad],True,(30,140,40),2)
    x,y=map(int,item['center'])
    cv2.putText(annotated,item['tag_id'],(x-40,y),cv2.FONT_HERSHEY_SIMPLEX,.45,(0,70,0),1)
if not cv2.imwrite(str(args.output),annotated):raise SystemExit('Could not save annotated output')
print(json.dumps({'image':str(args.image),'detections':found,
                  'diagnostics':detector.diagnostics,'clinical_validation':False},indent=2))
