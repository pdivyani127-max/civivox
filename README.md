# Event Logistics Coordinator

## Run on Windows
1. Install Node.js (version 22.5 or newer).
2. Open this folder in VS Code, then open a terminal (Terminal > New Terminal).
3. `npm install` (only the first time)
4. `npm run dev`
5. Open http://localhost:3000

## Open on a phone
Connect laptop and phone to the same Wi-Fi/hotspot. In Command Prompt run `ipconfig`,
find "IPv4 Address", then on the phone open http://<that-address>:3000
(Click "Allow access" if Windows Firewall asks.)

## Where things are
- lib/config.js : names, labels, stale-time (easy edits)
- lib/db.js     : database tables + sample event data (edit the seed to add events/zones)
- app/          : pages;  components/LiveStatus.js : the live visitor page

## Admin panel
Open http://localhost:3000/admin  (default password: admin123).
To change the password, create a file named `.env.local` in this folder containing:
```
ADMIN_PASSWORD=your-new-password
SESSION_SECRET=any-long-random-text
```
Then restart `npm run dev`.
