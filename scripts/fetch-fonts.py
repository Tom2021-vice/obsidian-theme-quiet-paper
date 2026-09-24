"""One-time vendoring. Requires fonttools[woff]; normal builds are offline."""
from pathlib import Path
from urllib.request import urlopen, Request
from fontTools.ttLib import TTFont
import io

root = Path(__file__).resolve().parents[1]
target = root / 'assets' / 'fonts'
target.mkdir(parents=True, exist_ok=True)
base = 'https://mirrors.ibiblio.org/CTAN/fonts/tex-gyre/'
for face in ('regular', 'italic', 'bold', 'bolditalic'):
    name = f'texgyrepagella-{face}'
    with urlopen(Request(base + 'opentype/' + name + '.otf', headers={'User-Agent': 'QuietPaperTheme/0.1'}), timeout=30) as response:
        font = TTFont(io.BytesIO(response.read()))
    font.flavor = 'woff2'
    font.save(target / (name + '.woff2'))
    print(name, (target / (name + '.woff2')).stat().st_size)
with urlopen(base + 'doc/GUST-FONT-LICENSE.txt', timeout=30) as response:
    (target / 'GUST-FONT-LICENSE.txt').write_bytes(response.read())

with urlopen('https://www.latex-project.org/lppl/lppl-1-3c.txt', timeout=30) as response:
    (target / 'LPPL-1.3c.txt').write_bytes(response.read())
