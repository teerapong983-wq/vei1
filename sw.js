/*!
 * VEI1 Log — Vanachai Energy Co., Ltd. (Vanachai Group)
 * สงวนลิขสิทธิ์ · All Rights Reserved · Proprietary and Confidential
 * ใช้ภายในองค์กรเท่านั้น — ห้ามทำซ้ำ ดัดแปลง หรือเผยแพร่โดยไม่ได้รับอนุญาต
 * Unauthorized copying, modification or distribution is prohibited.
 * origin-id: VNC-E063694A
 */
/* VEI1 Log — service worker (เปลือกแอปเท่านั้น ไม่แคชข้อมูลจาก Google Apps Script) */
const CACHE = 'vei1-shell-v1';
const SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // แตะเฉพาะไฟล์เปลือกของเราเอง — คำขอไปยัง script.google.com ปล่อยผ่านตามปกติเสมอ
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // network-first: ได้ไฟล์ใหม่เสมอเมื่อมีเน็ต, ใช้แคชเมื่อออฟไลน์
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
