var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

      creep.harvestOwnMineral();

      if(_.sum(creep.carry) == creep.carryCapacity ) {

        creep.haul();

      }

      ("Harvesting")._(CREEP_TIER);
	}

};

module.exports = roleHarvester;
