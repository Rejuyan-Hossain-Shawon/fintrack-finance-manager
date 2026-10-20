const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');
const month = new Date().toISOString().slice(0, 7);
const date = `${month}-15`;
const marker = `FTTEST-${randomUUID().slice(0, 8)}`;
let token, otherToken;
const headers = () => ({ Authorization: `Bearer ${token}` });
const tx = (description, amountCents = 2500) => ({ type: 'expense', amountCents, category: 'Food & Dining', description, date });
async function register(request, label) {
  const response = await request.post('/api/auth/register', { data: {
    name: `FinTrack Test ${label}`,
    email: `ft-${randomUUID()}@example.com`,
    password: `TestOnly!${randomUUID()}`,
  }});
  expect(response.status(), await response.text()).toBe(201);
  return (await response.json()).token;
}
async function loginViaToken(page) {
  await page.addInitScript(value => localStorage.setItem('fintrack_token', value), token);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Overview/ })).toBeVisible();
}
test.beforeAll(async ({ request }) => {
  token = await register(request, 'primary');
  otherToken = await register(request, 'secondary');
});
test('01 - API health and authentication', async ({ request }) => {
  const health = await request.get('/api/health', {
  headers: headers()
});

expect(health.ok()).toBeTruthy();
expect((await health.json()).status).toBe('ok');
  const me = await request.get('/api/auth/me', { headers: headers() });
  expect(me.ok()).toBeTruthy();
  expect((await me.json()).user.role).toBe('user');
  expect((await request.get('/api/transactions')).status()).toBe(401);
});
test('02 - transactions create, update, persistence and delete', async ({ request }) => {
  const created = await request.post('/api/transactions', { headers: headers(), data: tx(marker) });
  expect(created.status(), await created.text()).toBe(201);
  const id = (await created.json())._id;
  const updated = await request.put(`/api/transactions/${id}`, { headers: headers(), data: tx(`${marker}-edited`, 3600) });
  expect(updated.ok()).toBeTruthy();
  const list = await request.get(`/api/transactions?month=${month}`, { headers: headers() });
  expect((await list.json()).some(x => x._id === id && x.amountCents === 3600)).toBeTruthy();
  const removed = await request.delete(`/api/transactions/${id}`, { headers: headers() });
  expect(removed.ok()).toBeTruthy();
  const after = await request.get(`/api/transactions?month=${month}`, { headers: headers() });
  expect((await after.json()).some(x => x._id === id)).toBeFalsy();
});
test('03 - budget create, update and delete', async ({ request }) => {
  const data = { month, category: 'Education', limitCents: 12000 };
  const created = await request.post('/api/budgets', { headers: headers(), data });
  expect(created.ok(), await created.text()).toBeTruthy();
  const id = (await created.json())._id;
  try {
    const updated = await request.post('/api/budgets', { headers: headers(), data: { ...data, limitCents: 15000 } });
    expect(updated.ok()).toBeTruthy();
    const list = await request.get(`/api/budgets?month=${month}`, { headers: headers() });
    expect((await list.json()).some(x => x._id === id && x.limitCents === 15000)).toBeTruthy();
  } finally { await request.delete(`/api/budgets/${id}`, { headers: headers() }); }
});
test('04 - savings goal create, edit and delete', async ({ request }) => {
  const payload = { name: marker, targetCents: 50000, savedCents: 10000, targetDate: '' };
  const created = await request.post('/api/goals', { headers: headers(), data: payload });
  expect(created.ok(), await created.text()).toBeTruthy();
  const id = (await created.json())._id;
  try {
    const edited = await request.put(`/api/goals/${id}`, { headers: headers(), data: { ...payload, savedCents: 20000 } });
    expect(edited.ok(), await edited.text()).toBeTruthy();
    const listed = await request.get('/api/goals', { headers: headers() });
    expect((await listed.json()).some(x => x._id === id && x.savedCents === 20000)).toBeTruthy();
  } finally { await request.delete(`/api/goals/${id}`, { headers: headers() }); }
});
test('05 - validation and account isolation', async ({ request }) => {
  const invalid = await request.post('/api/transactions', { headers: headers(), data: tx('invalid', -1) });
  expect(invalid.status()).toBe(400);
  const created = await request.post('/api/transactions', { headers: headers(), data: tx(marker + '-private') });
  expect(created.status()).toBe(201);
  const id = (await created.json())._id;
  try {
    const otherHeaders = { Authorization: `Bearer ${otherToken}` };
    const list = await request.get(`/api/transactions?month=${month}`, { headers: otherHeaders });
    expect((await list.json()).some(x => x._id === id)).toBeFalsy();
    const attemptedDelete = await request.delete(`/api/transactions/${id}`, { headers: otherHeaders });
    expect(attemptedDelete.status()).toBe(404);
    const admin = await request.get('/api/admin/stats', { headers: headers() });
    expect(admin.status()).toBe(403);
  } finally { await request.delete(`/api/transactions/${id}`, { headers: headers() }); }
});
test('06 - UI navigation, search and CSV download', async ({ page }) => {
  await loginViaToken(page);
  for (const [button, heading] of [['Transactions','Transactions'], ['Budgets','Monthly budgets'], ['Savings goals','Savings goals'], ['Overview','Overview']]) {
    await page.locator('nav').getByRole('button', { name: button, exact: true }).click();
    await expect(page.locator('main h1')).toContainText(heading);
  }
  await page.locator('nav').getByRole('button', { name: 'Transactions' }).click();
  await page.getByPlaceholder('Search transactions').fill('UNLIKELY_SEARCH_FT_987654');
  await expect(page.getByText('No transactions yet. Add one to get started.')).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/\.csv$/i);
});
test('07 - UI login session persists on refresh and logout works', async ({ page }) => {
  await loginViaToken(page);
  await page.reload();
  await expect(page.locator('main h1')).toContainText('Overview');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('fintrack_token'))).toBeNull();
});
