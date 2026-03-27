import os

for f_name in ['style1.css', 'style2.css']:
    path = f'../arsen-yeremin/{f_name}'
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace purple/indigo colors with tech blues
    content = content.replace('#6366f1', '#2563eb')
    content = content.replace('#4f46e5', '#1d4ed8')
    content = content.replace('#818cf8', '#60a5fa')
    
    # Replace teal theme color if there is one (#0d9488) -> (#0284c7)
    content = content.replace('#0d9488', '#0284c7')
    content = content.replace('#14b8a6', '#0ea5e9')
    content = content.replace('#0f766e', '#0369a1')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Updated CSS colors')
