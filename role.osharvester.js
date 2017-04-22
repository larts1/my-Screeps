var roleOsharvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if (creep.attackClosest()) {
        "Battling"._(CREEP_TIER)
        return;
      }

      for (var id in Game.flags) {
        if (id.substr(0, 3) == creep.name.substr(4,3) && id.substr(3, 4) == "mine"
            && id.substr(7,1) == creep.name.substr(3,1)) {
          var target = Game.flags[id];
        }
      }

      if (target) {
         creep.memory.NoRoom = true;

        //  var target = creep.room.lookAt(target)[0];
         if(target.room && target.room.name == creep.room.name) {
           creep.harvestOwn();
           creep.markHarvest(100);
           "harvesting"._(CREEP_TIER);
         } else{
           ("Travelling")._(CREEP_TIER);
           creep.moveTo(target);
         }

    	}

    }

};

module.exports = roleOsharvester;

// ////
