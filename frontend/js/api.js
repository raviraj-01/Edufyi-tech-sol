// Universal API client wrapper

export class ApiError extends Error {
  constructor(message, code = "error", status = 400, field = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

export async function request(path, options = {}) {
  const config = {
    headers: {
      "Accept": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(path, config);

  // 204 No Content
  if (res.status === 204) {
    return null;
  }

  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = data && data.error ? data.error : {};
    throw new ApiError(
      err.message || "An unexpected error occurred",
      err.code || "unknown_error",
      res.status,
      err.field || null
    );
  }

  return data;
}
