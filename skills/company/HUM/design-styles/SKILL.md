---
name: "design-styles"
description: "Catálogo de 10 estilos visuales únicos para propuestas web de Humanio — tipografía, paleta, modo, efectos CSS y giros recomendados. El DesignPlanner DEBE seleccionar un estilo diferente para cada prospecto."
slug: "design-styles"
metadata:
  paperclip:
    slug: "design-styles"
    skillKey: "company/HUM/design-styles"
    paperclipSkillKey: "company/HUM/design-styles"
  skillKey: "company/HUM/design-styles"
  key: "company/HUM/design-styles"
key: "company/HUM/design-styles"
---

# Design Styles — Catálogo Visual | Humanio

Antes de escribir cualquier HTML, elige UN estilo de este catálogo. Documenta el estilo elegido en el ticket. No repitas el mismo estilo en prospectos consecutivos.

---

## Estilo 1 — Midnight Luxe

**Para:** Spas, negocios premium, restaurantes de lujo, boutiques, estética de alta gama
**Modo:** Dark

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap" rel="stylesheet">
font-family-heading: 'Playfair Display', serif
font-family-body: 'Raleway', sans-serif
```

**Paleta:**
```css
--bg:       #08060e;
--bg2:      #100d1a;
--bg3:      #181526;
--accent:   #c9a96e;
--accent2:  #e8c98e;
--text:     #f0ebe0;
--muted:    #8a7f6e;
```

**Efectos CSS:**
- Glassmorphism cards: `background: rgba(255,255,255,0.04); backdrop-filter: blur(16px); border: 1px solid rgba(201,169,110,0.15);`
- Gradient dorado: `background: linear-gradient(135deg, #c9a96e 0%, #e8c98e 100%);`
- Hero overlay: `background: linear-gradient(180deg, rgba(8,6,14,0) 0%, rgba(8,6,14,0.9) 100%);`
- Separador: `border-top: 1px solid rgba(201,169,110,0.2);`

**Animaciones recomendadas:** Fade-in lento (1.2s ease), parallax suave, cursor custom dorado, counter animado en cifras clave

---

## Estilo 2 — Neon Nights

**Para:** Bares, antros, gaming, tech startups, estudios de tatuaje, entretenimiento nocturno
**Modo:** Dark

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
font-family-heading: 'Space Grotesk', sans-serif
font-family-body: 'Space Grotesk', sans-serif
font-family-code: 'JetBrains Mono', monospace
```

**Paleta:**
```css
--bg:       #04040f;
--bg2:      #080818;
--bg3:      #0d0d24;
--accent:   #00f5ff;
--accent2:  #bf5fff;
--text:     #e8e8ff;
--muted:    #6060a0;
```

**Efectos CSS:**
- Glow neón: `box-shadow: 0 0 20px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.1);`
- Borde brillante: `border: 1px solid rgba(0,245,255,0.3);`
- Text glow: `text-shadow: 0 0 20px rgba(0,245,255,0.6);`
- Scan lines: `background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.03) 2px, rgba(0,245,255,0.03) 4px);`

**Animaciones recomendadas:** Glitch effect en título, partículas flotantes con color, neon flicker, typewriter en subtítulo

---

## Estilo 3 — Clean Slate

**Para:** Médicos, clínicas, dentistas, abogados, contadores, consultores, servicios profesionales
**Modo:** Light

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
font-family-heading: 'DM Sans', sans-serif
font-family-body: 'Inter', sans-serif
```

**Paleta:**
```css
--bg:       #ffffff;
--bg2:      #f7f9fc;
--bg3:      #eef2f8;
--accent:   #1e40af;
--accent2:  #3b82f6;
--text:     #1a2540;
--muted:    #6b7a99;
```

**Efectos CSS:**
- Card sombra: `box-shadow: 0 2px 16px rgba(30,64,175,0.08); border: 1px solid rgba(30,64,175,0.08);`
- Acento borde: `border-left: 4px solid #1e40af;`
- Hover card: `transform: translateY(-4px); box-shadow: 0 8px 32px rgba(30,64,175,0.12);`
- Fondo sección: `background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%);`

**Animaciones recomendadas:** Fade-up sutil (0.6s), contadores de estadísticas, iconos de certificación, timeline de proceso

---

## Estilo 4 — Tierra Viva

**Para:** Cafeterías, orgánicos, nutrición, bienestar, yoga, herbolaria, agricultura, eco-friendly
**Modo:** Light / Warm

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
font-family-heading: 'Playfair Display', serif
font-family-body: 'Lato', sans-serif
```

**Paleta:**
```css
--bg:       #fdf8f2;
--bg2:      #f5ede0;
--bg3:      #ede0cc;
--accent:   #7c4b1e;
--accent2:  #4a7c59;
--text:     #2d1f0e;
--muted:    #8c7355;
```

**Efectos CSS:**
- Textura: `background-image: url("data:image/svg+xml,..."); opacity: 0.03;` (grain texture sutil)
- Card natural: `border-radius: 16px; background: rgba(255,255,255,0.7); border: 1px solid rgba(124,75,30,0.12);`
- Divisor orgánico: `border-bottom: 2px dashed rgba(124,75,30,0.2);`
- Sombra cálida: `box-shadow: 4px 4px 24px rgba(124,75,30,0.12);`

**Animaciones recomendadas:** Reveal orgánico con clip-path, floating lento en elementos decorativos, zoom suave en hero al scroll

---

## Estilo 5 — Sol y Color

**Para:** Restaurantes casuales, panaderías, tiendas locales, farmacias, ferreterías, retail popular
**Modo:** Light / Vibrant

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Nunito:wght@400;600&display=swap" rel="stylesheet">
font-family-heading: 'Montserrat', sans-serif
font-family-body: 'Nunito', sans-serif
```

**Paleta:**
```css
--bg:       #ffffff;
--bg2:      #fff9f0;
--bg3:      #fff3e0;
--accent:   #e85d04;
--accent2:  #f9c80e;
--text:     #1a0a00;
--muted:    #806040;
```

**Efectos CSS:**
- Botón bold: `background: #e85d04; border-radius: 8px; font-weight: 800; letter-spacing: -0.02em;`
- Badge: `background: #f9c80e; color: #1a0a00; border-radius: 4px; padding: 4px 12px;`
- Hero: `background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);`
- Acento: `background: linear-gradient(90deg, #e85d04, #f9c80e);`

**Animaciones recomendadas:** Bounce suave en botones CTA, slide-in desde lados, contadores de clientes/años, pop en iconos de servicios

---

## Estilo 6 — Aqua Fresh

**Para:** Dentistas, clínicas de estética, spas, farmacias, ópticas, centros de salud beauty
**Modo:** Light / Fresh

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
font-family-heading: 'Nunito', sans-serif
font-family-body: 'DM Sans', sans-serif
```

**Paleta:**
```css
--bg:       #f0fbff;
--bg2:      #e0f5fa;
--bg3:      #cceef7;
--accent:   #0891b2;
--accent2:  #22d3ee;
--text:     #0c2d3a;
--muted:    #5a8090;
```

**Efectos CSS:**
- Card flotante: `background: white; border-radius: 20px; box-shadow: 0 8px 40px rgba(8,145,178,0.10);`
- Burbuja: `border-radius: 50% 20% 50% 20%; background: rgba(34,211,238,0.15);`
- Gradiente hero: `background: linear-gradient(135deg, #f0fbff 0%, #e0f5fa 100%);`
- Icono fill: `background: rgba(8,145,178,0.1); border-radius: 12px;`

**Animaciones recomendadas:** Burbujas flotantes en hero, slide desde abajo en cards, pulse suave en CTA, fade-in escalonado

---

## Estilo 7 — Industrial Edge

**Para:** Construcción, talleres automotrices, herrerías, ferretería industrial, manufactura, logística
**Modo:** Dark / Bold

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
font-family-heading: 'Bebas Neue', sans-serif
font-family-body: 'Inter', sans-serif
```

**Paleta:**
```css
--bg:       #111111;
--bg2:      #1a1a1a;
--bg3:      #242424;
--accent:   #f97316;
--accent2:  #facc15;
--text:     #f5f5f5;
--muted:    #888888;
```

**Efectos CSS:**
- Borde industrial: `border: 2px solid #f97316; border-radius: 2px;`
- Diagonal: `clip-path: polygon(0 0, 100% 0, 96% 100%, 0 100%);`
- Textura metálica: `background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px);`
- Acento bold: `font-size: 80px; letter-spacing: -0.02em; line-height: 0.9;`

**Animaciones recomendadas:** Reveal con clip-path diagonal, números grandes de proyectos/años, hover con scale en cards, scan horizontal

---

## Estilo 8 — Rosa Bloom

**Para:** Salones de belleza, estéticas femeninas, bridal, moda, fotografía, decoración de eventos
**Modo:** Light / Soft

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Nunito:wght@300;400;600&display=swap" rel="stylesheet">
font-family-heading: 'Cormorant Garamond', serif
font-family-body: 'Nunito', sans-serif
```

**Paleta:**
```css
--bg:       #fdf6f8;
--bg2:      #f9eef2;
--bg3:      #f4e4ea;
--accent:   #be185d;
--accent2:  #f9a8d4;
--text:     #3d0d20;
--muted:    #9c6070;
```

**Efectos CSS:**
- Card delicada: `border-radius: 24px; background: white; box-shadow: 0 4px 32px rgba(190,24,93,0.08); border: 1px solid rgba(249,168,212,0.3);`
- Gradiente suave: `background: linear-gradient(135deg, #fdf6f8 0%, #f9eef2 100%);`
- Acento floral: `background: linear-gradient(135deg, #be185d, #f9a8d4);`
- Hover: `transform: translateY(-6px) scale(1.01);`

**Animaciones recomendadas:** Petal float (elementos decorativos), fade-in con escala desde 0.95, ribbon reveal en títulos, suave bounce en CTA

---

## Estilo 9 — Verde Vida

**Para:** Gimnasios, nutriólogos, crossfit, yoga outdoor, tiendas deportivas, suplementos, running
**Modo:** Dark / Energetic

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
font-family-heading: 'Poppins', sans-serif
font-family-body: 'Inter', sans-serif
```

**Paleta:**
```css
--bg:       #050e09;
--bg2:      #091509;
--bg3:      #0d1e10;
--accent:   #22c55e;
--accent2:  #86efac;
--text:     #f0fdf4;
--muted:    #4a7a55;
```

**Efectos CSS:**
- Borde energético: `border: 1px solid rgba(34,197,94,0.3); border-radius: 8px;`
- Línea de progreso: `background: linear-gradient(90deg, #22c55e, #86efac); height: 3px;`
- Hero dinámico: `background: linear-gradient(135deg, #050e09 0%, #0d1e10 100%);`
- Glow verde: `box-shadow: 0 0 30px rgba(34,197,94,0.2);`

**Animaciones recomendadas:** Progress bars animadas, números de retos/transformaciones, slide-in agresivo desde lado, pulse en CTA principal

---

## Estilo 10 — Dorado Premium

**Para:** Inmobiliarias, asesores financieros, seguros, notarías, despachos jurídicos, consultoría empresarial
**Modo:** Dark / Sophisticated

**Tipografía:**
```
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet">
font-family-heading: 'Libre Baskerville', serif
font-family-body: 'Source Sans 3', sans-serif
```

**Paleta:**
```css
--bg:       #0a0908;
--bg2:      #120f0d;
--bg3:      #1a1512;
--accent:   #d4a853;
--accent2:  #f0cc7a;
--text:     #f5efe8;
--muted:    #8a7560;
```

**Efectos CSS:**
- Card executive: `border: 1px solid rgba(212,168,83,0.2); background: rgba(255,255,255,0.03); backdrop-filter: blur(8px);`
- Línea de lujo: `border-bottom: 1px solid rgba(212,168,83,0.3);`
- Gradiente sofisticado: `background: linear-gradient(135deg, #d4a853 0%, #f0cc7a 50%, #d4a853 100%);`
- Sello: `border: 2px solid rgba(212,168,83,0.4); border-radius: 50%; width: 80px; height: 80px;`

**Animaciones recomendadas:** Reveal de letras por palabra, counters de propiedades/clientes/años, parallax en hero, fade-in desde opacity 0

---

## Tabla de Compatibilidad Rápida

| Estilo | Modo | Energía | Perfecto para |
|--------|------|---------|--------------|
| Midnight Luxe | Dark | Sereno | Spa, lujo, alta gama |
| Neon Nights | Dark | Intenso | Bares, tech, nightlife |
| Clean Slate | Light | Profesional | Médicos, abogados |
| Tierra Viva | Light | Orgánico | Cafés, orgánicos, wellness |
| Sol y Color | Light | Alegre | Restaurantes, retail |
| Aqua Fresh | Light | Fresco | Dentistas, clínicas beauty |
| Industrial Edge | Dark | Bold | Construcción, automotriz |
| Rosa Bloom | Light | Delicado | Salones, bridal, moda |
| Verde Vida | Dark | Energético | Gimnasios, nutrición, deporte |
| Dorado Premium | Dark | Sofisticado | Finanzas, inmobiliaria, legal |

## Regla de variación

El agente DEBE documentar en el ticket el estilo usado:
```
🎨 Estilo elegido: [Nombre del estilo]
📐 Layout elegido: [Nombre del layout]
```

No repitas el mismo estilo para prospectos del mismo lote. Si tienes 3 dentistas, usa 3 estilos distintos (ej: Clean Slate, Aqua Fresh, Midnight Luxe).
