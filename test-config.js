// Script para probar la configuración
import config, { isProviderConfigured } from './utils/config.js';

console.log("=== Prueba de configuración ===");

// Mostrar la configuración de OpenAI
console.log("\n--- OpenAI ---");
console.log(`API Key: ${config.OPENAI_API_KEY ? config.OPENAI_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.OPENAI_API_URL}`);
console.log(`API Model: ${config.OPENAI_API_MODEL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('openai') ? 'Sí' : 'No'}`);

// Mostrar la configuración de DeepSeek
console.log("\n--- DeepSeek ---");
console.log(`API Key: ${config.DEEPSEEK_API_KEY ? config.DEEPSEEK_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.DEEPSEEK_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('deepseek') ? 'Sí' : 'No'}`);

// Mostrar la configuración de OpenRouter
console.log("\n--- OpenRouter ---");
console.log(`API Key: ${config.OPENROUTER_API_KEY ? config.OPENROUTER_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.OPENROUTER_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('openrouter') ? 'Sí' : 'No'}`);

// Mostrar la configuración de Together AI
console.log("\n--- Together AI ---");
console.log(`API Key: ${config.TOGETHER_API_KEY ? config.TOGETHER_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.TOGETHER_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('together') ? 'Sí' : 'No'}`);

// Mostrar la configuración de Groq
console.log("\n--- Groq ---");
console.log(`API Key: ${config.GROQ_API_KEY ? config.GROQ_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.GROQ_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('groq') ? 'Sí' : 'No'}`);

// Mostrar la configuración de DeepInfra
console.log("\n--- DeepInfra ---");
console.log(`API Key: ${config.DEEPINFRA_API_KEY ? config.DEEPINFRA_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.DEEPINFRA_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('deepinfra') ? 'Sí' : 'No'}`);

// Mostrar la configuración de Mistral
console.log("\n--- Mistral ---");
console.log(`API Key: ${config.MISTRAL_API_KEY ? config.MISTRAL_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.MISTRAL_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('mistral') ? 'Sí' : 'No'}`);

// Mostrar la configuración de Cohere
console.log("\n--- Cohere ---");
console.log(`API Key: ${config.COHERE_API_KEY ? config.COHERE_API_KEY.substring(0, 10) + "..." : "No definida"}`);
console.log(`API URL: ${config.COHERE_API_URL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('cohere') ? 'Sí' : 'No'}`);

// Mostrar la configuración de Ollama (Local)
console.log("\n--- Ollama (Local) ---");
console.log(`API URL: ${config.LOCAL_API_URL}`);
console.log(`API Model: ${config.LOCAL_MODEL}`);
console.log(`¿Configurado correctamente?: ${isProviderConfigured('local') ? 'Sí' : 'No'}`);

console.log("\n=== Fin de la prueba ===");
