
import { ROLE_CAPABILITIES } from './state.js';

export async function bootstrapApi() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role') || 'director';
  const permissions = ROLE_CAPABILITIES[role] || ROLE_CAPABILITIES.director;
  return {
    role,
    permissions,
    source: 'demo',
  };
}
