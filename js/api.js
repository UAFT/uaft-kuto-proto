import { permissionsForRole } from './state.js';

export async function bootstrapAuth() {
  const role = new URLSearchParams(window.location.search).get('role') || 'director';
  return {
    telegramId: 'demo',
    role,
    permissions: permissionsForRole(role),
  };
}
