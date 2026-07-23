const INSTALL_BUTTON_IDS=["startInstallAppBtn","navInstallApp","installAppSettingsBtn"];
let deferredInstallPrompt=null;
let serviceWorkerRegistration=null;
let updateReloadRequested=false;

function byId(id){return document.getElementById(id)}
function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true}
function setHidden(element,hidden){element?.classList.toggle("hidden",hidden)}
function setText(id,text){const element=byId(id);if(element)element.textContent=text}
function showStatus(message,type="info"){
 const toast=byId("pwaStatusToast");if(!toast)return;
 toast.textContent=message;toast.dataset.type=type;toast.classList.remove("hidden");
 clearTimeout(showStatus.timer);showStatus.timer=setTimeout(()=>toast.classList.add("hidden"),3600);
}
function updateInstallUi(){
 const installed=isStandalone();
 const canPrompt=Boolean(deferredInstallPrompt)&&!installed;
 INSTALL_BUTTON_IDS.forEach(id=>setHidden(byId(id),!canPrompt));
 setHidden(byId("pwaInstallCard"),!canPrompt);
 setText("pwaInstallState",installed?"App installiert":canPrompt?"Installation verfügbar":"Browser-Version");
 setText("pwaInstallDescription",installed
  ?"Fortress Commander läuft als installierte App. Spielstände bleiben lokal auf diesem Gerät gespeichert."
  :canPrompt?"Die App kann jetzt installiert werden und startet danach ohne sichtbare Browserleiste."
  :"Öffne in Chrome das Browsermenü und wähle „Zum Startbildschirm hinzufügen“, sobald die Installation angeboten wird.");
 document.body.classList.toggle("pwaStandalone",installed);
}
async function requestInstall(){
 if(isStandalone()){showStatus("Fortress Commander ist bereits als App installiert.","success");return}
 if(!deferredInstallPrompt){showStatus("Die Installation wird vom Browser momentan nicht angeboten. Öffne das Chrome-Menü und wähle „Zum Startbildschirm hinzufügen“.");return}
 const prompt=deferredInstallPrompt;deferredInstallPrompt=null;updateInstallUi();
 try{
  await prompt.prompt();
  const choice=await prompt.userChoice;
  showStatus(choice?.outcome==="accepted"?"Installation gestartet.":"Installation wurde vorerst abgebrochen.",choice?.outcome==="accepted"?"success":"info");
 }catch{showStatus("Die Installation konnte nicht gestartet werden.","error")}
 updateInstallUi();
}
function hideLaunchScreen(){
 const launch=byId("appLaunchScreen");if(!launch||launch.classList.contains("launchHidden"))return;
 launch.classList.add("launchReady");
 setTimeout(()=>{launch.classList.add("launchHidden");launch.setAttribute("aria-hidden","true")},440);
}
function prepareLaunchScreen(){
 const started=performance.now();
 const finish=()=>setTimeout(hideLaunchScreen,Math.max(0,(matchMedia("(prefers-reduced-motion: reduce)").matches?120:720)-(performance.now()-started)));
 if(document.readyState==="complete")finish();else window.addEventListener("load",finish,{once:true});
 setTimeout(hideLaunchScreen,4500);
}
function updateConnectionStatus(){
 const offline=!navigator.onLine;
 setHidden(byId("pwaConnectionBadge"),!offline);
 document.body.classList.toggle("pwaOffline",offline);
 if(!offline&&updateConnectionStatus.wasOffline)showStatus("Internetverbindung wiederhergestellt.","success");
 updateConnectionStatus.wasOffline=offline;
}
function showUpdateBanner(registration){
 serviceWorkerRegistration=registration||serviceWorkerRegistration;
 setHidden(byId("appUpdateBanner"),false);
}
function hideUpdateBanner(){setHidden(byId("appUpdateBanner"),true)}
function bindPwaControls(){
 INSTALL_BUTTON_IDS.forEach(id=>byId(id)?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();requestInstall()}));
 byId("appUpdateLaterBtn")?.addEventListener("click",hideUpdateBanner);
 byId("appUpdateNowBtn")?.addEventListener("click",()=>{
  const waiting=serviceWorkerRegistration?.waiting;
  if(!waiting){hideUpdateBanner();return}
  updateReloadRequested=true;
  byId("appUpdateNowBtn").disabled=true;
  byId("appUpdateNowBtn").textContent="Update wird geladen …";
  waiting.postMessage({type:"SKIP_WAITING"});
 });
}
async function registerServiceWorker(){
 if(!("serviceWorker" in navigator)||!/^https?:$/.test(location.protocol))return;
 try{
  const workerUrl=new URL("../service-worker.js",import.meta.url);
  const scopeUrl=new URL("../",import.meta.url);
  const registration=await navigator.serviceWorker.register(workerUrl,{scope:scopeUrl.pathname,updateViaCache:"none"});
  serviceWorkerRegistration=registration;
  if(registration.waiting&&navigator.serviceWorker.controller)showUpdateBanner(registration);
  registration.addEventListener("updatefound",()=>{
   const worker=registration.installing;if(!worker)return;
   worker.addEventListener("statechange",()=>{
    if(worker.state==="installed"&&navigator.serviceWorker.controller)showUpdateBanner(registration);
   });
  });
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
   if(updateReloadRequested){updateReloadRequested=false;location.reload()}
  });
  const check=()=>registration.update().catch(()=>{});
  window.addEventListener("focus",check,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check()});
  setInterval(check,30*60*1000);
 }catch(error){console.warn("PWA-Service-Worker konnte nicht registriert werden:",error)}
}
export function initializePwa({version=""}={}){
 document.documentElement.dataset.pwaVersion=version;
 prepareLaunchScreen();bindPwaControls();updateInstallUi();updateConnectionStatus();
 window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;updateInstallUi();showStatus("Fortress Commander kann jetzt als App installiert werden.","success")});
 window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;updateInstallUi();showStatus("Fortress Commander wurde installiert.","success")});
 window.addEventListener("online",updateConnectionStatus);window.addEventListener("offline",updateConnectionStatus);
 registerServiceWorker();
}
