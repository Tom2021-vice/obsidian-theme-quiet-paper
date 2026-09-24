"""Build install archives from an explicit project file list, not a vault scan."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
version = manifest['version']
css = root / 'theme.css'
if not css.read_text(encoding='utf-8').startswith(f'/* Quiet Paper {version} |'):
    raise SystemExit('Run npm run build before packaging: theme.css version differs.')
dist = root / 'dist'
dist.mkdir(exist_ok=True)

common = [(root / name, name) for name in (
    'README.md', 'LICENSE', 'ATTRIBUTION.md', 'CHANGELOG.md', 'CONTRIBUTING.md',
    'docs/VALIDATION.md', 'docs/ROADMAP.md', 'docs/RELEASING.md',
    'docs/assets/preview-light.png', 'docs/assets/preview-dark.png',
)]
common += [(root / 'assets/fonts' / name, 'licenses/' + name) for name in (
    'GUST-FONT-LICENSE.txt', 'LPPL-1.3c.txt',
)]
common += [(root / 'assets/fonts/README.md', 'licenses/FONT-NOTICE.md')]
theme_files = common + [(root / name, name) for name in ('theme.css', 'manifest.json')]
demo_files = common + [(root / 'demo-vault' / name, name) for name in (
    '01 — 排版样本.md', '02 — Markdown 元素.md', '03 — 边界检查.md',
    '04 — 间距对照.md', '05 — 引用与行内代码.md', 'assets/proportion.svg',
    '.obsidian/app.json', '.obsidian/appearance.json', '.obsidian/core-plugins.json',
)]
demo_files += [(root / name, '.obsidian/themes/Quiet Paper/' + name)
               for name in ('theme.css', 'manifest.json')]

for label, prefix, files in (
    ('Quiet-Paper', 'Quiet Paper', theme_files),
    ('Quiet-Paper-Demo', 'Quiet Paper Demo', demo_files),
):
    for source, _ in files:
        if not source.is_file(): raise SystemExit(f'Missing package input: {source.relative_to(root)}')
    output = dist / f'{label}-{version}.zip'
    with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
        for source, target in sorted(files, key=lambda item: item[1]):
            archive.write(source, f'{prefix}/{target}')
    with ZipFile(output) as archive:
        assert archive.testzip() is None, f'Corrupted archive: {output}'
        expected = {f'{prefix}/{target}' for _, target in files}
        assert set(archive.namelist()) == expected, 'Unexpected archive entries'
    print(output.name, f'{output.stat().st_size:,} bytes, {len(files)} files')
