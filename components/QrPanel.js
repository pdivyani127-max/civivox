'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default function QrPanel({ eventId, eventName }) {
  const [ips, setIps] = useState([]);
  const [ip, setIp] = useState('');
  const [custom, setCustom] = useState('');
  const [target, setTarget] = useState('event');
  const [img, setImg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/network').then(r => r.ok ? r.json() : []).then(list => { setIps(list); if (list[0]) setIp(list[0].address); }).catch(() => {});
  }, []);

  // Which address will the phone open?
  const host = typeof window !== 'undefined' ? window.location : { hostname: 'localhost', port: '3000', origin: '' };
  const onLaptopOnly = ['localhost', '127.0.0.1'].includes(host.hostname);
  let base = custom.trim().replace(/\/$/, '');
  if (!base) base = onLaptopOnly ? (ip ? `http://${ip}${host.port ? ':' + host.port : ''}` : '') : host.origin;
  const url = base ? `${base}${target === 'event' ? `/event/${eventId}` : '/events'}` : '';

  useEffect(() => {
    if (!url) { setImg(''); return; }
    QRCode.toDataURL(url, { width: 360, margin: 2, errorCorrectionLevel: 'M' }).then(setImg).catch(() => setImg(''));
  }, [url]);

  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  const poster = () => {
    const w = window.open('', '_blank');
    if (!w) return alert('Please allow pop-ups for this page, then try again.');
    w.document.write(`<!doctype html><html><head><title>QR poster</title><style>
      body{font-family:system-ui,Segoe UI,sans-serif;text-align:center;padding:40px;color:#111}
      h1{font-size:40px;margin:0 0 6px} h2{font-weight:500;margin:0 0 20px;color:#444}
      img{width:420px;max-width:80%} .u{font-size:16px;color:#555;word-break:break-all;margin-top:10px}
      .pts{font-size:20px;margin-top:22px;line-height:1.7}</style></head><body>
      <h1>${target === 'event' ? esc(eventName) : 'Live event information'}</h1>
      <h2>Scan to see live parking, crowd, waste and power status</h2>
      <img src="${img}" alt="QR code"><div class="u">${esc(url)}</div>
      <div class="pts">No app to install &nbsp;·&nbsp; No login &nbsp;·&nbsp; Just scan with your phone camera</div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <details className="card manage">
      <summary>📱 QR code for visitors</summary>
      <p className="muted tiny">Print this and put it at gates, parking and food courts. Visitors scan it with their normal phone camera and the live page opens. No app, no login.</p>
      <div className="row">
        <label>QR opens:&nbsp;</label>
        <select value={target} onChange={e => setTarget(e.target.value)}>
          <option value="event">{eventName} page</option>
          <option value="home">List of all events</option>
        </select>
      </div>
      {onLaptopOnly && ips.length > 1 && (
        <div className="row">
          <label>Laptop network:&nbsp;</label>
          <select value={ip} onChange={e => setIp(e.target.value)}>
            {ips.map(i => <option key={i.address} value={i.address}>{i.address} ({i.name})</option>)}
          </select>
        </div>
      )}
      <div className="row">
        <input value={custom} placeholder="Optional: your own web address, e.g. https://myevent.com" onChange={e => setCustom(e.target.value)} />
      </div>

      {url ? (
        <div className="qrbox">
          {img && <img src={img} alt="QR code" width="220" height="220" />}
          <div>
            <div className="tiny muted">Phones will open:</div>
            <div className="qrurl">{url}</div>
            <div className="row">
              <button className="btn primary" onClick={poster} disabled={!img}>🖨 Print poster</button>
              {img && <a className="btn" href={img} download={`qr-${eventName.replace(/\W+/g, '-')}.png`}>Download PNG</a>}
              <button className="btn" onClick={copy}>{copied ? 'Copied!' : 'Copy link'}</button>
            </div>
            {!custom.trim() && onLaptopOnly && (
              <div className="tiny muted">Works only for phones on the <b>same Wi-Fi or hotspot</b> as this laptop. Keep the site running.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="err">No network address found. Connect this laptop to Wi-Fi or a hotspot, or type your own web address above.</div>
      )}
    </details>
  );
}
