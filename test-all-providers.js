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

// Función para probar un proveedor con el endpoint /chat/completions
async function testProvider(name, apiUrl, apiKey, model, type = 'openai') {
  console.log(`${colors.blue}Probando ${name} (${model})...${colors.reset}`);
  
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
              content: 'Hola, ¿cómo estás? Responde brevemente en español.'
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
              content: 'Hola, ¿cómo estás? Responde brevemente en español.'
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
          message: 'Hola, ¿cómo estás? Responde brevemente en español.',
          max_tokens: 50
        };
        break;
        
      default:
        throw new Error(`Tipo de proveedor no soportado: ${type}`);
    }
    
    console.log(`Endpoint: ${endpoint}`);
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5) : 'No disponible'}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    const status = response.status;
    const statusText = response.statusText;
    console.log(`Status: ${status} ${statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✓ ${name} está funcionando correctamente${colors.reset}`);
      
      // Extraer la respuesta según el tipo de proveedor
      let content = '';
      if (type === 'openai') {
        content = data.choices[0].message.content;
      } else if (type === 'anthropic') {
        content = data.content[0].text;
      } else if (type === 'cohere') {
        content = data.text;
      }
      
      console.log(`${colors.cyan}Respuesta: "${content}"${colors.reset}`);
      return { success: true, provider: name, model: model, response: content };
    } else {
      const errorText = await response.text();
      console.log(`${colors.red}✗ ${name} falló: ${errorText}${colors.reset}`);
      return { success: false, provider: name, model: model, error: errorText };
    }
  } catch (error) {
    console.log(`${colors.red}✗ ${name} falló: ${error.message}${colors.reset}`);
    return { success: false, provider: name, model: model, error: error.message };
  }
}

// Función para probar Ollama local
async function testOllama(apiUrl, model) {
  console.log(`${colors.blue}Probando Ollama (${model})...${colors.reset}`);
  
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
          content: 'Hola, ¿cómo estás? Responde brevemente en español.'
        }
      ],
      max_tokens: 50
    };
    
    console.log(`Endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    const status = response.status;
    const statusText = response.statusText;
    console.log(`Status: ${status} ${statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✓ Ollama está funcionando correctamente${colors.reset}`);
      const content = data.choices[0].message.content;
      console.log(`${colors.cyan}Respuesta: "${content}"${colors.reset}`);
      return { success: true, provider: 'Ollama', model: model, response: content };
    } else {
      const text = await response.text();
      console.log(`${colors.red}✗ Ollama falló: ${text}${colors.reset}`);
      return { success: false, provider: 'Ollama', model: model, error: text };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Ollama falló: ${error.message}${colors.reset}`);
    return { success: false, provider: 'Ollama', model: model, error: error.message };
  }
}

// Función principal
async function main() {
  console.log(`${colors.magenta}=== Prueba de proveedores de IA ===${colors.reset}`);
  
  const results = [];
  
  // Probar OpenAI con gpt-4o
  if (process.env.OPENAI_API_URL && process.env.OPENAI_API_KEY) {
    results.push(await testProvider(
      'OpenAI (gpt-4o)',
      process.env.OPENAI_API_URL,
      process.env.OPENAI_API_KEY,
      'gpt-4o'
    ));
    
    // Probar OpenAI con gpt-4.1-nano
    results.push(await testProvider(
      'OpenAI (gpt-4.1-nano)',
      process.env.OPENAI_API_URL,
      process.env.OPENAI_API_KEY,
      'gpt-4.1-nano'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de OpenAI no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar Ollama local
  if (process.env.LOCAL_API_URL && process.env.LOCAL_MODEL) {
    results.push(await testOllama(
      process.env.LOCAL_API_URL,
      process.env.LOCAL_MODEL
    ));
  } else {
    console.log(`${colors.yellow}Configuración de Ollama no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar DeepSeek
  if (process.env.DEEPSEEK_API_URL && process.env.DEEPSEEK_API_KEY) {
    results.push(await testProvider(
      'DeepSeek',
      process.env.DEEPSEEK_API_URL,
      process.env.DEEPSEEK_API_KEY,
      'deepseek-chat'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de DeepSeek no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar OpenRouter
  if (process.env.OPENROUTER_API_URL && process.env.OPENROUTER_API_KEY) {
    results.push(await testProvider(
      'OpenRouter',
      process.env.OPENROUTER_API_URL,
      process.env.OPENROUTER_API_KEY,
      'deepseek/deepseek-chat-v3-0324:free'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de OpenRouter no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar Together AI
  if (process.env.TOGETHER_API_URL && process.env.TOGETHER_API_KEY) {
    results.push(await testProvider(
      'Together AI',
      process.env.TOGETHER_API_URL,
      process.env.TOGETHER_API_KEY,
      'mistralai/Mixtral-8x7B-Instruct-v0.1'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de Together AI no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar Groq
  if (process.env.GROQ_API_URL && process.env.GROQ_API_KEY) {
    results.push(await testProvider(
      'Groq',
      process.env.GROQ_API_URL,
      process.env.GROQ_API_KEY,
      'meta-llama/llama-4-maverick-17b-128e-instruct'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de Groq no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar DeepInfra
  if (process.env.DEEPINFRA_API_URL && process.env.DEEPINFRA_API_KEY) {
    results.push(await testProvider(
      'DeepInfra',
      process.env.DEEPINFRA_API_URL,
      process.env.DEEPINFRA_API_KEY,
      'Qwen/Qwen2.5-Coder-32B-Instruct'
    ));
  } else {
    console.log(`${colors.yellow}Configuración de DeepInfra no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Probar Mistral
  if (process.env.MISTRAL_API_URL && process.env.MISTRAL_API_KEY) {
    results.push(await testProvider(
      'Mistral',
      process.env.MISTRAL_API_URL,
      process.env.MISTRAL_API_KEY,
      'codestral-latest'
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
  } else {
    console.log(`${colors.yellow}Configuración de Cohere no encontrada o comentada en .env${colors.reset}`);
  }
  
  // Resumen de resultados
  console.log(`\n${colors.magenta}=== Resumen de resultados ===${colors.reset}`);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`${colors.green}Proveedores funcionando (${successful.length}): ${successful.map(r => `${r.provider} (${r.model})`).join(', ')}${colors.reset}`);
  console.log(`${colors.red}Proveedores con errores (${failed.length}): ${failed.map(r => `${r.provider} (${r.model})`).join(', ')}${colors.reset}`);
  
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
