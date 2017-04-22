var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if (!creep.memory.upgrade) creep.memory.upgrade = Game.time;

      if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	    }

	    if(creep.memory.upgrading) {
          creep.memory.upgrade = Game.time;
          creep.upgrade();
          ("Upgrading")._( CREEP_TIER);
      }
      else {
        ("Getting energy for " + (Game.time - creep.memory.upgrade))._(CREEP_TIER);
        if (!creep.harvestContainer()) {
          creep.cmoveTo(creep.room.controller);
        }
      }

	}
};

module.exports = roleUpgrader;
