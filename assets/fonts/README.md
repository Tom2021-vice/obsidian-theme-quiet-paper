# Embedded font manifest

TeX Gyre Pagella is an upstream font project by the GUST e-foundry team. Obtain the complete unmodified distribution, notices and sources from https://ctan.org/pkg/tex-gyre or https://www.gust.org.pl/projects/e-foundry/tex-gyre/pagella.

| Bundled file | Original upstream OpenType file | Face |
| --- | --- | --- |
| texgyrepagella-regular.woff2 | texgyrepagella-regular.otf | Regular |
| texgyrepagella-italic.woff2 | texgyrepagella-italic.otf | Italic |
| texgyrepagella-bold.woff2 | texgyrepagella-bold.otf | Bold |
| texgyrepagella-bolditalic.woff2 | texgyrepagella-bolditalic.otf | Bold italic |

Changes by Quiet Paper: conversion to WOFF2 with fontTools; no subsetting or intentional glyph changes. `scripts/fetch-fonts.py` documents the conversion process. CSS exposes these files under the alias `Quiet Pagella`. Existing font names and embedded notices are retained.

See GUST-FONT-LICENSE.txt and LPPL-1.3c.txt alongside this file in source, or in the package's licenses directory. These fonts are not relicensed under MIT.
