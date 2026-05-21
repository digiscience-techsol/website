# DigiScience AI Assistant Cloudflare Worker

This Worker powers the website LLM chatbot without exposing an AI provider key in the static frontend.

## Runtime behavior

- Endpoint: `POST /assistant`
- Expected request: `{ "question": "...", "page": "...", "transcript": [...] }`
- Response: `{ "answer": "...", "captureLead": true|false }`
- The website shows the lead form when `captureLead` is true.
- If `OPENAI_API_KEY` is missing or the model request fails, the Worker returns a safe knowledge-base fallback answer.

## Model options

The Worker supports two backend options:

1. Cloudflare Workers AI binding named `AI`.
2. OpenAI through a Cloudflare secret named `OPENAI_API_KEY`.

If neither is configured, the Worker still returns a safe curated fallback answer, but it is not a true LLM response.

## Required secret when using OpenAI

- `OPENAI_API_KEY`

Do not place this key in `config.js`, GitHub, HTML, or browser JavaScript.

## Optional Cloudflare variables

- `OPENAI_MODEL`, default: `gpt-5-mini`
- `CF_AI_MODEL`, default: `@cf/meta/llama-3.1-8b-instruct`

## Frontend activation

After the Worker is deployed, set this in `config.js`:

```js
assistantEndpointUrl: 'https://<worker-url>/assistant'
```

Then push the website update so production starts using the LLM backend.
