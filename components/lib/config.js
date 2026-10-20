// ONE PLACE to change names, colours and rules (easy to edit!)
export const RESOURCE_TYPES = {
  crowd:   { label: 'Crowd',   icon: '👥' },
  parking: { label: 'Parking', icon: '🅿️' },
  waste:   { label: 'Waste',   icon: '🗑️' },
  power:   { label: 'Power',   icon: '⚡' },
  devices: { label: 'Devices', icon: '📡' },
};
export const STATUS_LABELS = { green: 'Normal', yellow: 'Busy', red: 'Alert' };
// card turns grey after this many minutes without an update (set NEXT_PUBLIC_STALE_MINUTES to change)
export const STALE_AFTER_MINUTES = Number(process.env.NEXT_PUBLIC_STALE_MINUTES) || 10;

// One-click presets in the admin panel: [button text, status]
export const PRESETS = {
  waste:   [['Empty', 'green'], ['Half full', 'yellow'], ['Full - needs emptying', 'red']],
  power:   [['Normal', 'green'], ['Running on backup generator', 'yellow'], ['Outage - being restored', 'red']],
  crowd:   [['Low activity', 'green'], ['Moderate activity', 'yellow'], ['Crowded', 'red']],
  devices: [['Online', 'green'], ['Offline', 'red']],
  parking: [],
};

// The Arduino sensor card is filled in automatically from sensor readings
export const isSensorCard = (r) => r.type === 'devices' && String(r.label).startsWith('Crowd sensor');
export const SENSOR_OFFLINE_AFTER_SECONDS = 30;

// Position of each zone on the venue map (map is 640 x 360). Unknown zones are placed in a row at the bottom.
export const MAP_LAYOUT = {
  'Parking Lot A':  { x: 20,  y: 20,  w: 150, h: 120 },
  'Parking Lot B':  { x: 20,  y: 200, w: 150, h: 120 },
  'Main Hall':      { x: 230, y: 20,  w: 240, h: 150 },
  'Seminar Hall B': { x: 500, y: 20,  w: 120, h: 150 },
  'Food Court':     { x: 300, y: 215, w: 220, h: 105 },
  // Cultural Night
  'Main Gate Parking': { x: 20,  y: 20,  w: 150, h: 120 },
  'Overflow Parking':  { x: 20,  y: 200, w: 150, h: 120 },
  'Open Air Theatre':  { x: 230, y: 20,  w: 240, h: 150 },
  'Backstage':         { x: 500, y: 20,  w: 120, h: 150 },
  'Food Stalls':       { x: 300, y: 215, w: 220, h: 105 },
  // Annual Sports Meet
  'Main Stadium':       { x: 230, y: 20,  w: 260, h: 150 },
  'Indoor Arena':       { x: 510, y: 20,  w: 110, h: 150 },
  'North Gate Parking': { x: 20,  y: 20,  w: 150, h: 120 },
  'East Gate Parking':  { x: 20,  y: 200, w: 150, h: 120 },
  'Refreshment Zone':   { x: 230, y: 215, w: 230, h: 105 },
  'Control Room':       { x: 480, y: 215, w: 140, h: 105 },
};

// The main text of a card always matches its colour/status. Choosing a status in the admin panel sets this text.
export const STATUS_NOTES = {
  crowd:   { green: 'Low activity', yellow: 'Moderate activity', red: 'Crowded' },
  parking: { green: 'Free slots', yellow: 'Filling up', red: 'Almost full' },
  waste:   { green: 'Empty', yellow: 'Half full', red: 'Full - needs emptying' },
  power:   { green: 'Normal', yellow: 'Running on backup generator', red: 'Outage - being restored' },
  devices: { green: 'Online', yellow: 'Not working properly', red: 'Offline' },
};

// The site's name. Change it here and it updates everywhere (header, role page, browser tab).
export const SITE_NAME = 'Civivox';
export const SITE_TAGLINE = 'The live voice of every event';
export const SPLASH_BUTTON = 'Step inside';   // text of the button on the first screen
