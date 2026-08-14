from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BRANDING = ROOT / "public" / "images" / "branding"
PUBLIC = ROOT / "public"
MARK = Image.open(BRANDING / "lesbilibre-mark.png").convert("RGBA")


def font(size: int, italic: bool = False) -> ImageFont.FreeTypeFont:
    name = "georgiai.ttf" if italic else "georgia.ttf"
    return ImageFont.truetype(Path("C:/Windows/Fonts") / name, size)


def contain_mark(size: int, padding: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    source = MARK.copy()
    source.thumbnail((size - padding * 2, size - padding * 2), Image.Resampling.LANCZOS)
    canvas.alpha_composite(source, ((size - source.width) // 2, (size - source.height) // 2))
    return canvas


def icon(size: int, destination: Path) -> None:
    background = Image.new("RGBA", (size, size), "#170b10")
    # Gentle vignette retains the site's velvet editorial mood while remaining legible at 16px.
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((size * .08, size * .08, size * .92, size * .92), fill="#4b102a")
    background.alpha_composite(glow.filter(ImageFilter.GaussianBlur(size * .13)))
    background.alpha_composite(contain_mark(size, int(size * .15)))
    background.convert("RGB").save(destination, "PNG", optimize=True)


def social_card(destination: Path) -> None:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), "#10090d")
    draw = ImageDraw.Draw(image)
    # Editorial burgundy/fuchsia field with a deliberately quiet centre for text readability.
    draw.ellipse((650, -330, 1460, 480), fill="#421126")
    draw.ellipse((745, -220, 1370, 405), fill="#5d1837")
    draw.ellipse((-310, 420, 450, 1180), fill="#2c0f1e")
    mark = contain_mark(405, 30)
    image.paste(mark, (740, 125), mark)
    eyebrow = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 19)
    display = font(76)
    display_italic = font(76, italic=True)
    body = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
    draw.text((82, 84), "RENCONTRES · LESBIENNES · SINCÈRES", font=eyebrow, fill="#f04b7d")
    draw.text((80, 187), "Lesbi", font=display, fill="#f7efe6")
    draw.text((277, 187), "Libre", font=display_italic, fill="#f04b7d")
    draw.text((82, 298), "Aimer une femme,", font=display, fill="#f7efe6")
    draw.text((82, 380), "sans détour.", font=display_italic, fill="#f04b7d")
    draw.text((84, 501), "Une plateforme pensée pour les femmes qui aiment les femmes.", font=body, fill="#d9bdc8")
    draw.line((82, 555, 515, 555), fill="#e94676", width=3)
    image.save(destination, "PNG", optimize=True)


for asset_size in (16, 32, 48, 192, 512):
    icon(asset_size, BRANDING / f"icon-{asset_size}.png")

icon(180, PUBLIC / "apple-touch-icon-lesbilibre.png")
social_card(BRANDING / "lesbilibre-social-1200x630.png")

Image.open(BRANDING / "icon-32.png").save(
    PUBLIC / "favicon-lesbilibre.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
