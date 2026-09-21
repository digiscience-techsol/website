"""Generate two reviewed-in-PR planning PDFs from their distinct Markdown sources.
Run in a Python environment containing reportlab. No network calls.
"""
from pathlib import Path
import argparse
from xml.sax.saxutils import escape
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,KeepTogether
from reportlab.graphics.shapes import Drawing,Rect,String,Line,Polygon
ROOT=Path(__file__).resolve().parents[1]
styles=getSampleStyleSheet()
styles.add(ParagraphStyle('AssetBody',fontName='Helvetica',fontSize=10,leading=15,spaceAfter=8))
styles.add(ParagraphStyle('AssetHeading',parent=styles['Heading2'],fontSize=15,leading=19,spaceBefore=12,spaceAfter=8,keepWithNext=True))
def diagram():
 d=Drawing(470,270)
 d.add(Rect(0,0,470,255,fillColor=colors.HexColor('#F1F5F9'),strokeColor=colors.HexColor('#475569')))
 d.add(String(12,236,'Approved processing boundary (region and access rules to be agreed)',fontSize=9))
 for x,y,w,label in [(20,190,190,'User + identity provider'),(260,190,190,'Gateway / authorization'),(260,115,190,'Orchestrator + model endpoint'),(20,115,190,'Permission-filtered retrieval'),(20,40,190,'Approved source documents'),(260,40,190,'Answer + sources / human review')]:
  d.add(Rect(x,y,w,35,fillColor=colors.white,strokeColor=colors.HexColor('#2563EB')));d.add(String(x+8,y+14,label,fontSize=8.5))
 for x1,y1,x2,y2 in [(210,207,260,207),(355,190,355,150),(210,132,260,132),(115,75,115,115),(355,115,355,75)]:
  d.add(Line(x1,y1,x2,y2,strokeColor=colors.HexColor('#17233B'),strokeWidth=1.5))
  if x2>x1:pts=[x2,y2,x2-7,y2+4,x2-7,y2-4]
  elif y2>y1:pts=[x2,y2,x2-4,y2-7,x2+4,y2-7]
  else:pts=[x2,y2,x2-4,y2+7,x2+4,y2+7]
  d.add(Polygon(pts,fillColor=colors.HexColor('#17233B')))
 return d
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--asset', choices=['ai-readiness-assessment-scorecard','secure-ai-landing-zone-blueprint'], help='Regenerate only the selected asset; omit to regenerate both.')
args=parser.parse_args()
for name in [args.asset] if args.asset else ['ai-readiness-assessment-scorecard','secure-ai-landing-zone-blueprint']:
 path=ROOT/'assets/downloads'/f'{name}.md';story=[]
 for line in path.read_text().splitlines():
  if not line.strip():continue
  style='Title' if line.startswith('# ') else 'AssetHeading' if line.startswith('## ') else 'AssetBody'
  story.append(Paragraph(escape(line.lstrip('# ')),styles[style]))
  if name=='secure-ai-landing-zone-blueprint' and line=='## Boundary and data-flow diagram':
   story.extend([diagram(), Spacer(1, 4*mm)])
 def footer(c,d):
  c.setFont('Helvetica',8);c.drawString(18*mm,12*mm,'DigiScience Techsol | Illustrative planning tool | 20 Sep 2026');c.drawRightString(192*mm,12*mm,str(d.page))
 SimpleDocTemplate(str(path.with_suffix('.pdf')),pagesize=(210*mm,297*mm),leftMargin=18*mm,rightMargin=18*mm,topMargin=18*mm,bottomMargin=22*mm).build(story,onFirstPage=footer,onLaterPages=footer)
 print(path.with_suffix('.pdf'))
