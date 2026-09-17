"""Package project artifacts only; never reads or writes a personal vault."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))['version']
dist = root / 'dist'
theme = dist / 'Quiet Paper'
with ZipFile(dist / f'Quiet-Paper-{version}.zip', 'w', ZIP_DEFLATED) as archive:
    for path in sorted(theme.rglob('*')):
        if path.is_file():
            archive.write(path, Path('Quiet Paper') / path.relative_to(theme))

vault = root / 'demo-vault'
files = list(vault.glob('*.md')) + list((vault / 'assets').glob('*'))
files += [vault / '.obsidian' / name for name in ('app.json', 'appearance.json', 'core-plugins.json')]
files += list((vault / '.obsidian' / 'themes' / 'Quiet Paper').glob('*'))
with ZipFile(dist / f'Quiet-Paper-Demo-{version}.zip', 'w', ZIP_DEFLATED) as archive:
    for path in sorted(files):
        if path.is_file():
            archive.write(path, Path('Quiet Paper Demo') / path.relative_to(vault))
    for name in ('README.md', 'ATTRIBUTION.md', 'LICENSE'):
        archive.write(root / name, Path('Quiet Paper Demo') / name)
    archive.write(root / 'assets/fonts/GUST-FONT-LICENSE.txt', 'Quiet Paper Demo/licenses/GUST-FONT-LICENSE.txt')

for path in sorted(dist.glob('*.zip')):
    with ZipFile(path) as archive:
        assert archive.testzip() is None, f'Corrupted archive: {path}'
    print(path.name, f'{path.stat().st_size:,} bytes')
