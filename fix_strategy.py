import os

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Using string split to guarantee we only remove the Latest Strategy section and nothing else!
# The section string:
start_str = '<h2 class="section-title mb-8" data-astro-cid-j7pv25f6>Latest <span class="text-gradient" data-astro-cid-j7pv25f6>Strategy</span></h2>'

# Find where it starts
if start_str in text:
    before, after = text.split(start_str, 1)
    # the start of the section is just before this
    section_start = before.rfind('<section class="section" data-astro-cid-j7pv25f6>')
    # the end of the section is just after this
    section_end = after.find('</section>') + len('</section>')
    
    text = text[:section_start] + after[section_end:]

# 2. Fix the broken testimonial images
# The JSON has "photo":"/images/memes/meme-drake-build.webp" 
text = text.replace('"/images/memes/meme-drake-build.webp"', '"https://avatars.githubusercontent.com/u/298235?v=4"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Safely removed Latest Strategy section and fixed testimonial photos.")
