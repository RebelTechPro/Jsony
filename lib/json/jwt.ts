export type JwtPart = {
  raw: string;
  decoded: string;
  parsed?: unknown;
  parseError?: string;
};

export type JwtResult =
  | {
      ok: true;
      header: JwtPart;
      payload: JwtPart;
      signature: { raw: string };
      claims: KnownClaims;
    }
  | { ok: false; error: string };

export type KnownClaims = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: { value: number; date: string; expired: boolean };
  iat?: { value: number; date: string };
  nbf?: { value: number; date: string; active: boolean };
  jti?: string;
};

export function decodeJwt(input: string): JwtResult {
  const trimmed = input.trim().replace(/^Bearer\s+/i, "");
  if (trimmed === "") {
    return { ok: false, error: "Token is empty." };
  }

  const segments = trimmed.split(".");
  if (segments.length !== 3) {
    return {
      ok: false,
      error: `Expected 3 dot-separated segments (header.payload.signature). Got ${segments.length}.`,
    };
  }

  const [headerSeg, payloadSeg, signatureSeg] = segments;

  const headerDecoded = base64UrlDecode(headerSeg);
  if (!headerDecoded.ok) {
    return { ok: false, error: `Header decode failed: ${headerDecoded.error}` };
  }
  const payloadDecoded = base64UrlDecode(payloadSeg);
  if (!payloadDecoded.ok) {
    return {
      ok: false,
      error: `Payload decode failed: ${payloadDecoded.error}`,
    };
  }

  const header = parseJsonPart(headerSeg, headerDecoded.value);
  const payload = parseJsonPart(payloadSeg, payloadDecoded.value);

  return {
    ok: true,
    header,
    payload,
    signature: { raw: signatureSeg },
    claims: extractClaims(payload.parsed),
  };
}

function parseJsonPart(raw: string, decoded: string): JwtPart {
  try {
    return { raw, decoded, parsed: JSON.parse(decoded) };
  } catch (e) {
    return {
      raw,
      decoded,
      parseError: e instanceof Error ? e.message : "Invalid JSON.",
    };
  }
}

function base64UrlDecode(
  input: string,
): { ok: true; value: string } | { ok: false; error: string } {
  try {
    let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad === 2) b64 += "==";
    else if (pad === 3) b64 += "=";
    else if (pad !== 0)
      return { ok: false, error: "Invalid base64url length." };
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { ok: true, value: text };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid base64.",
    };
  }
}

function extractClaims(payload: unknown): KnownClaims {
  if (!payload || typeof payload !== "object") return {};
  const p = payload as Record<string, unknown>;
  const claims: KnownClaims = {};
  if (typeof p.iss === "string") claims.iss = p.iss;
  if (typeof p.sub === "string") claims.sub = p.sub;
  if (typeof p.aud === "string") claims.aud = p.aud;
  else if (Array.isArray(p.aud) && p.aud.every((a) => typeof a === "string"))
    claims.aud = p.aud as string[];
  if (typeof p.jti === "string") claims.jti = p.jti;

  const now = Math.floor(Date.now() / 1000);
  if (typeof p.exp === "number") {
    claims.exp = {
      value: p.exp,
      date: new Date(p.exp * 1000).toISOString(),
      expired: p.exp < now,
    };
  }
  if (typeof p.iat === "number") {
    claims.iat = {
      value: p.iat,
      date: new Date(p.iat * 1000).toISOString(),
    };
  }
  if (typeof p.nbf === "number") {
    claims.nbf = {
      value: p.nbf,
      date: new Date(p.nbf * 1000).toISOString(),
      active: p.nbf <= now,
    };
  }
  return claims;
}
