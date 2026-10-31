import sys,glob
from PIL import Image
out='/tmp/claude-0/-home-user-vwg/c8ca43b1-0312-58fd-852e-29310ca1461f/scratchpad/shots/'
names=sys.argv[2:]; dst=sys.argv[1]
w,h=405,720
ims=[Image.open(out+f'f_{float(n):.2f}.png').convert('RGB').resize((w,h),Image.LANCZOS) for n in names]
cols=min(4,len(ims)); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*h))
for i,im in enumerate(ims): S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(out+dst)
