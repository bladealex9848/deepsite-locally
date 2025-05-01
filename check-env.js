// Script para verificar las variables de entorno
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar variables de entorno
dotenv.config();

console.log("=== Verificación de variables de entorno ===");

// Función para mostrar una variable de entorno de forma segura
function showEnvVar(name) {
  const value = process.env[name];
  if (value) {
    const maskedValue = value.length > 10 
      ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}`
      : "***";
    console.log(`${name}: ${maskedValue} (longitud: ${value.length})`);
    return true;
  } else {
    console.log(`${name}: No definida`);
    return false;
  }
}

// Verificar variables de OpenAI
console.log("\n--- OpenAI ---");
const openaiKeyExists = showEnvVar("OPENAI_API_KEY");
showEnvVar("OPENAI_API_URL");
showEnvVar("OPENAI_API_MODEL");

// Verificar el archivo .env
console.log("\n--- Archivo .env ---");
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  
  // Buscar la línea de OPENAI_API_KEY
  const openaiKeyLine = lines.find(line => line.startsWith('OPENAI_API_KEY='));
  if (openaiKeyLine) {
    console.log(`Línea OPENAI_API_KEY encontrada en .env: ${openaiKeyLine.substring(0, 20)}...`);
    
    // Verificar si la clave está comentada
    if (openaiKeyLine.startsWith('#')) {
      console.log("ADVERTENCIA: La línea OPENAI_API_KEY está comentada en .env");
    }
    
    // Verificar el formato de la clave
    const keyValue = openaiKeyLine.split('=')[1];
    if (keyValue) {
      if (keyValue.startsWith('sk-')) {
        console.log("Formato de clave API correcto (comienza con 'sk-')");
      } else {
        console.log(`ADVERTENCIA: Formato de clave API inusual: ${keyValue.substring(0, 10)}...`);
      }
    }
  } else {
    console.log("No se encontró la línea OPENAI_API_KEY en .env");
  }
} catch (error) {
  console.error(`Error al leer el archivo .env: ${error.message}`);
}

// Sugerencias
console.log("\n--- Sugerencias ---");
if (!openaiKeyExists) {
  console.log("1. Asegúrate de que OPENAI_API_KEY esté definida y no comentada en el archivo .env");
  console.log("2. Reinicia el servidor después de modificar el archivo .env");
  console.log("3. Verifica que el formato de la clave API sea correcto (debe comenzar con 'sk-')");
}

console.log("\n=== Fin de la verificación ===");
