var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {


      if(creep.carry.energy == creep.carryCapacity) {
        var link = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
          filter: (x) => {return (x.structureType == STRUCTURE_LINK)}})[0];
          if (link) {
            creep.room.checkLinks(link);
            if ( creep.transfer(link, RESOURCE_ENERGY) ) creep.drop(RESOURCE_ENERGY);
            "Throwing to link"._(CREEP_TIER);
            return;
          }
      }

      creep.harvestOwn();
      ("Harvesting")._(CREEP_TIER);
	}

};

module.exports = roleHarvester;
