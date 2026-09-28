# Design System — [Nombre del Proyecto]

> Diseño. Construye. Entrega con consistencia.

Un sistema de diseño consistente y escalable para un producto moderno, accesible y con identidad propia. Este documento es la fuente única de verdad (_single source of truth_) que deben seguir diseño y desarrollo.

---

## 01. Identidad de Marca

Nuestra identidad visual refleja simplicidad, creatividad y tecnología.

**Nombre del proyecto:** SICOLOGIA DATA REPORT
**Tagline:** base de datos de pacientes y control de seguimiento
**Tono de voz:** cercano y profesional

---

## 02. Paleta de Colores

Usa estos colores de forma consistente en todo el producto. Nunca definas un color "al ojo" en el código: siempre referencia el token.

| Token                | Uso                          | Hex       |
| -------------------- | ---------------------------- | --------- |
| `--color-primary`    | Color principal de marca     | `#277da1` |
| `--color-accent`     | Acentos, CTAs, énfasis       | `#f3722c` |
| `--color-secondary`  | Apoyo, elementos secundarios | `#4d908e` |
| `--color-background` | Fondo general                | `#FAFAFA` |
| `--color-surface`    | Tarjetas, paneles            | `#FFFFFF` |
| `--color-success`    | Estados de éxito             | `#22C55E` |
| `--color-error`      | Estados de error             | `#f94144` |
| `--color-warning`    | Advertencias                 | `#F59E0B` |
| `--color-info`       | Información                  | `#3B82F6` |
| `--color-text`       | Texto principal              | `#18181B` |

> Regla: cada color debe tener contraste suficiente (mínimo AA de WCAG) contra el fondo donde se use.

---

## 03. Tipografía

**Familia tipográfica:** :https://fonts.google.com/specimen/Google+Sans+Flex?preview.script=Latn&query=SANS
**Fallback:** system-ui, sans-serif

| Estilo  | Tamaño | Line-height | Peso     |
| ------- | ------ | ----------- | -------- |
| H1      | 64px   | 72px        | Bold     |
| H2      | 48px   | 56px        | Semibold |
| H3      | 32px   | 40px        | Semibold |
| H4      | 24px   | 32px        | Medium   |
| Body    | 16px   | 24px        | Regular  |
| Caption | 14px   | 20px        | Regular  |

---

## 04. Espaciado (Spacing)

Sistema de espaciado en base 8px para mantener layouts consistentes.

`4px · 8px · 16px · 24px · 32px · 48px · 64px`

Regla práctica: los márgenes/paddings internos de componentes usan la escala completa; nunca valores arbitrarios (ej. 13px, 22px).

---

## 05. Border Radius

| Token           | Valor  | Uso típico               |
| --------------- | ------ | ------------------------ |
| `--radius-xs`   | 4px    | Badges, chips pequeños   |
| `--radius-sm`   | 8px    | Inputs, botones          |
| `--radius-md`   | 12px   | Cards                    |
| `--radius-lg`   | 16px   | Modales, paneles grandes |
| `--radius-full` | 9999px | Avatares, botones pill   |

---

## 06. Componentes

Componentes reutilizables para un desarrollo más rápido y consistente.

### Botones

- **Primary** — acción principal, un solo uso por vista
- **Secondary** — acción alternativa
- **Ghost** — acción de bajo énfasis

Estados obligatorios a diseñar: `default`, `hover`, `active`, `disabled`, `loading`.

### Input Field

Placeholder claro, estado de error con mensaje debajo, foco visible (outline o glow).

### Badge

Variantes: `default`, `success`, `warning`, `error`, `info`.

### Otros componentes base a definir

Card, Modal, Toast/Notification, Tabla, Tabs, Tooltip, Dropdown, Avatar.

---

## 07. Iconografía

ns]
**Set de íconos:** Lucide Icons
**Grosor de trazo:** consistente en todo el set (ej. 1.5px–2px)
**Tamaños estándar:** 16px / 20px / 24px / 32px

---

## 08. Breakpoints Responsivos

| Dispositivo | Rango           |
| ----------- | --------------- |
| Mobile      | < 640px         |
| Tablet      | 640px – 1024px  |
| Laptop      | 1024px – 1440px |
| Desktop     | ≥ 1440px        |

---

## 09. Principios de Uso

1. **Consistencia sobre creatividad puntual.** Si algo no está en este documento, se propone y se agrega aquí antes de usarse.
2. **Accesibilidad primero.** Contraste AA mínimo, foco visible, tamaños de toque ≥ 40px.
3. **Tokens, no valores sueltos.** Todo color, espaciado y tipografía se referencia por variable/token, nunca hardcodeado.
4. **Una fuente de verdad.** Este archivo (o su versión en Figma/código) es lo que se actualiza primero; el producto se ajusta después.

---

## 10. Historial de Versiones

| Versión | Fecha   | Cambios         |
| ------- | ------- | --------------- |
| 1.0     | [fecha] | Versión inicial |

---

_Plantilla generada para uso interno de Mindara — adapta cada sección al proyecto o cliente correspondiente._
