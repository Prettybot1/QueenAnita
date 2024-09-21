from PIL import Image, ImageDraw

def generate_image():
    img = Image.new('RGB', (200, 200), color=(73, 109, 137))
    d = ImageDraw.Draw(img)
    d.text((10, 10), "Hello World", fill=(255, 255, 0))
    img.save('/path/to/image.png')

generate_image()
