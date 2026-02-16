const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not set. Add it to .env");
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
