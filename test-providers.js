// Script para probar todos los proveedores de IA
// Autor: Alexander Oviedo Fadul

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para probar un proveedor
async function testProvider(name, apiUrl, apiKey, model, type = 'openai') {
  console.log(`${colors.blue}Probando ${name}...${colors.reset}`);

  try {
    let endpoint = '';
    let headers = {};
    let body = {};

    switch (type) {
      case 'openai':
        endpoint = `${apiUrl}/chat/completions`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hola, ¿cómo estás? Responde brevemente.'
            }
          ],
          max_tokens: 50
        };
        break;

      case 'anthropic':
        endpoint = `${apiUrl}/messages`;
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        body = {
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Hola, ¿cómo estás? Responde brevemente.'
            }
          ],
          max_tokens: 50
        };
        break;

      case 'cohere':
        endpoint = `${apiUrl}/chat`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = {
          model: model,
          message: 'Hola, ¿cómo estás? Responde brevemente.',
          max_tokens: 50
        };
        break;

      default:
        throw new Error(`Tipo de proveedor no soportado: ${type}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`${colors.green}✓ ${name} está funcionando correctamente${colors.reset}`);
      console.log(`${colors.cyan}Respuesta: ${JSON.stringify(data).substring(0, 150)}...${colors.reset}`);
      return { success: true, provider: name };
    } else {
      console.log(`${colors.red}✗ ${name} falló: ${data.error?.message || JSON.stringify(data)}${colors.reset}`);
      return { success: false, provider: name, error: data.error?.message || JSON.stringify(data) };
    }
  } catch (error) {
    console.log(`${colors.red}✗ ${name} falló: ${error.message}${colors.reset}`);
    return { success: false, provider: name, error: error.message };
  }
}

// Función para probar Ollama local
async function testOllama(apiUrl, model) {
  console.log(`${colors.blue}Probando Ollama (local)...${colors.reset}`);

  try {
    const endpoint = `${apiUrl}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json'
    };
    const body = {
      model: model,
      messages: [
        {
          role: 'user',
          content: 'Hola, ¿cómo estás? Responde brevemente.'
        }
      ],
      max_tokens: 50
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✓ Ollama está funcionando correctamente${colors.reset}`);
      console.log(`${colors.cyan}Respuesta: ${JSON.stringify(data).substring(0, 150)}...${colors.reset}`);
      return { success: true, provider: 'Ollama' };
    } else {
      const text = await response.text();
      console.log(`${colors.red}✗ Ollama falló: ${text}${colors.reset}`);
      return { success: false, provider: 'Ollama', error: text };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Ollama falló: ${error.message}${colors.reset}`);
    return { success: false, provider: 'Ollama', error: error.message };
  }
}

// Función principal
async function main() {
  console.log(`${colors.magenta}=== Prueba de proveedores de IA ===${colors.reset}`);

  const results = [];

  // Probar Ollama local
  if (process.env.LOCAL_API_URL && process.env.LOCAL_MODEL) {
    results.push(await testOllama(
      process.env.LOCAL_API_URL,
      process.env.LOCAL_MODEL
    ));
  }

  // Probar OpenAI
  if (process.env.OPENAI_API_URL && process.env.OPENAI_API_KEY) {
    console.log(`${colors.blue}Encontrada configuración de OpenAI en .env${colors.reset}`);
    results.push(await testProvider(
      'OpenAI',
      process.env.OPENAI_API_URL,
      process.env.OPENAI_API_KEY,
      process.env.OPENAI_API_MODEL || 'gpt-4.1-nano'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de OpenAI no encontrada o comentada en .env${colors.reset}`);
  }

  // Probar DeepSeek
  if (process.env.DEEPSEEK_API_URL && process.env.DEEPSEEK_API_KEY) {
    results.push(await testProvider(
      'DeepSeek',
      process.env.DEEPSEEK_API_URL,
      process.env.DEEPSEEK_API_KEY,
      'deepseek-chat'
    ));
  }

  // Probar OpenRouter
  if (process.env.OPENROUTER_API_URL && process.env.OPENROUTER_API_KEY) {
    results.push(await testProvider(
      'OpenRouter',
      process.env.OPENROUTER_API_URL,
      process.env.OPENROUTER_API_KEY,
      'deepseek/deepseek-chat-v3-0324:free'
    ));
  }

  // Probar Anthropic
  if (process.env.ANTHROPIC_API_URL && process.env.ANTHROPIC_API_KEY) {
    results.push(await testProvider(
      'Anthropic',
      process.env.ANTHROPIC_API_URL,
      process.env.ANTHROPIC_API_KEY,
      'claude-3-opus-20240229',
      'anthropic'
    ));
  }

  // Probar Together AI
  if (process.env.TOGETHER_API_URL && process.env.TOGETHER_API_KEY) {
    results.push(await testProvider(
      'Together AI',
      process.env.TOGETHER_API_URL,
      process.env.TOGETHER_API_KEY,
      'mistralai/Mixtral-8x7B-Instruct-v0.1'
    ));
  }

  // Probar Groq
  if (process.env.GROQ_API_URL && process.env.GROQ_API_KEY) {
    results.push(await testProvider(
      'Groq',
      process.env.GROQ_API_URL,
      process.env.GROQ_API_KEY,
      'llama3-70b-8192'
    ));
  }

  // Probar DeepInfra
  if (process.env.DEEPINFRA_API_URL && process.env.DEEPINFRA_API_KEY) {
    console.log(`${colors.blue}Encontrada configuración de DeepInfra en .env${colors.reset}`);
    results.push(await testProvider(
      'DeepInfra',
      process.env.DEEPINFRA_API_URL,
      process.env.DEEPINFRA_API_KEY,
      'Qwen/Qwen2.5-Coder-32B-Instruct' // Modelo actualizado según utils/providers.js
    ));
  } else {
    console.log(`${colors.yellow}Configuración de DeepInfra no encontrada o comentada en .env${colors.reset}`);
  }

  // Probar Mistral
  if (process.env.MISTRAL_API_URL && process.env.MISTRAL_API_KEY) {
    console.log(`${colors.blue}Encontrada configuración de Mistral en .env${colors.reset}`);
    results.push(await testProvider(
      'Mistral',
      process.env.MISTRAL_API_URL,
      process.env.MISTRAL_API_KEY,
      'codestral-latest' // Modelo actualizado según utils/providers.js
    ));
  } else {
    console.log(`${colors.yellow}Configuración de Mistral no encontrada o comentada en .env${colors.reset}`);
  }

  // Probar Cohere
  if (process.env.COHERE_API_URL && process.env.COHERE_API_KEY) {
    results.push(await testProvider(
      'Cohere',
      process.env.COHERE_API_URL,
      process.env.COHERE_API_KEY,
      'command-r-plus',
      'cohere'
    ));
  }

  // Resumen de resultados
  console.log(`\n${colors.magenta}=== Resumen de resultados ===${colors.reset}`);

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`${colors.green}Proveedores funcionando (${successful.length}): ${successful.map(r => r.provider).join(', ')}${colors.reset}`);
  console.log(`${colors.red}Proveedores con errores (${failed.length}): ${failed.map(r => r.provider).join(', ')}${colors.reset}`);

  // Guardar resultados en un archivo
  const resultsFile = path.join(__dirname, 'provider-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: results
  }, null, 2));

  console.log(`\n${colors.cyan}Resultados guardados en: ${resultsFile}${colors.reset}`);
}

// Ejecutar la función principal
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
