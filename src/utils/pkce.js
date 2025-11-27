import crypto from "crypto";

// Creating a cryptographically secure random string
export function generateCodeVerifier() {
  return crypto.randomBytes(64).toString("hex"); // 128 characters
}

// Base64 URL encoding for OAuth PKCE
function base64URLEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// SHA256 hash -> code_challenge
export function generateCodeChallenge(verifier) {
  return base64URLEncode(crypto.createHash("sha256").update(verifier).digest());
}

// Random state (secure)
export function generateState() {
  return crypto.randomBytes(32).toString("hex");
}
