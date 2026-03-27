from PIL import Image

# 1200x630 is the standard Open Graph image size
og_size = (1200, 630)
# Use the deep navy background of the site
bg_color = (7, 7, 13)

bg = Image.new('RGB', og_size, bg_color)
logo = Image.open('images/57_wht.png').convert("RGBA")

# Resize logo to have comfortable padding (approx 40% of the canvas height)
target_height = 300
target_width = int((target_height / logo.height) * logo.width)
logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)

# Center it
x = (og_size[0] - target_width) // 2
y = (og_size[1] - target_height) // 2

# Paste using the logo's alpha channel as the mask
bg.paste(logo, (x, y), logo)
bg.save('images/og-image.png')
print("og-image.png created successfully!")
