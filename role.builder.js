var roleUpgrader = require('role.upgrader');
module.exports = {
	run: function(creep) {
		if (creep.isWorking()){
			// Make sure that a new rampart is build up before leaving it.
			var newRampart = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {
				filter: (s) => s.structureType == STRUCTURE_RAMPART
										&& s.hits < 30000
			});
			if (newRampart[0] != undefined) {
					creep.repair(newRampart[0]);
			} else {
				let room = Game.rooms[creep.memory.home];
				var constructionSites = room.find(FIND_CONSTRUCTION_SITES);
				if (constructionSites.length > 0) {
					target = creep.pos.findClosestByRange(constructionSites);
					if (creep.build(target) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				} else {
					roleUpgrader.run(creep);
				}
			}
		} else {
			creep.getEnergy();
		}
	}
}
