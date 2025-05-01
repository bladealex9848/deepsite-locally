import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from "fs";
import {
  createRepo,
  uploadFiles,
  whoAmI,
  spaceInfo,
  fileExists,
} from "@huggingface/hub";
import { InferenceClient } from "@huggingface/inference";
import bodyParser from "body-parser";

import checkUser from "./middlewares/checkUser.js";
import { PROVIDERS } from "./utils/providers.js";
import { COLORS } from "./utils/colors.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

const ipAddresses = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.APP_PORT || 3000;
const REDIRECT_URI =
  process.env.REDIRECT_URI || `http://localhost:${PORT}/auth/login`;
const MODEL_ID = "deepseek-ai/DeepSeek-V3-0324";
const MAX_REQUESTS_PER_IP = 2;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "dist")));

const getPTag = (repoId) => {
  return `<p style="border-radius: 8px; text-align: center; font-size: 12px; color: #fff; margin-top: 16px;position: fixed; left: 8px; bottom: 8px; z-index: 10; background: rgba(0, 0, 0, 0.8); padding: 4px 8px;">Made with <img src="https://enzostvs-deepsite.hf.space/logo.svg" alt="DeepSite Logo" style="width: 16px; height: 16px; vertical-align: middle;display:inline-block;margin-right:3px;filter:brightness(0) invert(1);"><a href="https://enzostvs-deepsite.hf.space" style="color: #fff;text-decoration: underline;" target="_blank" >DeepSite</a> - 🧬 <a href="https://enzostvs-deepsite.hf.space?remix=${repoId}" style="color: #fff;text-decoration: underline;" target="_blank" >Remix</a></p>`;
};

app.get("/api/login", (_req, res) => {
  const redirectUrl = `https://huggingface.co/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20profile%20write-repos%20manage-repos%20inference-api&prompt=consent&state=1234567890`;
  res.status(200).send({
    ok: true,
    redirectUrl,
  });
});
app.get("/auth/login", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(302, "/");
  }
  const Authorization = `Basic ${Buffer.from(
    `${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`
  ).toString("base64")}`;

  const request_auth = await fetch("https://huggingface.co/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const response = await request_auth.json();

  if (!response.access_token) {
    return res.redirect(302, "/");
  }

  res.cookie("hf_token", response.access_token, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.redirect(302, "/");
});
app.get("/auth/logout", (req, res) => {
  res.clearCookie("hf_token", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
  });
  return res.redirect(302, "/");
});

app.get("/api/@me", checkUser, async (req, res) => {
  let { hf_token } = req.cookies;

  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    return res.send({
      preferred_username: "local-use",
      isLocalUse: true,
    });
  }

  try {
    const request_user = await fetch("https://huggingface.co/oauth/userinfo", {
      headers: {
        Authorization: `Bearer ${hf_token}`,
      },
    });

    const user = await request_user.json();
    res.send(user);
  } catch (err) {
    res.clearCookie("hf_token", {
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });
    res.status(401).send({
      ok: false,
      message: err.message,
    });
  }
});

app.post("/api/deploy", checkUser, async (req, res) => {
  const { html, title, path, prompts } = req.body;
  if (!html || (!path && !title)) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  let { hf_token } = req.cookies;
  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    hf_token = process.env.HF_TOKEN;
  }

  try {
    const repo = {
      type: "space",
      name: path ?? "",
    };

    let readme;
    let newHtml = html;

    if (!path || path === "") {
      const { name: username } = await whoAmI({ accessToken: hf_token });
      const newTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .split("-")
        .filter(Boolean)
        .join("-")
        .slice(0, 96);

      const repoId = `${username}/${newTitle}`;
      repo.name = repoId;

      await createRepo({
        repo,
        accessToken: hf_token,
      });
      const colorFrom = COLORS[Math.floor(Math.random() * COLORS.length)];
      const colorTo = COLORS[Math.floor(Math.random() * COLORS.length)];
      readme = `---
title: ${newTitle}
emoji: 🐳
colorFrom: ${colorFrom}
colorTo: ${colorTo}
sdk: static
pinned: false
tags:
  - deepsite
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference`;
    }

    newHtml = html.replace(/<\/body>/, `${getPTag(repo.name)}</body>`);
    const file = new Blob([newHtml], { type: "text/html" });
    file.name = "index.html"; // Add name property to the Blob

    // create prompt.txt file with all the prompts used, split by new line
    const newPrompts = ``.concat(prompts.map((prompt) => prompt).join("\n"));
    const promptFile = new Blob([newPrompts], { type: "text/plain" });
    promptFile.name = "prompts.txt"; // Add name property to the Blob

    const files = [file, promptFile];
    if (readme) {
      const readmeFile = new Blob([readme], { type: "text/markdown" });
      readmeFile.name = "README.md"; // Add name property to the Blob
      files.push(readmeFile);
    }
    await uploadFiles({
      repo,
      files,
      accessToken: hf_token,
    });
    return res.status(200).send({ ok: true, path: repo.name });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      message: err.message,
    });
  }
});

app.post("/api/ask-ai", async (req, res) => {
  const { prompt, html, previousPrompt, provider } = req.body;
  if (!prompt) {
    return res.status(400).send({
      ok: false,
      message: "Missing required fields",
    });
  }

  let { hf_token } = req.cookies;
  let token = hf_token;

  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    token = process.env.HF_TOKEN;
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    req.ip ||
    "0.0.0.0";

  if (!token) {
    ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
    if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
      return res.status(429).send({
        ok: false,
        openLogin: true,
        message: "Log In to continue using the service",
      });
    }

    token = process.env.DEFAULT_HF_TOKEN;
  }

  // Set up response headers for streaming
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const client = new InferenceClient(token);
  let completeResponse = "";

  let systemPrompt = `ONLY USE HTML, CSS AND JAVASCRIPT. No explanations, ONLY CODE. If you want to use ICON make sure to import the library first. Try to create the best UI possible by using only HTML, CSS and JAVASCRIPT. Use as much as you can TailwindCSS for the CSS, if you can't do something with TailwindCSS, then use custom CSS (make sure to import <script src="https://cdn.tailwindcss.com"></script> in the head). Also, try to ellaborate as much as you can, to create something unique. ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE`;

  let TOKENS_USED = prompt?.length;
  if (previousPrompt) TOKENS_USED += previousPrompt.length;
  if (html) TOKENS_USED += html.length;

  const DEFAULT_PROVIDER = PROVIDERS.novita;
  const selectedProvider =
    provider === "auto"
      ? DEFAULT_PROVIDER
      : PROVIDERS[provider] ?? DEFAULT_PROVIDER;

  if (provider !== "auto" && TOKENS_USED >= selectedProvider.max_tokens) {
    return res.status(400).send({
      ok: false,
      openSelectProvider: true,
      message: `Context is too long. ${selectedProvider.name} allow ${selectedProvider.max_tokens} max tokens.`,
    });
  }

  if (selectedProvider.id === "local") {
    try {
      const { localApiKey, localApiUrl, localModel } = req.body;
      if (!localApiUrl || !localModel) {
        return res.status(400).send({
          ok: false,
          message: "Missing required fields for local provider, set localApiKey, localApiUrl, and localModel",
        });
      }
      const response = await fetch(`${localApiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localApiKey}`,
        },
        body: JSON.stringify({
          model: localModel,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...(previousPrompt
              ? [
                  {
                    role: "user",
                    content: previousPrompt,
                  },
                ]
              : []),
            ...(html
              ? [
                  {
                    role: "assistant",
                    content: `The current code is: ${html}.`,
                  },
                ]
              : []),
            {
              role: "user",
              content: prompt,
            },
          ],
          stream: true
        })
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Local API Error: ${response.status} - ${errorBody}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const message = JSON.parse(line.replace('data: ', ''));
            if(message.choices[0].delta.content) {
              res.write(message.choices[0].delta.content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
      res.end();
    } catch (error) {
      if (error.message.includes("exceeded your monthly included credits")) {
        return res.status(402).send({
          ok: false,
          openProModal: true,
          message: error.message,
        });
      }
      if (!res.headersSent) {
        res.status(500).send({
          ok: false,
          message:
            error.message || "An error occurred while processing your request.",
        });
      } else {
        // Otherwise end the stream
        res.end();
      }
    }
  } else if (
    selectedProvider.id === "openai" ||
    selectedProvider.id === "deepseek" ||
    selectedProvider.id === "openrouter" ||
    selectedProvider.id === "anthropic" ||
    selectedProvider.id === "together" ||
    selectedProvider.id === "groq" ||
    selectedProvider.id === "deepinfra" ||
    selectedProvider.id === "mistral" ||
    selectedProvider.id === "cohere"
  ) {
    try {
      const response = await fetch(`${selectedProvider.base_url}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedProvider.api_key}`,
        },
        body: JSON.stringify({
          model: selectedProvider.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...(previousPrompt
              ? [
                  {
                    role: "user",
                    content: previousPrompt,
                  },
                ]
              : []),
            ...(html
              ? [
                  {
                    role: "assistant",
                    content: `The current code is: ${html}.`,
                  },
                ]
              : []),
            {
              role: "user",
              content: prompt,
            },
          ],
          stream: true
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error (${selectedProvider.name}): ${response.status} - ${errorBody}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            // Eliminar 'data: ' si existe y manejar el caso de 'data: [DONE]'
            const cleanLine = line.replace('data: ', '');
            if (cleanLine === '[DONE]') continue;

            const message = JSON.parse(cleanLine);
            if (message.choices && message.choices[0].delta && message.choices[0].delta.content) {
              res.write(message.choices[0].delta.content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
      res.end();
    } catch (error) {
      if (error.message.includes("exceeded your monthly included credits")) {
        return res.status(402).send({
          ok: false,
          openProModal: true,
          message: error.message,
        });
      }
      if (!res.headersSent) {
        res.status(500).send({
          ok: false,
          message:
            error.message || "An error occurred while processing your request.",
        });
      } else {
        // Otherwise end the stream
        res.end();
      }
    }
  } else {
    // Existing HF inference code
    try {
      const chatCompletion = client.chatCompletionStream({
        model: MODEL_ID,
        provider: selectedProvider.id,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...(previousPrompt
            ? [
                {
                  role: "user",
                  content: previousPrompt,
                },
              ]
            : []),
          ...(html
            ? [
                {
                  role: "assistant",
                  content: `The current code is: ${html}.`,
                },
              ]
            : []),
          {
            role: "user",
            content: prompt,
          },
        ],
        ...(selectedProvider.id !== "sambanova"
          ? {
              max_tokens: selectedProvider.max_tokens,
            }
          : {}),
      });

      while (true) {
        const { done, value } = await chatCompletion.next();
        if (done) {
          break;
        }
        const chunk = value.choices[0]?.delta?.content;
        if (chunk) {
          if (provider !== "sambanova") {
            res.write(chunk);
            completeResponse += chunk;

            if (completeResponse.includes("</html>")) {
              break;
            }
          } else {
            let newChunk = chunk;
            if (chunk.includes("</html>")) {
              // Replace everything after the last </html> tag with an empty string
              newChunk = newChunk.replace(/<\/html>[\s\S]*/, "</html>");
            }
            completeResponse += newChunk;
            res.write(newChunk);
            if (newChunk.includes("</html>")) {
              break;
            }
          }
        }
      }
      // End the response stream
      res.end();
    } catch (error) {
      if (error.message.includes("exceeded your monthly included credits")) {
        return res.status(402).send({
          ok: false,
          openProModal: true,
          message: error.message,
        });
      }
      if (!res.headersSent) {
        res.status(500).send({
          ok: false,
          message:
            error.message || "An error occurred while processing your request.",
        });
      } else {
        // Otherwise end the stream
        res.end();
      }
    }
  }
});

app.get("/api/remix/:username/:repo", async (req, res) => {
  const { username, repo } = req.params;
  const { hf_token } = req.cookies;

  let token = hf_token || process.env.DEFAULT_HF_TOKEN;

  if (process.env.HF_TOKEN && process.env.HF_TOKEN !== "") {
    token = process.env.HF_TOKEN;
  }

  const repoId = `${username}/${repo}`;

  const url = `https://huggingface.co/spaces/${repoId}/raw/main/index.html`;
  try {
    const space = await spaceInfo({
      name: repoId,
      accessToken: token,
      additionalFields: ["author"],
    });

    if (!space || space.sdk !== "static" || space.private) {
      return res.status(404).send({
        ok: false,
        message: "Space not found",
      });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(404).send({
        ok: false,
        message: "Space not found",
      });
    }
    let html = await response.text();
    // remove the last p tag including this url https://enzostvs-deepsite.hf.space
    html = html.replace(getPTag(repoId), "");

    let user = null;

    if (token) {
      const request_user = await fetch(
        "https://huggingface.co/oauth/userinfo",
        {
          headers: {
            Authorization: `Bearer ${hf_token}`,
          },
        }
      )
        .then((res) => res.json())
        .catch(() => null);

      user = request_user;
    }

    res.status(200).send({
      ok: true,
      html,
      isOwner: space.author === user?.preferred_username,
      path: repoId,
    });
  } catch (error) {
    return res.status(500).send({
      ok: false,
      message: error.message,
    });
  }
});
// Rutas para proyectos locales
const PROJECTS_DIR = path.join(__dirname, "projects");

// Asegurarse de que la carpeta de proyectos exista
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// Guardar proyecto localmente
app.post("/api/save-local", async (req, res) => {
  const { html, title, assets } = req.body;

  if (!html || !title) {
    return res.status(400).send({
      ok: false,
      message: "Faltan campos requeridos (html y title)",
    });
  }

  try {
    // Crear un ID único para el proyecto basado en el título y la fecha
    const projectId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const projectDir = path.join(PROJECTS_DIR, projectId);

    // Crear la carpeta del proyecto
    fs.mkdirSync(projectDir, { recursive: true });

    // Guardar el archivo HTML principal
    fs.writeFileSync(path.join(projectDir, "index.html"), html);

    // Guardar metadatos del proyecto
    const metadata = {
      title,
      createdAt: new Date().toISOString(),
      id: projectId
    };
    fs.writeFileSync(path.join(projectDir, "metadata.json"), JSON.stringify(metadata, null, 2));

    // Guardar assets si existen
    if (assets && Array.isArray(assets)) {
      const assetsDir = path.join(projectDir, "assets");
      fs.mkdirSync(assetsDir, { recursive: true });

      for (const asset of assets) {
        if (asset.content && asset.filename) {
          fs.writeFileSync(path.join(assetsDir, asset.filename), asset.content);
        }
      }
    }

    return res.status(200).send({
      ok: true,
      projectId,
      message: "Proyecto guardado localmente con éxito"
    });
  } catch (error) {
    console.error("Error al guardar el proyecto localmente:", error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al guardar el proyecto localmente"
    });
  }
});

// Listar todos los proyectos locales
app.get("/api/local-projects", (req, res) => {
  try {
    const projects = [];

    // Leer todos los directorios en la carpeta de proyectos
    const projectDirs = fs.readdirSync(PROJECTS_DIR);

    for (const dir of projectDirs) {
      const metadataPath = path.join(PROJECTS_DIR, dir, "metadata.json");

      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
        projects.push(metadata);
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).send({
      ok: true,
      projects
    });
  } catch (error) {
    console.error("Error al listar proyectos locales:", error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al listar proyectos locales"
    });
  }
});

// Obtener un proyecto local específico
app.get("/api/local-projects/:projectId", (req, res) => {
  const { projectId } = req.params;
  const projectDir = path.join(PROJECTS_DIR, projectId);

  try {
    if (!fs.existsSync(projectDir)) {
      return res.status(404).send({
        ok: false,
        message: "Proyecto no encontrado"
      });
    }

    const metadataPath = path.join(projectDir, "metadata.json");
    const htmlPath = path.join(projectDir, "index.html");

    if (!fs.existsSync(metadataPath) || !fs.existsSync(htmlPath)) {
      return res.status(404).send({
        ok: false,
        message: "Archivos del proyecto no encontrados"
      });
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    const html = fs.readFileSync(htmlPath, "utf8");

    // Listar assets si existen
    const assetsDir = path.join(projectDir, "assets");
    let assets = [];

    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir);
      assets = assetFiles.map(file => ({
        filename: file,
        path: `/api/local-projects/${projectId}/assets/${file}`
      }));
    }

    return res.status(200).send({
      ok: true,
      project: {
        ...metadata,
        html,
        assets
      }
    });
  } catch (error) {
    console.error(`Error al obtener el proyecto ${projectId}:`, error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al obtener el proyecto"
    });
  }
});

// Obtener un archivo específico de un proyecto
app.get("/api/local-projects/:projectId/assets/:filename", (req, res) => {
  const { projectId, filename } = req.params;
  const filePath = path.join(PROJECTS_DIR, projectId, "assets", filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({
        ok: false,
        message: "Archivo no encontrado"
      });
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error(`Error al obtener el archivo ${filename}:`, error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al obtener el archivo"
    });
  }
});

// Listar todos los archivos de un proyecto
app.get("/api/local-projects/:projectId/files", (req, res) => {
  const { projectId } = req.params;
  const projectDir = path.join(PROJECTS_DIR, projectId);

  try {
    if (!fs.existsSync(projectDir)) {
      return res.status(404).send({
        ok: false,
        message: "Proyecto no encontrado"
      });
    }

    const files = [];

    // Añadir el archivo HTML principal
    const htmlPath = path.join(projectDir, "index.html");
    if (fs.existsSync(htmlPath)) {
      files.push({
        name: "index.html",
        path: `/api/local-projects/${projectId}/download/index.html`,
        type: "html",
        size: fs.statSync(htmlPath).size
      });
    }

    // Añadir los metadatos
    const metadataPath = path.join(projectDir, "metadata.json");
    if (fs.existsSync(metadataPath)) {
      files.push({
        name: "metadata.json",
        path: `/api/local-projects/${projectId}/download/metadata.json`,
        type: "json",
        size: fs.statSync(metadataPath).size
      });
    }

    // Añadir assets si existen
    const assetsDir = path.join(projectDir, "assets");
    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir);

      for (const file of assetFiles) {
        const filePath = path.join(assetsDir, file);
        const stat = fs.statSync(filePath);

        files.push({
          name: file,
          path: `/api/local-projects/${projectId}/download/assets/${file}`,
          type: path.extname(file).substring(1) || "unknown",
          size: stat.size
        });
      }
    }

    return res.status(200).send({
      ok: true,
      files
    });
  } catch (error) {
    console.error(`Error al listar archivos del proyecto ${projectId}:`, error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al listar archivos del proyecto"
    });
  }
});

// Descargar un archivo específico de un proyecto
app.get("/api/local-projects/:projectId/download/:filename", (req, res) => {
  const { projectId, filename } = req.params;
  const filePath = path.join(PROJECTS_DIR, projectId, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({
        ok: false,
        message: "Archivo no encontrado"
      });
    }

    return res.download(filePath);
  } catch (error) {
    console.error(`Error al descargar el archivo ${filename}:`, error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al descargar el archivo"
    });
  }
});

// Descargar un asset específico de un proyecto
app.get("/api/local-projects/:projectId/download/assets/:filename", (req, res) => {
  const { projectId, filename } = req.params;
  const filePath = path.join(PROJECTS_DIR, projectId, "assets", filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({
        ok: false,
        message: "Archivo no encontrado"
      });
    }

    return res.download(filePath);
  } catch (error) {
    console.error(`Error al descargar el asset ${filename}:`, error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al descargar el asset"
    });
  }
});

// Descargar todo el proyecto como ZIP
app.get("/api/local-projects/:projectId/download-zip", (req, res) => {
  const { projectId } = req.params;
  const projectDir = path.join(PROJECTS_DIR, projectId);

  try {
    if (!fs.existsSync(projectDir)) {
      return res.status(404).send({
        ok: false,
        message: "Proyecto no encontrado"
      });
    }

    // Aquí implementaríamos la creación del archivo ZIP
    // Por simplicidad, esto requeriría una biblioteca adicional como 'archiver'
    // Por ahora, devolvemos un mensaje indicando que esta funcionalidad está pendiente

    return res.status(501).send({
      ok: false,
      message: "Funcionalidad de descarga ZIP pendiente de implementar"
    });
  } catch (error) {
    console.error(`Error al crear ZIP del proyecto ${projectId}:`, error);
    return res.status(500).send({
      ok: false,
      message: error.message || "Error al crear ZIP del proyecto"
    });
  }
});

// Ruta para servir la aplicación React
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
