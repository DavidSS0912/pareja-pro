# Modern Fintech Bento Grid — Design System Specification

## 1. Visión General y Filosofía de Diseño
Este sistema de diseño implementa una estética **Modern Fintech / Bento Modular SaaS**, caracterizada por:
- **Estructura modular Bento Grid:** Distribución balanceada de información en tarjetas autosuficientes con abundante aire y jerarquías claras.
- **Contraste selectivo de alto impacto:** Convivencia de una superficie clara luminosa (`#F5F6FA`) con módulos de acento profundo u obsidian dark (`#111319`), como la barra lateral y tarjetas de crédito principales.
- **Suavidad y calidez:** Radios generosos (`20px` a `24px`), sombras atmosféricas casi imperceptibles y fondos tintados en pasteles sutiles (menta, lavanda, melocotón).
- **Tratamiento numérico de precisión:** Tipografía tabular para lecturas financieras exactas y escaneables.

---

## 2. Tokens de Color

### Colores Base y Lienzo
| Token CSS | Valor Hex | Tailwind Class | Propósito / Contexto |
|---|---|---|---|
| `--bg-canvas` | `#F5F6FA` | `bg-[#F5F6FA]` | Fondo global del dashboard |
| `--surface-card` | `#FFFFFF` | `bg-white` | Fondo de tarjetas estándar bento |
| `--surface-dark` | `#111319` | `bg-[#111319]` | Sidebar oscuro, hero cards y botones primarios |
| `--surface-dark-elevated` | `#1A1D26` | `bg-[#1A1D26]` | Hover en sidebar y elementos anidados oscuros |
| `--border-subtle` | `#EEF0F4` | `border-[#EEF0F4]` | Separadores y bordes de tarjetas |
| `--border-dark` | `#232733` | `border-[#232733]` | Bordes interiores en superficies oscuras |

### Colores de Acento y Categorías (Pastel Washes)
| Categoría | Token de Acento | Color Sólido | Fondo Suave (Tint) | Aplicación |
|---|---|---|---|---|
| **Positivo / Menta** | `--color-mint` | `#10B981` | `#E8F8F0` | Ingresos, subidas porcentuales, status "Complete" |
| **Primario / Lavanda** | `--color-lavender` | `#6366F1` | `#EEF2FF` | Métricas primarias, barras activas, donas |
| **Gasto / Coral** | `--color-coral` | `#F97316` | `#FDEFEA` | Gastos, bajadas porcentuales, alertas de consumo |
| **Neutro / Slate** | `--color-slate-tint` | `#64748B` | `#F1F5F9` | Acciones secundarias, estados inactivos |

### Tipografía y Contenido
| Token CSS | Valor Hex | Tailwind Class | Propósito |
|---|---|---|---|
| `--text-primary` | `#0F172A` | `text-slate-900` | Encabezados, balances numéricos y etiquetas activas |
| `--text-secondary` | `#475569` | `text-slate-600` | Nombres de transacciones y títulos de columna |
| `--text-muted` | `#94A3B8` | `text-slate-400` | Labels secundarios, fechas, placeholders y subtítulos |
| `--text-inverse` | `#FFFFFF` | `text-white` | Texto sobre superficies oscuras (`#111319`) |
| `--text-inverse-muted` | `#6B7280` | `text-slate-400` | Enlaces secundarios en navegación lateral oscura |

---

## 3. Tipografía y Jerarquía

### Familias Tipográficas
- **Principal (UI & Datos):** `'Plus Jakarta Sans'`, `'Inter'`, o `'Geist Sans'`, sans-serif.
- **Configuración de Números:** `font-feature-settings: "tnum", "cv02", "cv03", "cv04"` para forzar el alineamiento monoespaciado en datos monetarios.

### Escala Tipográfica
```css
/* Escala de texto */
--font-kpi:         font-weight: 700; font-size: 1.75rem; line-height: 2rem;    /* 28px */
--font-h1:          font-weight: 700; font-size: 1.5rem;  line-height: 2rem;    /* 24px */
--font-h2:          font-weight: 600; font-size: 1.125rem;line-height: 1.5rem;  /* 18px */
--font-h3:          font-weight: 600; font-size: 1rem;    line-height: 1.25rem; /* 16px */
--font-body:        font-weight: 400; font-size: 0.875rem;line-height: 1.25rem; /* 14px */
--font-body-medium: font-weight: 500; font-size: 0.875rem;line-height: 1.25rem; /* 14px */
--font-caption:     font-weight: 500; font-size: 0.75rem; line-height: 1rem;    /* 12px */
--font-micro:       font-weight: 600; font-size: 0.6875rem;line-height: 0.875rem;/* 11px */
```

---

## 4. Radios, Elevación y Bordes

### Border Radius
- **Outer Shell / Viewport Wrapper:** `28px` (`rounded-[28px]`)
- **Bento Card Containers:** `24px` (`rounded-3xl` / `rounded-[24px]`)
- **Mini Widgets / Nested Cards:** `16px` (`rounded-2xl` / `rounded-[16px]`)
- **Inputs & Dropdown Triggers:** `12px` (`rounded-xl` / `rounded-[12px]`)
- **Pills, Avatars & Tags:** `9999px` (`rounded-full`)

### Sombras y Elevación
- **Card Shadow (Sutil y difusa):**
  ```css
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.03), 0 2px 6px -1px rgba(15, 23, 42, 0.02);
  ```
- **Floating Element / Popover:**
  ```css
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
  ```
- **Tooltip Dark:**
  ```css
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  ```

---

## 5. Especificación de Componentes

### 5.1 Barra Lateral (Dark Sidebar)
- **Ancho:** `240px` a `260px`.
- **Fondo:** `#111319` con esquinas redondeadas en el extremo exterior (`rounded-l-3xl` o encapsulado dentro del contenedor principal).
- **Elementos de Menú:**
  - Altura: `44px`.
  - Padding: `px-4 py-2.5`.
  - Iconos lineales de `20px` con trazo de `1.5px` a `1.75px`.
  - Estado Inactivo: Color de icono y texto `#8C93A6`, sin fondo.
  - Estado Hover: Color `#FFFFFF`, fondo `#1A1D26`, transición suave `150ms`.
  - Badge numérico en píldora: Fondo `#FFFFFF`, texto `#111319`, `rounded-full text-xs font-bold px-2 py-0.5`.

### 5.2 Tarjetas de Crédito Virtuales (Hero Visual Card)
- **Dimensiones:** Relación de aspecto estándar bancario (~`1.586 : 1`).
- **Fondo:** Degradado oscuro carbón:
  ```css
  background: linear-gradient(135deg, #1C1F28 0%, #101217 100%);
  ```
- **Elementos requeridos:**
  - Micro-chip de contacto SIM en la esquina superior derecha (plata o dorado metálico suave).
  - Número de tarjeta enmascarado: `**** **** **** 7865` con espaciado amplio (`tracking-widest`).
  - Nombre del titular y fecha de expiración en tipografía micro (`11px` / `12px`).
  - Logotipo del procesador (Visa / Mastercard) en blanco o doble esfera minimalista monocromática.

### 5.3 Bento Metric Cards (KPIs)
- **Estructura Interna:**
  ```
  +--------------------------------------------+
  | [Icono / Tag Pastel]       [Sparkline / ···] |
  | Label (ej. Total Income)                   |
  | $85,992.00                                 |
  | [↑ 17%] vs mes anterior                    |
  +--------------------------------------------+
  ```
- **Píldora de Tendencia:**
  - Positivo: Fondo `#E8F8F0`, texto verde menta `#10B981`, icono flecha `↑`.
  - Negativo: Fondo `#FDEFEA`, texto coral `#F97316`, icono flecha `↓`.

### 5.4 Transferencias Rápidas (Avatar Carousel)
- Avatares circulares de `40px` a `48px` (`rounded-full`).
- Anillo activo o botón `+` para añadir contacto: Fondo blanco con borde punteado o botón negro sólido.
- Campo de entrada para número de tarjeta / IBAN:
  - Input encapsulado con estilo pill (`rounded-full` o `rounded-xl`).
  - Fondo `#F5F6FA`, texto monoespaciado, logo de red emisora a la derecha (`Visa`).

### 5.5 Visualización de Datos (Charts)
- **Gráfica de Área / Tendencia de Flujo:**
  - Líneas dobles suaves (Spline curva `monotone`).
  - Trazo delgado de `2px` (Gris oscuro `#111319` para línea principal, línea punteada `#CBD5E1` para comparativa).
  - Puntos activos: Tooltip flotante en fondo oscuro `#111319`, texto blanco (`$2,289`).
- **Gráfica de Barras:**
  - Barras dobles con puntas redondeadas (`rounded-t-md`).
  - Par de barras: Barra primaria en `#111319` o lavanda `#6366F1`, barra secundaria en `#EEF0F4`.
- **Gráfica de Dona (Analytics):**
  - Radio interno ancho (donut delgado).
  - Segmentos en verde menta suave, lavanda texturizado y gris carbón.

### 5.6 Listas de Transacciones y Tablas
- **Encabezados:** Tipografía `12px uppercase font-semibold text-slate-400 tracking-wider`.
- **Fila de Transacción:**
  - Separación limpia mediante padding vertical (`py-3.5`) y línea inferior divisoria fina (`#EEF0F4`).
  - Avatar / Icono de categoría: Contenedor cuadrado con esquinas redondeadas (`rounded-xl`), `40x40px`, fondo pastel suave con icono a tono.
  - Tag de Estado: Píldora `px-2.5 py-1 text-xs rounded-full font-medium` con punto indicador de 6px a la izquierda.

---

## 6. Reglas de Implementación (Tailwind CSS)

```js
// tailwind.config.js - Extensión sugerida
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#F5F6FA',
        obsidian: {
          900: '#111319',
          800: '#1A1D26',
          700: '#232733',
        },
        mint: {
          DEFAULT: '#10B981',
          soft: '#E8F8F0',
        },
        lavender: {
          DEFAULT: '#6366F1',
          soft: '#EEF2FF',
        },
        peach: {
          DEFAULT: '#F97316',
          soft: '#FDEFEA',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '28px',
      },
      boxShadow: {
        'bento': '0 4px 20px -2px rgba(15, 23, 42, 0.03), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
      }
    }
  }
}
```

---

## 7. Directrices Estrictas de Construcción (Do's & Don'ts)

### Do's
- Mantén una coherencia estricta en los radios: siempre `rounded-3xl` para tarjetas de primer nivel y `rounded-2xl` para subcomponentes internos.
- Usa `tabular-nums` en cualquier componente con métricas financieras o valores numéricos dinámicos.
- Mantén los fondos de acento en una opacidad muy baja (tonos pastel lavados) para evitar sobrecargar la vista del usuario.
- Incorpora bordes ultra delgados (`border border-[#EEF0F4]`) incluso cuando las tarjetas tengan fondos blancos sobre fondo gris claro.

### Don'ts
- **No** utilices sombras oscuras pesadas o bordes negros gruesos alrededor de las tarjetas claras.
- **No** mezcles esquinas cuadradas (`rounded-none` o `rounded-sm`) con los componentes bento.
- **No** utilices colores saturados primarios como fondo de bloques completos (reserva los colores vivos únicamente para iconos, badges y líneas de gráficas).
- **No** recargues la pantalla con demasiados elementos oscuros; la regla visual es 80% superficie clara / 20% acentos en negro obsidiana.
