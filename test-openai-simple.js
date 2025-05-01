// Script simple para probar la API de OpenAI
import fetch from 'node-fetch';

// Cargar variables de entorno desde .env
import dotenv from 'dotenv';
dotenv.config();

// Usar variables de entorno
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || "https://api.openai.com/v1";
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "gpt-4o";

// Función principal
async function main() {
  console.log("=== Prueba simple de la API de OpenAI ===");
  console.log("API Key:", OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 5)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 5)}` : "No disponible");
  
  try {
    console.log("\nProbando endpoint /chat/completions...");
    
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_API_MODEL,
        messages: [
          {
            role: 'user',
            content: 'Hola, ¿cómo estás? Responde brevemente.'
          }
        ],
        max_tokens: 50
      })
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    console.log("Status:", status, statusText);
    
    const text = await response.text();
    console.log("Response:", text);
    
    if (response.ok) {
      console.log("✓ API funcionando correctamente");
    } else {
      console.log("✗ Error en la API");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Ejecutar la función principal
main().catch(error => {
  console.error("Error general:", error);
});
