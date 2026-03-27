import os

html_path = '../arsen-yeremin/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Legacy Architecture -> Fragile MVP Architecture
text = text.replace('<h3>Legacy Architecture</h3>', '<h3>Fragile MVP Architecture</h3>')
text = text.replace('<p data-astro-cid-j7pv25f6>Monolithic systems that are difficult to update, leading to <span class="text-white" data-astro-cid-j7pv25f6>slow development cycles</span>.</p>',
                    '<p data-astro-cid-j7pv25f6>Your initial tech stack is crumbling under new load, forcing your team to <span class="text-white" data-astro-cid-j7pv25f6>constantly put out fires</span>.</p>')

# 2. Unscalable Infrastructure -> Execution Paralysis
text = text.replace('<h3>Unscalable Infrastructure</h3>', '<h3>Execution Paralysis</h3>')
text = text.replace('<p data-astro-cid-j7pv25f6>Systems that <span class="text-white" data-astro-cid-j7pv25f6>crash under load</span> during critical growth phases.</p>',
                    '<p data-astro-cid-j7pv25f6>Without an experienced CTO, strategic engineering decisions are <span class="text-white" data-astro-cid-j7pv25f6>stalled or endlessly guessed at</span>.</p>')

# 3. The AI Gap -> The AI Competency Gap
text = text.replace('<h3>The AI Gap</h3>', '<h3>The AI Competency Gap</h3>')
text = text.replace('<p data-astro-cid-j7pv25f6>Falling behind competitors who are <span class="text-white" data-astro-cid-j7pv25f6>leveraging Machine Learning</span>.</p>',
                    '<p data-astro-cid-j7pv25f6>Competitors are automating cognitive labor while your team wastes capital on <span class="text-white" data-astro-cid-j7pv25f6>manual, expensive boilerplate</span>.</p>')

# 4. Security Vulnerabilities -> Data Silos & Fragmentation
text = text.replace('<h3>Security Vulnerabilities</h3>', '<h3>Data Silos & Fragmentation</h3>')
text = text.replace('<p data-astro-cid-j7pv25f6>Outdated codebases <span class="text-white" data-astro-cid-j7pv25f6>exposing sensitive data</span>.</p>',
                    '<p data-astro-cid-j7pv25f6>Valuable enterprise metrics are locked in legacy systems, making <span class="text-white" data-astro-cid-j7pv25f6>predictive ML analytics impossible</span>.</p>')

# 5. Inefficient Workflows -> Engineering Bottlenecks
text = text.replace('<h3>Inefficient Workflows</h3>', '<h3>Engineering Bottlenecks</h3>')
text = text.replace('<p data-astro-cid-j7pv25f6>Manual engineering processes <span class="text-white" data-astro-cid-j7pv25f6>draining resources</span>.</p>',
                    '<p data-astro-cid-j7pv25f6>Your lead developers are burned out on maintenance instead of <span class="text-white" data-astro-cid-j7pv25f6>shipping revenue-generating features</span>.</p>')

# 6. Resource Drain -> Bloated Cloud Spend
text = text.replace('<h3>Resource Drain</h3>', '<h3>Bloated Cloud Spend</h3>')
text = text.replace('<p data-astro-cid-j7pv25f6>Overspending on cloud infrastructure without <span class="text-white" data-astro-cid-j7pv25f6>proper optimization</span>.</p>',
                    '<p data-astro-cid-j7pv25f6>Inefficient codebase architectures are driving up infrastructure costs without <span class="text-white" data-astro-cid-j7pv25f6>delivering better performance</span>.</p>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated 'Cost of Chaos' section.")
