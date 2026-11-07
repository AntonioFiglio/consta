export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options?.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options?.headers,
    },
  });
  const data = await response
    .json()
    .catch(() => ({ error: "Não foi possível conectar ao servidor." }));
  if (!response.ok)
    throw new Error(data.error || "Não foi possível concluir a operação.");
  return data as T;
}
