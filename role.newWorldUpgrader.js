module.exports = {
	run: function(creep) {

		if (creep.memory.target == creep.room.name) {
			if (creep.isWorking()) {
				// check if spawn has been build
				spawnSite = creep.room.find(FIND_CONSTRUCTION_SITES, {
					filter: c => c.structureType == STRUCTURE_SPAWN
				});

				if (spawnSite.length > 0) {
					if (creep.build(spawnSite[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(spawnSite[0]);
					}
				} else {
					var controller = creep.room.controller;
					if (controller != undefined) {
						if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
							creep.moveTo(controller);
						}
					}
				}

			} else {
				let source = creep.pos.findClosestByPath(FIND_SOURCES);
//					console.log('energy', JSON.stringify(energy));
				if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source);
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
