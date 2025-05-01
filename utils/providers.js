import config from './config.js';

export const PROVIDERS = {
  "fireworks-ai": {
    name: "Fireworks AI",
    max_tokens: 131_000,
    id: "fireworks-ai",
  },
  nebius: {
    name: "Nebius AI Studio",
    max_tokens: 131_000,
    id: "nebius",
  },
  sambanova: {
    name: "SambaNova",
    max_tokens: 8_000,
    id: "sambanova",
  },
  novita: {
    name: "NovitaAI",
    max_tokens: 16_000,
    id: "novita",
  },
  // hyperbolic: {
  //   name: "Hyperbolic",
  //   max_tokens: 131_000,
  //   id: "hyperbolic",
  // },
  local: {
    name: "Local (Ollama)",
    max_tokens: 131_000,
    id: "local",
  },
  // OpenAI - FUNCIONANDO
  openai: {
    name: "OpenAI GPT-4.1 Nano",
    max_tokens: 131_000,
    id: "openai",
    model: config.OPENAI_API_MODEL,
    base_url: config.OPENAI_API_URL,
    api_key: config.OPENAI_API_KEY,
  },
  deepseek: {
    name: "DeepSeek Chat",
    max_tokens: 131_000,
    id: "deepseek",
    model: "deepseek-chat",
    base_url: config.DEEPSEEK_API_URL,
    api_key: config.DEEPSEEK_API_KEY,
  },
  openrouter: {
    name: "OpenRouter (DeepSeek)",
    max_tokens: 131_000,
    id: "openrouter",
    model: "deepseek/deepseek-chat-v3-0324:free",
    base_url: config.OPENROUTER_API_URL,
    api_key: config.OPENROUTER_API_KEY,
  },
  // Anthropic - NO FUNCIONA (Saldo insuficiente)
  // anthropic: {
  //   name: "Anthropic Claude 3",
  //   max_tokens: 131_000,
  //   id: "anthropic",
  //   model: "claude-3-haiku-20240307",
  //   base_url: process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1",
  //   api_key: process.env.ANTHROPIC_API_KEY,
  // },
  together: {
    name: "Together AI (Mixtral)",
    max_tokens: 131_000,
    id: "together",
    model: "Qwen/Qwen2.5-Coder-32B-Instruct",
    base_url: config.TOGETHER_API_URL,
    api_key: config.TOGETHER_API_KEY,
  },
  groq: {
    name: "Groq (Llama 4)",
    max_tokens: 131_000,
    id: "groq",
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    base_url: config.GROQ_API_URL,
    api_key: config.GROQ_API_KEY,
  },
  deepinfra: {
    name: "DeepInfra (Qwen Coder)",
    max_tokens: 131_000,
    id: "deepinfra",
    model: "Qwen/Qwen2.5-Coder-32B-Instruct",
    base_url: config.DEEPINFRA_API_URL,
    api_key: config.DEEPINFRA_API_KEY,
  },
  mistral: {
    name: "Mistral AI (Codestral)",
    max_tokens: 131_000,
    id: "mistral",
    model: "codestral-latest",
    base_url: config.MISTRAL_API_URL,
    api_key: config.MISTRAL_API_KEY,
  },
  cohere: {
    name: "Cohere Command R+",
    max_tokens: 131_000,
    id: "cohere",
    model: "command-r-plus",
    base_url: config.COHERE_API_URL,
    api_key: config.COHERE_API_KEY,
  }
};
