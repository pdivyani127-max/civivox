// Bridge: reads the Arduino over USB and sends each reading to the website.
//   Real Arduino:  npm run bridge -- COM3
//   No Arduino:    npm run bridge:sim        (fake readings, for testing and demos)
// Optional:  --url http://localhost:3001   --zone "Main Hall"   --event 1
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const sim = args.includes('--sim');
const zone = flag('--zone', 'Main Hall');
const eventId = Number(flag('--event', 1));
const key = process.env.TELEMETRY_KEY || 'sensor-demo-key';
const portArg = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));

async function findSite() {
  const given = flag('--url', null);
  if (given) return given.replace(/\/$/, '');
  for (const p of [3000, 3001, 3002, 3003]) {
    try { const r = await fetch(`http://localhost:${p}/api/events`); if (r.ok) return `http://localhost:${p}`; } catch {}
  }
  console.error('Could not find the website. Is "npm run dev" running? You can also pass --url http://localhost:3001');
  process.exit(1);
}

let site;
async function send(reading) {
  try {
    const res = await fetch(`${site}/api/telemetry`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ ...reading, zone, eventId }),
    });
    console.log(res.ok ? 'sent' : `website said ${res.status}`, JSON.stringify(reading));
  } catch (e) { console.log('could not reach website:', e.message); }
}

async function runSim() {
  console.log('SIMULATION MODE - sending fake readings (no Arduino needed). Press Ctrl+C to stop.');
  const steps = [8, 10, 12, 25, 40, 55, 70, 80, 75, 50, 30, 15];
  let i = 0, prev = null;
  setInterval(() => {
    const activity = steps[i++ % steps.length];
    const level = activity >= 40 ? 'crowded' : activity >= 20 ? 'moderate' : 'low';
    const trend = prev === null ? 'steady' : activity - prev >= 8 ? 'rising' : prev - activity >= 8 ? 'falling' : 'steady';
    prev = activity;
    send({ level, activity, trend });
  }, 3000);
}

async function runSerial() {
  const { SerialPort, ReadlineParser } = require('serialport');
  let path = portArg;
  if (!path) {
    const ports = await SerialPort.list();
    const guess = ports.find((p) => /arduino|wch|ftdi|silicon|ch340|usb/i.test(`${p.manufacturer || ''} ${p.friendlyName || ''}`));
    if (!guess) {
      console.error('No Arduino found. Ports seen:', ports.map((p) => p.path).join(', ') || 'none');
      console.error('Plug it in, then run:  npm run bridge -- COM3   (use the port shown in the Arduino IDE)');
      process.exit(1);
    }
    path = guess.path;
  }
  console.log(`Reading from ${path} ... (close the Arduino Serial Monitor, it blocks the port)`);
  const port = new SerialPort({ path, baudRate: 9600 });
  port.on('error', (e) => { console.error('Serial error:', e.message); process.exit(1); });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
  parser.on('data', (line) => {
    line = line.trim();
    if (!line.startsWith('{')) return console.log('arduino:', line);
    try { send(JSON.parse(line)); } catch { console.log('ignored:', line); }
  });
}

(async () => { site = await findSite(); console.log('Website found at', site); sim ? runSim() : runSerial(); })();
