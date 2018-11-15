var roleBuilder = require('role.builder');

module.exports = {
	run: function(creep) {
		if (creep.isWorking()){
			var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (s) =>  (s.hitsMax - s.hits > 1000 && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART)
			});
			if (structure != undefined) {
				if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
					creep.moveTo(structure);
				}
			} else {
				roleBuilder.run(creep);
			}
		} else {
			creep.getEnergy();
		}

	}

}
