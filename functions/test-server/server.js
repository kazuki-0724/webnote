const fs = require("fs");
const http = require("http");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.API_TEST_SERVER_PORT || 5179);
const maxRequestSize = 1024 * 1024;
const maxResponseSize = 1024 * 1024;
const allowedMethods = new Set([
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
]);
const restrictedHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "transfer-encoding",
]);
const html = fs.readFileSync(path.join(__dirname, "index.html"));

/**
 * Creates an HTTP error with a status code.
 * @param {number} statusCode HTTP status code.
 * @param {string} message Error message.
 * @return {Error} The annotated error.
 */
function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Sends a JSON response without caching it.
 * @param {!http.ServerResponse} response HTTP response.
 * @param {number} statusCode HTTP status code.
 * @param {*} value JSON response value.
 */
function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

/**
 * Reads and parses a size-limited JSON request body.
 * @param {!http.IncomingMessage} request HTTP request.
 * @return {!Promise<*>} Parsed request data.
 */
async function readJsonRequest(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxRequestSize) {
      throw createError(413, "リクエストが大きすぎます。");
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    throw createError(400, "リクエスト本文は JSON で指定してください。");
  }
}

/**
 * Restricts test targets to Firebase Functions and its emulator.
 * @param {*} value Requested URL.
 * @return {!URL} Validated endpoint.
 */
function validateEndpoint(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw createError(400, "エンドポイント URL を入力してください。");
  }

  let endpoint;
  try {
    endpoint = new URL(value);
  } catch (error) {
    throw createError(400, "有効なエンドポイント URL を入力してください。");
  }

  if (endpoint.username || endpoint.password || endpoint.hash) {
    throw createError(400, "認証情報やフラグメント付き URL は使えません。");
  }

  const isEmulator = endpoint.protocol === "http:" &&
    (endpoint.hostname === "127.0.0.1" ||
      endpoint.hostname === "localhost") &&
    endpoint.port === "5001";
  const isDeployedFunction = endpoint.protocol === "https:" &&
    (endpoint.hostname.endsWith(".cloudfunctions.net") ||
      endpoint.hostname.endsWith(".a.run.app")) &&
    !endpoint.port;

  if (!isEmulator && !isDeployedFunction) {
    throw createError(
        400,
        "Functions Emulator または Firebase Functions の URL のみ指定できます。",
    );
  }

  return endpoint;
}

/**
 * Validates and normalizes request headers.
 * @param {*} value Requested headers.
 * @return {!Headers} Normalized headers.
 */
function parseHeaders(value) {
  if (value === undefined || value === null) {
    return new Headers();
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw createError(400, "ヘッダーは JSON オブジェクトで指定してください。");
  }

  const entries = Object.entries(value);
  for (const [name, headerValue] of entries) {
    if (typeof headerValue !== "string") {
      throw createError(400, "ヘッダーの値は文字列で指定してください。");
    }
    if (restrictedHeaders.has(name.toLowerCase())) {
      throw createError(400, `${name} ヘッダーは指定できません。`);
    }
  }

  try {
    return new Headers(value);
  } catch (error) {
    throw createError(400, "有効な HTTP ヘッダーを指定してください。");
  }
}

/**
 * Parses the data object sent to an onCall function.
 * @param {*} value Callable request body.
 * @return {!Object} Callable data.
 */
function parseCallableData(value) {
  if (typeof value !== "string" || !value.trim()) {
    return {};
  }

  let data;
  try {
    data = JSON.parse(value);
  } catch (error) {
    throw createError(400, "Callable の入力は JSON で指定してください。");
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw createError(400, "Callable の入力は JSON オブジェクトにしてください。");
  }
  return data;
}

/**
 * Reads a response body with a size limit for display.
 * @param {!Response} response Upstream response.
 * @return {!Promise<{text: string, truncated: boolean}>} Body and
 *     truncation flag.
 */
async function readResponseBody(response) {
  if (!response.body) {
    return {text: "", truncated: false};
  }

  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  let truncated = false;

  while (size <= maxResponseSize) {
    const {done, value} = await reader.read();
    if (done) {
      break;
    }

    const remaining = maxResponseSize - size;
    const length = Math.min(remaining, value.byteLength);
    if (length > 0) {
      chunks.push(Buffer.from(value.subarray(0, length)));
      size += length;
    }
    if (length < value.byteLength) {
      truncated = true;
      await reader.cancel();
      break;
    }
  }

  return {
    text: Buffer.concat(chunks).toString("utf8"),
    truncated,
  };
}

/**
 * Validates a test request and forwards it to the selected function.
 * @param {!http.IncomingMessage} request HTTP request.
 * @param {!http.ServerResponse} response HTTP response.
 */
async function handleApiRequest(request, response) {
  const origin = request.headers.origin;
  if (origin && origin !== `http://${host}:${port}`) {
    throw createError(403, "このオリジンからのリクエストは許可されません。");
  }

  const input = await readJsonRequest(request);
  const endpoint = validateEndpoint(input.url);
  const mode = input.mode === undefined ? "http" : input.mode;
  if (mode !== "http" && mode !== "callable") {
    throw createError(400, "HTTP または Callable を選択してください。");
  }

  const method = String(input.method || "GET").toUpperCase();
  if (!allowedMethods.has(method)) {
    throw createError(400, "サポートされていない HTTP メソッドです。");
  }
  if (mode === "callable" && method !== "POST") {
    throw createError(400, "Callable 関数は POST で呼び出してください。");
  }

  const headers = parseHeaders(input.headers);
  let body;

  if (mode === "callable") {
    body = JSON.stringify({data: parseCallableData(input.body)});
    if (!headers.has("content-type")) {
      headers.set("Content-Type", "application/json");
    }
  } else if (typeof input.body === "string" && input.body.length > 0) {
    if (method === "GET" || method === "HEAD") {
      throw createError(400, `${method} リクエストに本文は指定できません。`);
    }
    body = input.body;
    if (!headers.has("content-type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  let upstream;
  const startedAt = Date.now();
  try {
    upstream = await fetch(endpoint, {
      body,
      headers,
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    const statusCode = error.name === "TimeoutError" ? 504 : 502;
    const message = statusCode === 504 ?
      "エンドポイントがタイムアウトしました。" :
      "エンドポイントに接続できませんでした。";
    throw createError(statusCode, message);
  }

  const responseBody = await readResponseBody(upstream);
  sendJson(response, 200, {
    body: responseBody.text,
    durationMs: Date.now() - startedAt,
    headers: Object.fromEntries(upstream.headers.entries()),
    status: upstream.status,
    statusText: upstream.statusText,
    truncated: responseBody.truncated,
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${host}:${port}`);

  if (request.method === "GET" && requestUrl.pathname === "/") {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(html);
    return;
  }

  if (request.method !== "POST" || requestUrl.pathname !== "/api/request") {
    sendJson(response, 404, {error: "Not found"});
    return;
  }

  try {
    await handleApiRequest(request, response);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ?
      error.message :
      "テストサーバーでエラーが発生しました。";
    sendJson(response, statusCode, {error: message});
  }
});

server.listen(port, host, () => {
  console.log(`API test server: http://${host}:${port}`);
});

module.exports = server;
