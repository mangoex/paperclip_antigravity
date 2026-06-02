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
except ImportError:
    # Si no está instalado en el entorno de desarrollo, imprimimos un error amigable
    # (En el contenedor Docker de Easypanel sí estará instalado)
    print("❌ Error: google.antigravity no está instalado en este entorno de Python.", file=sys.stderr)
    print("Por favor, asegúrate de correr en un entorno compatible con Python 3.11+.", file=sys.stderr)
    sys.exit(1)

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

    is_test_run = True # Guardrail de seguridad activo por defecto en tests

    # 1. Instanciar y ejecutar el CEO (Paso 1)
    print_step(1, "CEO", f"Recibe solicitud de prospección: '{args.nicho} en {args.ciudad}, {args.pais}'")
    
    ceo_config = LocalAgentConfig(system_instructions=ceo_inst)
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
    
    scout_config = LocalAgentConfig(system_instructions=scout_inst)
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
    
    qualifier_config = LocalAgentConfig(system_instructions=qualifier_inst)
    async with Agent(config=qualifier_config) as qualifier_agent:
        prompt_qualifier = f"""
        Como Qualifier, toma los resultados de prospección generados por Scout:
        
        {scout_response}
        
        Para cada prospecto:
        - Realiza la auditoría de SEO, sitemap e indexación.
        - Asigna un score de oportunidad de 1 a 10.
        - Identifica el mejor paquete de suscripción de Humanio (Starter de $27 USD/mes, Pro de $47 USD/mes o Business de $97 USD/mes).
        - Redacta un diagnóstico SEO conciso y accionable.
        
        Devuelve el reporte calificado en formato Markdown.
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
        
        Aplica los guardrails de seguridad (TEST RUN) ya que is_test_run es True. Confirma que todos los teléfonos reales sean reemplazados por el teléfono de prueba: {args.test_phone} y los emails por: {args.test_email}.
        Da la autorización formal para que Outreach simule el contacto.
        """
        response = await ceo_agent.chat(prompt_ceo_2)
        ceo_response_2 = await response.text()
        print(f"CEO aprobó el bypass de seguridad:\n{ceo_response_2}\n")

    # 5. Instanciar y ejecutar Outreach (Paso 5)
    print_step(5, "Outreach", "Genera el mensaje frío (WhatsApp y Correo SMTP) usando los guardrails.")
    
    outreach_config = LocalAgentConfig(system_instructions=outreach_inst)
    async with Agent(config=outreach_config) as outreach_agent:
        prompt_outreach = f"""
        Como Outreach, toma el reporte calificado y aprobado por el CEO:
        
        {qualifier_response}
        
        Para cada prospecto calificado:
        - Muestra los parámetros del template de WhatsApp 'humanio_diagnostico_v1' ({{1}}, {{2}}, {{3}}, {{4}}).
        - Genera un correo electrónico SMTP completo en HTML con el diseño premium de Humanio (firmado por Miguel González y asunto de 6 palabras o menos).
        - Simula el envío exitoso al destino de prueba (Teléfono: {args.test_phone}, Email: {args.test_email}) y reporta el ID de mensaje.
        """
        response = await outreach_agent.chat(prompt_outreach)
        outreach_response = await response.text()
        print(f"Outreach generó las plantillas y simuló los envíos:\n{outreach_response}\n")

    # 6. Instanciar y ejecutar Closer (Paso 6)
    print_step(6, "Closer", "Crea ticket de seguimiento en estado BLOCKED y define unblock_events.")
    
    closer_config = LocalAgentConfig(system_instructions=closer_inst)
    async with Agent(config=closer_config) as closer_agent:
        prompt_closer = f"""
        Como Closer, recibe la confirmación de envíos de Outreach y crea los tickets de seguimiento para los prospectos:
        
        {outreach_response}
        
        Redacta el bloque YAML estructurado de handoff para cada prospecto definiendo su estado como 'blocked' y detallando los unblock_events (inbound_response y followup_due).
        """
        response = await closer_agent.chat(prompt_closer)
        closer_response = await response.text()
        print(f"Closer registró el seguimiento:\n{closer_response}\n")

    # 7. Extracción de Datos Estructurados JSON para la UI del Dashboard
    print("\n[Extracción] Extrayendo prospectos en formato estructurado JSON...", flush=True)
    async with Agent(config=qualifier_config) as extractor_agent:
        prompt_json = f"""
        De acuerdo con todo el reporte y la prospección final que realizamos:
        
        {qualifier_response}
        
        Extrae la lista de prospectos calificados en un formato JSON estrictamente válido. El resultado debe ser una lista de objetos JSON. Cada objeto debe tener obligatoriamente estas llaves y ningún dato inventado:
        - name: Nombre de la clínica/negocio.
        - slug: Identificador web amigable (ej: 'vitalis-chihuahua').
        - opportunity: Puntuación entera del 1 al 10.
        - package: Plan comercial sugerido ('Starter', 'Pro' o 'Business').
        - phone: El teléfono con override ({args.test_phone}).
        - email: El correo con override ({args.test_email}).
        - diagnostic: Breve resumen de 1 línea del diagnóstico SEO.
        
        Responde ÚNICAMENTE con el bloque JSON, sin ningún tipo de explicación, sin comentarios ni delimitadores adicionales de texto (es decir, que inicie directamente con [ y termine con ]).
        """
        response = await extractor_agent.chat(prompt_json)
        json_output = await response.text()
        
        # Limpiar posibles delimitadores de código markdown ```json ... ```
        json_output = json_output.replace("```json", "").replace("```", "").strip()
        
        # Validar si el texto obtenido es JSON válido
        try:
            parsed_json = json.loads(json_output)
            # Imprimir en el formato especial que lee server.js
            print(f"\n__PROSPECTS_JSON__:{json.dumps(parsed_json)}", flush=True)
        except Exception as e:
            # Fallback en caso de problemas de parseo
            print(f"⚠️ Error al formatear JSON de prospectos: {e}", file=sys.stderr)
            print(f"Salida cruda del LLM: {json_output}", file=sys.stderr)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Orquestador Real de Agentes Humanio")
    parser.add_argument("command", choices=["status", "outbound", "demo"], default="status", nargs="?")
    parser.add_argument("--nicho", default="dentistas", help="Giro o nicho comercial")
    parser.add_argument("--ciudad", default="Chihuahua", help="Ciudad de prospección")
    parser.add_argument("--pais", default="México", help="País de prospección")
    parser.add_argument("--limit", type=int, default=3, help="Cantidad de prospectos a buscar")
    parser.add_argument("--test-phone", default="5216145551234", help="Teléfono de prueba")
    parser.add_argument("--test-email", default="test-outbound@humanio.digital", help="Email de prueba")
    
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
    else:
        print(f"El comando '{args.command}' no está soportado en la ejecución real de Fase 1. Usa 'outbound'.")
