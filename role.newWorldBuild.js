var roleNewWorldUpgrader = require('role.newWorldUpgrader');

module.exports = {
	run: function(creep) {
		if ((creep.memory.target != undefined && creep.memory.target == creep.room.name) || (creep.memory.targetRoom != undefined && creep.memory.targetRoom == creep.room.name)) {
			// check for hostile spawns lingering around
			let structures = creep.room.find(FIND_HOSTILE_SPAWNS) || [];
			if (structures.length > 0) {
				if(creep.dismantle(structures[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(structures[0]);
				}
			} else {
				structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
					filter: s => s.structureType != STRUCTURE_CONTROLLER
				});
				if (structures.length > 0) {
					if(creep.dismantle(structures[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(structures[0]);
					}
				} else {
					if (creep.isWorking()) {
						// spawn has highest prio
						spawnSite = creep.room.find(FIND_CONSTRUCTION_SITES, {
							filter: c => c.structureType == STRUCTURE_SPAWN
						});

						if (spawnSite.length > 0) {
							if (creep.build(spawnSite[0]) == ERR_NOT_IN_RANGE) {
								creep.moveTo(spawnSite[0]);
							}
						} else {
							var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
							if (constructionSite != undefined) {
								if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
									creep.moveTo(constructionSite);
								}
							} else {
							    roleNewWorldUpgrader.run(creep);
							}
						}
					} else {
						let source = creep.pos.findClosestByPath(FIND_SOURCES);
		//					console.log('energy', JSON.stringify(energy));
						if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
							creep.moveTo(source);
						}
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
