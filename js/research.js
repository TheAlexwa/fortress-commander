"use strict";

export const RESEARCH_BALANCE={
 guardHpPerLevel:.08,guardArmorPerLevel:.025,
 archerDamagePerLevel:.07,archerRangePerLevel:.06,archerRatePerLevel:.05,
 towerDamagePerLevel:.08,towerRatePerLevel:.05,towerHpPerLevel:.10,
 craftRepairPerLevel:.12,craftWoodPerLevel:.07,craftSpeedPerLevel:.08
};

export const RESEARCH_TABS=[
 {id:"fortress",label:"🏰 Festung",intro:"Technologien für die zentrale Verteidigung und die Erholung zwischen Angriffswellen."},
 {id:"guard",label:"🛡 Burgwache",intro:"Defensive Ausbildung für widerstandsfähige Nahkämpfer."},
 {id:"archer",label:"🏹 Bogenschützen",intro:"Fernkampftechnologien für Schaden, Reichweite und Angriffstempo."},
 {id:"tower",label:"🗼 Türme",intro:"Globale Werkstattverbesserungen für Bogen-, Armbrust- und Katapulttürme."},
 {id:"craft",label:"🔨 Handwerker",intro:"Verbesserungen für Reparaturleistung, Holzbedarf und Beweglichkeit."}
];

export const RESEARCH_TECHS={
 fortress:[{id:"fortress_autoRepair",icon:"🏰",name:"Automatische Wellenreparatur",desc:"Schaltet stufenweise eine automatische Reparatur der Festungsmauern nach jeder Welle frei.",max:5,costs:[3,5,8,12,17],values:["10 %","15 %","20 %","25 %","30 %"]}],
 guard:[
  {id:"guard_hp",icon:"♥",name:"Verstärkte Konstitution",desc:"Erhöht die maximalen Lebenspunkte aller Burgwachen um 8 % je Stufe.",max:5,costs:[2,4,7,10,14]},
  {id:"guard_armor",icon:"🛡",name:"Gehärtete Rüstung",desc:"Erhöht die Rüstung aller Burgwachen um 2,5 Prozentpunkte je Stufe.",max:5,costs:[3,5,8,12,16],requires:"guard_hp"}
 ],
 archer:[
  {id:"archer_damage",icon:"⚔",name:"Durchschlagskräftige Pfeile",desc:"Erhöht den Schaden aller Bogenschützen um 7 % je Stufe.",max:5,costs:[2,4,7,10,14]},
  {id:"archer_range",icon:"◎",name:"Ballistische Berechnung",desc:"Erhöht die Reichweite aller Bogenschützen um 6 % je Stufe.",max:5,costs:[3,5,8,12,16],requires:"archer_damage"},
  {id:"archer_rate",icon:"✦",name:"Schneller Köchergriff",desc:"Verkürzt die Angriffszeit aller Bogenschützen um 5 % je Stufe.",max:5,costs:[4,6,9,13,18],requires:"archer_range"}
 ],
 tower:[
  {id:"tower_damage",icon:"🎯",name:"Gehärtete Geschosse",desc:"Erhöht den Schaden aller Türme um 8 % je Stufe.",max:3,costs:[3,6,10]},
  {id:"tower_rate",icon:"⚙",name:"Präzise Mechanik",desc:"Verkürzt die Nachladezeit aller Türme um 5 % je Stufe.",max:3,costs:[4,7,11],requires:"tower_damage"},
  {id:"tower_hp",icon:"🧱",name:"Verstärkte Turmkonstruktion",desc:"Erhöht die maximalen Lebenspunkte aller Türme um 10 % je Stufe.",max:3,costs:[5,8,12],requires:"tower_rate"}
 ],
 craft:[
  {id:"craft_repair",icon:"🔨",name:"Effiziente Reparatur",desc:"Erhöht die Reparaturleistung der Handwerker um 12 % je Stufe.",max:5,costs:[2,4,7,10,14]},
  {id:"craft_wood",icon:"🪵",name:"Materialkunde",desc:"Senkt den Holzverbrauch pro Reparaturtakt um 7 % je Stufe.",max:5,costs:[3,5,8,12,16],requires:"craft_repair"},
  {id:"craft_speed",icon:"➤",name:"Leichte Werkzeugtaschen",desc:"Erhöht die Bewegungsgeschwindigkeit der Handwerker um 8 % je Stufe.",max:5,costs:[3,6,9,13,18],requires:"craft_wood"}
 ]
};

export function getResearchLevel(research,id){return Math.max(0,Number(research?.[id]||0))}
export function getRepairHpPerTick(research,base){return base*(1+getResearchLevel(research,"craft_repair")*RESEARCH_BALANCE.craftRepairPerLevel)}
export function getRepairWoodPerTick(research,base){return base*Math.max(.35,1-getResearchLevel(research,"craft_wood")*RESEARCH_BALANCE.craftWoodPerLevel)}
export function getCraftsmanMoveSpeed(research){return 150*(1+getResearchLevel(research,"craft_speed")*RESEARCH_BALANCE.craftSpeedPerLevel)}
export function getFortressAutoRepairPercent(research){return [0,.10,.15,.20,.25,.30][Math.min(5,getResearchLevel(research,"fortress_autoRepair"))]}

export function getResearchedUnitStats(key,build,research){
 const c=build[key],stats={hp:c.hp,damage:c.damage,range:c.range,rate:c.rate,speed:c.speed,armor:c.armor||0};
 if(key==="guard"){stats.hp*=1+getResearchLevel(research,"guard_hp")*RESEARCH_BALANCE.guardHpPerLevel;stats.armor=Math.min(.75,stats.armor+getResearchLevel(research,"guard_armor")*RESEARCH_BALANCE.guardArmorPerLevel)}
 if(key==="soldier"){stats.damage*=1+getResearchLevel(research,"archer_damage")*RESEARCH_BALANCE.archerDamagePerLevel;stats.range*=1+getResearchLevel(research,"archer_range")*RESEARCH_BALANCE.archerRangePerLevel;stats.rate*=Math.pow(1-RESEARCH_BALANCE.archerRatePerLevel,getResearchLevel(research,"archer_rate"))}
 return stats;
}


export function getResearchedTowerStats(key,build,research){
 const c=build[key],stats={hp:c.hp,damage:c.damage,range:c.range,rate:c.rate,speed:c.speed,splash:c.splash||0};
 stats.damage*=1+getResearchLevel(research,"tower_damage")*RESEARCH_BALANCE.towerDamagePerLevel;
 stats.rate*=Math.pow(1-RESEARCH_BALANCE.towerRatePerLevel,getResearchLevel(research,"tower_rate"));
 stats.hp*=1+getResearchLevel(research,"tower_hp")*RESEARCH_BALANCE.towerHpPerLevel;
 return stats;
}

export function applyResearchToUnits(units,techId,oldLevel,newLevel){
 if(newLevel<=oldLevel)return;
 for(const u of units){
  if((techId.startsWith("guard_")&&u.key!=="guard")||(techId.startsWith("archer_")&&u.key!=="soldier"))continue;
  if(techId==="guard_hp"){const factor=(1+newLevel*RESEARCH_BALANCE.guardHpPerLevel)/(1+oldLevel*RESEARCH_BALANCE.guardHpPerLevel);const oldMax=u.maxHp;u.maxHp*=factor;u.hp=Math.min(u.maxHp,u.hp+(u.maxHp-oldMax))}
  if(techId==="guard_armor")u.armor=Math.min(.75,(u.armor||0)+(newLevel-oldLevel)*RESEARCH_BALANCE.guardArmorPerLevel);
  if(techId==="archer_damage")u.damage*=(1+newLevel*RESEARCH_BALANCE.archerDamagePerLevel)/(1+oldLevel*RESEARCH_BALANCE.archerDamagePerLevel);
  if(techId==="archer_range")u.range*=(1+newLevel*RESEARCH_BALANCE.archerRangePerLevel)/(1+oldLevel*RESEARCH_BALANCE.archerRangePerLevel);
  if(techId==="archer_rate")u.rate*=Math.pow(1-RESEARCH_BALANCE.archerRatePerLevel,newLevel-oldLevel);
 }
}


export function applyResearchToTowers(buildings,techId,oldLevel,newLevel){
 if(newLevel<=oldLevel)return;
 for(const tower of buildings){
  if(tower.kind!=="building"||tower.base?.kind!=="tower")continue;
  if(techId==="tower_damage")tower.damage*=(1+newLevel*RESEARCH_BALANCE.towerDamagePerLevel)/(1+oldLevel*RESEARCH_BALANCE.towerDamagePerLevel);
  if(techId==="tower_rate")tower.rate*=Math.pow(1-RESEARCH_BALANCE.towerRatePerLevel,newLevel-oldLevel);
  if(techId==="tower_hp"){
   const factor=(1+newLevel*RESEARCH_BALANCE.towerHpPerLevel)/(1+oldLevel*RESEARCH_BALANCE.towerHpPerLevel);
   tower.maxHp*=factor;
   tower.hp=Math.min(tower.maxHp,Math.max(0,tower.hp*factor));
  }
 }
}

export function isResearchRequirementMet(tech,research){return !tech.requires||(research?.[tech.requires]||0)>0}
export function getResearchBaseCost(tech,research){const level=research?.[tech.id]||0;return tech.costs[Math.min(level,tech.costs.length-1)]}
export function getResearchCost(tech,research,multiplier=1){return Math.max(1,Math.ceil(getResearchBaseCost(tech,research)*multiplier))}
export function getAllResearchTechs(){return Object.values(RESEARCH_TECHS).flat()}
