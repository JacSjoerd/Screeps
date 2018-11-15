module.exports = {
	run: function(creep) {
		if (creep.room.name == creep.memory.targetRoom) {
			if (creep.isWorking()) {
				var target = creep.findEmptyStructure();
				if (target == null) {
					target = creep.findEmptyWorker();
				}
				if (target != null && creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			} else {
				energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
//					console.log('energy', JSON.stringify(energy));
				if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
					creep.moveTo(energy);
				} else {
					creep.moveTo(Game.creeps[creep.memory.target]);
				}
			}

			// Clean up this creep if room is big enough (i.e. 10 or more extensions)
			extensions = creep.room.find(FIND_MY_STRUCTURES, {
			    filter: s => s.structureType == STRUCTURE_EXTENSION
			})
			if (extensions.length >= 10) {
				creep.suicide();
				delete Memory.creeps[creep.name];
			}
		} else {
			creep.moveToRoom(creep.memory.targetRoom);
		}

	}
}
