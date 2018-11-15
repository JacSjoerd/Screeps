module.exports = {
	run: function(creep) {
		// if carrying load go home to deliver
		if (creep.isWorking()) {
			if (creep.room.name == creep.memory.home) {
				var target = creep.findEmptyStructure();
				if (target == null) {
					target = creep.findEmptyWorker();
				}
				if (target != null && creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {maxRooms: 1});
				}
			} else {
				creep.moveTo(Game.rooms[creep.memory.home].controller);
			}
		} else { // else if empty go to target room
			if (creep.room.name == creep.memory.targetRoom) {
				// find energy drops
				energy = creep.room.find(FIND_DROPPED_RESOURCES, {
					filter: e => e.resourceType == RESOURCE_ENERGY
				});
				if (energy.length > 0) {
					if (creep.pickup(energy[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(energy[0]);
					}
				} else {
					// if no loose energy, go to target
					if (creep.memory.target != undefined) {
						target = Game.getObjectById(creep.memory.target);
						if (!creep.pos.inRangeTo(target, 2)) {
							creep.moveTo(target, {maxRooms: 1});
						}
					}
				}

			} else {
				let target = Game.getObjectById(creep.memory.target);
				if (target == null) {
				    targetRoom = new RoomPosition(24, 24, creep.memory.targetRoom);
					creep.moveTo(targetRoom, {range: 20});
				} else {
					creep.moveTo(Game.getObjectById(creep.memory.target));
				}
			}
		}
	}

}
