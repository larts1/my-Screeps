var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {

      for (var id in Game.flags) {
        if (id.substr(0, 3) == creep.name.substr(4,3) && id.substr(4,3) == "bui") {
          var target = Game.flags[id];
        }
      }


      if (target && creep.memory.build) {
         creep.memory.NoRoom = true;
         creep.memory.goBy = true;

         if(target.room.name == creep.room.name) {

           if ( creep.carry.energy == 0 ) creep.memory.build = false;

           var site = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
           if (site) creep.doAt("build", site);
           else target.remove();
           "In build room"._(CREEP_TIER);
         } else{
           "Running to build room"._(CREEP_TIER);
           creep.moveTo(target.pos);
         }

    	} else {
        if (creep.carry.energy == creep.carryCapacity) creep.memory.build = true;
        else if (creep.room.storage && creep.room.storage.store.energy && creep.collect()) "Collecting"._(CREEP_TIER);
        else if (creep.harvestClosest()) "Harvesting closest"._(CREEP_TIER);
      }

    }

};

module.exports = roleClaimer;

// ////
