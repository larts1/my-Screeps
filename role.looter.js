var roleLooter = {

    /** @param {Creep} creep **/
    run: function(creep) {

      if (Game.flags["loot"] && (creep.carry.energy != creep.carryCapacity) ) {
         creep.memory.NoRoom = true;
         creep.say("loot");
         var flag = Game.flags["loot"];

         if(Game.flags["loot"].room == creep.room) {

           var target = creep.room.lookForAt(LOOK_ENERGY, flag)[0];
           if (target) {
             var output = creep.pickup(target);
             if(output == ERR_NOT_IN_RANGE) creep.moveTo(target);
           } else {
             console.log("Target looted @"+ creep.room.name);
             Game.flags["loot"].remove();
           }

         } else{
           creep.moveTo(Game.flags["loot"].pos);
         }
    	}else {
        if(!creep.carry.energy) creep.moveTo(Game.flags['attack']);
        else if (creep.room.find(FIND_MY_SPAWNS).length != 0) creep.dropAll();
        else creep.memory.NoRoom = false;
      }
    }

};

module.exports = roleLooter;
