# Architecture

> Visión general de la estructura del proyecto, el stack tecnológico y cómo se conecta todo.
> **Última actualización:** AAAA-MM-DD · **Responsable:** [Nombre]

---

## 01. Resumen del sistema

**[Nombre del proyecto]** es [qué hace en 1–2 líneas] para [quién lo usa].

```
Cliente (Web / Móvil)
        |
        v
Frontend  [Framework + estilos]
        |
        v
Backend / APIs  [BD, Auth, Storage]
        |
        +--> Autenticación   [Servicio]
        +--> Pagos           [Servicio]
        +--> Emails          [Servicio]
        +--> Despliegue      [Servicio]
```

**Principios de diseño**

- [Ej: Simple primero, complejidad solo cuando se necesite]
- [Ej: Modular: cada carpeta tiene una sola responsabilidad]
- [Ej: Seguridad por defecto]

---

## 02. Stack tecnológico

| Capa                          | Tecnología            | Por qué se eligió                                                                                                                                                  |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend / Fullstack**      | Next.js (App Router)  | Renderizado híbrido (SSR/RSC) para alta velocidad de carga (<2s), SEO óptimo y arquitectura modular y escalable.                                                   |
| **Estilos y UI**              | Tailwind CSS          | Desarrollo ágil con consistencia visual garantizada mediante diseño basado en tokens y bundle CSS ultraligero en producción.                                       |
| **Base de Datos y Backend**   | Supabase (PostgreSQL) | Base de datos relacional robusta con soporte nativo de seguridad a nivel de fila (RLS), autenticación integrada y APIs instantáneas para datos clínicos sensibles. |
| **Hosting e Infraestructura** | Vercel                | Despliegue continuo (CI/CD) automatizado, baja latencia mediante Edge Network global y compatibilidad nativa con Next.js sin gestión de servidores.                |
| **Iconografía**               | Lucide Icons          | Conjunto de íconos moderno, ligero y altamente personalizable con soporte completo para tree-shaking.                                                              |

---

## 03. Estructura del proyecto

```
mi-app/
├─ app/           # Rutas y páginas
├─ components/    # Componentes reutilizables
├─ lib/           # Utilidades y configuraciones
├─ hooks/         # Hooks personalizados
├─ services/      # APIs y servicios externos
├─ types/         # Tipos de TypeScript
├─ public/        # Archivos estáticos
├─ docs/          # Documentación del proyecto (.md)
├─ .env           # Variables de entorno (NO subir a Git)
├─ package.json   # Dependencias
└─ README.md      # Descripción general
```

**Reglas de organización**

- Los componentes no llaman directamente a APIs externas: pasan por `services/`.
- Toda variable sensible vive en `.env`, nunca en el código.

---

## 04. Flujo de datos

1. El usuario interactúa con el frontend.
2. El frontend envía una solicitud al backend (HTTPS).
3. El backend valida, procesa y guarda en la base de datos.
4. El backend responde con JSON.
5. La interfaz se actualiza con la respuesta.

**Flujos críticos** (detallar cada uno)

- Registro / inicio de sesión: [descripción]
- Pago: [descripción]
- [Otro flujo clave]

---

## 05. Integraciones externas

| Servicio   | Uso        | Variables de entorno | Documentación |
| ---------- | ---------- | -------------------- | ------------- |
| [Servicio] | [Para qué] | `NOMBRE_API_KEY`     | [URL]         |

---

## 06. Entornos

| Entorno    | URL            | Rama Git   | Notas           |
| ---------- | -------------- | ---------- | --------------- |
| Local      | localhost:3000 | cualquiera | Datos de prueba |
| Staging    | [URL]          | `develop`  | Pruebas previas |
| Producción | [URL]          | `main`     | Datos reales    |

---

## 07. Escalabilidad y consideraciones futuras

- [ ] Arquitectura modular para agregar funciones fácilmente
- [ ] Caché para mejorar rendimiento
- [ ] Tareas en segundo plano para procesos largos
- [ ] Monitoreo de uso y alertas
- [ ] Despliegue multi-región si crece la base de usuarios

---

## 08. Decisiones de arquitectura (registro)

|---|---|---|---|
| Fecha | Decisión | Motivo | Alternativas descartadas |
|---|---|---|---|
| 2026-09-28 | **Next.js (App Router) como Framework Fullstack** | Permite Server Components para carga ultra rápida (<2s), Server Actions y Route Handlers para procesar reportes y consultar Supabase de forma segura desde el servidor. | **Vite / React SPA puro:** Dependencia total de llamadas del lado del cliente y peor rendimiento inicial.<br>**Remix:** Menor integración nativa y ecosistema con Vercel/Supabase. |
| 2026-09-28 | **TypeScript como Lenguaje Principal** | Tipado estricto de extremo a extremo que previene errores en tiempo de compilación al manejar datos sensibles de pacientes y esquemas de base de datos. | **JavaScript Vanilla:** Mayor propensión a errores en runtime con estructuras de datos complejas. |
| 2026-09-28 | **Supabase (PostgreSQL + Auth + RLS) como BaaS** | Base de datos relacional para historial clínico, autenticación integrada y políticas de seguridad a nivel de fila (RLS) para cumplimiento de la Ley 19.628. | **Firebase / Firestore:** Modelo NoSQL poco óptimo para reportes y analítica relacional.<br>**Backend personalizado (Node/Express):** Mayor costo de desarrollo y mantenimiento de infraestructura. |
| 2026-09-28 | **Tailwind CSS con Design Tokens** | Implementación ágil y exacta del Design System sin sobrecarga de runtime, asegurando un bundle CSS mínimo y optimizado. | **Material UI / Styled Components:** Mayor peso de JavaScript y estilos menos personalizables. |
| 2026-09-28 | **Despliegue e Infraestructura en Vercel** | CI/CD automático, despliegues sin servidor (serverless) con escalabilidad instantánea y red Edge global optimizada para Next.js. | **AWS / VPS propio (EC2/DigitalOcean):** Complejidad innecesaria de administración de servidores y mantenimiento DevOps. |

---

## Documentos relacionados

`PRD.md` · `AGENTS.md` · `DESIGN_SYSTEM.md` · `SECURITY.md` · `CODE_STYLE.md` · `TESTING.md` · `README.md`

> **Para asistentes de IA:** lee este archivo antes de proponer cambios y respeta el stack y la estructura descritos aquí.
