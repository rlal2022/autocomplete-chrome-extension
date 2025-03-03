const API_URL = "http://localhost:3000/api/generate";
const debounce = _.debounce;

const state = {
  currentInput: "",
  currentSuggestion: "",
};

const isValidTarget = (target) =>
  target.tagName === "TEXTAREA" || target.isContentEditable;

// Creates or gets a span to display suggestions

function createSuggestionElement() {
  const id = "display-suggestion";
  let element = document.getElementById(id);

  if (!element) {
    element = document.createElement("span");
    element.id = id;
    element.style.cssText = `
      position: absolute;
      pointer-events: none;
      color: #888;
      background: transparent;
      white-space: pre-wrap;
      overflow: hidden;
      z-index: 999999;
    `;
    document.body.appendChild(element);
  }

  return element;
}

// Place the span element over the target element

function updatePosition(target, element) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
  const rect = target.getBoundingClientRect();
  // Get CSS of the target element
  const style = window.getComputedStyle(target);

  Object.assign(element.style, {
    font: style.font,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    padding: style.padding,
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
}

const mergeSuggestion = (text, suggestion) => {
  const lastWord = text.match(/\S+$/);
  if (lastWord) {
    const lastWordMatches = lastword[0];
    return text.slice(0, -lastWordMatches.length) + suggestion;
  }
  return text + suggestion;
};

const fetchSuggestion = debounce(async (text, target) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
    });
    const data = await res.json();

    if (data.response) {
      let suggestion = data.response;
      let fullSuggestion;

      // Checks if we need to replace the last partial word
      if (!text.endsWith(" ") && text.trim().length > 0) {
        const lastSpaceIndex = text.lastIndexOf(" ");
        const baseText =
          lastSpaceIndex === -1 ? "" : text.substring(0, lastSpaceIndex + 1);

        fullSuggestion = baseText + suggestion;
      } else {
        // Add a space if the suggestion doesn't start with one
        const addSpace = !text.endsWith(" ") && !suggestion.startsWith(" ");
        fullSuggestion = text + (addSpace ? " " : "") + suggestion;
      }

      if (fullSuggestion !== text) {
        const element = createSuggestionElement();
        state.currentSuggestion = fullSuggestion;
        element.textContent = fullSuggestion;
        element.style.display = "block";
        updatePosition(target, element);
      }
    }
  } catch (err) {
    console.error("Suggestion error:", err);
    clearSuggestion();
  }
}, 800); // Debounce time

function clearSuggestion() {
  state.currentSuggestion = "";
  const element = document.getElementById("display-suggestion");
  if (element) element.style.display = "none";
}

function handleInput(e) {
  const text = e.target.isContentEditable
    ? e.target.textContent
    : e.target.value;
  state.currentInput = text;

  if (state.currentSuggestion) clearSuggestion();
  if (text.trim()) fetchSuggestion(text, e.target);
}

function handleKeydown(e) {
  if (e.key === "Tab" && state.currentSuggestion) {
    e.preventDefault();
    e.target[e.target.isContentEditable ? "textContent" : "value"] =
      state.currentSuggestion;
    clearSuggestion();

    if (e.target.isContentEditable) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    }
  }
}

// Event listeners

document.addEventListener(
  "input",
  (e) => isValidTarget(e.target) && handleInput(e)
);
document.addEventListener(
  "keydown",
  (e) => isValidTarget(e.target) && handleKeydown(e)
);

window.addEventListener(
  "scroll",
  () => {
    const element = document.getElementById("display-suggestion");
    const target = document.activeElement;
    if (element?.style.display !== "none" && isValidTarget(target)) {
      updatePosition(target, element);
    }
  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    const element = document.getElementById("display-suggestion");
    const target = document.activeElement;
    if (element?.style.display !== "none" && isValidTarget(target)) {
      updatePosition(target, element);
    }
  },
  { passive: true }
);
