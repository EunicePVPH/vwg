import sys
from PIL import Image, ImageDraw
out=sys.argv[1]; files=sys.argv[2:]
cw,ch=405,720; cols=min(4,len(files)); rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cols*cw,rows*ch),(20,20,20))
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((cw-6,ch-6),Image.LANCZOS)
    sheet.paste(im,((i%cols)*cw+3,(i//cols)*ch+3))
    ImageDraw.Draw(sheet).text(((i%cols)*cw+10,(i//cols)*ch+8),f.split('/')[-1],fill=(255,255,0))
sheet.save(out,quality=90)
