const DEFAULT_SETTINGS = {
  apiKey: "",
  targetLang: "RU",
  enabled: true
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  const next = { ...DEFAULT_SETTINGS, ...current };
  await chrome.storage.sync.set(next);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "TRANSLATE_SELECTION") {
    return false;
  }

  handleTranslate(message.text)
    .then((translatedText) => sendResponse({ ok: true, translatedText }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

async function handleTranslate(text) {
  const { apiKey, targetLang, enabled } = await chrome.storage.sync.get(
    Object.keys(DEFAULT_SETTINGS)
  );

  if (!enabled) {
    throw new Error("Auto-translation is disabled.");
  }

  if (!apiKey) {
    throw new Error("API key is missing. Set it in extension options.");
  }

  const payload = new URLSearchParams({
    text,
    target_lang: targetLang || DEFAULT_SETTINGS.targetLang
  });

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString()
  });

  if (!response.ok) {
    const details = await safeJson(response);
    const message = details?.message || `DeepL request failed (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  const translatedText = data?.translations?.[0]?.text;

  if (!translatedText) {
    throw new Error("Translation response is empty.");
  }

  return translatedText;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
