# Website Update Channel

This repository is the source of truth for DigiScience Techsol website updates.

## Operating model
1. Founder gives business instruction in ChatGPT.
2. Assistant converts the instruction into website content and code changes.
3. Changes are tracked through GitHub issues and branches.
4. Cloudflare deploys the website from GitHub.
5. Production changes should remain recoverable through Git history.

## Current control issue
- Issue #2: Set up AI-first website update channel

## Current redesign branch
- ai-first-redesign

## Safety rules
- Do not share passwords, API tokens, private keys, or production secrets in chat.
- Use GitHub and Cloudflare role-based integrations instead of pasted credentials.
- Keep website changes traceable through commits, branches, issues, or pull requests.
