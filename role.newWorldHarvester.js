var roleNewWorldBuilder = require('role.newWorldBuilder');
module.exports = {
	run: function(creep) {
		if (creep.room.name == creep.memory.target) {
			if (creep.isWorking()) {
					roleNewWorldBuilder.run(creep);
			} else {
				sources = creep.room.find(FIND_SOURCES);
				target = sources[creep.memory.source];
				if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				} else {
					closeTrucker = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
						filter: c => c.memory.role == 'newWorldTrucker'
					});
					if (closeTrucker != undefined) {
							creep.transfer(closeTrucker[0], RESOURCE_ENERGY);
					}
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
			creep.moveToRoom(creep.memory.target);
		}
	}
}
