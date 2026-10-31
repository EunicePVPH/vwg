import sys, glob, os
import numpy as np
from PIL import Image
from multiprocessing import Pool
out = sys.argv[1]
def work(id_):
    ims = [np.asarray(Image.open(f'{out}/sub/{id_}_{j}.jpg').convert('RGB'), dtype=np.float32) for j in range(3)]
    w = np.array([.25, .5, .25], dtype=np.float32)
    a = sum(w[j]*ims[j] for j in range(3))
    Image.fromarray(np.clip(a+.5,0,255).astype(np.uint8)).save(f'{out}/frames/{id_}.jpg', quality=96)
    return id_
if __name__ == '__main__':
    ids = sorted({os.path.basename(f)[:5] for f in glob.glob(f'{out}/sub/*_0.jpg')})
    ids = [i for i in ids if all(os.path.exists(f'{out}/sub/{i}_{j}.jpg') for j in range(3))]
    with Pool(4) as p: r = p.map(work, ids)
    print('blended', len(r))
