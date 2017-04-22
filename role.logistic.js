var roleLogistic = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if ( !creep.memory.upgrade ) creep.memory.upgrade = Game.time;

      if(_.sum(creep.carry) == 0 && creep.memory.haul) {
            creep.memory.haul = false;
	    }
      if(!creep.memory.haul && _.sum(creep.carry) == creep.carryCapacity) {
          creep.memory.haul = true;
      }

	    if(!creep.memory.haul) {
        if (creep.collect()) {
          creep.memory.upgrade = Game.time;
          "Collecting"._(CREEP_TIER);
        } else {
          ( "Waiting for " + (Game.time - creep.memory.upgrade) )._(CREEP_TIER);
        }
      }
      else {
        creep.haul();
        ("Hauling")._(CREEP_TIER);
      }
	}

};

module.exports = roleLogistic;
