"use strict";

export const ENEMY_CODEX={
 raider:{role:"KRIEGER",visualClass:"normal",visualScale:.94,name:"Eisenclan-Plünderer",icon:"🪓",baseHp:58,hpWave:10,baseSpeed:36,speedWave:.5,reward:12,damage:30,attackRate:1.05,armor:0,color:"#7b342d",unlockWave:1,lore:"Zäher Standardkrieger der Eisenclans. Er stürmt ohne Umwege auf die Palisade und ist besonders in großen Gruppen gefährlich.",strength:"Masse",weakness:"Fokusschaden"},
 runner:{role:"SPÄHER",visualClass:"normal",visualScale:.88,name:"Clanspäher",icon:"🥾",baseHp:38,hpWave:7,baseSpeed:63,speedWave:.7,reward:13,damage:20,attackRate:.72,armor:0,color:"#a5562d",unlockWave:4,lore:"Leicht gerüsteter Kundschafter. Seine hohe Geschwindigkeit lässt langsame Verteidigungslinien schnell überfordert wirken.",strength:"Sehr schnell",weakness:"Wenig Leben"},
 spear:{role:"JÄGER",visualClass:"normal",visualScale:1,name:"Speerjäger",icon:"🔱",baseHp:72,hpWave:11,baseSpeed:39,speedWave:.45,reward:17,damage:36,attackRate:1.12,armor:0,color:"#536345",unlockWave:3,lore:"Erfahrener Jäger mit langem Speer. Ausgewogene Werte machen ihn zu einem verlässlichen Angreifer der mittleren Wellen.",strength:"Ausgewogen",weakness:"Keine Rüstung"},
 shield:{role:"SCHILDTRÄGER",visualClass:"special",visualScale:1.16,name:"Eisenschild",icon:"🛡️",baseHp:145,hpWave:21,baseSpeed:25,speedWave:.35,reward:24,damage:46,attackRate:1.25,armor:.22,color:"#4d5964",unlockWave:6,lore:"Schwer gepanzerter Frontkämpfer. Sein massiver Eisenschild reduziert eingehenden Schaden und deckt nachrückende Krieger.",strength:"22 % Rüstung",weakness:"Langsam"},
 berserker:{role:"ELITE",visualClass:"special",visualScale:1.24,name:"Blutberserker",icon:"⚔️",baseHp:118,hpWave:17,baseSpeed:47,speedWave:.55,reward:29,damage:67,attackRate:.82,armor:.08,color:"#7e2523",unlockWave:10,lore:"Rasender Elitekrieger mit enormer Schlagkraft. Er hält wenig von Deckung und versucht, Verteidiger schnell zu überwältigen.",strength:"Hoher Schaden",weakness:"Teures Primärziel"},
 boss:{role:"BOSS",visualClass:"boss",visualScale:1.5,name:"Eisenclan-Häuptling",icon:"👑",baseHp:760,hpWave:65,baseSpeed:20,speedWave:.2,reward:135,damage:110,attackRate:1.5,armor:.18,color:"#352123",unlockWave:8,boss:true,lore:"Der gefürchtete Anführer der Eisenclans. Gewaltige Lebenspunkte, schwere Rüstung und vernichtende Angriffe machen ihn zum Zentrum jeder achten Angriffswelle.",strength:"Boss · 18 % Rüstung",weakness:"Sehr langsam"}
};

const DISCOVERY_KEY="fortressCommander.enemyCodex.v1";

export function enemyStatsFor(type,wave=1){
 const d=ENEMY_CODEX[type];
 if(!d)throw new Error(`Unbekannter Gegnertyp: ${type}`);
 const radius=d.radius||({runner:12,raider:14,spear:15,shield:18,berserker:17,boss:25}[type]||14);
 return {name:d.name,icon:d.icon,hp:d.baseHp+wave*d.hpWave,speed:d.baseSpeed+wave*d.speedWave,radius,reward:d.reward,damage:d.damage,attackRate:d.attackRate,armor:d.armor||0,color:d.color,lore:d.lore,strength:d.strength,weakness:d.weakness,role:d.role||"KRIEGER",boss:!!d.boss,visualClass:d.visualClass||"normal",visualScale:Number.isFinite(d.visualScale)?d.visualScale:1};
}

export function loadDiscoveredEnemies(){
 try{
  const saved=JSON.parse(localStorage.getItem(DISCOVERY_KEY)||"[]");
  return new Set(Array.isArray(saved)?saved:[]);
 }catch(_){
  return new Set();
 }
}

export function persistDiscoveredEnemies(discoveredEnemies){
 try{
  localStorage.setItem(DISCOVERY_KEY,JSON.stringify([...discoveredEnemies]));
  return true;
 }catch(_){
  return false;
 }
}
