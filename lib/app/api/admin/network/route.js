import os from 'node:os';
import { getSession, isManager } from '@/lib/auth';

// Finds this laptop's address on the Wi-Fi/hotspot so phones can open the site (localhost only works on the laptop itself)
export async function GET(req) {
  if (!isManager(await getSession())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const found = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) found.push(i.address);
  }
  const rank = (a) => (a.startsWith('192.168.') ? 0 : a.startsWith('10.') ? 1 : a.startsWith('172.') ? 2 : 3);
  found.sort((a, b) => rank(a) - rank(b));
  const host = req.headers.get('host') || '';
  const port = host.includes(':') ? host.split(':').pop() : '3000';
  return Response.json({ addresses: found, port });
}
