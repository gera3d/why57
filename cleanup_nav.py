import os
import re

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix the bio headshot image
text = text.replace('https://gera.yerem.in/images/gera-headshot.webp', 'https://avatars.githubusercontent.com/u/298235?v=4')

# 2. Fix the header nav links (remove Memes, About, Work)
text = re.sub(r'<a href="https://calendar.app.google/[^"]+" class="header__link"[^>]*>\s*(?:<span[^>]*>[^<]*</span>\s*)?Memes\s*</a>', '', text)
text = re.sub(r'<a href="https://calendar.app.google/[^"]+" class="header__link"[^>]*>\s*About\s*</a>', '', text)
text = re.sub(r'<a href="https://calendar.app.google/[^"]+" class="header__link"[^>]*>\s*Work\s*</a>', '', text)

# 3. Fix the "View Case Studies" button in the Hero to link to #work
text = text.replace('"btn btn-ghost" data-astro-cid-j7pv25f6>View Case Studies</a>', '"btn btn-ghost" data-astro-cid-j7pv25f6 href="#work">View Case Studies</a>')
text = re.sub(r'<a href="https://calendar.app.google/[^"]+" class="btn btn-ghost"', '<a class="btn btn-ghost"', text)

# Add id="work" to the Case Studies section
text = text.replace('<section class="section section--alt" data-astro-cid-j7pv25f6> <div class="container animate-on-scroll" data-astro-cid-j7pv25f6> <h2 class="section-title text-center mb-8" data-astro-cid-j7pv25f6>Selected <span class="text-gradient"', 
                    '<section id="work" class="section section--alt" data-astro-cid-j7pv25f6> <div class="container animate-on-scroll" data-astro-cid-j7pv25f6> <h2 class="section-title text-center mb-8" data-astro-cid-j7pv25f6>Selected <span class="text-gradient"')

# 4. Remove the "View Full Portfolio ->" button
text = re.sub(r'<div class="text-center mt-12"[^>]*>\s*<div class="cta-row"[^>]*>\s*<a href="https://calendar[^>]*>View Full Portfolio →</a>\s*</div>\s*</div>', '', text)

# 5. Remove the "Topics" footer section entirely
text = re.sub(r'<div class="footer__section">\s*<h4 class="footer__title">Topics</h4>.*?</ul>\s*</div>', '', text, flags=re.DOTALL)

# 6. Fix the Twitter link which incorrectly points to github right now
# We see <li> <a href="https://github.com/arsen3d" class="footer__link" target="_blank" rel="noopener noreferrer"> Twitter </a> </li>
text = text.replace('href="https://github.com/arsen3d" class="footer__link" target="_blank" rel="noopener noreferrer"> Twitter </a>', 
                    'href="https://twitter.com/arsen3d" class="footer__link" target="_blank" rel="noopener noreferrer"> Twitter </a>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Cleaned up navigation links and fixed bio headshot.")
