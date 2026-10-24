import { guardEvent } from '@/lib/auth';
import { fillSample, SAMPLE_TEMPLATES } from '@/lib/db';

// Adds ready-made areas, cards and parking history to an event (areas it already has are kept)
export async function POST(req, { params }) {
  const { id } = await params;
  const g = await guardEvent(id); if (g.error) return g.error;
  const { template } = await req.json().catch(() => ({}));
  if (!SAMPLE_TEMPLATES[template]) return Response.json({ error: 'Choose which sample data to load' }, { status: 400 });
  const added = fillSample(template, Number(id));
  return Response.json({ ok: true, added });
}
