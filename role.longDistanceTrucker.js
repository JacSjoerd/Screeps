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
				road = creep.pos.findInRange(FIND_STRUCTURES, 0 , {filter: { structureType: STRUCTURE_ROAD }});
				if (road.length) {
					if (road[0].hits < road.hitsMax - 1000) {
						creep.repair(road[0]);
					}
					creep.moveTo(Game.rooms[creep.memory.home].controller, { ignoreCreeps: true, swampCost: 2 });
				} else {
					construction = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0);
					if (construction.length) {
						creep.build(construction[0]);
					} else {
						creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
					}
				}
			}
		} else { // else if empty go to target room
			if (creep.room.name == creep.memory.targetRoom) {
				// find energy drops
				energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
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
