/** Fictional local policy example, not an authentication service or production RAG implementation. */
const strings = value => Array.isArray(value) && value.length > 0 && value.every(x => typeof x === 'string' && x.length > 0);
const owns = (object, key) => object !== null && typeof object === 'object' && Object.hasOwn(object, key);

export function prepareContext({ authenticatedPrincipalId, requestedIds, policy, documents }) {
  // Caller must supply an already verified identity. This sample DOES NOT verify a login or token.
  // There is deliberately no client-supplied group/tenant/filter argument.
  const denied = { status: 'denied', context: [], citations: [] };
  if (typeof authenticatedPrincipalId !== 'string' || !owns(policy?.principals, authenticatedPrincipalId)) return denied;
  const principal = policy.principals[authenticatedPrincipalId];
  if (!principal || principal.active !== true || typeof principal.tenant !== 'string' || !principal.tenant || !strings(principal.groups)) return denied;
  if (!strings(requestedIds) || !Array.isArray(documents)) return denied;
  // Validate policy metadata per document; absent or malformed metadata never grants access.
  const permitted = documents.filter(doc => doc && typeof doc.id === 'string' && requestedIds.includes(doc.id)
    && doc.tenant === principal.tenant && strings(doc.allowedGroups)
    && doc.allowedGroups.some(group => principal.groups.includes(group))
    && typeof doc.text === 'string' && doc.text.length > 0);
  // A duplicate ID would make citation identity ambiguous; reject the whole request.
  if (new Set(documents.map(doc => doc?.id)).size !== documents.length) return denied;
  const context = permitted.map(doc => ({ id: doc.id, text: doc.text }));
  return { status: context.length ? 'context-ready' : 'insufficient-authorized-evidence', context, citations: context.map(doc => doc.id) };
}
