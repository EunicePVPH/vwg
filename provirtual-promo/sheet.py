import sys,glob
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]
ims=[Image.open(f).resize((405,720)) for f in files]
cols=min(len(ims),5); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*405,rows*720))
for i,im in enumerate(ims): S.paste(im,((i%cols)*405,(i//cols)*720))
S.save(out,quality=88)
