"""Render reviewed figure regions directly from the unchanged source PDF.

Bounds are fractions (left, top, right, bottom), checked against source pages.
The full-page originals remain available; no instructional image is generated.
"""
import json
from pathlib import Path
import pypdfium2 as pdfium

root = Path(__file__).resolve().parents[1]
source = root / "public/source/reference-v7-1"
regions = {
    "general-vmc:18": (18, (.065, .109, .935, .538)),
    "general-vhf-range:19": (19, (.270, .132, .730, .179)),
    "general-surveillance:20": (20, (.145, .078, .937, .937)),
    "holding-entries:39": (39, (.090, .049, .938, .389)),
    "approach-procedure-turns:47": (47, (.065, .440, .937, .801)),
    "approach-test-tolerances:48": (48, (.065, .480, .935, .806)),
    "approach-visual-atc:51": (51, (.109, .128, .892, .427)),
    "approach-visual-requirements:52": (52, (.157, .129, .844, .841)),
    "gradient-nomograph:57": (57, (.065, .079, .937, .921)),
}
assets = {}
with pdfium.PdfDocument(source / "original.pdf") as pdf:
    for key, (number, (left, top, right, bottom)) in regions.items():
        page = pdf[number - 1]
        width, height = page.get_size()
        bitmap = page.render(scale=2, crop=(left * width, (1-bottom) * height, (1-right) * width, top * height))
        image = bitmap.to_pil()
        filename = f"figure-{key.replace(':', '-')}.webp"
        image.save(source / filename, format="WEBP", quality=92)
        assets[key] = {"src": f"/source/reference-v7-1/{filename}", "width": image.width, "height": image.height}
        image.close()
        bitmap.close()
        page.close()
(root / "src/features/baseline/model/figureAssets.json").write_text(json.dumps(assets, indent=2) + "\n", encoding="utf-8")
print(f"Rendered {len(assets)} source figure regions")
