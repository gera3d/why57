import os

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the missing CSS links
text = text.replace('/_astro/_slug_.D3QT9bDT.css', './style1.css')
text = text.replace('/_astro/index.TX77FkmU.css', './style2.css')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Restored CSS paths locally.")
