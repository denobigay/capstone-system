export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('api_token')
  const headers: any = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`http://127.0.0.1:8000${path}`, { ...options, headers })
}


