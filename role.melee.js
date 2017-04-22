var roleMelee = {

    /** @param {Creep} creep **/
    run: function(creep) {

         if (!creep.memory.attacked) creep.memory.attacked = Game.time;

         var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
         if(closestHostile) {
            creep.memory.attacked = Game.time;
             if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
               creep.moveTo(closestHostile);
             }
         } else {
           ( "Idle for " + (Game.time - creep.memory.attacked) +"/"+DEFENCE_TIMEOUT )._(CREEP_TIER);
           if (Game.time - creep.memory.attacked > DEFENCE_TIMEOUT) creep.memory.role = "salvage";
         }
    }

};

module.exports = roleMelee;

// ////
