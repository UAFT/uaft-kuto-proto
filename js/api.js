import { ROLE_CAPABILITIES } from './state.js';

function queryParams() {
  return new URLSearchParams(window.location.search || '');
}

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

export function resolveApiBase() {
  const params = queryParams();
  const fromQuery = params.get('api_base') || params.get('apiBase') || '';
  const fromWindow = typeof window !== 'undefined' ? (window.__KUTO_API_BASE__ || '') : '';
  const fromStorage = typeof window !== 'undefined' ? (window.localStorage?.getItem('KUTO_API_BASE') || '') : '';
  return stripTrailingSlash(fromQuery || fromWindow || fromStorage || '');
}

function buildUrl(path, searchParams) {
  const apiBase = resolveApiBase();
  const prefix = apiBase || '';
  const url = new URL(`${prefix}${path}`, window.location.origin);
  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (value !== undefined && value !== null && String(value) !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function apiGet(path, params) {
  const res = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  });

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.error || payload?.detail || `API ${res.status}`;
    throw new Error(message);
  }
  if (payload && payload.ok === false) {
    throw new Error(payload.error || 'backend_error');
  }
  return payload;
}

export async function bootstrapApi() {
  const params = queryParams();
  const explicitRole = params.get('role') || 'director';
  const permissions = ROLE_CAPABILITIES[explicitRole] || ROLE_CAPABILITIES.director;

  return {
    role: explicitRole,
    permissions,
    source: 'backend',
    apiBase: resolveApiBase(),
    chatId: params.get('chat_id') || '',
    initialGroupId: params.get('id_gruppy') || params.get('group_id') || '',
    initialMonth: params.get('month') || '',
  };
}

export async function fetchKutoGroupList({
  idGruppy = '',
  month = '',
  limit = 20,
  q = '',
  chatId = '',
  role = '',
} = {}) {
  const params = new URLSearchParams();
  if (idGruppy) params.set('id_gruppy', idGruppy);
  if (month) params.set('month', month);
  if (limit !== undefined && limit !== null && String(limit) !== '') params.set('limit', String(limit));
  if (q) params.set('q', q);
  if (chatId) params.set('chat_id', chatId);
  if (role) params.set('role', role);

  return await apiGet('/api/kuto/group-list', params);
}
