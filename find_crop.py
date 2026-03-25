from PIL import Image
import numpy as np
import os

os.chdir('c:/Users/pcjr3/Documents/Vibe Projects/why57/images')
img = Image.open('57_wht.png')
arr = np.array(img)

# Find the empty rows between the triangle and the text
# We look for rows with 0 alpha
alpha = arr[:,:,3]
row_sums = alpha.sum(axis=1)

# print where the image has content
for i, s in enumerate(row_sums):
    if s > 0:
        print(f"Row {i} has content")
