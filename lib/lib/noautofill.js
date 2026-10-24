// Props that ask the browser NOT to fill in, suggest or remember names and passwords.
// (The field is read-only until you click it, which stops browsers from filling it when the page opens.)
const unlock = (e) => { e.currentTarget.readOnly = false; };
const base = { autoCorrect: 'off', autoCapitalize: 'off', spellCheck: false, readOnly: true, onFocus: unlock, 'data-lpignore': 'true', 'data-1p-ignore': 'true' };

export const noFillName = { ...base, autoComplete: 'off' };
export const noFillPassword = { ...base, autoComplete: 'new-password' };
