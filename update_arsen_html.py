import os

html_path = '../arsen-yeremin/index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "Gera Yeremin": "Arsen Yeremin",
    "Gera": "Arsen",
    "gera.yerem.in": "Arsen.Yerem.in",
    "gera3d": "arsen3d",
    "/images/gera-headshot.webp": "https://avatars.githubusercontent.com/u/298235?v=4",
    "Software Developer & Digital Marketer": "Fractional CTO & AI Specialist",
    "Developer + Marketer.": "Fractional CTO + AI Specialist.",
    "Stop manually copying data. Start building assets.": "Scale your tech stack. Build intelligent systems.",
    "Custom software for businesses that have outgrown spreadsheets.": "Strategic technical leadership and AI integration for scaling businesses.",
    "/_astro/_slug_.D3QT9bDT.css": "./style1.css",
    "/_astro/index.TX77FkmU.css": "./style2.css",
    "href=\"/contact\"": "href=\"https://calendar.app.google/93NLV73sQd1DXuUB6\"",
    "Developer + Marketer + Business Owner": "Fractional CTO + AI Specialist",
    "Most developers don't understand P&L. Most marketers can't build product. I do both.": "I bridge the gap between business strategy and deep technical execution, ensuring your systems scale without breaking.",
    "I've been building software for 15+ years and running marketing for almost as long. I co-founded 57 Seconds, a digital agency, where I build the tools we use to help clients.": "Seasoned technologist with deep expertise in AI/Machine Learning, CRM systems, CMS platforms, and e-commerce. I bring strategic technical leadership to scaling organizations.",
    "I eat my own dog food.": "I build resilient architectures.",
    "The booking system, the reporting dashboards, the automation—I build them for my own business first. If it doesn't make money or save time, I don't write the code.": "Every system must serve the business, scaling elegantly and generating tangible enterprise value.",
    "Custom Business Software": "Fractional CTO Services",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated index.html')
