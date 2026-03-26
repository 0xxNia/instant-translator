const DEFAULTS = {
  apiKey: "",
  targetLang: "RU",
  enabled: true,
  notionEnabled: false,
  notionToken: "",
  notionDatabaseId: ""
};

const apiKeyInput = document.getElementById("apiKey");
const targetLangSelect = document.getElementById("targetLang");
const enabledInput = document.getElementById("enabled");
const notionEnabledInput = document.getElementById("notionEnabled");
const notionTokenInput = document.getElementById("notionToken");
const notionDatabaseIdInput = document.getElementById("notionDatabaseId");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

void loadSettings();
saveBtn.addEventListener("click", () => {
  void saveSettings();
});

async function loadSettings() {
  const settings = await chrome.storage.sync.get(Object.keys(DEFAULTS));
  const next = { ...DEFAULTS, ...settings };

  apiKeyInput.value = next.apiKey;
  targetLangSelect.value = next.targetLang;
  enabledInput.checked = Boolean(next.enabled);
  notionEnabledInput.checked = Boolean(next.notionEnabled);
  notionTokenInput.value = next.notionToken;
  notionDatabaseIdInput.value = next.notionDatabaseId;
}

async function saveSettings() {
  const payload = {
    apiKey: apiKeyInput.value.trim(),
    targetLang: targetLangSelect.value,
    enabled: enabledInput.checked,
    notionEnabled: notionEnabledInput.checked,
    notionToken: notionTokenInput.value.trim(),
    notionDatabaseId: notionDatabaseIdInput.value.trim()
  };

  await chrome.storage.sync.set(payload);
  showStatus("Saved.");
}

function showStatus(message) {
  statusEl.textContent = message;
  window.setTimeout(() => {
    statusEl.textContent = "";
  }, 1500);
}
