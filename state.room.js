Room.prototype.stats = function() {
    return {
        myCreepsCnt: this.find(FIND_MY_CREEPS).length,
        enemiesCnt: this.find(FIND_HOSTILE_CREEPS).length
    };
};

Room.prototype.full = function() {
    return ( this.energyAvailable == this.energyCapacityAvailable );
};

Room.prototype.checkLinks = function(harvest) {

  if ( harvest.energy < 100 || !this.full() ) return;

    var links = this.find(FIND_MY_STRUCTURES, {
      filter: (x) => ( x.structureType == STRUCTURE_LINK &&
                       !x.pos.findInRange(FIND_MY_CREEPS, 1, { filter: (y) => (y.memory.role == "harvester") })[0] )});

    for (var link in links) {
      if ( links[link] != harvest  && links[link].energy != links[link].energyCapacity) harvest.transferEnergy(links[link]);
    }
};

String.prototype._ = function(tier = 1, nl = false) {
  RawMemory.segments[0] += (nl)?("\n"):("");
  RawMemory.segments[0] += ( " ".repeat(tier) + this );
  return true;
}

// Upgrade for JSON.stringify, updated to allow arrays
var oldJSONStringify = JSON.stringify;
JSON.stringify = function(input){
    var convArrToObj = function(array){
      var thisEleObj = new Object();
      if(typeof array == "object"){
        for(var i in array){
          var thisEle = convArrToObj(array[i]);
          thisEleObj[i] = thisEle;
        }
      }else {
        thisEleObj = array;
      }
      return thisEleObj;
    };
    if(oldJSONStringify(input) == '[]')
        return oldJSONStringify(convArrToObj(input));
    else
        return oldJSONStringify(input);
};
