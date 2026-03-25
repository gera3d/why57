from PIL import Image
import os

os.chdir('c:/Users/pcjr3/Documents/Vibe Projects/why57/images')
for f in ['57_wht.png', '57seconds.png', 'Just_57_Border_white.png']:
    try:
        img = Image.open(f)
        print(f"{f}: {img.size}")
    except Exception as e:
        print(f"Error on {f}: {e}")
