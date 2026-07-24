import {
  BASE_TROOP_CAPACITY,
  HARD_TROOP_CAPACITY,
  troopCostForUnit,
  troopCapacityForHouse,
  totalTroopCapacity,
  usedTroopCapacity,
  troopCapacityStatus,
} from "../js/troops.js";

const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(BASE_TROOP_CAPACITY === 2, "Grundkapazität muss 2 betragen");
assert(HARD_TROOP_CAPACITY === 24, "Sicherheitslimit muss 24 betragen");
assert(troopCostForUnit("soldier") === 1, "Bogenschütze muss 1 Platz belegen");
assert(troopCostForUnit("guard") === 1, "Burgwache muss 1 Platz belegen");
assert(troopCostForUnit("hero") === 0, "Andreas darf keinen Platz belegen");
assert(troopCapacityForHouse({ key: "house", hp: 100, level: 1, material: "wood" }) === 2, "Zeltlager muss +2 geben");
assert(troopCapacityForHouse({ key: "house", hp: 100, level: 2, material: "wood" }) === 4, "Holzhaus muss +4 geben");
assert(troopCapacityForHouse({ key: "house", hp: 100, level: 3, material: "wood" }) === 5, "Großes Holzhaus muss +5 geben");
assert(troopCapacityForHouse({ key: "house", hp: 100, level: 3, material: "stone" }) === 6, "Steinhaus muss +6 geben");
assert(troopCapacityForHouse({ key: "house", hp: 0, level: 3, material: "stone" }) === 0, "Zerstörtes Haus darf keine Kapazität geben");

const state = {
  buildings: [
    { key: "house", bid: 1, hp: 100, level: 1, material: "wood" },
    { key: "house", bid: 2, hp: 100, level: 2, material: "wood" },
  ],
  units: [
    { key: "soldier", hp: 100 },
    { key: "guard", hp: 100 },
    { key: "hero", hp: 100 },
  ],
};
assert(totalTroopCapacity(state) === 8, "Grundkapazität plus Häuser ist falsch");
assert(usedTroopCapacity(state) === 2, "Verbrauchte Truppenplätze sind falsch");
assert(troopCapacityStatus(state, "guard").canTrain, "Freier Truppenplatz wird fälschlich gesperrt");

state.buildings = [];
state.units = [
  { key: "soldier", hp: 100 },
  { key: "guard", hp: 100 },
];
assert(!troopCapacityStatus(state, "soldier").canTrain, "Ausbildung über Kapazität wird nicht gesperrt");
state.buildings = [{ key: "house", hp: 100, level: 3, material: "wood" }];
assert(troopCapacityStatus(state).capacity === 7, "Großes Holzhaus plus Grundkapazität ist falsch");
state.buildings[0].hp = 0;
assert(troopCapacityStatus(state).overLimit === false, "Gleichstand am Grundlimit darf nicht als Überbelegung gelten");
state.units.push({ key: "soldier", hp: 100 });
assert(troopCapacityStatus(state).overLimit, "Kapazitätsverlust muss als Überbelegung angezeigt werden");

if (failures.length) {
  console.error("Truppenprüfung fehlgeschlagen:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Truppenprüfung erfolgreich: Grundlimit, Häuser, Andreas, Überbelegung und Sicherheitslimit bestätigt.");
