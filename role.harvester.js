var roleBuilder = require('role.builder');
module.exports = {
	run: function(creep) {

		// 2 modes of operation: with links and without links.

		// is working means delivering enery
		if (creep.isWorking()){
			const structure = creep.findEmptyStructure();
			if (structure != undefined) {
				if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(structure);
				}
			} else {
				roleBuilder.run(creep);
			}
		} else {
			let source = {};
			if (creep.memory.target != undefined) {
				source = Game.getObjectById(creep.memory.target);
			}

			if (creep.memory.target == undefined || source == undefined) {
				source = creep.pos.findClosestByPath(FIND_SOURCES, {
					filter: (s) => s.energy > 0
				});
			}

			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			} else {
				link = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
					filter: s => s.structureType == STRUCTURE_LINK
				});
				if (link.length > 0) {
					creep.transfer(link[0], RESOURCE_ENERGY);
				}
			}

		}

		closeTrucker = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
			filter: c => c.memory.role == 'trucker'
		});
		if (closeTrucker != undefined) {
				creep.transfer(closeTrucker[0], RESOURCE_ENERGY);
		}

		// get occasionally lying around energy
		let droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
			filter: e => e.resourceType == RESOURCE_ENERGY
		});
		creep.pickup(droppedEnergy[0]);

	}
}
