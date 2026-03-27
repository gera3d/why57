import os
import re
import json

html_path = '../arsen-yeremin/index.html'
if not os.path.exists(html_path):
    print(f"File not found: {html_path}")
    exit(1)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # Links & Identity
    "https://www.linkedin.com/in/gera3d": "https://linkedin.com/in/arsenyeremin/",
    "https://github.com/gera3d": "https://github.com/arsen3d",
    "https://twitter.com/gera3d": "https://github.com/arsen3d",
    "@gera3d": "@arsen3d",
    "Gera Yeremin": "Arsen Yeremin",
    "Gera": "Arsen",
    "gera.yerem.in": "Arsen.Yerem.in",

    # Meta
    "Software Developer & Digital Marketer": "Fractional CTO & AI Specialist",
    "Developer + Marketer.": "Fractional CTO + AI Specialist.",
    "Developer + Marketer": "Fractional CTO + AI Specialist",
    
    # Hero
    "Custom Business Software": "Fractional CTO & AI Solutions",
    "Stop manually copying data.": "Stop building fragile systems.",
    "Start building <span class=\"gradient-text\" data-astro-cid-j7pv25f6>assets</span>.": "Start scaling with <span class=\"gradient-text\" data-astro-cid-j7pv25f6>AI</span>.",
    "Custom software for businesses that have outgrown spreadsheets.": "Strategic technical leadership and AI integration for scaling ventures.",
    
    # Chaos section
    "These problems cost you <span class=\"text-gradient\" data-astro-cid-j7pv25f6>money</span>.": "Technical debt costs you <span class=\"text-gradient\" data-astro-cid-j7pv25f6>growth</span>.",
    "Scattered Data": "Legacy Architecture",
    "Sales in one place, customers in another. You can't answer basic questions without <span class=\"text-white\" data-astro-cid-j7pv25f6>digging for 20 minutes</span>.": "Monolithic systems that are difficult to update, leading to <span class=\"text-white\" data-astro-cid-j7pv25f6>slow development cycles</span>.",
    "Expensive Busywork": "Unscalable Infrastructure",
    "$50/hour labor doing <span class=\"text-white\" data-astro-cid-j7pv25f6>$10/hour work</span>.": "Systems that <span class=\"text-white\" data-astro-cid-j7pv25f6>crash under load</span> during critical growth phases.",
    "The Sarah Problem": "The AI Gap",
    "Only <span class=\"text-white\" data-astro-cid-j7pv25f6>one person</span> knows the system.": "Falling behind competitors who are <span class=\"text-white\" data-astro-cid-j7pv25f6>leveraging Machine Learning</span>.",
    "Death by 1,000 Tools": "Security Vulnerabilities",
    "8 apps that <span class=\"text-white\" data-astro-cid-j7pv25f6>don't talk</span> to each other.": "Outdated codebases <span class=\"text-white\" data-astro-cid-j7pv25f6>exposing sensitive data</span>.",
    "Bottleneck Central": "Inefficient Workflows",
    "Nothing moves unless <span class=\"text-white\" data-astro-cid-j7pv25f6>you push it</span>.": "Manual engineering processes <span class=\"text-white\" data-astro-cid-j7pv25f6>draining resources</span>.",
    "Gut Decisions": "Resource Drain",
    "You're making $50K decisions based on instinct. That's <span class=\"text-white\" data-astro-cid-j7pv25f6>gambling</span>, not strategy.": "Overspending on cloud infrastructure without <span class=\"text-white\" data-astro-cid-j7pv25f6>proper optimization</span>.",

    # Who I work with
    "For Owners Who Want Assets, Not Just Code": "For Ventures Ready to Scale Securely",
    "I don't work with everyone. I work best with business owners who have traction but are stuck in the \"Founder's Trap.\"": "I partner with scaling organizations that need high-level engineering leadership without the full-time executive overhead.",
    
    # Services / What I do
    "Custom Operations Platforms": "Fractional CTO Services",
    "Stop reacting. Start orchestrating.": "Strategic technical direction.",
    "Replace 20 scattered spreadsheets with <span class=\"text-white\" data-astro-cid-j7pv25f6>one dashboard</span> that tells you the truth about your business.": "Get enterprise-grade technical strategy, architecture design, and team leadership on a <span class=\"text-white\" data-astro-cid-j7pv25f6>fractional basis</span>.",
    "Client Portals": "AI & Machine Learning",
    "Premium experience.": "Intelligent systems.",
    "Give your customers a white-labeled login to check status and approve quotes. Establish <span class=\"text-white\" data-astro-cid-j7pv25f6>instant trust</span>.": "Integrate Large Language Models, predictive analytics, and automated decision-making to create <span class=\"text-white\" data-astro-cid-j7pv25f6>scalable AI tools</span>.",
    "Workflow Automation": "Blockchain & Web3",
    "Zero human error.": "Decentralized architecture.",
    "Lead routing, invoice generation, and status updates happen <span class=\"text-white\" data-astro-cid-j7pv25f6>while you sleep</span>.": "Develop robust smart contracts and decentralized compute infrastructure that <span class=\"text-white\" data-astro-cid-j7pv25f6>scales globally</span>.",
    "Content Pool Creation": "Enterprise Architectures",
    "Never run out of ideas.": "Resilient and secure.",
    "Turn raw ideas and assets into an <span class=\"text-white\" data-astro-cid-j7pv25f6>infinite well</span> of content ready for distribution.": "Design maintainable enterprise architectures using <span class=\"text-white\" data-astro-cid-j7pv25f6>Python, C#, and modern frameworks</span>.",

    # Bio
    "Most developers don't understand P&L. Most marketers can't build product. I do both.": "I bridge the gap between business strategy and deep technical execution, ensuring your systems scale without breaking.",
    "I've been building software for 15+ years and running marketing for almost as long. I co-founded 57 Seconds, a digital agency, where I build the tools we use to help clients.": "With over 20 years of experience, I've served as CTO for Tygher AI and Everyvine. I bring strategic technical leadership to scaling organizations.",
    "I eat my own dog food.": "I build resilient architectures.",
    "The booking system, the reporting dashboards, the automation—I build them for my own business first. If it doesn't make money or save time, I don't write the code.": "Every system must serve the business, scaling elegantly and generating tangible enterprise value. From AI models to Web3 backends, I engineer for scale.",

    # Case Studies
    "Agent Review Growth System": "Tygher AI Infrastructure",
    "Health for California": "Tygher AI",
    "900x Review Growth": "10x Processing Speed",
    "Agents had almost no online presence (~10 reviews total). They were losing clients to competitors with better visibility.": "The legacy architecture couldn't handle the data throughput required for real-time AI processing and model inference.",
    "Built an automated review engine with SMS workflows. Each agent got a custom landing page to showcase their diverse reputation.": "Architected a highly scalable pipeline using modern AI frameworks to process datasets efficiently.",
    "Scaled to <mark>9,000+</mark> verified Google reviews.": "Increased model training speed by <mark>10x</mark>.",
    "Agents now compete on reputation, not price.": "Allowed the platform to scale to thousands of concurrent users.",
    
    "200+ Sites in &lt; 4 Hours": "Decentralized AI Compute",
    "Client: Nuvolum": "Lilypad Network",
    "Weeks → Hours": "Global Scale",
    "Building custom websites for oral surgeons was taking weeks per client. The agency couldn't scale to meet demand.": "Required a robust smart contract ecosystem to facilitate decentralized AI compute across global nodes.",
    "I built a deployment system that launches fully branded sites with custom 4K video content in under 4 hours.": "Engineered advanced blockchain solutions bridging artificial intelligence workloads with Web3 infrastructure.",
    "Launched 200+ unique sites in record time.": "Deployed secure smart contracts handling extensive computation.",
    "Agency doubled its client roster and grew from 7 to 50 employees.": "Enabled the network to process complex AI tasks globally securely.",

    # Guides / Blogs
    "Custom Business Software: The Complete Guide": "Scaling AI Architecture: The Complete Guide",
    "Custom Workflow Automation: When You&#39;ve Outgrown Zapier": "From Monolith to Microservices: A CTO's Guide",

    # Bottom CTA
    "honest advice on whether custom software is the right move for you.": "honest advice on technical strategy and architecture for your business.",
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Overwrite testimonials array
testimonials_json = \
'[{"name":"Lilypad Network","role":"Blockchain & AI Enterprise","quote":"Arsen\'s expertise in Web3 and AI infrastructure was critical to scaling our decentralized compute network. He delivered exceptional smart contract architectures.","photo":"/images/memes/meme-drake-build.webp","highlight":"critical to scaling our decentralized compute network","rank":100},' + \
'{"name":"Tygher AI","role":"AI Startup","quote":"As our CTO, Arsen transformed our technology stack. His deep understanding of Machine Learning and scalable architecture saved us months of development time.","photo":"/images/memes/meme-drake-build.webp","highlight":"saved us months of development time","rank":100},' + \
'{"name":"Everyvine","role":"Digital Platform","quote":"Arsen brings unparalleled technical leadership. He bridges the gap between complex engineering challenges and clear business outcomes flawlessly.","photo":"/images/memes/meme-drake-build.webp","highlight":"bridges the gap between complex engineering challenges and clear business outcomes","rank":95}]'

# Use regex to replace the testimonials array inside main.js or index.html
content = re.sub(r'const testimonials = \[.*?\];', f'const testimonials = {testimonials_json};', content, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated index.html completely for Arsen.')
