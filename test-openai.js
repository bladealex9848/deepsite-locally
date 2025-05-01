// Script para probar la API de OpenAI
// Autor: Alexander Oviedo Fadul

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Usar variables de entorno desde .env
// No definir claves API directamente en el código

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

// Función para probar la API de OpenAI
async function testOpenAI() {
  console.log(`${colors.magenta}=== Prueba de la API de OpenAI ===${colors.reset}`);
  
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_API_MODEL || "gpt-4.1-nano";
  
  if (!apiKey || !apiUrl || !model) {
    console.log(`${colors.red}Error: Faltan variables de entorno necesarias (OPENAI_API_KEY, OPENAI_API_URL, OPENAI_API_MODEL)${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Configuración:${colors.reset}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`Modelo: ${model}`);
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5) : "No disponible"}`);
  console.log(`API Key Length: ${apiKey ? apiKey.length : 0}`);
  
  // Probar el endpoint de chat completions
  try {
    console.log(`\n${colors.blue}Probando endpoint /chat/completions...${colors.reset}`);
    
    const chatResponse = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Hola, ¿cómo estás? Responde brevemente.'
          }
        ],
        max_tokens: 50
      })
    });
    
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log(`${colors.green}✓ Endpoint /chat/completions funcionando correctamente${colors.reset}`);
      console.log(`${colors.cyan}Respuesta: ${JSON.stringify(data).substring(0, 150)}...${colors.reset}`);
    } else {
      const errorText = await chatResponse.text();
      console.log(`${colors.red}✗ Error en endpoint /chat/completions: ${chatResponse.status} - ${chatResponse.statusText}${colors.reset}`);
      console.log(`${colors.red}Detalles: ${errorText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error al conectar con endpoint /chat/completions: ${error.message}${colors.reset}`);
  }
  
  // Probar el endpoint de completions (obsoleto pero aún funcional)
  try {
    console.log(`\n${colors.blue}Probando endpoint /completions...${colors.reset}`);
    
    const completionsResponse = await fetch(`${apiUrl}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',  // Este endpoint usa modelos diferentes
        prompt: 'Hola, ¿cómo estás? Responde brevemente.',
        max_tokens: 50
      })
    });
    
    if (completionsResponse.ok) {
      const data = await completionsResponse.json();
      console.log(`${colors.green}✓ Endpoint /completions funcionando correctamente${colors.reset}`);
      console.log(`${colors.cyan}Respuesta: ${JSON.stringify(data).substring(0, 150)}...${colors.reset}`);
    } else {
      const errorText = await completionsResponse.text();
      console.log(`${colors.red}✗ Error en endpoint /completions: ${completionsResponse.status} - ${completionsResponse.statusText}${colors.reset}`);
      console.log(`${colors.red}Detalles: ${errorText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error al conectar con endpoint /completions: ${error.message}${colors.reset}`);
  }
  
  // Probar el endpoint de responses (nuevo)
  try {
    console.log(`\n${colors.blue}Probando endpoint /responses...${colors.reset}`);
    console.log(`${colors.yellow}Nota: Este endpoint es nuevo y puede no estar disponible para todas las cuentas${colors.reset}`);
    
    const responsesResponse = await fetch(`${apiUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        input: [],
        text: {
          format: {
            type: "text"
          }
        },
        reasoning: {},
        tools: [],
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
        store: true
      })
    });
    
    if (responsesResponse.ok) {
      const data = await responsesResponse.json();
      console.log(`${colors.green}✓ Endpoint /responses funcionando correctamente${colors.reset}`);
      console.log(`${colors.cyan}Respuesta: ${JSON.stringify(data).substring(0, 150)}...${colors.reset}`);
    } else {
      const errorText = await responsesResponse.text();
      console.log(`${colors.red}✗ Error en endpoint /responses: ${responsesResponse.status} - ${responsesResponse.statusText}${colors.reset}`);
      console.log(`${colors.red}Detalles: ${errorText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error al conectar con endpoint /responses: ${error.message}${colors.reset}`);
  }
}

// Ejecutar la función principal
testOpenAI().catch(error => {
  console.error(`${colors.red}Error general: ${error.message}${colors.reset}`);
  process.exit(1);
});
