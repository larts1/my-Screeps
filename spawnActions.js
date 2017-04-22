var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleAttack = require('role.attack');
var roleLooter = require('role.looter');
var roleClaimer = require('role.claimer');
var roleMelee = require('role.melee');
var roleBuilder = require('role.builder');
var towerActions = require('towerActions')
var roleLogistic = require('role.logistic')

RoomObject.prototype.init = function (giveRoles, GivenRoleCount, givenBase) {
  this.roles_ = giveRoles;
  this.roleCount = GivenRoleCount;
  this.base = givenBase;
  this.roles = [];
  this.baseID = givenBase.name.substr(0,3);

  // if (Game.time % 100 == 0) this.base.memory.spawning = false;

  for (var role in this.roles_){
    this.roles[role] = [];
    for (var part in this.roles_[role]) {
      for(i=0; i < this.roles_[role][part];i++) {
        if (part == "work") this.roles[role].unshift(WORK);
        if (part == "move") this.roles[role].push(MOVE);
        if (part == "carry") this.roles[role].unshift(CARRY);
        if (part == "claim") this.roles[role].unshift(CLAIM);
        if (part == "attack") this.roles[role].unshift(ATTACK);
        if (part == "heal") this.roles[role].unshift(HEAL);
        if (part == "hp") this.roles[role].unshift(TOUGH);
        if (part == "ranged") this.roles[role].unshift(RANGED_ATTACK);
      }
    }
  }

  this.doRoleCount();
  this.fitRolesToBase();

  this.roles["osharvester"] = this.roles["harvester"].slice();
  this.roles["osharvester"].push(ATTACK);
  this.roles["osharvester"].push(ATTACK);
  this.roles["mineralharvester"] = this.roles["harvester"];
  this.roles["oslogistic"] = this.roles["logistic"];

}

RoomObject.prototype.fitRolesToBase = function() {
  var maxE = this.base.room.energyCapacityAvailable;

  this.roles["attack"] = [MOVE];
  for (var i = maxE - 50; i > 150; i -= 150) {
    this.roles["attack"].unshift(TOUGH);
    this.roles["attack"].unshift(TOUGH);
    this.roles["attack"].unshift(ATTACK);
    this.roles["attack"].unshift(MOVE);
  }

  if ( maxE < 600 ) {
    this.roles["harvester"] = [WORK, WORK, CARRY, MOVE];
    for (var i = maxE - 300; i > 100; i -= 100) {
      this.roles["harvester"].unshift(WORK);
    }
  }else this.roles["harvester"] = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];

  if (maxE < 900 ) {
    this.roles["builder"] = [WORK, CARRY, MOVE, MOVE];
    for (var i = maxE - 250; i > 150; i -= 150) {
      this.roles["builder"].unshift(WORK);
      this.roles["builder"].unshift(CARRY);
    }
  }

  if ( maxE < 1200 ) {
    this.roles["logistic"] = [CARRY, CARRY, MOVE];
    for (var i = maxE - 150; i > 150; i -= 150) {
      this.roles["logistic"].unshift(MOVE);
      this.roles["logistic"].unshift(CARRY);
      this.roles["logistic"].unshift(CARRY);
    }
  }

  if ( maxE < 1550 ) {
    this.roles["upgrader"] = [WORK, CARRY, MOVE];
    for (var i = (maxE - 200); i > 250; i = i - 250) {
      this.roles["upgrader"].push(MOVE);
      this.roles["upgrader"].unshift(WORK);
      this.roles["upgrader"].unshift(WORK);
    }
  }

}

RoomObject.prototype.doRoleCount = function() {
  this.roleCount['harvester'] = this.base.room.find(FIND_SOURCES).length;
  this.roleCount['mineralharvester'] = this.base.room.find(FIND_MY_STRUCTURES,
                                      {filter: (x) => ( x.structureType == STRUCTURE_EXTRACTOR && this.base.room.find(FIND_MINERALS)[0].mineralAmount > 0 )}).length;
  this.roleCount["logistic"] = this.roleCount['harvester'];
  if (this.base.room.controller) this.roleCount['upgrader'] = UPGRADER_COUNT;
  else this.roleCount['upgrader'] = 0;
  this.roleCount['builder'] = BUILDER_COUNT;

  //pakotetaan harvesterit ja logistiikat ensin, jotta saadaan muut nopeammin
  if ( _.filter(Game.creeps, (creep) => creep.memory.role == "harvester" && creep.name.substr(4,3) == this.base.name.substr(0,3) ).length
        < this.roleCount['harvester'] ) this.base.memory.forceRole = "harvester";
  else if (_.filter(Game.creeps, (creep) => creep.memory.role == "logistic" && creep.name.substr(4,3) == this.base.name.substr(0,3) ).length
      < this.roleCount['logistic'] ) this.base.memory.forceRole = "logistic";
  else if (_.filter(Game.creeps, (creep) => creep.memory.role == "upgrader" && creep.name.substr(4,3) ==this. base.name.substr(0,3) ).length
      < this.roleCount['upgrader'] ) this.base.memory.forceRole = "upgrader";
  else this.base.memory.forceRole = false;

  //console.log(base.pos.findClosestByRange(FIND_HOSTILE_CREEPS).owner);
  if(this.base.pos.findClosestByRange(FIND_HOSTILE_CREEPS)) this.roleCount['melee'] = 1;
  else this.roleCount['melee'] = 0;
  if (Game.flags[this.baseID+'att0']) this.roleCount['attack'] = ATTACK_STRENGTH;
  else this.roleCount['attack'] = 0;
  if (Game.flags['loot']) this.roleCount['looter'] = 1;
  if (Game.flags[this.baseID+"osbuild"]) this.roleCount["osbuilder"] = OSBUILDER_COUNT;

  if (Game.flags[this.baseID+"claim2"]) this.roleCount["claimer"] = 3;
  else if (Game.flags[this.baseID+"claim1"]) this.roleCount["claimer"] = 2;
  else if (Game.flags[this.baseID+"claim0"]) this.roleCount["claimer"] = 1;
  else this.roleCount["claimer"] = 0;

  if (Game.flags[this.baseID+"mine2"]) this.roleCount["osharvester"] = 3;
  else if (Game.flags[this.baseID+"mine1"]) this.roleCount["osharvester"] = 2;
  else if (Game.flags[this.baseID+"mine0"]) this.roleCount["osharvester"] = 1;
  else this.roleCount["osharvester"] = 0;

  if (Game.flags[this.baseID+"harv2"]) this.roleCount["oslogistic"] = 3;
  else if (Game.flags[this.baseID+"harv1"]) this.roleCount["oslogistic"] = 2;
  else if (Game.flags[this.baseID+"harv0"]) this.roleCount["oslogistic"] = 1;
  else this.roleCount["oslogistic"] = 0;

  ("Role count: " + JSON.stringify(this.roleCount))._(2);
}

RoomObject.prototype.spawnCreeps = function() {
  // Jossei harvesterita niin luodaan paniikki harvesteri joka maksaa vain 300e SHOULD NOT BE NEEDED
  if (_.filter(Game.creeps, (creep) => creep.memory.role == "harvester" && creep.name.substr(4,3) == this.base.name.substr(0,3) ).length == 0 ) {
  this.base.memory.panick++;
  if (this.base.memory.panick > 100) this.base.createCreep([WORK,CARRY,MOVE], "har0"+this.base.name.substr(0,3), { role: "harvester" } );
  }else this.base.memory.panick = 0;

  // //Jossei logisteri niin luodaan paniikki logisteri joka maksaa vain 300e
  if (_.filter(Game.creeps, (creep) => creep.memory.role == "logistic" && creep.name.substr(4,3) == this.base.name.substr(0,3) ).length == 0) {
  this.base.memory.panick2++;
  if (this.base.memory.panick2 > 100) this.base.createCreep([CARRY,CARRY,MOVE], "log0"+this.base.name.substr(0,3), { role: "logistic" } );
  } else this.base.memory.panick2 = 0;

  if (this.base.memory.panick >= 100 || this.base.memory.panick2 >= 100 ) return;


  if (this.base.memory.forceRole) ("Forcing next spawn to be " + this.base.memory.forceRole)._(2);
  for (var role_ in this.roles) {
    if (this.base.memory.forceRole) role_ = this.base.memory.forceRole;
    var creepCount = _.filter(Game.creeps, (creep) => (creep.memory.role == role_) &&
                              creep.name.substr(4,3) == this.base.name.substr(0,3)).length;


    //Jos puuttuu creep
    if ( this.roleCount[role_] && creepCount < this.roleCount[role_] ) {

      for (i = 0; i < this.roleCount[role_]; i++) {
          name = role_.substr(0,3)+i+this.base.name.substr(0,3);
          var nameTaken = _.filter(Game.creeps, (creep) => creep.name == name).length;
          if (nameTaken == 0) break;
      }

      var newName = this.base.createCreep(this.roles[role_], name, { role: role_ } );
      if(_.isString(newName)) {
        console.log('The name is: '+newName);
        this.base.memory.spawning = 0;
        Memory.forceRole = false;
        break;
      }
      else {
        this.base.memory.spawning = name;
        return;
      }
    }

  }
}

RoomObject.prototype.runSpawn = function() {

  var contProg = Math.floor(this.base.room.controller.progress/1000) +"K/"+ this.base.room.controller.progressTotal/1000 + "K";
  if (this.base.room.storage) ( "Stored energy: " + this.base.room.energyAvailable+"/"+this.base.room.energyCapacityAvailable+" "+ JSON.stringify(this.base.room.storage.store) +" "+ contProg)._(2, true);
  if (this.base.spawning) {
    var txt = Math.round(100 - (this.base.spawning.remainingTime/this.base.spawning.needTime)*100)+"% ";
    ( "spawning "+this.base.spawning.name + " " +txt)._(2, true);
  }

  if (this.base.hits < this.base.hitsMax/4) this.base.room.controller.activateSafeMode();

  for(var name in Game.creeps) {
    //Not my creep
    if (name.substr(4,3) != this.base.name.substr(0,3)) continue;
    ("creep: " + name)._(3, true);

    var creep = Game.creeps[name];
    if (Memory.debug) var creepsCost = Game.cpu.getUsed();
    creep.logState();
    if (creep.overRide(creep)) continue;

    if (creep.checkHome(creep, this.base) && creep.forceReNew(creep, this.roles, this.base) && ( !creep.spawning || !"spawning"._(CREEP_TIER) )) {
      if(creep.memory.role == 'salvage') {
        ("Going to salvage")._(CREEP_TIER);
        creep.salvage(creep, this.base);
      }else require("role."+creep.memory.role).run(creep);
    }

    if (Memory.debug) {
      ("CPU: " + (Game.cpu.getUsed() - creepsCost).toFixed(3))._(CREEP_TIER);
      if (creep.memory.cpuCost) {
        creep.memory.cpuCost[0]++;
        creep.memory.cpuCost[1] += (Game.cpu.getUsed() - creepsCost)
      } else creep.memory.cpuCost = [0,0];
      ("AVG: " + ( creep.memory.cpuCost[1] / creep.memory.cpuCost[0] ).toFixed(3)  )._(4);
      ("Tracked for: " + creep.memory.cpuCost[0] )._(CREEP_TIER)
    }

  }

  var towers = this.base.room.find(FIND_STRUCTURES, {
              filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER)
              }
  });
  var towerControl = new towerActions();
  for (var towerID in towers) {
    towerControl.shootAndHeal(towers[towerID]);
  }

}
