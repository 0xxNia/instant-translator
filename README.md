# Instant Translator

Browser extension for instant translation of selected text using DeepL API.

## Features

- Instant translation right after text selection
- Floating tooltip near selected text
- Configurable target language
- Toggle auto-translation on/off
- Uses DeepL API for translation quality

## Project Structure

- `manifest.json` - Chrome extension manifest (MV3)
- `content.js` - Handles selection events and tooltip UI
- `background.js` - Handles API requests and settings
- `styles.css` - Tooltip styles
- `options.html` - Extension settings page UI
- `options.js` - Settings persistence logic

## Requirements

- Google Chrome (or Chromium-based browser with MV3 support)
- DeepL API key (Free or Pro)

## Local Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd instant-translator
   ```
2. Open Chrome extensions page:
   - `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the project folder

## Configure DeepL API

1. Open extension details in `chrome://extensions/`
2. Click **Extension options**
3. Paste your DeepL API key
4. Choose target language
5. Click **Save settings**

> Note: Current implementation uses `https://api-free.deepl.com`, intended for DeepL Free API keys.

## Usage

1. Open any webpage
2. Select text with your mouse
3. Translation tooltip appears automatically near selection

## Security Notes

- Never commit API keys to the repository
- Keep keys only in browser extension storage
- Rotate key if you suspect leakage

## Contributing

Please review `CONTRIBUTING.md` before opening issues or pull requests.

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature
   ```
3. Commit using conventional format:
   - `feat(scope): description`
   - `fix(scope): description`
   - `docs(scope): description`
   - `refactor(scope): description`
   - `test(scope): description`
4. Open a Pull Request with:
   - clear summary
   - screenshots/GIF for UI changes
   - test steps

## Code of Conduct

Please read `CODE_OF_CONDUCT.md` before participating in discussions or reviews.

## Roadmap

- Add supported sites allowlist/blocklist
- Add keyboard shortcut toggle
- Add translation cache for repeated text
- Add richer language list and auto-detect enhancements

## License

MIT (you can replace with your preferred license).
