# Civivox

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

## QR codes
Admin page > "QR code for visitors": shows a QR for the selected event. It uses this laptop's network address,
so phones must be on the same Wi-Fi/hotspot. Press "Print poster" for a ready-to-print page.
If the site is hosted online, type its web address in the box and the QR will use that instead.

## Let anyone scan the QR (from any phone, any network)
The QR must contain an address the phone can reach. Two ways:

### A. Quick: temporary public link from your laptop (no account)
1. Keep `npm run dev` running.
2. In another terminal: `winget install Cloudflare.cloudflared` (first time only), then
   `cloudflared tunnel --url http://localhost:3000`   (use your port)
3. It prints a link like https://something.trycloudflare.com. Open `<that link>/admin`, log in,
   and the QR panel automatically uses that link. Print the poster.
The link changes each time you start the tunnel, and your laptop must stay on.

### B. Put it online (free, on Render.com)
1. Make a free GitHub account; create a new repository and upload this project's files
   (not node_modules / .next).
2. On render.com: New > Blueprint > pick that repository > type your own ADMIN_PASSWORD > Deploy.
3. Open https://<your-name>.onrender.com/admin from that address; the QR panel uses it automatically.
Notes: the free plan sleeps after 15 minutes without visitors (first load then takes up to a minute),
and its data resets to the sample event when it restarts, which is fine for a demo. Open the site a few
minutes before your presentation to wake it. Admin: "Reset everything to sample data" also refreshes it any time.

## Roles and sign-in (start page)
- **Visitor**: no login. Start page > Visitor > pick an event.
- **Volunteer**: name + password, created by the organizer (Dashboard > Volunteers).
- **Organizer**: Start page > Organizer > Create account (name, password, first event, permission letter).
  Each organizer sees and manages only their own events.
- **Site owner**: the master password (`ADMIN_PASSWORD`, default `admin123`) at Start page > Site owner.
  Sees every event and organizer account, can view letters, approve/reject/remove organizers.

Settings in `.env.local` (all optional):
```
ADMIN_PASSWORD=your-site-owner-password
SESSION_SECRET=any-long-random-text
DEMO_MODE=1            # 1 (default): organizers may use a sample letter. 0: a real upload is required.
REQUIRE_APPROVAL=0     # 0 (default): new organizers are approved at once. 1: the site owner must approve first.
```
Change the site name in `lib/config.js` (`SITE_NAME`).

## First screen and name
The site is called **Civivox**. The first screen (`/`) shows the name and one button (text set by `SPLASH_BUTTON` in `lib/config.js`).
The button opens the role page at `/start`. Change the name or button text in `lib/config.js`.

## Look and feel (paper-cut storybook style)
- `/` first screen, `/welcome` scroll story, `/start` role page. Illustrations are small inline SVG drawings in `components/art.js`.
- Colours, fonts and animations live at the bottom of `app/globals.css` (section "Civivox paper-cut theme").
- `components/ScrollFX.js` powers the fade-in and parallax. Animations switch off for people who prefer reduced motion.

## Navigation
A round **Back** button sits at the left of the top bar on every page (goes to the previous page; if there is none, to the story page).
The role page (`/start`) offers Volunteer and Organizer only; visitors browse events from the story page (`/welcome`) or `/events`.
