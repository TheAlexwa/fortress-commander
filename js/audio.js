const AUDIO_PREFERENCES_KEY="fortressCommander.audioPreferences.v1";
const AUDIO_DEFAULTS=Object.freeze({master:.78,effects:.86,ui:.62,muted:false});
const SOUND_DEFINITIONS=Object.freeze({
 uiClick:{file:"ui-click.mp3",bus:"ui",volume:.58,cooldown:45,maxVoices:4,rateVariation:.018},
 uiClose:{file:"ui-close.mp3",bus:"ui",volume:.55,cooldown:100,maxVoices:2,rateVariation:.01},
 uiError:{file:"ui-error.mp3",bus:"ui",volume:.72,cooldown:180,maxVoices:2},
 buildPlace:{file:"build-place.mp3",bus:"effects",volume:.78,cooldown:180,maxVoices:2,rateVariation:.025},
 upgradeComplete:{file:"upgrade-complete.mp3",bus:"effects",volume:.76,cooldown:240,maxVoices:2},
 repair:{file:"repair.mp3",bus:"effects",volume:.52,cooldown:820,maxVoices:1,rateVariation:.035},
 arrowShot:{file:"arrow-shot.mp3",bus:"effects",volume:.44,cooldown:72,maxVoices:4,rateVariation:.045},
 meleeHit:{file:"melee-hit.mp3",bus:"effects",volume:.46,cooldown:95,maxVoices:4,rateVariation:.05},
 towerShot:{file:"tower-shot.mp3",bus:"effects",volume:.62,cooldown:125,maxVoices:3,rateVariation:.028},
 siegeImpact:{file:"siege-impact.mp3",bus:"effects",volume:.72,cooldown:330,maxVoices:2,rateVariation:.018},
 waveHorn:{file:"wave-horn.mp3",bus:"effects",volume:.88,cooldown:2500,maxVoices:1},
 waveVictory:{file:"wave-victory.mp3",bus:"effects",volume:.84,cooldown:2500,maxVoices:1}
});
const AUDIO_ROOT=new URL("../assets/audio/",import.meta.url);
const listeners=new Set();
const buffers=new Map();
const loading=new Map();
const lastPlayed=new Map();
const activeBySound=new Map();
const activeSources=new Set();
let context=null;
let masterGain=null;
let effectGain=null;
let uiGain=null;
let unlocked=false;
let initialized=false;
let preferences=loadPreferences();

function clamp01(value){return Math.max(0,Math.min(1,Number(value)||0))}
function loadPreferences(){
 try{
  const stored=JSON.parse(localStorage.getItem(AUDIO_PREFERENCES_KEY)||"null");
  return {
   master:Number.isFinite(stored?.master)?clamp01(stored.master):AUDIO_DEFAULTS.master,
   effects:Number.isFinite(stored?.effects)?clamp01(stored.effects):AUDIO_DEFAULTS.effects,
   ui:Number.isFinite(stored?.ui)?clamp01(stored.ui):AUDIO_DEFAULTS.ui,
   muted:stored?.muted===true
  };
 }catch{return {...AUDIO_DEFAULTS}}
}
function persistPreferences(){try{localStorage.setItem(AUDIO_PREFERENCES_KEY,JSON.stringify(preferences))}catch{}}
function notify(){const snapshot=getAudioPreferences();for(const listener of listeners){try{listener(snapshot)}catch{}}}
function createContext(){
 if(context)return context;
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass)return null;
 context=new AudioContextClass({latencyHint:"interactive"});
 masterGain=context.createGain();effectGain=context.createGain();uiGain=context.createGain();
 effectGain.connect(masterGain);uiGain.connect(masterGain);masterGain.connect(context.destination);
 applyGainValues();
 return context;
}
function applyGainValues(){
 if(!context||!masterGain||!effectGain||!uiGain)return;
 const now=context.currentTime;
 const master=preferences.muted?0:preferences.master;
 masterGain.gain.cancelScheduledValues(now);masterGain.gain.setTargetAtTime(master,now,.025);
 effectGain.gain.cancelScheduledValues(now);effectGain.gain.setTargetAtTime(preferences.effects,now,.025);
 uiGain.gain.cancelScheduledValues(now);uiGain.gain.setTargetAtTime(preferences.ui,now,.025);
}
async function ensureAudioReady(){
 const ctx=createContext();
 if(!ctx)return null;
 const wasUnlocked=unlocked;unlocked=true;
 if(ctx.state==="suspended"){
  try{await ctx.resume()}catch{}
 }
 if(!wasUnlocked)notify();
 return ctx;
}
async function decodeSound(id){
 if(buffers.has(id))return buffers.get(id);
 if(loading.has(id))return loading.get(id);
 const definition=SOUND_DEFINITIONS[id];
 if(!definition)return null;
 const task=(async()=>{
  try{
   const response=await fetch(new URL(definition.file,AUDIO_ROOT),{cache:"force-cache"});
   if(!response.ok)throw new Error(`Audio ${id}: ${response.status}`);
   const data=await response.arrayBuffer();
   const ctx=await ensureAudioReady();
   if(!ctx)return null;
   const buffer=await ctx.decodeAudioData(data.slice(0));
   buffers.set(id,buffer);
   return buffer;
  }catch(error){console.warn("Sound konnte nicht geladen werden:",id,error);return null}
  finally{loading.delete(id)}
 })();
 loading.set(id,task);
 return task;
}
function disconnectSource(record){
 if(!record)return;
 activeSources.delete(record);
 const set=activeBySound.get(record.id);if(set){set.delete(record);if(!set.size)activeBySound.delete(record.id)}
 try{record.source.disconnect()}catch{}
 try{record.gain.disconnect()}catch{}
}
function stopRecord(record){
 if(!record)return;
 try{record.source.stop()}catch{}
 disconnectSource(record);
}
function enforceVoiceLimits(id,maxVoices){
 const set=activeBySound.get(id);
 if(set&&set.size>=maxVoices){const oldest=[...set].sort((a,b)=>a.started-b.started)[0];stopRecord(oldest)}
 const GLOBAL_LIMIT=18;
 if(activeSources.size>=GLOBAL_LIMIT){const oldest=[...activeSources].sort((a,b)=>a.started-b.started)[0];stopRecord(oldest)}
}
export async function playSound(id,options={}){
 const definition=SOUND_DEFINITIONS[id];
 if(!definition||preferences.muted||preferences.master<=0)return false;
 const now=performance.now();
 const cooldown=Math.max(0,Number(options.cooldown??definition.cooldown)||0);
 if(!options.force&&now-(lastPlayed.get(id)||-Infinity)<cooldown)return false;
 const ctx=await ensureAudioReady();
 if(!ctx||ctx.state!=="running")return false;
 const buffer=await decodeSound(id);if(!buffer)return false;
 lastPlayed.set(id,now);
 enforceVoiceLimits(id,Math.max(1,Number(definition.maxVoices)||1));
 const source=ctx.createBufferSource();
 const gain=ctx.createGain();
 const variation=Math.max(0,Number(definition.rateVariation)||0);
 source.buffer=buffer;
 source.playbackRate.value=Math.max(.75,Math.min(1.25,Number(options.playbackRate)||1+(Math.random()*2-1)*variation));
 gain.gain.value=Math.max(0,Math.min(2,(Number(definition.volume)||1)*(Number(options.volume)||1)));
 if(typeof ctx.createStereoPanner==="function"&&Number.isFinite(options.pan)){
  const panner=ctx.createStereoPanner();panner.pan.value=Math.max(-1,Math.min(1,options.pan));source.connect(gain);gain.connect(panner);panner.connect(definition.bus==="ui"?uiGain:effectGain);
 }else{source.connect(gain);gain.connect(definition.bus==="ui"?uiGain:effectGain)}
 const record={id,source,gain,started:performance.now()};
 if(!activeBySound.has(id))activeBySound.set(id,new Set());
 activeBySound.get(id).add(record);activeSources.add(record);
 source.addEventListener("ended",()=>disconnectSource(record),{once:true});
 try{source.start(0);return true}catch{disconnectSource(record);return false}
}
export function stopAllSounds(){for(const record of [...activeSources])stopRecord(record)}
export function getAudioPreferences(){return {...preferences,available:Boolean(window.AudioContext||window.webkitAudioContext),unlocked}}
export function setAudioPreferences(next={}){
 preferences={
  master:"master" in next?clamp01(next.master):preferences.master,
  effects:"effects" in next?clamp01(next.effects):preferences.effects,
  ui:"ui" in next?clamp01(next.ui):preferences.ui,
  muted:"muted" in next?Boolean(next.muted):preferences.muted
 };
 persistPreferences();applyGainValues();notify();return getAudioPreferences();
}
export function toggleAudioMute(){return setAudioPreferences({muted:!preferences.muted})}
export function subscribeAudioPreferences(listener){if(typeof listener!=="function")return()=>{};listeners.add(listener);return()=>listeners.delete(listener)}
export async function preloadAudio(){await ensureAudioReady();await Promise.all(Object.keys(SOUND_DEFINITIONS).map(decodeSound));return buffers.size}
export function initializeAudio(){
 if(initialized)return getAudioPreferences();
 initialized=true;
 const unlock=()=>{ensureAudioReady().then(()=>preloadAudio())};
 window.addEventListener("pointerdown",unlock,{once:true,capture:true,passive:true});
 window.addEventListener("keydown",unlock,{once:true,capture:true});
 document.addEventListener("visibilitychange",()=>{
  if(document.hidden){stopAllSounds();if(context?.state==="running")context.suspend().catch(()=>{})}
  else if(unlocked&&context?.state==="suspended")context.resume().catch(()=>{});
 });
 window.addEventListener("pagehide",stopAllSounds,{passive:true});
 notify();
 return getAudioPreferences();
}
