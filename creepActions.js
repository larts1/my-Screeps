// function getDropped(creep) {
//
//   if (!creep) var creep = this;
//
//   var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
//     if(target) {
//       if (Memory.debug) creep.say("looting");
//       if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
//           creep.moveTo(target);
//       }
//       return true;
//     }
// }
// Creep.prototype.getDropped = getDropped;

Creep.prototype.cmoveTo = function(target) {

  if (!this.memory.stuck) this.memory.stuck = 0;
  var opt = {};
  if (this.memory.stuck < 3) opt = {maxRooms: 1, ignoreCreeps: true};
  else opt = {maxRooms: 1, ignoreCreeps: false, reusePath: 0};

  var output = this.moveTo(target, opt);
  if (this.memory.pos && this.memory.pos.x == this.pos.x &&
      this.memory.pos.y == this.pos.y) this.memory.stuck += 1;
  else {
    this.memory.pos = this.pos;
    this.memory.stuck = 0;
  }

  return output;
}

Creep.prototype.overRide = function(creep) {
  if ( Game.flags[creep.name] ) {
    this.cmoveTo(Game.flags[creep.name]);
    return true;
  }

  if (creep.memory.goBy && Game.flags['goby'] && !creep.memory.wentby) {
    creep.moveTo(Game.flags['goby']);
    if ( creep.pos.isNearTo(Game.flags['goby']) ) creep.memory.wentby = true;
    "Going to goby"._(CREEP_TIER);
    return true;
  }

  return false;
}

Creep.prototype.deBuild = function() {
  var flag = this.room.find(FIND_FLAGS, {
    filter: (flag) => { return ( flag.pos.room == this.pos.room  &&
                                 flag.name.substr(0, 6) == "remove"); }
  })[0];

  if (flag) var target = this.room.lookForAt(LOOK_STRUCTURES, flag)[0];

  if (flag && !target) flag.remove();

  if (target) {
    if (Memory.debug) this.say("DISMANTLING");
    this.doAt("dismantle", target);
    return true;
  } else {
    return false;
  }
}

Creep.prototype.harvestContainer = function() {
  var container = this.pos.findInRange(FIND_STRUCTURES, 4, {
    filter: (struct) => { return (( struct.structureType == STRUCTURE_LINK ) &&
                                  ( struct.energy != 0 )); }
  })[0];

  //haetaan läheisin laatikko
  if (!container) var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (struct) => { return (( struct.structureType == STRUCTURE_CONTAINER ) &&
                                  ( struct.pos.lookFor(LOOK_CREEPS).length == 0 ) &&
                                  ( _.sum(struct.store) != 0 )); }
  });

  if (container) {
    if (Memory.debug) this.say("container");
    if(this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
       this.cmoveTo(container);
     }
     return true;
  } else {
    return false;
  }
}

Creep.prototype.harvestClosest = function(creep) {

  if (!creep) var creep = this;

  var source = creep.pos.findClosestByRange(FIND_SOURCES);

  if (source) {
    if (Memory.debug) creep.say("mining");
    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
      this.cmoveTo(source);
    }
    return true;
  } else return false;
}

Creep.prototype.getHaulTarget = function() {

  //Haetaan muistista targetti, ja päivitetään se tarvittaessa
  if ( this.memory.haulTarget && this.memory.haulTarget[1] - Game.Time < HAUL_RETARGET ) {
    return Game.getObjectById(this.memory.haulTarget[0]);
  }

  //Jos huone ei täynnä niin yritetään aina ensin täyttää se
  if ( !this.room.full() && _.keys(this.carry).length == 1 ) {
    var target = this.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_SPAWN
          ||  structure.structureType == STRUCTURE_EXTENSION
          ||  structure.structureType == STRUCTURE_TOWER && structure.energy < (structure.energyCapacity/2) ) &&
             ( !Memory.hauling[structure.id] || Memory.hauling[structure.id] == this.id ) &&
             ( structure.energy < structure.energyCapacity) &&
             ( this.carry.energy != 0 );
        }
    });
  }

  //Jos terminaali tarvitsee mitä kannetaan niin viedään sinne
  if (!target && this.room.terminal) {
    for (var need in Memory.needForTrade[this.room.name]) {
      if ( this.carry[need] > 0 ) {
        var target = this.room.terminal;
        if ( Memory.needForTrade[this.room.name][need] < (this.carry[need] + target.store[need]) ) delete Memory.needForTrade[this.room.name][need];
        break;
      }
    }
  }

  //Lopulta yritetään storageen
  if ( !target ) var target = this.room.storage;

  //Toimitaan linkkinä jos ei ole vielä storagea
  if ( !target ) var target = this.pos.findClosestByRange(FIND_MY_CREEPS, {
    filter: (x) => (x.memory.role == "upgrader")
  });

  this.memory.haulTarget = [target.id, Game.time]
  return target;
}

Creep.prototype.haul = function(creep) {

  var target = this.getHaulTarget();

  if( target ) {
    if (Memory.debug) this.say(target.structureType);

    if (target.structureType && target.structureType != STRUCTURE_SPAWN && target.energy + this.carry.energy > target.energyCapacity)  Memory.hauling[target.id] == this.id;

    var output = this.transfer(target, _.keys(this.carry)[ (_.keys(this.carry).length > 1)?1:0 ]);
    if( output == ERR_NOT_IN_RANGE) {
      this.cmoveTo(target);
    } else if ( output == ERR_FULL ){
      this.cmoveTo(target);
    } else {
      delete Memory.hauling[target.id];
    }
    return true;

  }else {
    return false;
  }

}

Creep.prototype.checkHome = function(creep,base) {
  if (creep.memory.NoRoom) return true;
    if (creep.room.name != base.room.name) {
      this.cmoveTo(base);
      "Running home"._(CREEP_TIER);
      return false;
    }
    return true;
}

Creep.prototype.forceReNew = function(creep, roles, base) {
  if ( creep.memory.role == "claimer" ) return true;
  if ( creep.memory.role == "salvage" ) return true;
  if ( creep.memory.NoRoom ) return true;

  if (!Game.creeps[base.memory.renewing]) base.memory.renewing = false;

  if ( (creep.ticksToLive < 300) || creep.memory.renewing) {
    if ( base.memory.renewing && !creep.memory.renewing) return true;

    if (Memory.debug) creep.say("need renew");

    var creepParts = [];
    for (var part in creep.body) {
      creepParts.push(creep.body[part].type)
    }

    //EI OLE HYVÄ! NYT PALASIKSI
    if(!_.isEqual(creepParts, roles[creep.memory.role])) {
      creep.memory.role = "salvage";
      console.log("recycling: "+  creep.name);
      return true;
    }

    var output = base.renewCreep(creep)
    if ( output == ERR_NOT_IN_RANGE ) this.cmoveTo(base);
    if ( output == ERR_FULL) {
      console.log("Renewed creep: " + creep.name);
      creep.memory.renewing = false;
      base.memory.renewing = false;
    }else {
      ("Renewing")._(CREEP_TIER);
      creep.memory.renewing = true;
      base.memory.renewing = creep.name;
    }

    return false;
  }
  return true;
}

Creep.prototype.salvage = function(creep, base) {
  if ( base.recycleCreep(creep) == ERR_NOT_IN_RANGE ) this.cmoveTo(base);
}

Creep.prototype.buildClosest = function() {
  var targets = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);

  var closestDamagedStructure = this.room.find(FIND_STRUCTURES, {
      filter: (structure) => { return ( structure.hits < structure.hitsMax ) &&
                                      ( structure.hitsMax < 1000000 ||
                                        structure.hits < WALL_HP)
                              }
  });

  if(closestDamagedStructure && !targets) {
    if (Memory.debug) this.say("REPAIR");
     if(this.repair(closestDamagedStructure[0]) == ERR_NOT_IN_RANGE) {
        this.cmoveTo(closestDamagedStructure[0]);
     }
     return true;
  }

  if(targets) {
    if (Memory.debug) this.say("BUILD");
    if(this.build(targets) == ERR_NOT_IN_RANGE) {
      this.cmoveTo(targets);
    }
    return true;
  } else {
    return false;
  }
}

Creep.prototype.upgrade = function(creep) {
  if (Memory.debug) this.say("Upgrading");
  if(this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
    this.cmoveTo(this.room.controller);
  }
}

Creep.prototype.getHarvestOwnTarget = function() {

  //Haetaan muistista targetti, ja päivitetään se tarvittaessa
  if ( this.memory.harvestTarget && this.memory.harvestTarget[1] - Game.Time < HARVESTOWN_RETARGET ) {
    return Game.getObjectById(this.memory.harvestTarget[0]);
  }

  var sourceID = ( this.name.substr(3,1) % 2 );
  var sources = this.room.find(FIND_SOURCES);

  this.memory.harvestTarget = [sources[sourceID].id, Game.time]
  return sources[sourceID];

}

Creep.prototype.harvestOwn = function() {

  if (Memory.debug) this.say("Harvesting");

  var target = this.getHarvestOwnTarget();

  this.doAt("harvest", target);

}

Creep.prototype.harvestOwnMineral = function() {

  if (Memory.debug) this.say("Harvesting");

  var sourceID = ( this.name.substr(3,1) % 2 );

  var sources = this.room.find(FIND_MINERALS);

  this.doAt("harvest", sources[sourceID]);
}

Creep.prototype.dropAll = function(creep) {
  if (creep.carry) creep.say("Dropping");
  for(var resourceType in creep.carry) {
	   creep.drop(resourceType);
  }
}

Creep.prototype.collect = function(creep) {

  if (!creep) var creep = this;

  //Aina jos suuri määrä mineraaleja maassa niin haetaan ne
  var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: (x) => {return( x.resourceType != RESOURCE_ENERGY &&
                            _.sum(x.amount) > 100 &&
                          ( !Memory.looting[x.id] || Memory.looting[x.id] == creep.id ))}
  });


  //Jos maassa energiaa haetaan se
  if (!container && !target) var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY, {
    filter: (x) => {return(x.amount > creep.carryCapacity &&
                          ( !Memory.looting[x.id] || Memory.looting[x.id] == creep.id ))}
  });

  //Jos jossain säiliössä energiaa haetaan se
  if (!container && !target) var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (x) => { return (x.structureType == STRUCTURE_CONTAINER) &&
                            (_.sum(x.store) > creep.carryCapacity) &&
                            (!Memory.looting[x.id] || Memory.looting[x.id] == creep.id )}
    });

  //Jos huone ei täynnä niin varastetaan linkistä
  if (!container && !target && !this.room.full() ) var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (x) => { return (x.energy > (creep.carryCapacity/1.8) && x.structureType == STRUCTURE_LINK) &&
      ( !Memory.looting[x.id] || Memory.looting[x.id] == creep.id )}
    });

  //Jos storage joka ei ole tyhjä niin haetaan se
  if ( !container && !target )
            var container = creep.room.storage;


  if(target) {

    if (target.amount < creep.carryCapacity) Memory.looting[target.id] = creep.id;

    if (Memory.debug) creep.say("looting from ground");
    if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
      this.cmoveTo(target);
    }else {
      delete Memory.looting[target.id];
    }
    return true;
  }

  if(container) {
      if (Memory.debug) creep.say(container.structureType);

      if (_.sum(container.store) < creep.carryCapacity) Memory.looting[container.id] = creep.id;

      if (container != creep.room.storage && _.keys(container.store)[1]) var type = _.keys(container.store)[1]
      else if (container == creep.room.storage && ( creep.room.full() || creep.room.storage.store.energy == 0 ) && container.store[_.keys(Memory.needForTrade[creep.room.name])[0]] ) {
        var type =  _.keys(Memory.needForTrade[creep.room.name])[0];
      }
      else var type = RESOURCE_ENERGY

      if(creep.withdraw(container, type) == ERR_NOT_IN_RANGE) {
         this.cmoveTo(container);
       }else {
         delete Memory.looting[container.id];
       }
      return true;
  }

  return false;
}

Creep.prototype.markLoot = function(creep, amount) {

  if (Game.flags['loot']) return false;

  var target = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY, {
    filter: (x) => {return(x.amount > amount)}
  });

  if (target) creep.room.createFlag(target, "loot");
}

Creep.prototype.markHarvest = function(amount) {
  var baseID = this.name.substr(4,3);

  if (Game.flags[baseID+"harv"+this.name.substr(3,1)]) return;

  var target = this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {
    filter: (x) => {return(x.amount > amount)}
  });

  if (target) this.room.createFlag(target, baseID+"harv"+this.name.substr(3,1));
}

Creep.prototype.attackClosest = function(creep) {
  var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if(closestHostile) {
     this.memory.attacked = Game.time;
      if (this.attack(closestHostile) == ERR_NOT_IN_RANGE) {
        this.moveTo(closestHostile);
      }
  } else return false;
  return true;
}

Creep.prototype.attackIfRange = function(creep, range) {
  var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if(closestHostile && closestHostile.pos.inRangeTo(creep.pos, range)) {
     creep.memory.attacked = Game.time;
      if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestHostile);
      }
  } else return false;
  return true;
}

Creep.prototype.doAt = function(action, target) {
  var output = this[action](target);
  if (output == ERR_NOT_IN_RANGE) this.cmoveTo(target);
  else return false;
  return true;
}

Creep.prototype.storeMinerals = function(creep) {

  if (!creep) var creep = this;

  if ( creep.carry.energy != _.sum(creep.carry) ) {
    for (var id in creep.carry) {
      if (id != "energy") {
        if ( creep.transfer(creep.room.storage, id) == ERR_NOT_IN_RANGE )
        this.cmoveTo(creep.room.storage);
      }
    }
    return true;
  }
  return false;
}

Creep.prototype.logState = function(creep) {
  var carry = JSON.stringify(this.carry);
  (carry +" "+ this.ticksToLive)._(CREEP_TIER, false);
}
