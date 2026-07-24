const CACHE_NAME="fortress-commander-v1.18.4";
const INDEX_URL=new URL("index.html",self.registration.scope).href;
const APP_SHELL=[
 './index.html',
 './manifest.webmanifest',
 './css/mobile.css',
 './css/style.css',
 './css/ui.css',
 './js/audio.js',
 './js/bonus-objectives.js',
 './js/buildings.js',
 './js/campaign.js',
 './js/combat.js',
 './js/economy.js',
 './js/enemies.js',
 './js/fortifications.js',
 './js/game.js',
 './js/input.js',
 './js/main.js',
 './js/map-layout.js',
 './js/pwa.js',
 './js/render.js',
 './js/research.js',
 './js/save.js',
 './js/siege.js',
 './js/specializations.js',
 './js/stone-buildings.js',
 './js/ui.js',
 './js/utils.js',
 './js/villagers.js',
 './js/war-council.js',
 './js/weather.js',
 './js/world-map.js',
 './data/buildings.json',
 './data/economy.json',
 './data/enemies.json',
 './data/technologies.json',
 './data/units.json',
 './data/weather.json',
 './assets/audio/LICENSES.md',
 './assets/audio/arrow-shot.mp3',
 './assets/audio/build-place.mp3',
 './assets/audio/melee-hit.mp3',
 './assets/audio/repair.mp3',
 './assets/audio/siege-impact.mp3',
 './assets/audio/tower-shot.mp3',
 './assets/audio/ui-click.mp3',
 './assets/audio/ui-close.mp3',
 './assets/audio/ui-error.mp3',
 './assets/audio/upgrade-complete.mp3',
 './assets/audio/wave-horn.mp3',
 './assets/audio/wave-victory.mp3',
 './assets/audio/music-menu.mp3',
 './assets/audio/music-build.mp3',
 './assets/audio/music-battle.mp3',
 './assets/audio/music-boss.mp3',
 './assets/audio/music-defeat.mp3',
 './assets/audio/ambience-castle.mp3',
 './assets/audio/ambience-blacksmith.mp3',
 './assets/audio/ambience-wind.mp3',
 './assets/buildings/archer-tower.webp',
 './assets/buildings/catapult-tower.webp',
 './assets/buildings/crossbow-tower.webp',
 './assets/buildings/lumber-camp.webp',
 './assets/buildings/market-shop.webp',
 './assets/buildings/quarry-site.webp',
 './assets/buildings/repair-house.webp',
 './assets/buildings/stone-house.webp',
 './assets/buildings/stone-lumber-camp.webp',
 './assets/buildings/stone-market-shop.webp',
 './assets/buildings/stone-quarry-site.webp',
 './assets/buildings/stone-repair-house.webp',
 './assets/buildings/stone-workshop-house.webp',
 './assets/buildings/tent-camp.webp',
 './assets/buildings/warrior-statue.webp',
 './assets/buildings/wood-fortress-center.webp',
 './assets/buildings/wood-house.webp',
 './assets/buildings/workshop-house.webp',
 './assets/enemies/berserker.webp',
 './assets/enemies/boss.webp',
 './assets/enemies/raider.webp',
 './assets/enemies/runner.webp',
 './assets/enemies/shield.webp',
 './assets/enemies/spear.webp',
 './assets/environment/fortress-yard.webp',
 './assets/environment/outer-landscape.webp',
 './assets/environment/road.webp',
 './assets/icons/apple-touch-icon.png',
 './assets/icons/favicon-16.png',
 './assets/icons/favicon-32.png',
 './assets/icons/icon-1024.png',
 './assets/icons/icon-192.png',
 './assets/icons/icon-512.png',
 './assets/icons/icon-maskable-192.png',
 './assets/icons/icon-maskable-512.png',
 './assets/ui/andreas-portrait.webp',
 './assets/ui/start-screen.webp',
 './assets/units/andreas-idle.webp',
 './assets/units/andreas-walk-1.webp',
 './assets/units/andreas-walk-2.webp',
 './assets/units/archer-idle.webp',
 './assets/units/archer-walk-1.webp',
 './assets/units/archer-walk-2.webp',
 './assets/units/guard-idle.webp',
 './assets/units/guard-walk-1.webp',
 './assets/units/guard-walk-2.webp'
];

self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});

self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith("fortress-commander-")&&key!==CACHE_NAME).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});

self.addEventListener("message",event=>{
 if(event.data?.type==="SKIP_WAITING")self.skipWaiting();
});

self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE_NAME);
   const cached=await cache.match(INDEX_URL);
   if(cached)return cached;
   try{
    const response=await fetch(request);
    if(response.ok)await cache.put(INDEX_URL,response.clone());
    return response;
   }catch{return new Response("Fortress Commander konnte offline noch nicht geladen werden.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}})}
  })());
  return;
 }
 event.respondWith((async()=>{
  const cached=await caches.match(request);
  if(cached)return cached;
  try{
   const response=await fetch(request);
   if(response.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone())}
   return response;
  }catch{return new Response("",{status:504,statusText:"Offline"})}
 })());
});
