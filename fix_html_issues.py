import os
import re

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the "Latest Strategy" section
# The section starts with <section class="section" data-astro-cid-j7pv25f6> and contains "Latest <span class="text-gradient"...>Strategy</span>"
# We can find this specific section using a regex that looks for the h2 "Latest Strategy"
text = re.sub(r'<section class="section"[^>]*>.*?<h2 class="section-title mb-8"[^>]*>Latest.*?</h2>.*?</section>', '', text, flags=re.DOTALL)

# 2. Fix the broken testimonial images
# The JSON has "photo":"/images/memes/meme-drake-build.webp"
# We will replace them all with Arsen's avatar so they aren't broken, or a blank placeholder.
text = text.replace('"/images/memes/meme-drake-build.webp"', '"https://avatars.githubusercontent.com/u/298235?v=4"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Removed Latest Strategy section and fixed testimonial photos.")
