import os from 'node:os';
import { getSession, isManager } from '@/lib/auth';

// Lists this laptop's network addresses so the QR code can point phones to it (admin only)
export async function GET() {
  if (!isManager(await getSession())) return Response.json({ error: 'Not logged in' }, { status: 401 });
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push({ name, address: i.address });
  }
  // Most likely real Wi-Fi / hotspot addresses first (192.168.x.x), then 10.x.x.x, then the rest
  const rank = (a) => (a.startsWith('192.168.') ? 0 : a.startsWith('10.') ? 1 : 2);
  out.sort((a, b) => rank(a.address) - rank(b.address));
  return Response.json(out);
}
