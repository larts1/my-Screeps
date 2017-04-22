var roleAttack = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if (Game.flags['goby'] && !creep.memory.wentby) {
        if (creep.cmoveTo(Game.flags['goby'])!= ERR_NOT_IN_RANGE) creep.memory.wentby = true;
        return;
      }

      var flag = Game.flags[creep.name.substr(4,3)+"att0"];
      if (flag) {
         creep.memory.NoRoom = true;

         if(flag.room == creep.room) {
          creep.markLoot(200);

          if (creep.attackIfRange(creep, 5)) return;

           var target = creep.room.lookForAt(LOOK_STRUCTURES, flag)[0];
           if (target) {
             var output = creep.attack(target);
             if(output == ERR_NOT_IN_RANGE) creep.cmoveTo(target);
           } else {
             console.log("Target DESTROYED @"+ creep.room.name);
             flag.remove();
           }

         } else{
           creep.cmoveTo(flag);
           "Going to attack room"._(CREEP_TIER);
         }
    	}
    }

};

module.exports = roleAttack;

// ////
