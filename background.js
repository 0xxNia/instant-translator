const DEFAULT_SETTINGS = {
  apiKey: "",
  targetLang: "RU",
  enabled: true,
  notionEnabled: false,
  notionToken: "",
  notionDatabaseId: ""
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

chrome.commands.onCommand.addListener((command) => {
  if (command !== "save-selection-to-notion") {
    return;
  }

  void handleCommandSaveSelection();
});

async function handleCommandSaveSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id) {
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_SELECTION_TEXT" });
    const selectedText = (response?.text || "").trim();
    if (!selectedText) {
      await setTemporaryBadge("NO TXT", "#9e9e9e");
      return;
    }

    const translatedText = await handleTranslate(selectedText);
    await saveToNotion({
      sourceText: selectedText,
      translatedText,
      pageUrl: tab.url || "",
      pageTitle: tab.title || ""
    });

    await setTemporaryBadge("SAVED", "#1f8b4c");
  } catch (_error) {
    await setTemporaryBadge("ERROR", "#c81d25");
  }
}

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

async function saveToNotion({ sourceText, translatedText, pageUrl, pageTitle }) {
  const { notionEnabled, notionToken, notionDatabaseId, targetLang } =
    await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));

  if (!notionEnabled) {
    throw new Error("Notion sync is disabled.");
  }

  if (!notionToken) {
    throw new Error("Notion token is missing.");
  }

  if (!notionDatabaseId) {
    throw new Error("Notion database ID is missing.");
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      parent: { database_id: notionDatabaseId },
      properties: {
        Word: {
          title: [{ text: { content: sourceText.slice(0, 2000) } }]
        },
        Translation: {
          rich_text: [{ text: { content: translatedText.slice(0, 2000) } }]
        },
        TargetLang: {
          rich_text: [{ text: { content: targetLang || DEFAULT_SETTINGS.targetLang } }]
        },
        SourceURL: pageUrl
          ? {
              url: pageUrl
            }
          : undefined,
        SourceTitle: {
          rich_text: [{ text: { content: (pageTitle || "").slice(0, 2000) } }]
        }
      }
    })
  });

  if (!response.ok) {
    const details = await safeJson(response);
    const message = details?.message || `Notion request failed (${response.status})`;
    throw new Error(message);
  }
}

async function setTemporaryBadge(text, color) {
  await chrome.action.setBadgeBackgroundColor({ color });
  await chrome.action.setBadgeText({ text });
  setTimeout(() => {
    void chrome.action.setBadgeText({ text: "" });
  }, 2000);
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
