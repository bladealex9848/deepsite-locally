// Configuración centralizada para la aplicación
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Cargar variables de entorno
dotenv.config({ path: path.join(rootDir, '.env') });

// Leer directamente el archivo .env para casos donde dotenv no funciona correctamente
function getEnvVarFromFile(varName) {
  try {
    const envPath = path.join(rootDir, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      // Buscar la línea que contiene la variable
      const varLine = lines.find(line => line.trim().startsWith(`${varName}=`));
      if (varLine) {
        // Extraer el valor después del signo igual
        const value = varLine.split('=')[1].trim();
        return value;
      }
    }
  } catch (error) {
    console.error(`Error al leer variable ${varName} desde .env:`, error);
  }
  return null;
}

// Configuración de proveedores
export const config = {
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || getEnvVarFromFile('OPENAI_API_KEY'),
  OPENAI_API_URL: process.env.OPENAI_API_URL || getEnvVarFromFile('OPENAI_API_URL') || "https://api.openai.com/v1",
  OPENAI_API_MODEL: process.env.OPENAI_API_MODEL || getEnvVarFromFile('OPENAI_API_MODEL') || "gpt-4.1-nano",
  
  // DeepSeek
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || getEnvVarFromFile('DEEPSEEK_API_KEY'),
  DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || getEnvVarFromFile('DEEPSEEK_API_URL') || "https://api.deepseek.com/v1",
  
  // OpenRouter
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || getEnvVarFromFile('OPENROUTER_API_KEY'),
  OPENROUTER_API_URL: process.env.OPENROUTER_API_URL || getEnvVarFromFile('OPENROUTER_API_URL') || "https://openrouter.ai/api/v1",
  
  // Together AI
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || getEnvVarFromFile('TOGETHER_API_KEY'),
  TOGETHER_API_URL: process.env.TOGETHER_API_URL || getEnvVarFromFile('TOGETHER_API_URL') || "https://api.together.xyz/v1",
  
  // Groq
  GROQ_API_KEY: process.env.GROQ_API_KEY || getEnvVarFromFile('GROQ_API_KEY'),
  GROQ_API_URL: process.env.GROQ_API_URL || getEnvVarFromFile('GROQ_API_URL') || "https://api.groq.com/openai/v1",
  
  // DeepInfra
  DEEPINFRA_API_KEY: process.env.DEEPINFRA_API_KEY || getEnvVarFromFile('DEEPINFRA_API_KEY'),
  DEEPINFRA_API_URL: process.env.DEEPINFRA_API_URL || getEnvVarFromFile('DEEPINFRA_API_URL') || "https://api.deepinfra.com/v1/openai",
  
  // Mistral
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || getEnvVarFromFile('MISTRAL_API_KEY'),
  MISTRAL_API_URL: process.env.MISTRAL_API_URL || getEnvVarFromFile('MISTRAL_API_URL') || "https://api.mistral.ai/v1",
  
  // Cohere
  COHERE_API_KEY: process.env.COHERE_API_KEY || getEnvVarFromFile('COHERE_API_KEY'),
  COHERE_API_URL: process.env.COHERE_API_URL || getEnvVarFromFile('COHERE_API_URL') || "https://api.cohere.ai/v1",
  
  // Ollama (Local)
  LOCAL_API_URL: process.env.LOCAL_API_URL || getEnvVarFromFile('LOCAL_API_URL') || "http://localhost:11434/v1",
  LOCAL_API_KEY: process.env.LOCAL_API_KEY || getEnvVarFromFile('LOCAL_API_KEY') || "",
  LOCAL_MODEL: process.env.LOCAL_MODEL || getEnvVarFromFile('LOCAL_MODEL') || "qwen3:4b",
};

// Función para verificar si una configuración está completa
export function isProviderConfigured(providerName) {
  switch (providerName) {
    case 'openai':
      return !!config.OPENAI_API_KEY && !!config.OPENAI_API_URL;
    case 'deepseek':
      return !!config.DEEPSEEK_API_KEY && !!config.DEEPSEEK_API_URL;
    case 'openrouter':
      return !!config.OPENROUTER_API_KEY && !!config.OPENROUTER_API_URL;
    case 'together':
      return !!config.TOGETHER_API_KEY && !!config.TOGETHER_API_URL;
    case 'groq':
      return !!config.GROQ_API_KEY && !!config.GROQ_API_URL;
    case 'deepinfra':
      return !!config.DEEPINFRA_API_KEY && !!config.DEEPINFRA_API_URL;
    case 'mistral':
      return !!config.MISTRAL_API_KEY && !!config.MISTRAL_API_URL;
    case 'cohere':
      return !!config.COHERE_API_KEY && !!config.COHERE_API_URL;
    case 'local':
      return !!config.LOCAL_API_URL && !!config.LOCAL_MODEL;
    default:
      return false;
  }
}

// Exportar la configuración
export default config;
