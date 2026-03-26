(function () {
  const TOOLTIP_ID = "instant-selection-translator-tooltip";
  const MAX_TEXT_LENGTH = 600;
  const DEBOUNCE_MS = 300;

  let debounceTimer = null;
  let lastSelection = "";
  let tooltipEl = null;
  let tooltipLocked = false;

  document.addEventListener("selectionchange", () => {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      void handleSelection();
    }, DEBOUNCE_MS);
  });

  document.addEventListener("mousedown", (event) => {
    if (tooltipEl && !tooltipEl.contains(event.target)) {
      hideTooltip();
    }
  });

  async function handleSelection() {
    const selectedText = getSelectedText();

    if (!selectedText) {
      hideTooltip();
      return;
    }

    if (selectedText === lastSelection) {
      return;
    }

    lastSelection = selectedText;
    showTooltip("Translating...", selectedText);

    try {
      const result = await chrome.runtime.sendMessage({
        type: "TRANSLATE_SELECTION",
        text: selectedText.slice(0, MAX_TEXT_LENGTH)
      });

      if (!result?.ok) {
        showTooltip(result?.error || "Translation failed.", selectedText, true);
        return;
      }

      showTooltip(result.translatedText, selectedText);
    } catch (_error) {
      showTooltip("Extension error. Reload the page and try again.", selectedText, true);
    }
  }

  function getSelectedText() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return "";
    }

    const text = selection.toString().trim();
    if (!text) {
      return "";
    }

    return text.replace(/\s+/g, " ");
  }

  function showTooltip(translatedText, sourceText, isError = false) {
    if (!tooltipEl) {
      tooltipEl = createTooltip();
      document.documentElement.appendChild(tooltipEl);
    }

    const sourceEl = tooltipEl.querySelector(".ist-source");
    const translatedEl = tooltipEl.querySelector(".ist-translation");
    if (!sourceEl || !translatedEl) {
      return;
    }

    sourceEl.textContent = sourceText;
    translatedEl.textContent = translatedText;
    translatedEl.classList.toggle("ist-error", isError);

    placeTooltipNearSelection(tooltipEl);
    tooltipEl.classList.add("ist-visible");
  }

  function hideTooltip() {
    if (!tooltipEl || tooltipLocked) {
      return;
    }
    tooltipEl.classList.remove("ist-visible");
    lastSelection = "";
  }

  function createTooltip() {
    const wrapper = document.createElement("div");
    wrapper.id = TOOLTIP_ID;
    wrapper.className = "ist-tooltip";

    const source = document.createElement("div");
    source.className = "ist-source";

    const separator = document.createElement("div");
    separator.className = "ist-separator";

    const translated = document.createElement("div");
    translated.className = "ist-translation";

    const controls = document.createElement("div");
    controls.className = "ist-controls";

    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.textContent = "Pin";
    pinBtn.addEventListener("click", () => {
      tooltipLocked = !tooltipLocked;
      pinBtn.textContent = tooltipLocked ? "Unpin" : "Pin";
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      tooltipLocked = false;
      pinBtn.textContent = "Pin";
      hideTooltip();
    });

    controls.appendChild(pinBtn);
    controls.appendChild(closeBtn);

    wrapper.appendChild(source);
    wrapper.appendChild(separator);
    wrapper.appendChild(translated);
    wrapper.appendChild(controls);
    return wrapper;
  }

  function placeTooltipNearSelection(element) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const pageX = window.scrollX;
    const pageY = window.scrollY;

    let top = rect.bottom + pageY + 8;
    let left = rect.left + pageX;

    const maxLeft = pageX + window.innerWidth - element.offsetWidth - 8;
    left = Math.max(pageX + 8, Math.min(left, maxLeft));

    if (top + element.offsetHeight > pageY + window.innerHeight - 8) {
      top = rect.top + pageY - element.offsetHeight - 8;
    }

    if (top < pageY + 8) {
      top = pageY + 8;
    }

    element.style.top = `${top}px`;
    element.style.left = `${left}px`;
  }
})();
