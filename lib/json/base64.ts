export type Base64Variant = "standard" | "url";

export type Base64Result =
  | { ok: true; output: string }
  | { ok: false; error: string };

export function encodeBase64(
  text: string,
  variant: Base64Variant = "standard",
): Base64Result {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
      binary += String.fromCharCode(bytes[i]);
    let out = btoa(binary);
    if (variant === "url") {
      out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    return { ok: true, output: out };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Encoding failed.",
    };
  }
}

export function decodeBase64(
  input: string,
  variant: Base64Variant = "standard",
): Base64Result {
  try {
    let normalized = input.trim();
    if (variant === "url" || /[-_]/.test(normalized)) {
      normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
    }
    const pad = normalized.length % 4;
    if (pad === 2) normalized += "==";
    else if (pad === 3) normalized += "=";
    else if (pad !== 0) {
      return { ok: false, error: "Invalid length for base64." };
    }
    if (!/^[A-Za-z0-9+/=]*$/.test(normalized)) {
      return { ok: false, error: "Contains characters that aren't base64." };
    }
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { ok: true, output: text };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Decoding failed.",
    };
  }
}
