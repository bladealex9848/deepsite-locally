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
  openai: {
    name: "OpenAI",
    max_tokens: 131_000,
    id: "openai",
    model: process.env.OPENAI_API_MODEL || "gpt-4.1-nano",
    base_url: process.env.OPENAI_API_URL || "https://api.openai.com/v1",
    api_key: process.env.OPENAI_API_KEY,
  },
  deepseek: {
    name: "DeepSeek",
    max_tokens: 131_000,
    id: "deepseek",
    model: "deepseek-chat",
    base_url: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1",
    api_key: process.env.DEEPSEEK_API_KEY,
  },
  openrouter: {
    name: "OpenRouter",
    max_tokens: 131_000,
    id: "openrouter",
    model: "deepseek/deepseek-chat-v3-0324:free",
    base_url: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
    api_key: process.env.OPENROUTER_API_KEY,
  }
};
