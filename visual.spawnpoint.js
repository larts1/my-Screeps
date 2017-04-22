var spawn;
var visual;

function visualSpawn(spawnPoint) {
  spawn = spawnPoint;
  visual = spawnPoint.room.visual;
}

visualSpawn.prototype.drawEnergy = function() {
  var txt = spawn.room.energyAvailable+"/"+spawn.room.energyCapacityAvailable;
  visual.text(txt, spawn.pos.x+1.9, spawn.pos.y+1.2);

  if (spawn.spawning) {
    var txt = Math.round(100 - (spawn.spawning.remainingTime/spawn.spawning.needTime)*100)+"% ";
    visual.text(txt+spawn.spawning.name, spawn.pos.x+1.9, spawn.pos.y+2.2);
  }else if (spawn.memory.spawning) {
    visual.text("0% "+spawn.memory.spawning, spawn.pos.x+1.9, spawn.pos.y+2.2);
  }

  if(spawn.memory.renewing) {
    visual.text("Renewing "+spawn.memory.renewing, spawn.pos.x+1.9, spawn.pos.y+3.2);
  }
}

module.exports = visualSpawn;
