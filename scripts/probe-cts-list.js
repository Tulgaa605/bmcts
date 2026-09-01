async function post(body) {
  const res = await fetch('https://ctsystem.mn/api/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(JSON.stringify(body).slice(0, 120), res.status, text.slice(0, 220).replace(/\s+/g, ' '));
}

(async () => {
  await post({ raw: '123456', year: 2026, month: 8, deviceId: 'WEB', tag: 'CT$FS4' });
  await post({ qr: '123456', tag: 'CT$FS4' });
  await post({ code: '123456', database: 'CT$FS4' });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
