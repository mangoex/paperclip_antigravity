# Guía de Pruebas Paso a Paso — Paperclip Antigravity

Esta guía te describe cómo convocar a los agentes, correr las simulaciones del flujo de negocio y ejecutar pruebas reales en este entorno.

---

## 🛠️ Paso 1: Configurar las Variables de Entorno (Opcional)

Si deseas realizar pruebas reales de comunicación (WhatsApp/Email) o registro, debes crear un archivo `.env` en la raíz del proyecto `/Users/miguelgonzalez/Codex/paperclip_antigravity/`:

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Abre el `.env` y rellena las credenciales que deseas probar:
   * **WhatsApp:** `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_CLOUD_API_TOKEN`.
   * **Email:** `SMTP_USER` y `SMTP_PASS` (para envíos directos).
   * **Override de Seguridad:** `TEST_PHONE` (tu número de teléfono con código de país, ej. `521667...`) y `TEST_EMAIL` (tu correo de prueba). **Esto asegura que ningún cliente real reciba mensajes de prueba.**

---

## 💻 Paso 2: Ejecutar la Simulación en Consola

El script `coordinator.js` simula la interacción y los mensajes que se envían los agentes durante el flujo. Es útil para validar la secuencia lógica y el enrutamiento.

Corre los siguientes comandos en tu terminal desde la carpeta del proyecto:

```bash
# 1. Comprobar que el entorno y los 11 agentes están listos:
node coordinator.js status

# 2. Simular el flujo Outbound (prospección en frío sin construir web):
node coordinator.js outbound

# 3. Simular el flujo Demo/Inbound (construcción y despliegue de web):
node coordinator.js demo
```

---

## 🤖 Paso 3: Convocar y Orquestar Agentes desde este Chat (Gemini Antigravity)

Para interactuar y ver trabajar a los agentes de manera real dentro de esta sesión, puedes ordenarme a mí (que actúo como el **CEO/Agente Orquestador principal**) que active el pipeline. 

Aquí tienes los comandos textuales que me puedes dar en el chat para iniciar cada fase:

### Pruebas de Prospección (Scout + Qualifier)
Escríbeme en el chat:
> *«Convoca a Scout para buscar [N] negocios de [Giro] en [Ciudad]. Al terminar, pásale los resultados a Qualifier para que genere los diagnósticos SEO.»*

* **Lo que yo haré:**
  1. Definiré e invocaré al subagente `scout_agent` en segundo plano para realizar la búsqueda real en internet.
  2. Al recibir sus resultados, invocaré a `qualifier_agent` para que audite las webs encontradas y redacte los 3 hallazgos clave.
  3. Te presentaré el brief comercial final estructurado.

### Pruebas de Envío Comercial (Outreach)
Si tienes el archivo `.env` configurado con tus credenciales y número de prueba, escríbeme:
> *«Convoca a Outreach para enviar el diagnóstico de prueba del prospecto [Nombre del Negocio] a mi número de WhatsApp de prueba.»*

* **Lo que yo haré:**
  1. Validaré que el `contact_override` esté activo (para proteger a los prospectos reales).
  2. Invocaré al subagente `outreach_agent` para que ejecute la llamada cURL real a Meta y te envíe la plantilla de WhatsApp a tu celular.
  3. Te mostraré la respuesta de Meta y el `provider_message_id` como evidencia del envío.
  4. Crearé el ticket de seguimiento bloqueado para el `Closer`.
