# Índice de Skills de Agente - Antigravity IDE

Este archivo sirve como referencia e índice para las skills de agente instaladas de forma global bajo el directorio `~/.agents/skills/`.

---

## 🖥️ ENTORNO DE EJECUCIÓN

Este sistema corre en **Windows**. Ten en cuenta lo siguiente en toda la sesión:

- Usa `python` en lugar de `python3` para scripts Python.
- Usa rutas con `\` o rutas absolutas con `C:\Users\ADRIA\` cuando sea necesario.
- Para comandos bash en skills que los asuman (cp, rm, mkdir...), tradúcelos al equivalente PowerShell o usa Git Bash si está disponible.
- El directorio global de skills es `C:\Users\ADRIA\.agents\skills\`.

---

## ⚠️ PROTOCOLO OBLIGATORIO DE ACTIVACIÓN (PRIORIDAD MÁXIMA)

Las siguientes 6 skills son de uso **IMPERATIVO Y NO NEGOCIABLE** en todas las sesiones. El agente debe activarlas automáticamente según los triggers indicados. Ninguna tarea de código, diseño, o arquitectura puede completarse sin haber consultado las skills correspondientes.

| # | Skill | Trigger de Activación Obligatoria |
|---|---|---|
| 1 | **GRAPHIFY** | ✅ ANTES de cualquier pregunta sobre el codebase, arquitectura, relaciones entre archivos o búsqueda de dependencias. Si `graphify-out/graph.json` existe, usar `/graphify query` directamente. |
| 2 | **SUPERPOWERS** | ✅ ANTES de cualquier tarea compleja (implementación, debugging, planning). Invocar `using-superpowers` para determinar qué sub-skill de Superpowers aplica (brainstorming, TDD, systematic-debugging, writing-plans, etc.). |
| 3 | **CODE REVIEW** | ✅ AL FINALIZAR cualquier bloque de código nuevo o modificado. Nunca marcar una tarea como completa sin haber pasado por revisión de código. |
| 4 | **SECURITY GUIDANCE** | ✅ EN CADA edición de código que involucre: inputs de usuario, llamadas a API, acceso a base de datos, autenticación, variables de entorno o secretos. Revisar la checklist de seguridad antes de cerrar la tarea. |
| 5 | **CLAUDE-MEM** | ✅ Al INICIAR cada sesión: verificar si existe memoria persistente del proyecto en `~/.claude-mem`. Al FINALIZAR: registrar decisiones tomadas, bugs resueltos y contexto relevante para sesiones futuras. |
| 6 | **GSTACK** | ✅ Siempre que aplique un rol de ciclo de vida: `/qa` para testing, `/review` para revisión de código, `/investigate` para bugs, `/ship` para deploys, `/spec` para especificaciones, `/office-hours` para brainstorming de producto. |

### Regla de Oro
> Si existe cualquier duda de si una de estas 6 skills aplica → **ACTIVAR PRIMERO, luego actuar**. El coste de activar una skill innecesariamente es cero. El coste de no activarla cuando era necesaria es un error de calidad.

---

## 🔄 FLUJO DE SESIÓN POR FASES

Sigue este orden en cada sesión. No saltes fases.

```
INICIO
  └── claude-mem    → cargar contexto de sesiones anteriores
  └── Graphify      → indexar/consultar el codebase si la tarea lo requiere

PLANIFICACIÓN
  └── SuperPowers   → brainstorming, /plan, writing-plans
  └── gstack        → /spec, /office-hours, /plan-ceo-review

DISEÑO (ver jerarquía abajo)
  └── ui-ux-pro-max → Frontend Design → Taste → Emil Kowalski → Impeccable

IMPLEMENTACIÓN
  └── SuperPowers   → TDD (RED → GREEN → REFACTOR), subagentes en paralelo
  └── gstack        → /autoplan

REVISIÓN Y ENTREGA
  └── Code Review   → revisar lógica, convenciones y calidad
  └── Security Guidance → checklist de seguridad
  └── gstack        → /review, /qa, /ship

CIERRE
  └── claude-mem    → guardar decisiones, bugs resueltos y contexto relevante
```

---

## 🎨 JERARQUÍA DE ORQUESTACIÓN DE DISEÑO

Cuando una tarea involucre UI/UX, las skills de diseño se aplican **en este orden estricto**. Cada una tiene un rol distinto y no se solapan si se respeta la secuencia:

| Orden | Skill | Rol | Qué decide |
|---|---|---|---|
| 1º | **ui-ux-pro-max** | Elección | Paleta de color, tipografía, stack tecnológico, directrices UX base |
| 2º | **Frontend Design** | Base de tokens | Tokens de diseño, defaults de layout, evitar clichés AI |
| 3º | **Taste Skill** | Filtrado | Arquetipo de estilo (Standard / Soft-Premium / Editorial-Minimal), densidad visual, intensidad de movimiento |
| 4º | **Emil Kowalski** | Implementación | Animaciones (<300ms), easing curves, feedback de botones (100–160ms), micro-interacciones |
| 5º | **Impeccable Design** | Auditoría | `/polish`, `/critique`, `/audit`, `/animate` — refinamiento final antes de entregar |

### Regla de conflicto de diseño
> Si dos skills dan instrucciones contradictorias, la skill de **orden inferior** (número más alto en la tabla) prevalece, ya que actúa sobre el output de la anterior, no en paralelo.

---

## Índice Completo de Skills Instaladas

| # | Skill | Directorio | Descripción / ¿Qué hace? | ¿Cuándo se activa / Usa? |
|---|---|---|---|---|
| 1 | **GRAPHIFY** 🔴 | `graphify/` | Convierte el repositorio en un grafo de conocimiento interactivo consultable para reducir el uso de tokens hasta 71×. | **OBLIGATORIO** para cualquier pregunta sobre codebase, arquitectura o dependencias. |
| 2 | **EMIL KOWALSKI** | `emil-design-eng/` | Reglas de polish de UI y micro-interacciones (animaciones <300ms, easing y feedback rápido). | 4º en jerarquía de diseño. Durante tareas de pulido estético, animaciones CSS/JS y diseño de componentes interactivos. |
| 3 | **IMPECCABLE DESIGN** | `impeccable/` | Vocabulario compartido de diseño con comandos como `/polish`, `/audit`, `/critique`, `/animate`. | 5º en jerarquía de diseño. Auditoría y refinamiento final de componentes frontend. |
| 4 | **TASTE SKILL** | `design-taste-frontend/` | Inyecta buen gusto en el diseño (arquetipos Standard, Soft-Premium, Editorial-Minimal, reglas anti-slop). | 3º en jerarquía de diseño. Filtra y define estilo tras elegir paleta/tipografía. |
| 5 | **UI-UX-PRO-MAX** | `ui-ux-pro-max/` | Base de datos de más de 160 paletas, tipografías y 99 directrices UX en 10 stacks tecnológicos. | 1º en jerarquía de diseño. Al estructurar la base de un nuevo sistema de diseño. |
| 6 | **SUPERPOWERS** 🔴 | `*` (múltiples directorios) | Framework de desarrollo completo: TDD, brainstorming, planificación, git worktrees, debugging sistemático en 4 fases, code review, subagentes en paralelo. | **OBLIGATORIO** antes de cualquier tarea compleja de implementación o debugging. |
| 7 | **FRONTEND DESIGN** | `frontend-design/` | Skill oficial de Anthropic para guiar el diseño hacia decisiones de estilo intencionales y distintivas. | 2º en jerarquía de diseño. Base de tokens y defaults de layout. |
| 8 | **CODE REVIEW** 🔴 | `code-review/` | Skill oficial de Anthropic para revisar lógica de código, adherencia a convenciones y buenas prácticas. | **OBLIGATORIO** al finalizar cualquier implementación antes de cerrar la tarea. |
| 9 | **SECURITY GUIDANCE** 🔴 | `security-guidance/` | Análisis de seguridad en tiempo real: XSS, SSRF, inyección, secretos hardcodeados, 25+ clases de vulnerabilidades. | **OBLIGATORIO** en cualquier código que toque inputs, APIs, DB, auth o variables de entorno. |
| 10 | **CLAUDE-MEM** 🔴 | `claude-mem/` | Memoria persistente local que almacena decisiones, soluciones y contexto de sesiones anteriores. | **OBLIGATORIO** al inicio (cargar contexto) y al final (guardar decisiones) de cada sesión. |
| 11 | **GSTACK** 🔴 | `gstack/` | Colección de roles del ciclo de vida: CEO, Diseñador, QA, Release Manager con 23 slash-commands. | **OBLIGATORIO** para roles específicos: `/qa`, `/review`, `/investigate`, `/ship`, `/spec`, `/office-hours`. |

> 🔴 = Skill de activación obligatoria. Debe usarse siempre que aplique su trigger.

---

## Nota de Configuración y Uso

Todas las carpetas de las skills están ubicadas en el directorio global:
`C:\Users\ADRIA\.agents\skills\`

Cada una de ellas cuenta con su archivo `SKILL.md` correspondiente, lo cual permite al motor de **Antigravity IDE** descubrirlas y cargarlas bajo demanda según el contexto de tu consulta o el trigger del agente.

### Comando de Verificación del Sistema
```bash
python .agent/scripts/checklist.py .
```
Ejecutar antes de cualquier deploy o merge para validar: Seguridad, Linting, Esquemas, Tests, UX y SEO.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
