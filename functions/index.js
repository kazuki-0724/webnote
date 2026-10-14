const {onRequest, onCall, HttpsError} =
  require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello World function was called");
  response.status(200).send("Hello from Firebase Functions!");
});

exports.geminiAPI = onCall(
    {secrets: [geminiApiKey]},
    async (request) => {
    //   if (!request.auth) {
    //     throw new HttpsError("unauthenticated", "ログインが必要です。");
    //   }

      const prompt = request.data && request.data.prompt;
      if (typeof prompt !== "string" || !prompt.trim()) {
        throw new HttpsError("invalid-argument", "prompt を指定してください。");
      }
      if (prompt.length > 10000) {
        throw new HttpsError("invalid-argument", "prompt が長すぎます。");
      }

      const geminiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiApiKey.value(),
            },
            body: JSON.stringify({
              contents: [{parts: [{text: prompt}]}],
            }),
          },
      );

      if (!geminiResponse.ok) {
        logger.error("Gemini API request failed", {
          status: geminiResponse.status,
        });
        throw new HttpsError("unavailable", "Gemini API の呼び出しに失敗しました。");
      }

      const result = await geminiResponse.json();
      const candidate = result.candidates && result.candidates[0];
      const parts = candidate && candidate.content && candidate.content.parts;
      const text = parts && parts
          .map((part) => part.text || "")
          .join("");

      if (!text) {
        throw new HttpsError("failed-precondition", "Gemini から回答を取得できませんでした。");
      }

      return {text};
    },
);
