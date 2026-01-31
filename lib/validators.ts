// URL validation for GitHub repository
export function validateDataUrl(dataUrl: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(dataUrl);

    // Check protocol
    if (url.protocol !== "https:") {
      return { valid: false, error: "URL must use HTTPS protocol" };
    }

    // Check domain
    if (url.hostname !== "raw.githubusercontent.com") {
      return { valid: false, error: "URL must be from raw.githubusercontent.com" };
    }

    // Check repository path
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts.length < 4) {
      return { valid: false, error: "Invalid URL format" };
    }

    const [owner, repo, commitHash, ...filePath] = pathParts;

    // Check repository owner and name
    if (owner !== "taimoorahmed91" || repo !== "iseflowproject") {
      return {
        valid: false,
        error: "Only URLs from repository taimoorahmed91/iseflowproject are allowed",
      };
    }

    // Check file path
    const filePathStr = filePath.join("/");
    if (filePathStr !== "configs/processed_data.json") {
      return {
        valid: false,
        error: "File path must be configs/processed_data.json",
      };
    }

    // Check commit hash format (alphanumeric, 7-40 characters)
    if (!/^[a-zA-Z0-9]{7,40}$/.test(commitHash)) {
      return {
        valid: false,
        error: "Invalid commit hash format",
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid URL format" };
  }
}

// Basic Auth validation
export function validateBasicAuth(authHeader: string | null): boolean {
  if (!authHeader) {
    return false;
  }

  const [scheme, credentials] = authHeader.split(" ");

  if (scheme !== "Basic" || !credentials) {
    return false;
  }

  try {
    const decoded = Buffer.from(credentials, "base64").toString("utf-8");
    const [username, password] = decoded.split(":");

    const expectedUsername = process.env.BASIC_AUTH_USERNAME || "taimoor";
    const expectedPassword = process.env.BASIC_AUTH_PASSWORD || "temp-password-123";

    return username === expectedUsername && password === expectedPassword;
  } catch (error) {
    return false;
  }
}
