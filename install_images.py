import os
import shutil
import glob

html_path = '../arsen-yeremin/index.html'
images_dir = '../arsen-yeremin/images'
brain_dir = r'C:\Users\pcjr3\.gemini\antigravity\brain\11d8c9b1-c2fe-4fb6-a3c4-85422e53d341'

if not os.path.exists(images_dir):
    os.makedirs(images_dir)

# Find the newest generated images
def get_latest_image(name_prefix):
    files = glob.glob(os.path.join(brain_dir, f"{name_prefix}*.png"))
    if not files: return None
    return max(files, key=os.path.getctime)

hero_img = get_latest_image('hero_ai_network')
blog1_img = get_latest_image('blog_ai_strategy')
blog2_img = get_latest_image('blog_web3_compute')

# Copy them to arsen-yeremin/images/
if hero_img: shutil.copy(hero_img, os.path.join(images_dir, 'hero_img.png'))
if blog1_img: shutil.copy(blog1_img, os.path.join(images_dir, 'blog1_img.png'))
if blog2_img: shutil.copy(blog2_img, os.path.join(images_dir, 'blog2_img.png'))

with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the specific meme images with our newly copied local images
text = text.replace('https://gera.yerem.in/images/memes/meme-drake-build.webp', './images/hero_img.png')
text = text.replace('https://gera.yerem.in/images/memes/meme-morpheus-excel.png', './images/blog1_img.png')
text = text.replace('https://gera.yerem.in/images/memes/meme-afraid-zap-failed.png', './images/blog2_img.png')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Images copied and HTML updated!")
