# Community Directory warning review

English review notes for maintainers; 中文结论：保持排版和双视图一致性，不用关闭规则或裁剪字体追求零警告。

## Scope

Reviewed for Quiet Paper 0.1.8 on 2026-09-30. The local check uses `stylelint-config-obsidianmd` 0.1.0 with the project's existing naming and rule-order exceptions. It reports **0 errors and 21 warning locations** in generated CSS. This is not a remote Community Directory scan or approval. README language detection and recommended file-size thresholds belong to the remote review.

The same configuration reports 8 formatting errors and 24 warning locations for the original 0.1.7 build. Scanner/data versions can produce different counts: the reported `css-text-indent` warning did not reproduce locally, but the redundant declaration was removed anyway.

## Decisions

| Reported warning | Decision in 0.1.8 | Reason / validation |
| --- | --- | --- |
| Theme CSS is larger than recommended | Reduce formatting overhead; keep full embedded fonts. Size warning may remain. | 538,476 → 532,620 bytes (5,856 bytes smaller). Four font data URLs account for 507,684 bytes. WOFF2 payloads remain byte-identical; no glyphs or weights are removed and no remote request is introduced. |
| README does not appear to contain English | English `README.md`, full Chinese `README.zh-CN.md`, reciprocal links. | Both describe installation, fonts, settings, limitations, and development; both are packaged. Remote language detection requires a new directory scan. |
| `css-text-indent` partially supported | Remove redundant `text-indent: 0`. | Default behavior is unchanged in the browser comparison of Reading View and Live Preview. |
| `text-decoration` partially supported | Remove redundant `text-decoration-skip-ink: auto`; retain thickness and color. | Two warning locations remain. Link decoration is part of the design. The scanner groups the declarations under a broad feature; browser checks retain the same computed appearance. |
| `multicolumn` partially supported | Keep print-only `break-inside: avoid`. | One warning location remains. It controls diagram fragmentation, not a multicolumn layout. Existing printing behavior is preserved. |
| Avoid `!important` | Retain five print-only Mermaid dimension overrides. | Mermaid emits inline dimensions. Greater selector specificity cannot override normal inline declarations. Removing these rules risks reintroducing cropped diagrams. No new `!important` is added. |
| Avoid `:has()` | Retain the 13 existing occurrences and scope. | They distinguish structural empty lines, quote ends, adjacent code blocks, and existing icons; needed for editor spacing and icon deduplication. |
| Unknown `mjx-container` type | Use `.MathJax[display="true"]` in both views. | This is the class on the existing MathJax container, not a renamed element or a disabled rule. Tests cover display math in both views and unchanged inline math. |

## Retained selector scope

- `src/30-typography.css`: one quote-end check on direct children of the outer CodeMirror content container.
- `src/35-rhythm.css`: ten occurrences inspect direct line children or adjacent siblings. Active lines, quotes, lists, code, frontmatter, and embedded editors retain existing exclusions.
- `src/55-explorer.css`: two checks within file/folder titles. Descendant matching is intentional because icon plugins may wrap their icon; direct-child matching could produce duplicate icons.

There is no new document-wide `body:has(...)` or unbounded editor scan. Scoped selectors are not a claim of zero performance cost or complete benchmarking. Removing these rules would undo spacing fixes; JavaScript alternatives would require a plugin.

## Local rules and build

`.stylelintrc.json` extends the official configuration. Existing exceptions for `selector-class-pattern`, `custom-property-pattern`, `no-descending-specificity`, `declaration-empty-line-before`, and the font-family quoting convention are unchanged. Obsidian's native class names and the deliberate reading/editor cascade do not follow all generic style conventions. These exceptions do not disable any of the eight reported warning categories.

Compatibility, `:has()`, `!important`, and unknown-selector warnings remain enabled. There are no inline disable comments or `ignorePartialSupport` switches.

PostCSS removes ordinary comments and indentation while preserving line breaks, the license header, and the complete `@settings` block. It does not merge rules, rewrite selectors or values, change ordering, remove fallback declarations, or modify fonts. AST equality and computed-style checks verify that behavior. Source CSS remains readable.

```sh
npm run check
npm run check:community
npm test
python scripts/package.py
```

The detailed local warning list is saved to `.local/review/community-check.json`. After pushing, use **Review branch** on the directory management page to inspect the actual remote result before creating another release.

## References

- [Official Obsidian Stylelint configuration](https://github.com/obsidianmd/stylelint-config)
- [Community Directory FAQ: scanning and Review branch](https://docs.obsidian.md/community-directory/faq)
- [Compatibility plugin: partial support and fallback limitations](https://github.com/rjwadley/stylelint-no-unsupported-browser-features)
