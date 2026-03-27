import os

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fractional CTO
text = text.replace('Fractional CTO Services</h3>', 'Fractional CTO Leadership</h3>')
text = text.replace('Strategic technical direction.</p>', 'Scale without the executive overhead.</p>')
text = text.replace('<p data-astro-cid-j7pv25f6>Get enterprise-grade technical strategy, architecture design, and team leadership on a <span class="text-white" data-astro-cid-j7pv25f6>fractional basis</span>.</p>', 
                    '<p data-astro-cid-j7pv25f6>Stop guessing on technical decisions. Get elite technical strategy, architecture mapping, and seasoned engineering leadership on a <span class="text-white" data-astro-cid-j7pv25f6>fractional basis</span>.</p>')

# 2. AI & Machine Learning
text = text.replace('AI & Machine Learning</h3>', 'Custom AI & Agentic Workflows</h3>')
text = text.replace('Intelligent systems.</p>', 'Multiply your team\'s output.</p>')
text = text.replace('<p data-astro-cid-j7pv25f6>Integrate Large Language Models, predictive analytics, and automated decision-making to create <span class="text-white" data-astro-cid-j7pv25f6>scalable AI tools</span>.</p>', 
                    '<p data-astro-cid-j7pv25f6>I integrate proprietary Large Language Models and AI agents into your workflows to build <span class="text-white" data-astro-cid-j7pv25f6>smart enterprise systems</span> that drastically cut operational costs.</p>')

# 3. Blockchain & Web3
text = text.replace('Blockchain & Web3</h3>', 'Web3 & Decentralized Platforms</h3>')
text = text.replace('Decentralized architecture.</p>', 'Global, trustless infrastructure.</p>')
text = text.replace('<p data-astro-cid-j7pv25f6>Develop robust smart contracts and decentralized compute infrastructure that <span class="text-white" data-astro-cid-j7pv25f6>scales globally</span>.</p>', 
                    '<p data-astro-cid-j7pv25f6>Architect robust smart contracts and high-throughput Web3 infrastructure that power <span class="text-white" data-astro-cid-j7pv25f6>next-gen distributed applications</span>.</p>')

# 4. Enterprise Architectures
text = text.replace('Enterprise Architectures</h3>', 'Scalable System Architecture</h3>')
text = text.replace('Resilient and secure.</p>', 'Kill your technical debt.</p>')
text = text.replace('<p data-astro-cid-j7pv25f6>Design maintainable enterprise architectures using <span class="text-white" data-astro-cid-j7pv25f6>Python, C#, and modern frameworks</span>.</p>', 
                    '<p data-astro-cid-j7pv25f6>Transition from fragile MVP to bulletproof code. I redesign backends in <span class="text-white" data-astro-cid-j7pv25f6>Python & C#</span> so your platform handles massive scale without breaking.</p>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated 'What I Do' section with high value skills.")
