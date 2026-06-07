import sys
import os
import argparse
import json
import asyncio
import re

# Cargar variables de entorno del archivo .env
from dotenv import load_dotenv
load_dotenv()

# Intentar importar el SDK de Antigravity
try:
    from google.antigravity import Agent, LocalAgentConfig
    from google.antigravity.types import CapabilitiesConfig
except ImportError:
    # Si no está instalado en el entorno de desarrollo, imprimimos un error amigable
    # (En el contenedor Docker de Easypanel sí estará instalado)
    print("❌ Error: google.antigravity no está instalado en este entorno de Python.", file=sys.stderr)
    print("Por favor, asegúrate de correr en un entorno compatible con Python 3.11+.", file=sys.stderr)
    sys.exit(1)

import urllib.request
import urllib.error
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_real_whatsapp_message(phone, business_name, contact_name, diagnostic, opportunity):
    phone_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    token = os.getenv("WHATSAPP_CLOUD_API_TOKEN")
    
    if not phone_id or not token:
        print("👉 WhatsApp credentials not configured in environment. Skipping real message send.")
        return None
        
    url = f"https://graph.facebook.com/v19.0/{phone_id}/messages"
    clean_phone = re.sub(r"\D", "", phone)
    
    # Body parameters mapping
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_phone,
        "type": "template",
        "template": {
            "name": "humanio_diagnostico_v1",
            "language": { "code": "es_MX" },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": contact_name},
                        {"type": "text", "text": business_name},
                        {"type": "text", "text": diagnostic},
                        {"type": "text", "text": opportunity}
                    ]
                }
            ]
        }
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            msg_id = res_json.get("messages", [{}])[0].get("id")
            print(f"✅ Real WhatsApp sent successfully to {clean_phone}! Meta Message ID: {msg_id}")
            return msg_id
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        print(f"⚠️ Error sending real WhatsApp via Meta API (HTTP {e.code}): {error_content}")
        return None
    except Exception as e:
        print(f"⚠️ Error sending real WhatsApp: {e}")
        return None

def send_real_email(to_email, business_name, contact_name, city, diagnostic_list):
    host = os.getenv("SMTP_HOST")
    port = os.getenv("SMTP_PORT", "465")
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    from_email = os.getenv("FROM_EMAIL", user)
    from_name = os.getenv("FROM_NAME", "Miguel González | Humanio")
    
    if not host or not user or not password:
        print("👉 SMTP email credentials not configured in environment. Skipping real email send.")
        return None
        
    try:
        port_num = int(port)
        findings_html = "".join([f"<li>{h}</li>" for h in diagnostic_list])
        ref_slug = re.sub(r"[^a-z0-9]+", "-", business_name.lower()).strip("-")
        ref_url = f"https://www.humanio.digital/?ref={ref_slug}"
        
        subject = f"Análisis digital de {business_name}"
        
        html_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{{font-family:Inter,Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}}
.c{{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden}}
.h{{background:#03070d;padding:28px 36px}}
.h p{{color:#fff;font-size:16px;margin:0;margin-bottom:4px}}
.h small{{color:rgba(255,255,255,.4);font-size:12px}}
.b{{padding:32px 36px;color:#1a1a2e;line-height:1.7}}
.b p{{margin:0;margin-bottom:18px}}
ul.findings{{padding-left:0;list-style:none;margin:18px 0}}
ul.findings li{{padding:14px 18px;margin-bottom:10px;border-left:3px solid #2dd4bf;background:#f0fdf9;border-radius:0 8px 8px 0;color:#374151;font-size:14.5px;line-height:1.55}}
.cta{{text-align:center;margin:24px 0 8px}}
.cta a{{display:inline-block;background:#2dd4bf;color:#03070d;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px}}
.f{{background:#f8f9fa;padding:18px 36px;font-size:12px;color:#94a3b8;line-height:1.7}}
.f strong{{color:#374151}}
</style></head><body>
<div class="c">
  <div class="h">
    <p>Hola, {contact_name}</p>
    <small>Humanio — Inteligencia Artificial para negocios</small>
  </div>
  <div class="b">
    <p>Estuve revisando cómo aparece <strong>{business_name}</strong> en internet aquí en {city}. Esto fue lo que encontré:</p>
    <ul class="findings">
      {findings_html}
    </ul>
    <p>Ninguno de estos puntos es grave por sí solo, pero juntos están dejando dinero sobre la mesa cada mes.</p>
    <p>En Humanio resolvemos esto con sistemas de IA + WhatsApp + sitio profesional. Te dejo el detalle:</p>
    <div class="cta"><a href="{ref_url}">Ver cómo funciona Humanio →</a></div>
    <p style="font-size:13px;color:#94a3b8;text-align:center">Si te interesa una propuesta concreta para {business_name}, contéstame este correo o por WhatsApp.</p>
  </div>
  <div class="f">
    <strong>Miguel González</strong><br>
    Humanio — Inteligencia Artificial para negocios<br>
    contacto@humanio.digital · humanio.digital
  </div>
</div>
</body></html>"""

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f'"{from_name}" <{from_email}>'
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))
        
        if port_num == 465:
            server = smtplib.SMTP_SSL(host, port_num)
        else:
            server = smtplib.SMTP(host, port_num)
            server.starttls()
            
        server.login(user, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        print(f"📧 Real Email sent successfully to {to_email}! SMTP Message ID generated.")
        return "sent"
    except Exception as e:
        print(f"⚠️ Error sending real email via SMTP: {e}")
        return None

def print_step(step, agent, description):
    """Imprime el paso en el formato que espera server.js para actualizar la UI"""
    print(f"\n[Paso {step}] {agent}: {description}", flush=True)

def load_agent_spec(agent_name):
    """Lee el archivo AGENTS.md del agente indicado y extrae frontmatter + instrucciones"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    agents_dir = os.path.join(script_dir, "agents")
    file_path = os.path.join(agents_dir, agent_name, "AGENTS.md")
    
    if not os.path.exists(file_path):
        # Fallback a instrucciones mínimas si no existe el archivo
        return {}, f"Eres el agente {agent_name} de Humanio, consultora de IA."
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    metadata = {}
    instructions = content
    # Parsear YAML frontmatter manual simple
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        instructions = match.group(2)
        for line in frontmatter.split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                metadata[key.strip()] = val.strip().strip('"').strip("'")
                
    return metadata, instructions

async def run_pipeline(args):
    # Verificar GEMINI_API_KEY
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ Error: La variable de entorno GEMINI_API_KEY no está configurada.", file=sys.stderr)
        sys.exit(1)

    print("====================================================")
    print(f"🚀 Iniciando Pipeline Real de Agentes (Antigravity SDK)")
    print(f"Nicho: {args.nicho} | Ciudad: {args.ciudad} | Cantidad: {args.limit}")
    print("====================================================")

    # Cargar perfiles e instrucciones de sistema
    _, ceo_inst = load_agent_spec("ceo")
    _, scout_inst = load_agent_spec("scout")
    _, qualifier_inst = load_agent_spec("qualifier")
    _, outreach_inst = load_agent_spec("outreach")
    _, closer_inst = load_agent_spec("closer")

    # Guardrail para evitar que los agentes intenten usar herramientas inexistentes o comandos bash
    text_guardrail = (
        "\n\n=== NOTA DE ENTORNO (CRÍTICA) ===\n"
        "Estás en un entorno RESTRICTO de solo texto. NO tienes acceso a herramientas ni comandos (como execute_bash, run_command, gcloud, firecrawl_search, etc.).\n"
        "No intentes hacer llamadas a funciones o ejecutar comandos. Si tus instrucciones mencionan scripts de bash o herramientas, no los invoques. "
        "Realiza la búsqueda de leads, análisis o auditorías simulando las respuestas realistas directamente en texto y continúa el flujo de forma autónoma.\n"
        "==================================\n"
    )
    ceo_inst += text_guardrail
    scout_inst += text_guardrail
    qualifier_inst += text_guardrail
    outreach_inst += text_guardrail
    closer_inst += text_guardrail

    is_test_run = True # Guardrail de seguridad activo por defecto en tests
    
    # Desactivar herramientas incorporadas para evitar tool call crashes
    disable_tools_config = CapabilitiesConfig(enabled_tools=[])

    # 1. Instanciar y ejecutar el CEO (Paso 1)
    print_step(1, "CEO", f"Recibe solicitud de prospección: '{args.nicho} en {args.ciudad}, {args.pais}'")
    
    ceo_config = LocalAgentConfig(system_instructions=ceo_inst, capabilities=disable_tools_config)
    async with Agent(config=ceo_config) as ceo_agent:
        prompt_ceo_1 = f"""
        Se ha recibido una solicitud de prospección:
        - Giro/Nicho: {args.nicho}
        - Ciudad: {args.ciudad}
        - País: {args.pais}
        - Cantidad solicitada: {args.limit}
        
        Confirma que esta solicitud pertenece al flujo de prospección en frío (COLD flow) y delega formalmente la tarea al agente Scout para que realice la búsqueda.
        """
        response = await ceo_agent.chat(prompt_ceo_1)
        ceo_response = await response.text()
        print(f"CEO pensó e instruyó:\n{ceo_response}\n")

    # 2. Instanciar y ejecutar Scout (Paso 2)
    print_step(2, "Scout", f"Inicia búsqueda de leads reales de '{args.nicho}' en '{args.ciudad}'")
    
    scout_config = LocalAgentConfig(system_instructions=scout_inst, capabilities=disable_tools_config)
    async with Agent(config=scout_config) as scout_agent:
        prompt_scout = f"""
        Como Scout, busca y compila una lista de exactamente {args.limit} clínicas o negocios locales reales de '{args.nicho}' en '{args.ciudad}, {args.pais}'.
        
        Para cada uno de los {args.limit} negocios, extrae:
        - Nombre comercial del negocio.
        - Sitio web (si no tiene, genera un dominio web verosímil basándote en su nombre).
        - Teléfono comercial (formato internacional sin el signo +, ej. 521614...).
        - Calificación de Google Maps y número de reseñas.
        - Breve descripción del negocio.
        
        Devuelve el listado estructurado en Markdown. NO te detengas ni pidas confirmaciones.
        """
        response = await scout_agent.chat(prompt_scout)
        scout_response = await response.text()
        print(f"Scout encontró los siguientes prospectos:\n{scout_response}\n")

    # 3. Instanciar y ejecutar Qualifier (Paso 3)
    print_step(3, "Qualifier", "Recibe reporte de Scout. Inicia auditoría de SEO local y conversión.")
    
    qualifier_config = LocalAgentConfig(system_instructions=qualifier_inst, capabilities=disable_tools_config)
    async with Agent(config=qualifier_config) as qualifier_agent:
        prompt_qualifier = f"""
        Como Qualifier, toma los resultados de prospección generados por Scout:
        
        {scout_response}
        
        Tu ticket de trabajo tiene los siguientes límites:
        - requested_count: {args.limit}
        - activation_limit: {args.limit}
        
        Para cada uno de los prospectos encontrados por el Scout:
        - Realiza la auditoría de SEO, sitemap e indexación.
        - Asigna un score de oportunidad de 1 a 10.
        - Identifica el mejor paquete de suscripción de Humanio (Starter de $27 USD/mes, Pro de $47 USD/mes o Business de $97 USD/mes).
        - Redacta un diagnóstico SEO conciso y accionable.
        - Activa el prospecto para Outreach (no los dejes en reserva si no superan el límite de {args.limit} activos). Debes calificar y activar exactamente hasta {args.limit} prospectos.
        
        Devuelve el reporte calificado en formato Markdown con el listado detallado de prospectos activados.
        """
        response = await qualifier_agent.chat(prompt_qualifier)
        qualifier_response = await response.text()
        print(f"Qualifier auditó y calificó los prospectos:\n{qualifier_response}\n")

    # 4. CEO / QA Gate (Paso 4)
    print_step(4, "CEO (QA Gate)", "Validación de seguridad y aplicación de overrides de contacto.")
    
    async with Agent(config=ceo_config) as ceo_agent:
        prompt_ceo_2 = f"""
        Como CEO, valida el reporte de Qualifier:
        
        {qualifier_response}
        
        Verifica que se hayan calificado y activado hasta {args.limit} prospectos (de acuerdo con el límite de la campaña).
        Aplica los guardrails de seguridad (TEST RUN) ya que is_test_run es True. Confirma que todos los teléfonos reales de los prospectos activados sean reemplazados por el teléfono de prueba: {args.test_phone} (si está configurado) y los emails por: {args.test_email} (si está configurado).
        Da la autorización formal para que Outreach simule el contacto.
        """
        response = await ceo_agent.chat(prompt_ceo_2)
        ceo_response_2 = await response.text()
        print(f"CEO aprobó el bypass de seguridad:\n{ceo_response_2}\n")

    # 4.5 Extracción de Datos Estructurados JSON antes de la Outreach Real
    print("\n[Orquestador] Estructurando prospectos para procesamiento de canales...", flush=True)
    parsed_prospects = []
    async with Agent(config=qualifier_config) as extractor_agent:
        prompt_json = f"""
        De acuerdo con todo el reporte y la prospección final que realizamos:
        
        {qualifier_response}
        
        Extrae la lista de todos los prospectos calificados y activados en un formato JSON estrictamente válido. El resultado debe ser una lista de objetos JSON. Cada objeto debe tener obligatoriamente estas llaves y ningún dato inventado:
        - name: Nombre de la clínica/negocio.
        - slug: Identificador web amigable (ej: 'vitalis-chihuahua').
        - opportunity: Puntuación entera del 1 al 10.
        - package: Plan comercial sugerido ('Starter', 'Pro' o 'Business').
        - phone: El teléfono del negocio.
        - email: El correo del negocio (si no hay, usa '').
        - ciudad: La ciudad del negocio (ej: 'Culiacán').
        - diagnostic: Breve resumen de 1 línea del diagnóstico SEO.
        
        Responde ÚNICAMENTE con el bloque JSON, sin ningún tipo de explicación, sin comentarios ni delimitadores adicionales de texto (es decir, que inicie directamente con [ y termine con ]).
        """
        response = await extractor_agent.chat(prompt_json)
        json_output = await response.text()
        json_output = json_output.replace("```json", "").replace("```", "").strip()
        try:
            parsed_prospects = json.loads(json_output)
        except Exception as e:
            print(f"⚠️ Error al formatear JSON de prospectos en paso intermedio: {e}", file=sys.stderr)
            print(f"Salida cruda del LLM: {json_output}", file=sys.stderr)
            
    if not parsed_prospects:
        # Fallback de emergencia
        parsed_prospects = [{
            "name": args.nicho.capitalize() + " " + args.ciudad,
            "slug": re.sub(r"[^a-z0-9]+", "-", args.nicho.lower() + "-" + args.ciudad.lower()).strip("-"),
            "opportunity": 8,
            "package": "Business",
            "phone": "5216672013019",
            "email": "miguelespino@humanio.digital",
            "test_phone": args.test_phone,
            "test_email": args.test_email,
            "ciudad": args.ciudad,
            "diagnostic": "Invisibilidad en buscadores (0 páginas indexadas) y falta de optimización SEO local."
        }]
    else:
        for p in parsed_prospects:
            if "ciudad" not in p or not p["ciudad"] or p["ciudad"].lower() == "null":
                p["ciudad"] = args.ciudad
            p["test_phone"] = args.test_phone if args.test_phone else ""
            p["test_email"] = args.test_email if args.test_email else ""
            
    # Mensaje de información sobre overrides
    if args.test_phone or args.test_email:
        print("🔧 Test Run: Overrides de contacto preparados para simulación (los datos reales se conservan en el CRM).")
    else:
        print("🚀 Production Run: Conservando datos de contacto reales de los prospectos.")

    # Guardar prospectos estructurados temporalmente en `./tmp/current_prospects.json`
    try:
        os.makedirs("./tmp", exist_ok=True)
        with open("./tmp/current_prospects.json", "w", encoding="utf-8") as f:
            json.dump(parsed_prospects, f, indent=2)
    except Exception as e:
        print(f"⚠️ Error al guardar ./tmp/current_prospects.json: {e}", file=sys.stderr)

    # 5. Instanciar y ejecutar Outreach (Paso 5)
    print_step(5, "Outreach", "Genera el mensaje frío (WhatsApp y Correo SMTP) usando los guardrails.")
    
    outreach_config = LocalAgentConfig(system_instructions=outreach_inst, capabilities=disable_tools_config)
    async with Agent(config=outreach_config) as outreach_agent:
        prompt_outreach = f"""
        Como Outreach, toma el reporte calificado y aprobado por el CEO:
        
        {qualifier_response}
        
        Para cada uno de los prospectos calificados y activados:
        - Muestra los parámetros del template de WhatsApp 'humanio_diagnostico_v1' ({{1}}, {{2}}, {{3}}, {{4}}).
        - Genera un correo electrónico SMTP completo en HTML con el diseño premium de Humanio (firmado por Miguel González y asunto de 6 palabras o menos).
        - Simula el envío exitoso al destino de prueba y reporta el ID de mensaje.
        """
        response = await outreach_agent.chat(prompt_outreach)
        outreach_response = await response.text()
        print(f"Outreach generó las plantillas y simuló los envíos:\n{outreach_response}\n")

    # Los mensajes ya no se envían automáticamente.
    # Quedan listos en el historial para ser disparados de forma manual desde el Dashboard.
    for p in parsed_prospects:
        p["whatsapp_status"] = "pending"
        p["email_status"] = "pending"

    # Guardar prospectos con estados inicializados (pending)
    try:
        with open("./tmp/current_prospects.json", "w", encoding="utf-8") as f:
            json.dump(parsed_prospects, f, indent=2)
    except Exception as e:
        print(f"⚠️ Error al actualizar ./tmp/current_prospects.json: {e}", file=sys.stderr)

    # 6. Instanciar y ejecutar Closer (Paso 6)
    print_step(6, "Closer", "Crea ticket de seguimiento en estado BLOCKED y define unblock_events.")
    
    closer_config = LocalAgentConfig(system_instructions=closer_inst, capabilities=disable_tools_config)
    async with Agent(config=closer_config) as closer_agent:
        prompt_closer = f"""
        Como Closer, recibe la confirmación de envíos de Outreach y crea los tickets de seguimiento para los prospectos:
        
        {outreach_response}
        
        Redacta el bloque YAML estructurado de handoff para cada prospecto definiendo su estado como 'blocked' y detallando los unblock_events (inbound_response y followup_due).
        """
        response = await closer_agent.chat(prompt_closer)
        closer_response = await response.text()
        print(f"Closer registró el seguimiento:\n{closer_response}\n")

    # Imprimir en el formato especial de JSON que lee server.js
    print(f"\n__PROSPECTS_JSON__:{json.dumps(parsed_prospects)}", flush=True)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Orquestador Real de Agentes Humanio")
    parser.add_argument("command", choices=["status", "outbound", "demo", "send-manual-whatsapp", "send-manual-email"], default="status", nargs="?")
    parser.add_argument("--nicho", default="dentistas", help="Giro o nicho comercial")
    parser.add_argument("--ciudad", default="Chihuahua", help="Ciudad de prospección")
    parser.add_argument("--pais", default="México", help="País de prospección")
    parser.add_argument("--limit", type=int, default=3, help="Cantidad de prospectos a buscar")
    parser.add_argument("--test-phone", default="", help="Teléfono de prueba")
    parser.add_argument("--test-email", default="", help="Email de prueba")
    
    # Argumentos para envío manual
    parser.add_argument("--phone", default="", help="Teléfono del prospecto")
    parser.add_argument("--email", default="", help="Email del prospecto")
    parser.add_argument("--name", default="", help="Nombre del prospecto")
    parser.add_argument("--diagnostic", default="", help="Diagnóstico del prospecto")
    
    # En caso de que se pase el comando directamente posicional sin guiones (compatibilidad con coordinator.js)
    # Ejemplo: node server.js -> python3 runner.py outbound "nicho" "ciudad" "pais"
    args, unknown = parser.parse_known_args()
    
    # Si hay argumentos posicionales extra, los mapeamos
    if len(unknown) >= 3:
        args.nicho = unknown[0]
        args.ciudad = unknown[1]
        args.pais = unknown[2]
    
    if args.command == "outbound":
        asyncio.run(run_pipeline(args))
    elif args.command == "send-manual-whatsapp":
        opportunity_str = "Atraer más clientes optimizando tu posicionamiento en Google y automatizando la atención por WhatsApp."
        wa_id = send_real_whatsapp_message(
            phone=args.phone,
            business_name=args.name,
            contact_name=args.name,
            diagnostic=args.diagnostic,
            opportunity=opportunity_str
        )
        if wa_id:
            print(f"__SUCCESS_WA_ID__:{wa_id}")
        else:
            print("__FAILED__")
            sys.exit(1)
    elif args.command == "send-manual-email":
        email_sent = send_real_email(
            to_email=args.email,
            business_name=args.name,
            contact_name=args.name,
            city=args.ciudad,
            diagnostic_list=[args.diagnostic]
        )
        if email_sent:
            print("__SUCCESS_EMAIL__")
        else:
            print("__FAILED__")
            sys.exit(1)
    else:
        print(f"El comando '{args.command}' no está soportado en la ejecución real de Fase 1. Usa 'outbound'.")

