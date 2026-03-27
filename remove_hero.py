import os
import re

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Using regex to match the hero__visual div and remove it
text = re.sub(r'<div class="hero__visual" data-astro-cid-j7pv25f6>\s*<img[^>]+>\s*</div>', '', text, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Removed hero image from index.html.")
