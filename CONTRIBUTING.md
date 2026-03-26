# Contributing Guide

Thank you for contributing to Instant Translator.

## Before You Start

- Read `README.md`
- Search existing issues and pull requests
- For larger changes, open an issue first to discuss scope

## Development Setup

1. Fork and clone the repository.
2. Create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
3. Load extension in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select project folder

## Commit Convention

Use format:

`type(scope): description`

Allowed types:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`

Examples:

- `feat(extension): add shortcut toggle`
- `fix(tooltip): prevent overflow on small screens`
- `docs(readme): clarify setup steps`

## Pull Request Process

1. Keep PR focused on one topic.
2. Fill in the PR template completely.
3. Include test steps and expected results.
4. Add screenshots/GIF if UI behavior changed.
5. Ensure no secrets or API keys are included.

## Code Quality Guidelines

- Follow SOLID and DRY principles
- Prefer readable and explicit naming
- Keep functions small and focused
- Avoid unnecessary dependencies

## Security

- Do not commit any API keys
- Do not store secrets in source files
- Report vulnerabilities privately to the repository owner
