function tower() {

}

tower.prototype.shootAndHeal = function (tower, room) {
  var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if(closestHostile) {
     console.log("HOSTILEEEEEEEES")
      tower.attack(closestHostile);
      return;
  }

   var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
       filter: (structure) => {return structure.hits < (structure.hitsMax/4) && structure.hitsMax < 1000000}
   });

   if(closestDamagedStructure &&
     (tower.id != "58e95dfa57a51af2213de30a") ) {
      tower.repair(closestDamagedStructure);
      return;
   }

   var creep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
       filter: (structure) => {return structure.hits < structure.hitsMax}
   });

   if (creep) {
     tower.heal(creep);
     return;
   }



}

module.exports = tower;
