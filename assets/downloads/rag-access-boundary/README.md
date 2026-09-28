# Permission-aware retrieval: fictional local boundary example

DigiScience Techsol | Version 1.0 | 28 September 2026

This is an original, dependency-free teaching example. All identities, documents and policy records are fictional and public. It prepares a permitted context list from an in-memory document fixture; it does not implement semantic search, call a model or connect to Azure, AWS or any other service.

## Run and inspect

Use Node.js 22 or later. From this directory:

    node test-access-boundary.mjs
    node test-access-boundary.mjs --check-recorded

The first command emits the actual result alongside the expected result for each case. The second also checks that the saved results.json agrees with a fresh execution. An assertion failure exits nonzero. No dependencies, credentials, uploads or network access are required. Read the source before adapting it.

The 16 cases exercise allowed context, restricted exact document lookup, tenant separation, missing identity, missing/malformed permissions, policy updates, ignored client scope fields and ambiguous source IDs. A negative control deliberately omits ACL checks in an isolated test expression; the oracle detects unauthorized context. That unsafe expression is not an alternative runtime mode.

## What the boundary means

The caller supplies an authenticatedPrincipalId assumed to have been verified upstream. A trusted server-side policy maps that ID to an active tenant and group membership. Both matching tenant and permitted group are required before any document text enters the returned context. Citation IDs derive only from that context. Missing permissions do not imply public access.

Group removal, account deactivation and changed document ACL tests supply an updated local policy/document snapshot. They do not demonstrate real-time cloud revocation, identity-token expiry, propagation delay or race handling. Extra browser-style group, tenant and filter fields are ignored; a real application must authenticate identity and protect its own policy sources.

An instruction in a permitted document cannot modify this deterministic function. No generative model is involved, so this is not a prompt-injection resistance test. Relevance ranking, response generation, model retention, logging, identity-provider validation, vector-index ACL synchronization, shared caches, conversation history, access to citation destinations, network isolation and operations still require separate design and tests. Do not deploy this sample as a security boundary.

## Architecture and provider mapping

Application sign-in → server authorization using current policy → permission-scoped retrieval → permitted context and source IDs → separately governed model request → human-reviewed answer. Ingestion must preserve source permissions on every chunk and synchronize changes. Private networking is a separate transport control.

Microsoft describes security filters as string matching, distinct from built-in token-based document permission enforcement. Some native ACL integrations are preview; verify the current service/API/source support before selecting one:
https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search
https://learn.microsoft.com/en-us/azure/search/search-document-level-access-overview

Azure private endpoints provide a private network route; public network access is a separate setting:
https://learn.microsoft.com/en-us/azure/search/service-create-private-endpoint

AWS supports explicit metadata filtering; supported operators depend on the vector store. Construct mandatory access filters from trusted authorization decisions, not from user text or a model-generated relevance filter:
https://docs.aws.amazon.com/bedrock/latest/userguide/kb-test-config.html
https://aws.amazon.com/blogs/machine-learning/access-control-for-vector-stores-using-metadata-filtering-with-knowledge-bases-for-amazon-bedrock/

AWS endpoint policies constrain principals/actions/resources on the private path. They are not the per-document policy demonstrated here:
https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html

References checked 28 September 2026. This sample is not provider-endorsed, certified, audited or evidence of customer results.
