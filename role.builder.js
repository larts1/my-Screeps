var roleLogistic = require('role.logistic')

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if ( creep.deBuild() ) {
        ("Debuilding")._(CREEP_TIER);
        return;
      }

      if ( creep.storeMinerals() ) {
        return;
      }

      //SET STATES
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }

	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

      //RUN STATES
	    if(creep.memory.building) {

	        if (!creep.buildClosest()) {
            creep.haul();
            ("Hauling")._(CREEP_TIER);
          } else ("Building")._( CREEP_TIER);
	    }
	    else{ //DEFAULT STATE
            if (!creep.harvestContainer()) creep.harvestClosest();
            ("Collecting")._(CREEP_TIER);
	    }

	}
};

module.exports = roleBuilder;
