const AUDIO_PREFERENCES_KEY="fortressCommander.audioPreferences.v1";
const AUDIO_DEFAULTS=Object.freeze({master:.78,effects:.86,ui:.62,music:.4,ambience:.24,muted:false});
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
const MUSIC_DEFINITIONS=Object.freeze({
 menu:{file:"music-menu.mp3",loop:true,volume:.72},
 build:{file:"music-build.mp3",loop:true,volume:.68},
 battle:{file:"music-battle.mp3",loop:true,volume:.75},
 boss:{file:"music-boss.mp3",loop:true,volume:.8},
 defeat:{file:"music-defeat.mp3",loop:false,volume:.76}
});
const AMBIENCE_DEFINITIONS=Object.freeze({
 castle:{file:"ambience-castle.mp3",loop:true,volume:.72},
 blacksmith:{file:"ambience-blacksmith.mp3",loop:true,volume:.7},
 wind:{file:"ambience-wind.mp3",loop:true,volume:.68}
});
const AUDIO_ROOT=new URL("../assets/audio/",import.meta.url);
const listeners=new Set();
const buffers=new Map();
const loading=new Map();
const lastPlayed=new Map();
const activeBySound=new Map();
const activeSources=new Set();
const musicChannels=[];
const ambienceChannels=new Map();
let context=null;
let masterGain=null;
let effectGain=null;
let uiGain=null;
let musicGain=null;
let ambienceGain=null;
let unlocked=false;
let initialized=false;
let hiddenPaused=false;
let preferences=loadPreferences();
let desiredMusicState="none";
let currentMusicState="none";
let activeMusicChannel=-1;
let musicTransitionToken=0;
let desiredAmbience={castle:0,blacksmith:0,wind:0};

function clamp01(value){return Math.max(0,Math.min(1,Number(value)||0))}
function loadPreferences(){
 try{
  const stored=JSON.parse(localStorage.getItem(AUDIO_PREFERENCES_KEY)||"null");
  return {
   master:Number.isFinite(stored?.master)?clamp01(stored.master):AUDIO_DEFAULTS.master,
   effects:Number.isFinite(stored?.effects)?clamp01(stored.effects):AUDIO_DEFAULTS.effects,
   ui:Number.isFinite(stored?.ui)?clamp01(stored.ui):AUDIO_DEFAULTS.ui,
   music:Number.isFinite(stored?.music)?clamp01(stored.music):AUDIO_DEFAULTS.music,
   ambience:Number.isFinite(stored?.ambience)?clamp01(stored.ambience):AUDIO_DEFAULTS.ambience,
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
 masterGain=context.createGain();
 effectGain=context.createGain();
 uiGain=context.createGain();
 musicGain=context.createGain();
 ambienceGain=context.createGain();
 effectGain.connect(masterGain);uiGain.connect(masterGain);musicGain.connect(masterGain);ambienceGain.connect(masterGain);masterGain.connect(context.destination);
 applyGainValues();
 return context;
}
function applyBusGain(node,value,now){
 if(!node)return;
 node.gain.cancelScheduledValues(now);
 node.gain.setTargetAtTime(value,now,.025);
}
function applyGainValues(){
 if(!context||!masterGain||!effectGain||!uiGain||!musicGain||!ambienceGain)return;
 const now=context.currentTime;
 applyBusGain(masterGain,preferences.muted?0:preferences.master,now);
 applyBusGain(effectGain,preferences.effects,now);
 applyBusGain(uiGain,preferences.ui,now);
 applyBusGain(musicGain,preferences.music,now);
 applyBusGain(ambienceGain,preferences.ambience,now);
}
function longAudioMayPlay(bus="music"){
 if(!unlocked||hiddenPaused||document.hidden||preferences.muted||preferences.master<=0)return false;
 return bus==="music"?preferences.music>0:preferences.ambience>0;
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
function createLongChannel(bus="music"){
 const ctx=createContext();
 if(!ctx)return null;
 const element=new Audio();
 element.preload="auto";
 element.playsInline=true;
 const source=ctx.createMediaElementSource(element);
 const gain=ctx.createGain();
 gain.gain.value=0;
 source.connect(gain);gain.connect(bus==="music"?musicGain:ambienceGain);
 const channel={element,source,gain,key:"",target:0,stopTimer:null,version:0};
 element.addEventListener("error",()=>console.warn("Lange Audiodatei konnte nicht geladen werden:",element.currentSrc||element.src));
 return channel;
}
function ensureMusicChannels(){
 while(musicChannels.length<2){const channel=createLongChannel("music");if(!channel)break;musicChannels.push(channel)}
 return musicChannels.length===2;
}
function clearChannelTimer(channel){if(channel?.stopTimer!==null){clearTimeout(channel.stopTimer);channel.stopTimer=null}}
function setChannelSource(channel,key,definition){
 const sourceUrl=new URL(definition.file,AUDIO_ROOT).href;
 if(channel.key===key&&channel.element.src===sourceUrl)return;
 clearChannelTimer(channel);
 channel.element.pause();
 channel.element.src=sourceUrl;
 channel.element.loop=definition.loop!==false;
 channel.element.load();
 channel.key=key;
}
function scheduleChannelGain(channel,target,seconds=.8){
 if(!context||!channel)return;
 const now=context.currentTime;
 const duration=Math.max(.05,Number(seconds)||.8);
 channel.target=Math.max(0,Number(target)||0);
 const parameter=channel.gain.gain;
 if(typeof parameter.cancelAndHoldAtTime==="function")parameter.cancelAndHoldAtTime(now);
 else{parameter.cancelScheduledValues(now);parameter.setValueAtTime(Math.max(0,parameter.value),now)}
 parameter.linearRampToValueAtTime(channel.target,now+duration);
}
function pauseChannelAfter(channel,seconds,reset=false){
 if(!channel)return;
 clearChannelTimer(channel);
 channel.stopTimer=setTimeout(()=>{
  channel.stopTimer=null;
  if(channel.target>0)return;
  channel.element.pause();
  if(reset){try{channel.element.currentTime=0}catch{}}
 },Math.max(80,seconds*1000+80));
}
async function playMediaElement(element){
 try{await element.play();return true}
 catch(error){console.warn("Lange Audiodatei wartet auf Benutzerinteraktion:",error?.message||error);return false}
}
async function transitionMusic(nextState,{fadeSeconds=2.2,restart=false}={}){
 const key=MUSIC_DEFINITIONS[nextState]?nextState:"none";
 desiredMusicState=key;
 const token=++musicTransitionToken;
 if(!longAudioMayPlay("music"))return false;
 const ctx=await ensureAudioReady();
 if(!ctx||!ensureMusicChannels()||token!==musicTransitionToken)return false;
 const current=musicChannels[activeMusicChannel]||null;
 if(key==="none"){
  if(current){scheduleChannelGain(current,0,fadeSeconds);pauseChannelAfter(current,fadeSeconds,false)}
  activeMusicChannel=-1;currentMusicState="none";
  return true;
 }
 if(!restart&&current&&currentMusicState===key&&current.key===key){
  clearChannelTimer(current);
  if(current.element.paused)await playMediaElement(current.element);
  scheduleChannelGain(current,MUSIC_DEFINITIONS[key].volume,.35);
  return true;
 }
 const previousIndex=activeMusicChannel,previousState=currentMusicState;
 const nextIndex=activeMusicChannel===0?1:0;
 const next=musicChannels[nextIndex];
 clearChannelTimer(next);
 next.element.pause();
 scheduleChannelGain(next,0,.05);
 setChannelSource(next,key,MUSIC_DEFINITIONS[key]);
 try{next.element.currentTime=0}catch{}
 activeMusicChannel=nextIndex;currentMusicState=key;
 const started=await playMediaElement(next.element);
 if(token!==musicTransitionToken)return false;
 if(!started){activeMusicChannel=previousIndex;currentMusicState=previousState;next.element.pause();return false}
 scheduleChannelGain(next,MUSIC_DEFINITIONS[key].volume,fadeSeconds);
 if(current&&current!==next){scheduleChannelGain(current,0,fadeSeconds);pauseChannelAfter(current,fadeSeconds,true)}
 return true;
}
function ensureAmbienceChannel(key){
 if(ambienceChannels.has(key))return ambienceChannels.get(key);
 const definition=AMBIENCE_DEFINITIONS[key];
 if(!definition)return null;
 const channel=createLongChannel("ambience");
 if(!channel)return null;
 setChannelSource(channel,key,definition);
 ambienceChannels.set(key,channel);
 return channel;
}
async function applyAmbienceChannel(key,target,{fadeSeconds=1.8}={}){
 const definition=AMBIENCE_DEFINITIONS[key];
 if(!definition)return false;
 const level=clamp01(target);
 const channel=ensureAmbienceChannel(key);
 if(!channel)return false;
 const version=++channel.version;
 const effectiveTarget=level*definition.volume;
 if(effectiveTarget<=.001||!longAudioMayPlay("ambience")){
  scheduleChannelGain(channel,0,fadeSeconds);
  pauseChannelAfter(channel,fadeSeconds,false);
  return true;
 }
 clearChannelTimer(channel);
 if(channel.element.paused){
  const started=await playMediaElement(channel.element);
  if(version!==channel.version)return false;
  if(!started)return false;
 }
 if(version!==channel.version)return false;
 scheduleChannelGain(channel,effectiveTarget,fadeSeconds);
 return true;
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
  music:"music" in next?clamp01(next.music):preferences.music,
  ambience:"ambience" in next?clamp01(next.ambience):preferences.ambience,
  muted:"muted" in next?Boolean(next.muted):preferences.muted
 };
 persistPreferences();applyGainValues();notify();
 if(preferences.muted||preferences.master<=0)pauseLongAudio();
 else{
  if(preferences.music<=0)for(const channel of musicChannels){clearChannelTimer(channel);channel.element.pause()}
  if(preferences.ambience<=0)for(const channel of ambienceChannels.values()){clearChannelTimer(channel);channel.element.pause()}
  queueMicrotask(()=>resumeLongAudio());
 }
 return getAudioPreferences();
}
export function updateAudioPreferences(next={}){return setAudioPreferences(next)}
export function toggleAudioMute(){return setAudioPreferences({muted:!preferences.muted})}
export function subscribeAudioPreferences(listener){if(typeof listener!=="function")return()=>{};listeners.add(listener);return()=>listeners.delete(listener)}
export async function preloadAudio(){await ensureAudioReady();await Promise.all(Object.keys(SOUND_DEFINITIONS).map(decodeSound));return buffers.size}
export function setMusicState(state,options={}){return transitionMusic(state,options)}
export function setAmbienceState(next={},options={}){
 const normalized={};
 for(const key of Object.keys(AMBIENCE_DEFINITIONS))normalized[key]=clamp01(next[key]);
 desiredAmbience=normalized;
 return Promise.all(Object.entries(normalized).map(([key,value])=>applyAmbienceChannel(key,value,options)));
}
export function updateAudioScene(scene={}){
 const fadeSeconds=Math.max(.2,Math.min(5,Number(scene.fadeSeconds)||2.2));
 const music=MUSIC_DEFINITIONS[scene.music]?scene.music:"none";
 if(music!==desiredMusicState||scene.restartMusic===true)setMusicState(music,{fadeSeconds,restart:scene.restartMusic===true});
 const ambience=scene.ambience||{};
 const changed=Object.keys(AMBIENCE_DEFINITIONS).some(key=>Math.abs(clamp01(ambience[key])-clamp01(desiredAmbience[key]))>=.025);
 if(changed)setAmbienceState(ambience,{fadeSeconds:Math.min(2.5,Math.max(.6,fadeSeconds))});
 return {music,ambience:{...desiredAmbience}};
}
export function pauseLongAudio(){
 hiddenPaused=document.hidden;
 for(const channel of musicChannels){clearChannelTimer(channel);channel.element.pause()}
 for(const channel of ambienceChannels.values()){clearChannelTimer(channel);channel.element.pause()}
}
export async function resumeLongAudio(){
 hiddenPaused=false;
 if(!longAudioMayPlay("music")&&!longAudioMayPlay("ambience"))return false;
 await ensureAudioReady();
 if(longAudioMayPlay("music")&&desiredMusicState!=="none")await transitionMusic(desiredMusicState,{fadeSeconds:.65,restart:false});
 if(longAudioMayPlay("ambience"))await Promise.all(Object.entries(desiredAmbience).map(([key,value])=>applyAmbienceChannel(key,value,{fadeSeconds:.8})));
 return true;
}
export function stopAllLongAudio(){
 desiredMusicState="none";currentMusicState="none";activeMusicChannel=-1;desiredAmbience={castle:0,blacksmith:0,wind:0};musicTransitionToken++;
 for(const channel of musicChannels){clearChannelTimer(channel);scheduleChannelGain(channel,0,.08);channel.element.pause();try{channel.element.currentTime=0}catch{}}
 for(const channel of ambienceChannels.values()){clearChannelTimer(channel);scheduleChannelGain(channel,0,.08);channel.element.pause();try{channel.element.currentTime=0}catch{}}
}
export function initializeAudio(){
 if(initialized)return getAudioPreferences();
 initialized=true;
 const unlock=()=>{ensureAudioReady().then(()=>Promise.allSettled([resumeLongAudio(),preloadAudio()]))};
 window.addEventListener("pointerdown",unlock,{once:true,capture:true,passive:true});
 window.addEventListener("keydown",unlock,{once:true,capture:true});
 document.addEventListener("visibilitychange",()=>{
  if(document.hidden){hiddenPaused=true;stopAllSounds();pauseLongAudio();if(context?.state==="running")context.suspend().catch(()=>{})}
  else if(unlocked){hiddenPaused=false;(async()=>{if(context?.state==="suspended")try{await context.resume()}catch{};await resumeLongAudio()})()}
 });
 window.addEventListener("pagehide",()=>{stopAllSounds();pauseLongAudio()},{passive:true});
 notify();
 return getAudioPreferences();
}
