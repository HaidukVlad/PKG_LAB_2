from flask import Flask, request, jsonify, render_template
from PIL import Image


app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/flaskwebgui-keep-server-alive')
def keep_alive():
    return jsonify({"status": "alive"})

def get_compression_type(image):
    compression = "Неизвестно"

    if image.format in ["JPEG", "JPG"]:
        # Для JPEG можно проверить, прогрессивное ли изображение
        if "progressive" in image.info and image.info["progressive"]:
            compression = "Прогрессивное"
        else:
            compression = "Базовое"

    elif image.format == "PNG":
        # Для PNG можно проверить тип сжатия
        if image.info.get("compression", 0) == 0:
            compression = "Без потерь"
        elif image.info.get("compression", 0) == 1:
            compression = "Расширенный последовательный"

    elif image.format == "GIF":
        # Для GIF сжатие всегда без потерь
        compression = "Без потерь"

    elif image.format == "TIFF":
        # Для TIFF можно проверить, используется ли сжатие
        if "compression" in image.tag_v2:
            tiff_compression = image.tag_v2[256]  # 256 - это тег для сжатия
            if tiff_compression == 1:
                compression = "Нет сжатия"
            elif tiff_compression == 2:
                compression = "CCITTRLE"
            elif tiff_compression == 3:
                compression = "CCITTFAX3"
            elif tiff_compression == 4:
                compression = "CCITTFAX4"
            elif tiff_compression == 5:
                compression = "LZW"
            elif tiff_compression == 32773:
                compression = "PackBits"
            else:
                compression = "Неизвестное сжатие"

    elif image.format == "BMP":
        # BMP обычно не использует сжатие
        compression = "Нет сжатия"

    elif image.format == "PCX":
        # PCX может использовать разные методы сжатия, но чаще всего это RLE
        compression = "RLE"

    return compression

@app.route('/upload', methods=['POST'])
def upload_image():
    if request.method == 'POST':
        images = request.files.getlist('images')
        results = []

        for image in images:
            try:
                img = Image.open(image)
                width, height = img.size
                dpi = img.info.get('dpi')
                mode = img.mode
                compression = get_compression_type(img)
                data = {
                    'filename': image.filename,
                    'size': f"{width}x{height}",
                    'dpi': dpi if dpi else "Нет",
                    'mode': mode,
                    'compression': compression
                }
                results.append(data)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        return jsonify(results)

    return jsonify({'error': 'Error uploading image'}), 400

if __name__ == '__main__':
    app.run()