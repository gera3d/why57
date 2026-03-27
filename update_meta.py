import os

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace Open Graph and Twitter images with Arsen's avatar
text = text.replace('content="https://Arsen.Yerem.in/images/social-card.png"', 'content="https://avatars.githubusercontent.com/u/298235?v=4"')

# Update meta description to match his 20+ years of Fractional CTO / AI experience
old_desc = "Stop building fragile systems. Start building assets. Strategic technical leadership and AI integration for scaling ventures. 15+ years experience."
new_desc = "Scale without executive overhead. Strategic Fractional CTO leadership, AI workflow automation, and Web3 infrastructure for growing enterprise systems. 20+ years experience."

text = text.replace(old_desc, new_desc)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated meta tags and open graph images.")
