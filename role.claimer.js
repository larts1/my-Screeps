var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {

      for (var id in Game.flags) {
        if (id.substr(0, 3) == creep.name.substr(4,3) && id.substr(3, 5) == "claim"
            && id.substr(8,1) == creep.name.substr(3,1)) {
          var target = Game.flags[id];
        }
      }

      if (target) {
         creep.memory.NoRoom = true;
         creep.memory.goBy = true;

        //  var target = creep.room.lookAt(target.pos)[0];
         if(target.room && target.room.name == creep.room.name) {
           var output = creep.claimController(creep.room.controller);
           if(output == ERR_NOT_IN_RANGE) {
             "Travelling"._(CREEP_TIER);
             creep.moveTo(creep.room.controller);
           } else if ( output == ERR_GCL_NOT_ENOUGH) {
             "Reserving"._(CREEP_TIER);
             creep.doAt("reserveController", creep.room.controller);
           } else if (output == OK){
             console.log("ROOM CLAIMED "+ creep.room.name);
             target.remove();
           }
         } else{
           ("Running to claim")._(CREEP_TIER);
           creep.moveTo(target.pos);
         }
    	}

    }

};

module.exports = roleClaimer;

// ////
