module.exports = {
	run: function(creep) {
		if (creep.isWorking()){
			// Deliver energy
			var target;
			if (creep.memory.dropOff == null) {
				target = creep.findEmptyStructure();
				if (target == null) {
					target = creep.findEmptyWorker();
				}
			} else {
				target = Game.getObjectById(creep.memory.dropOff);
				if (target == undefined) {
					target = Game.creeps[creep.memory.dropOff];
					if (target == undefined) {
						console.log(creep.name+': No clue what my target should be');
					}
				}
			}

			if (target != null && target.id != creep.memory.pickUp && creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		} else {
			// Get energy
			target = Game.getObjectById(creep.memory.pickUp);
			if (target == undefined) {
				target = Game.creeps[creep.memory.pickUp];
				if (target == undefined) {
					console.log(creep.name+': No clue what my target should be');
				}
			}

			if (target != undefined) {
				creep.moveTo(target);
				creep.withdraw(target, RESOURCE_ENERGY);
			}

			// get occasionally lying around energy
			let droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
				filter: e => e.resourceType == RESOURCE_ENERGY
			});
			creep.pickup(droppedEnergy[0]);
		}
	}
}
