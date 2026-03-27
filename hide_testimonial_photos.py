import os

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Hide the testimonial photos by injecting a display:none inline style
text = text.replace(
    '<img id="quote-photo" src="" alt="" class="testimonial-photo" data-astro-cid-laxl3n4d>', 
    '<img id="quote-photo" src="" alt="" class="testimonial-photo" data-astro-cid-laxl3n4d style="display: none;">'
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Testimonial photos successfully hidden.")
