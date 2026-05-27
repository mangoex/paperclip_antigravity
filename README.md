# Paperclip Antigravity — Ecosistema de Agentes de Humanio

Este repositorio es la implementación independiente y optimizada para **Antigravity** de la organización agéntica de **Humanio**, basada en el framework de orquestación **Paperclip**.

Este repositorio contiene la definición de los **11 agentes**, las **41 habilidades (skills)** y los contratos de eventos con n8n que automatizan el pipeline de prospección (Outbound) y el flujo de propuestas y demos (Inbound).

---

## 🚀 Cómo Funciona en Antigravity

A diferencia de los despliegues de producción (que requieren bases de datos en la nube y servidores de colas), la orquestación en **Antigravity** se realiza mediante **subagentes locales** de manera directa:

1. **CEO (El Agente Padre):** Actúa como el gobernador del estado. Centraliza la asignación de tareas, recibe los reportes y valida que se cumplan las reglas comerciales de cada paso (QA Gate).
2. **Subagentes (Unidades de Ejecución):** Registrados en la sesión con sus respectivos prompts en `agents/`.
3. **Coordinador Local (`coordinator.js`):** Script interactivo en Node.js que simula y orquesta las llamadas a los subagentes, pasando los contratos de datos (JSON/YAML) limpiamente de una etapa a la siguiente.

Para probar la simulación del flujo de agentes desde tu consola, ejecuta:
```bash
# Ver el estado y los agentes disponibles
node coordinator.js status

# Simular la ruta Outbound (Scout -> Qualifier -> Outreach -> Closer)
node coordinator.js outbound

# Simular la ruta Inbound / Demo (DesignPlanner -> WebBuilder -> WebQA -> WebPublisher)
node coordinator.js demo
```

---

## 👥 Estructura del Equipo de Agentes

| Agente | Rol | Responsabilidad en el Pipeline | Heartbeat |
|:---|:---|:---|:---|
| **CEO** | `ceo` | Coordinador general del pipeline, validación de presupuestos y QA de handoffs. | Activo (300s) |
| **Scout** | `general` | Extrae negocios sin presencia digital en directorios locales. | Activo (300s) |
| **Qualifier** | `general` | Audita SEO técnico de los prospectos, genera diagnósticos y calcula el score (1-10). | Activo (300s) |
| **Outreach** | `general` | Envía el primer contacto (msg1) por WhatsApp o Email SMTP con el diagnóstico. | Activo (300s) |
| **ConversationManager** | `general` | Atiende Chatwoot, realiza el intake conversacional y enruta al CEO. | Pausado (Inbound) |
| **Closer** | `general` | Cerrador comercial, atiende seguimientos, objeciones y coordina la demo. | Activo (300s) |
| **DesignPlanner** | `general` | Planifica la propuesta visual y crea el `DESIGN_SPEC` de la demo. | Pausado (Demo) |
| **WebBuilder** | `general` | Construye el código HTML/CSS/JS del sitio web demo personalizado en `/tmp`. | Pausado (Demo) |
| **WebQA** | `general` | Realiza el QA de diseño, responsividad y enlaces de Hotmart. | Pausado (Demo) |
| **WebPublisher** | `general` | Publica la demo en Surge.sh y guarda el log de publicación. | Pausado (Demo) |
| **DataAnalyst** | `researcher` | Monitorea MRR, churn, LTV y conversiones del pipeline. | Activo (300s) |

---

## 🔄 Los Dos Pipelines de Negocio

### 1. Outbound (Prospección en Frío)
Se activa por giro y ciudad. **No construye sitio ni publica demo al inicio** para no desperdiciar recursos.
$$\text{CEO} \longrightarrow \text{Scout} \longrightarrow \text{Qualifier} \longrightarrow \text{Outreach} \longrightarrow \text{Closer (Espera Respuesta)}$$
* Outreach envía el template aprobado por Meta `humanio_diagnostico_v1` o un correo de diagnóstico con el CTA hacia `humanio.digital/?ref={slug}`.
* Closer queda bloqueado a la espera de respuestas.

### 2. Inbound / Demo Solicitada
Se activa cuando el Closer captura el intake de un prospecto interesado o cuando un cliente contacta directamente a WhatsApp.
$$\text{WhatsApp/n8n} \longrightarrow \text{ConversationManager} \longrightarrow \text{CEO/Closer} \longrightarrow \text{DesignPlanner} \longrightarrow \text{WebBuilder} \longrightarrow \text{WebQA} \longrightarrow \text{WebPublisher} \longrightarrow \text{Closer}$$
* Esto **SÍ construye sitio web** y lo publica en Surge.sh (`humanio.surge.sh/{slug}/`) para ser entregado.

---

## 🛡️ Contratos de Eventos e Integración n8n

Las reglas para interactuar con integraciones externas y workflows de n8n se detallan en el directorio `/n8n`:
* **`EVENT_CONTRACTS.md`:** Los eventos de n8n deben ser tickets explícitos estructurados con `event_type` y cuerpo YAML (ej. `inbound_chatwoot_event`, `inbound_response`, `followup_due`).
* **`BOT_AUTO_REPLY_TRIAGE.md`:** Reglas para que la IA detecte y triaje respuestas automáticas/bots de prospectos, etiquetando la conversación y evitando loops infinitos de mensajes.
* **`SEGUIMIENTOS_CRON.md`:** La cadencia de follow-ups comercial al día 3 y día 7 es calculada por n8n, el cual comprueba que no haya respuesta en Chatwoot antes de disparar el ticket para el Closer.

---

## 🛠️ Skills Principales (`/skills/company/HUM`)
* **`conversation-manager`:** Lógica de clasificación conversacional e intake de datos mínimos.
* **`chatwoot-whatsapp-ops`:** Operaciones de envío de plantillas Meta y mensajes Chatwoot.
* **`closer-sales`:** Scripts persuasivos, manejo de objeciones y enrutamiento a Hotmart.
* **`scout-prospector` & `scrapling-official`:** Scraping optimizado con `Scrapling` y su *StealthyFetcher*.
* **`web-qa` & `web-premier-system`:** Validadores del código HTML y cargadores de componentes interactivos premium.

---

> Humanio — Inteligencia Artificial para negocios
