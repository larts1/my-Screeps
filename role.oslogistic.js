var roleOsharvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if ( !creep.memory.NoRoom ) {
        "Hauling"._(CREEP_TIER);
        creep.haul();
        if ( creep.carry.energy == 0 ) creep.memory.NoRoom = true;
        return;
      }

      for (var id in Game.flags) {
        if (id.substr(0, 3) == creep.name.substr(4,3) && id.substr(3, 4) == "harv"
            && id.substr(7,1) == creep.name.substr(3,1)) {
          var target = Game.flags[id];
        }
      }

      if (target) {
         creep.memory.NoRoom = true;
         creep.memory.goBy = false;

         if(target.room && target.room.name == creep.room.name) {

           "Collecting"._(CREEP_TIER);

           if ( creep.carry.energy != creep.carryCapacity ) creep.collect();
           else creep.memory.NoRoom = false;

         } else{
           ("Running to loot")._(CREEP_TIER);
           creep.moveTo(target);
         }
    	}

    }

};

module.exports = roleOsharvester;

// ////
