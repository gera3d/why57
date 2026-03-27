import os
import re

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix broken images by loading them from Gera's server
text = text.replace('src="/images/', 'src="https://gera.yerem.in/images/')
text = text.replace('href="/favicon', 'href="https://gera.yerem.in/favicon')
text = text.replace('href="/apple-touch', 'href="https://gera.yerem.in/apple-touch')
text = text.replace('href="/site.webmanifest', 'href="https://gera.yerem.in/site.webmanifest')
text = text.replace('href="/rss.xml', 'href="https://gera.yerem.in/rss.xml')

# Hide the logos that don't make sense anymore (e.g. Health for California for Tygher AI)
text = re.sub(r'<img[^>]+class="company-logo"[^>]*>', '<!-- logo hidden -->', text)

# Fix broken internal navigation links
for link in ['/memes', '/about', '/work', '/contact', '/custom-business-software-guide', '/custom-workflow-automation-guide']:
    text = text.replace(f'href="{link}"', 'href="https://calendar.app.google/93NLV73sQd1DXuUB6"')

text = re.sub(r'href="/topic/[^"]+"', 'href="https://calendar.app.google/93NLV73sQd1DXuUB6"', text)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed broken images and links.")
