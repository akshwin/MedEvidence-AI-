# MedEvidence AI — Research Paper Draft

This folder contains a **submission-ready research paper draft** describing the MedEvidence AI system (PubMed-grounded medical question answering with citations).

## Files

- `paper.md`: Main paper draft (edit authors/affiliations + fill evaluation details).
- `references.bib`: BibTeX scaffold for citations.

## Export (optional)

If you want a PDF/Word export, you can use `pandoc` (not required by the repo):

```bash
pandoc paper/paper.md --citeproc --bibliography paper/references.bib -o paper/paper.pdf
pandoc paper/paper.md --citeproc --bibliography paper/references.bib -o paper/paper.docx
```

## Adapting to a target venue (recommended)

Tell me:

- **Venue/template**: (e.g., arXiv, IEEE, ACM, Springer LNCS)
- **Page limit**: (e.g., 6 pages + references)
- **Paper type**: systems paper vs empirical paper

And I can generate a matching `paper.tex` (and adjust sectioning, figures, tables, and bibliography style).

