---
name: "layout-blueprints"
description: "6 arquetipos de layout para propuestas web de Humanio — wireframes ASCII, CSS listo, variantes de testimonios/CTAs/footers y tabla de compatibilidad estilo↔layout. Combinar con design-styles para variedad total."
slug: "layout-blueprints"
metadata:
  paperclip:
    slug: "layout-blueprints"
    skillKey: "company/HUM/layout-blueprints"
    paperclipSkillKey: "company/HUM/layout-blueprints"
  skillKey: "company/HUM/layout-blueprints"
  key: "company/HUM/layout-blueprints"
key: "company/HUM/layout-blueprints"
---

# Layout Blueprints — Arquetipos de Layout | Humanio

Elige UN layout de este catálogo. Combina con el estilo visual del skill `design-styles`. Documenta la combinación en el ticket antes de escribir HTML.

---

## Layout 1 — Centrado Clásico

**Descripción:** Hero centrado con título grande, texto debajo, luego secciones alternas de contenido. El layout más limpio y universal.

**Mejor con:** Clean Slate, Aqua Fresh, Sol y Color, Tierra Viva

**Wireframe ASCII:**
```
┌─────────────────────────────────┐
│           NAV (logo + links)    │
├─────────────────────────────────┤
│                                 │
│     [IMAGEN HERO FULL-WIDTH]    │
│                                 │
│      TÍTULO PRINCIPAL           │
│      Subtítulo descriptivo      │
│      [ CTA PRIMARIO ]           │
│                                 │
├─────────────────────────────────┤
│  ESTADÍSTICA  ESTADÍSTICA  STAT │
├─────────────────────────────────┤
│   Servicio 1  Servicio 2  S.3   │
│   [card]      [card]      [card]│
├─────────────────────────────────┤
│        SECCIÓN BENEFICIOS       │
│   ✓ Punto 1   ✓ Punto 2        │
├─────────────────────────────────┤
│          TESTIMONIOS            │
├─────────────────────────────────┤
│         CTA FINAL               │
│      [ Contactar ahora ]        │
└─────────────────────────────────┘
```

**CSS Base:**
```css
.hero {
  text-align: center;
  padding: 120px 24px 80px;
  position: relative;
}
.hero h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  max-width: 800px;
  margin: 0 auto 24px;
}
.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--accent);
}
.stats-bar > div {
  background: var(--bg2);
  padding: 32px;
  text-align: center;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 64px 24px;
}
```

---

## Layout 2 — Split 50/50

**Descripción:** Hero dividido en dos columnas: texto a la izquierda, imagen a la derecha. Secciones alternas (texto-imagen / imagen-texto). Transmite modernidad y balance.

**Mejor con:** Midnight Luxe, Dorado Premium, Rosa Bloom, Verde Vida

**Wireframe ASCII:**
```
┌─────────────────────────────────┐
│           NAV                   │
├─────────────────┬───────────────┤
│                 │               │
│  TÍTULO         │  [IMAGEN]     │
│  GRANDE         │               │
│                 │               │
│  Descripción    │               │
│  [ CTA ]        │               │
│                 │               │
├─────────────────┴───────────────┤
│  [IMAGEN]     │  Servicio 1    │
│               │  Descripción   │
├───────────────┤                │
│  Servicio 2   │  [IMAGEN]      │
│  Descripción  │                │
├─────────────────────────────────┤
│  TESTIMONIOS (cards en fila)    │
├─────────────────────────────────┤
│  CTA FINAL centrado             │
└─────────────────────────────────┘
```

**CSS Base:**
```css
.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  align-items: center;
}
.hero-split .text-side {
  padding: 80px 64px 80px 40px;
}
.hero-split .image-side {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}
.hero-split .image-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.service-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: center;
}
.service-split:nth-child(even) { direction: rtl; }
.service-split:nth-child(even) > * { direction: ltr; }
@media (max-width: 768px) {
  .hero-split, .service-split { grid-template-columns: 1fr; }
  .hero-split .image-side { height: 50vw; position: relative; }
}
```

---

## Layout 3 — Hero Full-Bleed

**Descripción:** Hero de viewport completo con imagen de fondo, overlay y texto centrado. Máximo impacto visual. Secciones con fondo oscuro alternado.

**Mejor con:** Neon Nights, Industrial Edge, Midnight Luxe, Verde Vida

**Wireframe ASCII:**
```
┌─────────────────────────────────┐
│  NAV (transparente sobre hero)  │
│                                 │
│  [IMAGEN FONDO 100vh]           │
│         OVERLAY                 │
│                                 │
│      TÍTULO IMPACTANTE          │
│      Tag line aquí              │
│      [ CTA ]  [ Ver más ↓ ]    │
│                                 │
│           ⌄ scroll              │
├─────────────────────────────────┤
│ [card]  [card]  [card]  [card]  │
│  Servicios con iconos           │
├─────────────────────────────────┤
│ [BG imagen]  Sección de texto   │
│              con beneficios     │
├─────────────────────────────────┤
│       STATS HORIZONTALES        │
├─────────────────────────────────┤
│          CTA FINAL              │
└─────────────────────────────────┘
```

**CSS Base:**
```css
.hero-fullbleed {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-fullbleed .bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  transform: scale(1.1);
  transition: transform 8s ease;
}
.hero-fullbleed:hover .bg-image { transform: scale(1.0); }
.hero-fullbleed .overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 100%);
  z-index: 1;
}
.hero-fullbleed .content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
}
nav.transparent {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  background: transparent;
  transition: background 0.3s;
}
nav.transparent.scrolled { background: var(--bg); }
```

---

## Layout 4 — Tarjetas Apiladas

**Descripción:** Grid de cards como estructura principal. Ideal para negocios con múltiples servicios o categorías claramente diferenciadas.

**Mejor con:** Sol y Color, Aqua Fresh, Rosa Bloom, Clean Slate

**Wireframe ASCII:**
```
┌─────────────────────────────────┐
│           NAV                   │
├─────────────────────────────────┤
│  TÍTULO     SUBTÍTULO      CTA  │
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │[img] │ │[img] │ │[img] │    │
│ │Serv.1│ │Serv.2│ │Serv.3│    │
│ │desc  │ │desc  │ │desc  │    │
│ │[btn] │ │[btn] │ │[btn] │    │
│ └──────┘ └──────┘ └──────┘    │
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │[img] │ │[img] │ │[img] │    │
│ │Serv.4│ │Serv.5│ │Serv.6│    │
│ └──────┘ └──────┘ └──────┘    │
├─────────────────────────────────┤
│  STATS  |  PROCESO  |  RESEÑAS │
├─────────────────────────────────┤
│        CTA FINAL                │
└─────────────────────────────────┘
```

**CSS Base:**
```css
.hero-compact {
  padding: 80px 24px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 48px 24px;
}
.service-card {
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.service-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.service-card .card-body {
  padding: 24px;
}
```

---

## Layout 5 — Scroll Narrativo

**Descripción:** La página cuenta una historia al hacer scroll. Secciones con revelaciones progresivas, timeline o proceso paso a paso. Muy efectivo para persuasión.

**Mejor con:** Tierra Viva, Dorado Premium, Clean Slate, Midnight Luxe

**Wireframe ASCII:**
```
┌─────────────────────────────────┐
│           NAV + progress bar    │
├─────────────────────────────────┤
│     HOOK — El problema          │
│     (dolor del cliente)         │
├─────────────────────────────────┤
│     LA SOLUCIÓN                 │
│     (quiénes somos)             │
├─────────────────────────────────┤
│  PASO 1 → PASO 2 → PASO 3      │
│  (proceso de trabajo)           │
├─────────────────────────────────┤
│     EVIDENCIA / RESULTADOS      │
│     Stats + testimonios         │
├─────────────────────────────────┤
│     SERVICIOS                   │
│     (con precios)               │
├─────────────────────────────────┤
│     ¿POR QUÉ NOSOTROS?          │
│     Diferenciadores             │
├─────────────────────────────────┤
│     ACCIÓN — CTA urgencia       │
└─────────────────────────────────┘
```

**CSS Base:**
```css
.narrative-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 80px 24px;
  position: relative;
}
.narrative-section.dark { background: var(--bg); }
.narrative-section.darker { background: var(--bg2); }
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent);
  z-index: 1000;
  transition: width 0.1s linear;
}
.timeline {
  display: flex;
  gap: 0;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  opacity: 0.3;
}
.timeline-step {
  flex: 1;
  text-align: center;
  padding: 0 24px;
  position: relative;
}
.timeline-step::before {
  content: attr(data-step);
  display: block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  font-weight: 700;
  margin: 0 auto 16px;
}
```

---

## Layout 6 — Sidebar + Content

**Descripción:** Navegación lateral fija con contenido principal scrollable. Ideal para propuestas con muchas secciones o cuando el cliente quiere navegar directamente a precios/servicios.

**Mejor con:** Dorado Premium, Neon Nights, Industrial Edge, Verde Vida

**Wireframe ASCII:**
```
┌────────┬────────────────────────┐
│        │        NAV TOP         │
│ LOGO   ├────────────────────────┤
│        │                        │
│ ────── │   HERO (sin sidebar)   │
│        │                        │
│ Inicio ├────────────────────────┤
│        │                        │
│ Servic.│   SECCIÓN ACTIVA       │
│        │   Contenido principal  │
│ Precios│                        │
│        │   [cards/info/etc]     │
│ Reseñas│                        │
│        ├────────────────────────┤
│ Contac.│   SIGUIENTE SECCIÓN    │
│        │                        │
│ ────── │                        │
│ [CTA]  │                        │
└────────┴────────────────────────┘
```

**CSS Base:**
```css
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: var(--bg2);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 32px 16px;
  overflow-y: auto;
  z-index: 50;
}
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--muted);
  transition: all 0.2s;
  font-size: 14px;
}
.sidebar-nav a:hover,
.sidebar-nav a.active {
  background: rgba(255,255,255,0.06);
  color: var(--text);
}
.sidebar-nav a.active { border-left: 3px solid var(--accent); }
.main-content {
  margin-left: 240px;
}
@media (max-width: 768px) {
  .app-layout { grid-template-columns: 1fr; }
  .sidebar { position: fixed; bottom: 0; top: auto; height: auto; width: 100%; flex-direction: row; }
  .main-content { margin-left: 0; padding-bottom: 80px; }
}
```

---

## Variantes de Testimonios (elige una)

### T1 — Cards en Grid
```css
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.testimonial-card {
  background: var(--bg2);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(255,255,255,0.06);
}
.testimonial-card .stars { color: var(--accent); margin-bottom: 12px; }
.testimonial-card .author { font-weight: 600; margin-top: 16px; font-size: 14px; }
```

### T2 — Carrusel Horizontal (scroll snapping)
```css
.testimonials-scroll {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}
.testimonials-scroll::-webkit-scrollbar { display: none; }
.testimonial-slide {
  flex: 0 0 360px;
  scroll-snap-align: start;
  background: var(--bg2);
  border-radius: 16px;
  padding: 32px;
}
```

### T3 — Quote Grande Central
```css
.testimonial-featured {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding: 64px 24px;
}
.testimonial-featured blockquote {
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 32px;
  color: var(--text);
}
.testimonial-featured blockquote::before { content: '"'; font-size: 4rem; color: var(--accent); }
```

---

## Variantes de CTA (elige una)

### CTA-1 — Banner Centrado
```css
.cta-banner {
  padding: 80px 24px;
  text-align: center;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
}
.cta-banner h2 { color: white; font-size: clamp(1.8rem, 4vw, 3rem); margin-bottom: 16px; }
.btn-cta-white {
  background: white;
  color: var(--accent);
  padding: 16px 40px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  display: inline-block;
  text-decoration: none;
}
```

### CTA-2 — Split con imagen
```css
.cta-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
}
.cta-split .image-side { overflow: hidden; }
.cta-split .image-side img { width: 100%; height: 100%; object-fit: cover; }
.cta-split .text-side {
  background: var(--accent);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 48px;
  color: white;
}
```

### CTA-3 — Floating Card
```css
.cta-float {
  position: relative;
  padding: 80px 24px;
}
.cta-card {
  max-width: 600px;
  margin: 0 auto;
  background: var(--bg2);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 32px 80px rgba(0,0,0,0.4);
}
```

---

## Variantes de Footer (elige una)

### F1 — Completo con columnas
```css
.footer-full {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  padding: 64px 24px 32px;
  background: var(--bg);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.footer-brand p { color: var(--muted); font-size: 14px; margin-top: 12px; max-width: 280px; }
.footer-col h4 { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
.footer-col a { display: block; color: var(--text); text-decoration: none; margin-bottom: 8px; font-size: 14px; }
```

### F2 — Minimal centrado
```css
.footer-minimal {
  text-align: center;
  padding: 48px 24px;
  background: var(--bg2);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.footer-minimal .social-links { display: flex; justify-content: center; gap: 16px; margin: 24px 0; }
.footer-minimal .social-links a {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  color: var(--muted);
  text-decoration: none;
  transition: all 0.2s;
}
.footer-minimal .social-links a:hover { background: var(--accent); color: white; }
```

### F3 — CTA integrado al footer
```css
.footer-cta {
  padding: 64px 24px 32px;
  background: var(--bg);
}
.footer-cta-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-wrap: wrap;
  gap: 24px;
}
.footer-cta-top h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); max-width: 500px; }
```

---

## Tabla de Compatibilidad Estilo ↔ Layout

| Estilo | L1 Clásico | L2 Split | L3 FullBleed | L4 Tarjetas | L5 Narrativo | L6 Sidebar |
|--------|-----------|---------|-------------|------------|-------------|-----------|
| Midnight Luxe | ✓ | ★ | ★ | — | ✓ | ★ |
| Neon Nights | — | — | ★ | ✓ | — | ★ |
| Clean Slate | ★ | ✓ | — | ✓ | ★ | — |
| Tierra Viva | ✓ | ✓ | — | ★ | ★ | — |
| Sol y Color | ★ | — | — | ★ | — | — |
| Aqua Fresh | ★ | — | — | ★ | ✓ | — |
| Industrial Edge | — | ✓ | ★ | — | — | ★ |
| Rosa Bloom | ✓ | ★ | — | ★ | — | — |
| Verde Vida | — | ★ | ★ | — | ✓ | ★ |
| Dorado Premium | ✓ | ★ | ✓ | — | ★ | ★ |

★ = Combinación premium recomendada | ✓ = Funciona bien | — = Evitar
