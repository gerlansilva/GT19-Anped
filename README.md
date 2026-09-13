# Memória do GT19 da ANPEd

Site de memória, encontros e produção científica do Grupo de Trabalho 19 — Educação Matemática — da ANPEd.

## Conteúdo

- Edições das Reuniões Nacionais da ANPEd;
- trabalhos e minicursos do GT19;
- acervo de artigos e produções sobre o GT19;
- lives do grupo;
- história e dados gerais do GT19.

## Estrutura

O site é estático e está pronto para hospedagem no Cloudflare Pages.

- `dist/index.html` — estrutura das páginas;
- `dist/styles.css` — identidade visual e responsividade;
- `dist/app.js` — navegação e renderização;
- `dist/data.js` — dados dos trabalhos, reuniões e lives;
- `dist/assets/` — logos e imagens;
- `dist/docs/` — documentos disponíveis para download.

## Publicação no Cloudflare Pages

Ao conectar este repositório ao Cloudflare Pages, use:

- Framework preset: **None**;
- Build command: deixe vazio;
- Output directory: `dist`.

Para upload direto, envie o conteúdo da pasta `dist`.

## Créditos

Trabalho independente de Gerlan Silva da Silva (UFSCar).
