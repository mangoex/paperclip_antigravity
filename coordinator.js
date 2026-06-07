import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colores de consola para presentación premium
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

class AntigravityCoordinator {
  constructor() {
    this.companyName = "Humanio Codex";
    this.activeSubagents = new Map();
  }

  logHeader(title) {
    console.log(`\n${colors.bright}${colors.blue}=== ${title.toUpperCase()} ===${colors.reset}\n`);
  }

  logStep(step, agent, description) {
    console.log(`${colors.green}[Paso ${step}]${colors.reset} ${colors.bright}${agent}${colors.reset}: ${description}`);
  }

  logInfo(msg) {
    console.log(`${colors.dim}👉 ${msg}${colors.reset}`);
  }

  logWarning(msg) {
    console.log(`${colors.yellow}⚠️ ADVERTENCIA: ${msg}${colors.reset}`);
  }

  logSuccess(msg) {
    console.log(`\n${colors.bright}${colors.green}✓ ${msg}${colors.reset}\n`);
  }

  async loadAgentPrompt(agentName) {
    const filePath = path.join(__dirname, 'agents', agentName, 'AGENTS.md');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (err) {
      this.logWarning(`No se pudo leer el prompt para el agente ${agentName} en ${filePath}`);
      return null;
    }
  }

  async printStatus() {
    this.logHeader("Estado del Ecosistema Humanio");
    console.log(`${colors.bright}Organización:${colors.reset} ${this.companyName}`);
    console.log(`${colors.bright}Plataforma:${colors.reset} Antigravity Agent Orchestration Engine`);
    console.log(`${colors.bright}Repositorio:${colors.reset} https://github.com/mangoex/paperclip_antigravity\n`);

    console.log(`${colors.bright}Agentes Disponibles:${colors.reset}`);
    const agentsDir = path.join(__dirname, 'agents');
    try {
      const folders = await fs.readdir(agentsDir);
      for (const folder of folders) {
        const stats = await fs.stat(path.join(agentsDir, folder));
        if (stats.isDirectory() && folder !== '.git') {
          console.log(`  - ${colors.cyan}${folder.toUpperCase()}${colors.reset}`);
        }
      }
    } catch (err) {
      console.log("  No se pudieron listar los agentes locales.");
    }
  }

  async runOutbound(nicho, ciudad, pais) {
    this.logHeader(`Corriendo Flujo Outbound - ${nicho} en ${ciudad}, ${pais}`);
    
    // Paso 1: CEO Inicia
    this.logStep(1, "CEO", `Recibe solicitud de prospección: "${nicho} en ${ciudad}, ${pais}"`);
    this.logInfo("CEO valida presupuesto y estado global del pipeline.");

    // Paso 2: Scout Busca
    this.logStep(2, "Scout", `Inicia búsqueda de leads reales de "${nicho}" en "${ciudad}, ${pais}"`);
    this.logInfo("Llamando a las herramientas de búsqueda web...");
    this.logInfo("Simulando extracción de perfiles de Google Maps, URLs de negocio y teléfonos.");

    // Paso 3: Qualifier Evalúa
    this.logStep(3, "Qualifier", "Recibe reporte de Scout. Inicia auditoría de SEO local y conversión.");
    this.logInfo(" Qualifier realiza las siguientes comprobaciones:");
    console.log(`    - Indexación en buscadores (site:URL)`);
    console.log(`    - Existencia de robots.txt y sitemap.xml`);
    console.log(`    - Fricción del embudo (¿Redirige a teléfonos corporativos o tiene WhatsApp directo?)`);
    console.log(`    - Reseñas e imagen digital`);

    // Paso 4: CEO / QA Gate (Guardrail de seguridad)
    this.logStep(4, "CEO (QA Gate)", "Validación de seguridad y aplicación de contact_override.");
    this.logWarning("Verificando si la ejecución es un TEST RUN.");
    this.logInfo("Si is_test_run es true, se reemplazan los teléfonos de las clínicas reales por tu número de prueba.");

    // Paso 5: Outreach Contacta
    this.logStep(5, "Outreach", "Genera y envía el primer mensaje frío msg1.");
    this.logInfo("Cargando plantilla aprobada por Meta: 'humanio_diagnostico_v1'");
    this.logInfo("Enviando variables al API de WhatsApp Cloud...");
    console.log(`    - {{1}} (Nombre del Contacto)`);
    console.log(`    - {{2}} (Nombre del Negocio)`);
    console.log(`    - {{3}} (Hallazgo SEO más relevante del Qualifier)`);
    console.log(`    - {{4}} (Oportunidad comercial en menos de 120 caracteres)`);

    // Paso 6: Closer Espera
    this.logStep(6, "Closer", "Crea ticket de seguimiento en estado BLOCKED (espera pasiva).");
    this.logInfo("Se programan unblock_events (inbound_response y followup_due).");

    this.logSuccess("Simulación de Flujo Outbound Completada.");
    console.log(`Para ejecutar esta orquestación de manera real en tu consola de Antigravity, usa el comando:`);
    console.log(`${colors.bright}${colors.yellow}node coordinator.js execute --nicho "odontologos" --ciudad "Chihuahua" --test-phone "52166..."${colors.reset}\n`);
  }

  async runInboundDemo(prospectName, slug) {
    this.logHeader(`Corriendo Flujo Demo - Propuesta Web para ${prospectName}`);

    this.logStep(1, "Closer", `Detecta interés en la demo y realiza el Intake para: ${prospectName}`);
    this.logInfo("Capturando datos básicos: Nombre del negocio, Giro y Ciudad.");

    this.logStep(2, "DesignPlanner", "Genera el plan creativo (DESIGN_SPEC) del sitio demo.");
    
    this.logStep(3, "WebBuilder", `Construye el código de la landing page personalizada en /tmp/proposal-${slug}/`);
    
    // Generar físicamente los archivos a partir del template
    const templateSrc = path.join(__dirname, 'template_proposal');
    const destRepo = path.join(__dirname, 'tmp', `proposal-${slug}`);
    const destHumanio = path.join('/Users/miguelgonzalez/Codex/Humanio/tmp', `proposal-${slug}`);
    
    const replacements = {
      "Clínica Dental Vitalis": prospectName,
      "Clinica Dental Vitalis": prospectName,
      "Vitalis": prospectName
    };
    
    const copyDir = async (src, dest) => {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src, { withFileTypes: true });
      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          if (entry.name.endsWith('.html')) {
            let content = await fs.readFile(srcPath, 'utf8');
            for (let [target, replacement] of Object.entries(replacements)) {
              content = content.split(target).join(replacement);
            }
            await fs.writeFile(destPath, content, 'utf8');
          } else {
            await fs.copyFile(srcPath, destPath);
          }
        }
      }
    };
    
    try {
      this.logInfo("Generando archivos reales de propuesta a partir de la plantilla...");
      await copyDir(templateSrc, destRepo);
      
      // Intentar copiar al workspace de Humanio si existe la carpeta tmp
      const humanioTmpParent = '/Users/miguelgonzalez/Codex/Humanio/tmp';
      const existsHumanioTmp = await fs.access(humanioTmpParent).then(() => true).catch(() => false);
      if (existsHumanioTmp) {
        await copyDir(templateSrc, destHumanio);
        this.logInfo(`Propuesta copiada también a workspace de Humanio: ${destHumanio}`);
      }
      this.logInfo("✓ Código generado exitosamente.");
    } catch (err) {
      this.logWarning(`No se pudieron generar los archivos de propuesta reales: ${err.message}`);
    }
    
    this.logStep(4, "WebQA", "Realiza auditoría técnica: responsive, links rotos y checkout de Hotmart.");
    
    this.logStep(5, "WebPublisher", `Publica el sitio demo en Surge.sh: https://humanio.surge.sh/${slug}/`);
    
    this.logStep(6, "Closer", "Entrega la URL terminada al prospecto y programa seguimientos.");

    this.logSuccess("Simulación de Flujo Demo Completada.");
  }
}

// CLI Command Parser básico
const args = process.argv.slice(2);
const command = args[0] || 'status';

const coordinator = new AntigravityCoordinator();

if (command === 'status') {
  await coordinator.printStatus();
} else if (command === 'outbound') {
  const nicho = args[1] || "dentistas";
  const ciudad = args[2] || "Chihuahua";
  const pais = args[3] || "México";
  await coordinator.runOutbound(nicho, ciudad, pais);
} else if (command === 'demo') {
  const name = args[1] || "Distrito Dental";
  const slug = args[2] || "distritodental-chihuahua";
  await coordinator.runInboundDemo(name, slug);
} else {
  console.log(`Comando no reconocido. Comandos válidos: status, outbound, demo.`);
}
