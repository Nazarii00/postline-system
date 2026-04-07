const BASE_URL = import.meta.env.VITE_API_URL 

async function fetcher<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/auth'
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? 'Помилка сервера')
  }

  return res.json()
}

export const api = {
  get:    <T>(path: string)                  => fetcher<T>(path),
  post:   <T>(path: string, body: unknown)   => fetcher<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)   => fetcher<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                  => fetcher<T>(path, { method: 'DELETE' }),
}