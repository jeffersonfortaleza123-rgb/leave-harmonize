## Objetivo

Criar uma landing page institucional moderna e premium do 3º Grupamento de Bombeiros em uma **nova rota `/sobre`**, sem alterar a home atual (Controle de Férias). Identidade visual militar/honrada: vermelho vibrante, dourado, branco e azul; tipografia serifada imponente; ícones de machado, chama e escudo; micro-animações suaves; totalmente responsiva.

## Arquivos novos

- `src/routes/sobre.tsx` — rota principal da landing, com `head()` próprio (title, description, og:title, og:description, og:image).
- `src/components/landing/Hero.tsx` — hero com brasão centralizado, fundo de chamas/sertão sutil, título serifado, CTAs vermelho/dourado.
- `src/components/landing/Historia.tsx` — bloco história com texto institucional genérico.
- `src/components/landing/Missao.tsx` — missão, visão e valores em cards com ícone de escudo/chama.
- `src/components/landing/Servicos.tsx` — grid de serviços (combate a incêndio, resgate, salvamento aquático, prevenção, atendimento pré-hospitalar) com ícones lucide (Flame, Shield, Axe-like via `Swords`, LifeBuoy, HeartPulse).
- `src/components/landing/Galeria.tsx` — grid de 6 imagens IA (viatura, equipe, treino, brasão, paisagem, chamas) usando assets gerados.
- `src/components/landing/Contato.tsx` — endereço, telefone de emergência 193, e-mail; formulário visual (sem backend).
- `src/components/landing/SiteHeader.tsx` — header fixo translúcido com brasão pequeno, nav âncora (História, Missão, Serviços, Galeria, Contato) e botão dourado "Controle de Férias" linkando para `/`.
- `src/components/landing/SiteFooter.tsx` — rodapé escuro com brasão, lema e créditos.

## Assets gerados (imagegen, salvos como `.asset.json`)

- `src/assets/hero-bg.jpg.asset.json` — paisagem do sertão nordestino ao entardecer com leve textura de chamas, cinematográfica, escura.
- 6 imagens da galeria em `src/assets/galeria-*.jpg.asset.json`.

Reuso do brasão existente: `src/assets/brasao.png.asset.json`.

## Design tokens (em `src/styles.css`)

Adicionar tokens semânticos (sem quebrar o tema atual usado pelo sistema de férias):

- `--gb-red: oklch(0.5 0.25 25)` (já alinhado ao primary atual)
- `--gb-gold: oklch(0.78 0.15 85)`
- `--gb-navy: oklch(0.28 0.08 260)`
- `--gb-cream: oklch(0.97 0.02 80)`
- `--gradient-gb-hero: linear-gradient(135deg, oklch(0.2 0.05 25) 0%, var(--gb-red) 100%)`
- `--shadow-gold: 0 10px 30px -10px oklch(0.78 0.15 85 / 0.5)`
- Família serifada `--font-serif: "Cormorant Garamond", "Playfair Display", Georgia, serif` carregada via `<link>` no `__root.tsx` head (não `@import`).

Esses tokens vivem dentro de `@theme inline` para gerar utilitárias `bg-gb-red`, `text-gb-gold`, etc.

## Estrutura visual

```text
[ Header fixo translúcido | brasão • nav âncora • CTA dourado ]
[ HERO: bg paisagem+chamas, brasão grande, título serif "3º Grupamento
       de Bombeiros", lema, 2 botões (Conheça / Emergência 193) ]
[ HISTÓRIA: 2 colunas, texto + imagem, divisor dourado ]
[ MISSÃO/VISÃO/VALORES: 3 cards escudo/chama/machado ]
[ SERVIÇOS: grid 2x3 com ícones e descrições ]
[ GALERIA: masonry 6 imagens com hover-zoom ]
[ CONTATO: mapa estilizado + dados + form visual ]
[ FOOTER vermelho escuro + dourado ]
```

## Micro-animações

- `animate-fade-in` ao entrar nas seções (via IntersectionObserver leve em hook utilitário `useInView`).
- `hover-scale` nos cards de serviço e itens da galeria.
- Brasão do hero com leve `animate-pulse` dourado em torno (box-shadow gold).
- Sublinhado dourado animado nos links do nav (`story-link` adaptada para cor gold).

## SEO

`head()` em `sobre.tsx`:
- title: "3º Grupamento de Bombeiros — Honra, Disciplina e Coragem"
- description institucional <160 chars
- og:title, og:description, og:image (hero-bg)
- H1 único no Hero, semantic `<section>` por bloco, alt em todas imagens.

## Integração com app atual

- Não toca em rotas, dados, auth ou componentes do sistema de férias.
- Em `src/routes/index.tsx` adicionar um pequeno link discreto no header existente: "Sobre o 3º GB" → `/sobre` (Link do TanStack). Único toque fora da landing.

## Responsividade

- Header colapsa em menu hambúrguer abaixo de `sm`.
- Hero: título 3xl → 6xl; brasão 24 → 40.
- Grids: 1 col mobile, 2 tablet, 3 desktop.
- Aplica padrão `grid-cols-[minmax(0,1fr)_auto]` nos headers com brasão+nav para não quebrar em mobile.

## Fora de escopo

- Nenhum backend, formulário não envia (apenas UI).
- Nenhuma mudança no Controle de Férias além do link "Sobre".
- Sem i18n, sem CMS.