# fs-frost

GitHub profile README for FS-Frost (shown at https://github.com/FS-Frost). Public-facing, bilingual: English is the profile, Spanish is a linked copy.

## Layout

- `README.md` (English, rendered on the profile) and `README.es.md` (Spanish): header, badges, intro, skills install snippet and the generated **Projects** section. Keep both in sync when editing the hand-written parts.
- The language switch under the title uses **absolute URLs** (`https://github.com/FS-Frost` and `.../fs-frost/blob/main/README.es.md`): relative links break on the profile page.
- `scripts/generate-readme.ts`: Bun script that rewrites everything between `<!-- tools:start -->` and `<!-- tools:end -->` in both files (`readmes` array: path, locale, table headers, category labels).
- `.github/workflows/readme.yml`: runs the script daily (06:00 UTC) and on manual dispatch; commits only if a README changed.

## Single source of truth

The project list lives in the **mai-tools** repo at `static/tools.json`, published at https://fs-frost.github.io/mai-tools/tools.json.

- To add, remove or edit a project: change `tools.json` in mai-tools, not this README.
- Never hand-edit the region between the `tools:` markers; it is overwritten.
- One single table (Category | Project | Description | Stack) so every row shares column widths: GitHub sizes each table to its content, so separate tables per category looked uneven. Rows are grouped by `category` in order of first appearance in `tools.json`, with the category shown only on the group's first row, using the `en`/`es` text per file.
- Spanish category labels in the script must match the `es` dictionary in mai-tools' `src/lib/text.ts`. A new category without a label shows its raw `tools.json` name.
- Stack badges come from the `badges` map in the script. A stack missing there gets a plain grey badge; add it to the map (same colors as `stackColors` in mai-tools' `Home.svelte`).

## Commands

```sh
bun scripts/generate-readme.ts                                  # from the published JSON
bun scripts/generate-readme.ts ../mai-tools/static/tools.json   # from a local mai-tools checkout
```

## Conventions

- Badges use shields.io `style=flat`. Avoid `%2F` (encoded `/`) in badge paths: GitHub's image proxy breaks on it.
- External images must come from services that are still up (the old activity graph returned 402 and was replaced).
