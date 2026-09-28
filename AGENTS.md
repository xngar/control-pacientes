<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

# AGENTS.md

Instrucciones para agentes de IA (Claude Code, Cursor, GitHub Copilot, etc.) que trabajan en este proyecto.

## 01. Propósito

Este archivo entrega contexto, reglas y convenciones para que cualquier agente de IA que edite este repositorio produzca código consistente, de buena calidad y alineado con las decisiones del equipo. No reemplaza el criterio humano: es la base mínima que el agente debe respetar antes de proponer o aplicar cambios.

## 02. Antes de empezar

- [ ] Leer `docs/PRD.md` para entender el producto y sus objetivos
- [ ] Leer `docs/DESIGN_SYSTEM.md` para las guías de UI/UX
- [ ] Leer `docs/ARCHITECTURE.md` para la estructura técnica
- [ ] Revisar componentes y patrones ya existentes antes de crear nuevos
- [ ] Entender la estructura de carpetas del proyecto
- [ ] Revisar issues o tareas abiertas si existen

## 03. Stack del proyecto

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 (tokens de diseño, no valores hardcodeados)
- Supabase Auth para autenticación
- Gestor de paquetes: npm

## 04. Reglas generales

- Usar TypeScript y Next.js siguiendo las convenciones del App Router
- Seguir el design system del proyecto (`docs/DESIGN_SYSTEM.md`)
- Reutilizar componentes existentes antes de crear nuevos
- Mantener el código modular y escalable
- Escribir código limpio y legible, con nombres descriptivos
- Comentar únicamente la lógica no trivial
- No crear archivos innecesarios ni carpetas fuera de la estructura definida
- Seguir la estructura de carpetas del proyecto

## 05. Guía de código

- Usar componentes funcionales (sin clases)
- Nombres de variables y funciones descriptivos, en inglés o español consistente con el resto del repo
- Preferir componentes de UI ya existentes sobre crear nuevos desde cero
- Mantener los componentes pequeños y reutilizables
- Seguir el estilo de código definido en `docs/CODE_STYLE.md` (o el linter/formatter configurado: ESLint + Prettier)
- Manejar siempre estados de carga, error y vacío en componentes que consumen datos
- Asegurar responsividad en todos los breakpoints (mobile-first)
- Escribir código accesible y semántico (etiquetas HTML correctas, atributos ARIA cuando corresponda)

## 06. Seguridad y buenas prácticas

- Nunca exponer API keys ni datos sensibles en el código o en el cliente
- Usar variables de entorno (`.env`, nunca commiteadas) para credenciales
- Validar todos los inputs del usuario, tanto en cliente como en servidor
- Seguir los flujos de autenticación y autorización definidos (roles, RBAC)
- Implementar manejo de errores explícito, no fallos silenciosos
- Evitar hardcodear secretos, IDs o URLs de producción
- Ser cuidadoso con la privacidad de datos de usuarios y clientes

## 07. Comandos útiles

```bash
# Instalar dependencias
npm install

# Levantar entorno de desarrollo
npm run dev

# Compilar para producción
npm run build

# Linter
npm run lint

# Tests
npm run test
```

## 08. Qué NO debe hacer el agente sin confirmar

- Instalar nuevas dependencias sin justificar por qué
- Modificar configuración de despliegue, CI/CD o variables de entorno de producción
- Eliminar o renombrar archivos fuera del alcance de la tarea pedida
- Cambiar el design system o la paleta de colores sin indicación explícita
- Hacer refactors grandes no solicitados junto con una tarea pequeña

## 9. ¿Necesitas ayuda?

Si no estás seguro de algo:

- Revisa la documentación en `/docs`
- Busca ejemplos de código ya existentes en el proyecto
- Sigue los patrones ya usados en el repositorio
- Pide aclaración antes de hacer cambios grandes o estructurales

---

_Plantilla base de AGENTS.md — adaptar las secciones marcadas según cada proyecto._

<!-- END:nextjs-agent-rules -->
