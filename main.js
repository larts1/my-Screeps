var visualizer = require('visual.spawnpoint');

ATTACK_STRENGTH = 1;
CREEP_TIER = 4;

UPGRADER_COUNT = 1;
BUILDER_COUNT = 1;
CLAIMER_COUNT = 1;
OSBUILDER_COUNT = 0;

DEFENCE_TIMEOUT = 200;
WALL_HP = 100000;

HAUL_RETARGET = 10;
HARVESTOWN_RETARGET = 500;

var roles = [];
var roles_ = [];
var roleCount = [];

roles_["builder"] = {"work":5, "move":3, "carry":5};
roles_["osbuilder"] = {"work":5, "move":10, "carry":5};
roles_["upgrader"] = {"work":13, "move":1, "carry":4};
roles_["logistic"] = {"work":0, "move":8, "carry":16};
roles_["looter"] = {"work":0, "move":8, "carry":15};
roles_["harvester"] = {"work":6, "move":1, "carry":1}; //CLEARS NODE even if transfering
roles_["claimer"] = {"work":0, "move":1, "carry":0, "claim":2};
roles_["melee"] = {"attack":8, "move":3, "heal":0, "hp":1};

roles_["tank"] = {"attack":0, "move":2, "heal":0, "hp":10};
roles_["ranged"] = {"attack":0, "move":1, "heal":0, "rattack":1};

//extend objects
require('state.room');
require('spawnActions');
require('creepActions');

Memory.needForTrade = { "E92S1" : { "energy" : 30000 } }

// Memory.hauling = {}
// Memory.looting = {}


module.exports.loop = function () {

  PathFinder.use(true);
  RawMemory.setActiveSegments([0]);

  var gclProg = "GCL: " + Math.floor(Game.gcl.progress/1000) +"K/"+ Math.floor(Game.gcl.progressTotal/1000) + "K";
  RawMemory.segments[0] = "Current game state:\n" +gclProg;

  if ((Game.time % 250) == 0) clearMemory();

  var spawnVisual;

  for (var spawn in Game.spawns) {
    ("In spawn: " + spawn)._(1, true)
    spawnVisual = new visualizer(Game.spawns[spawn]);

    if (Memory.debug) var initCost = Game.cpu.getUsed();
    Game.spawns[spawn].init(roles_, roleCount, Game.spawns[spawn]);
    if (Memory.debug) ("Init CPU cost:" + (Game.cpu.getUsed() - initCost).toFixed(3) )._(1, true);

    if (Memory.debug) var spawnCreepsCost = Game.cpu.getUsed();
    Game.spawns[spawn].spawnCreeps();
    if (Memory.debug) ("spawnCreeps CPU cost:" + (Game.cpu.getUsed() - spawnCreepsCost).toFixed(3) )._(1, true);

    spawnVisual.drawEnergy();

    if (Memory.debug) var runSpawnCost = Game.cpu.getUsed();
    Game.spawns[spawn].runSpawn();
    if (Memory.debug) ("runSpawn CPU cost:" + (Game.cpu.getUsed() - runSpawnCost).toFixed(3) )._(1, true);

    ("-----")._(0, true);
  }

}

function clearMemory() {
  Memory.hauling = {}
  Memory.looting = {}
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}
