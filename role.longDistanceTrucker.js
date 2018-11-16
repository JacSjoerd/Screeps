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
				road = creep.pos.lookFor(LOOK_STRUCTURES);
				if (road.length && road[0].structureType === STRUCTURE_ROAD) {
    				new RoomVisual(creep.room.name).text(road[0].hits, creep.pos.x, creep.pos.y - 1);
					if (road[0].hits < road[0].hitsMax - 1000) {
						creep.repair(road[0]);
					}
					creep.moveTo(Game.rooms[creep.memory.home].controller, { swampCost: 2 });
				} else {
					construction = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
					if (construction.length) {
						creep.build(construction[0]);
					} else {
						creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
					}
				}
			}
		} else { // else if empty go to target room

    		energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
    			filter: e => e.resourceType == RESOURCE_ENERGY
    		});
    		if (energy.length > 0) {
    			creep.pickup(energy[0]);
    		}

    		if (creep.room.name == creep.memory.targetRoom) {
    			if (creep.memory.target != undefined) {
    				target = Game.getObjectById(creep.memory.target);
    				if (!creep.pos.inRangeTo(target, 2)) {
    					creep.moveTo(target, {maxRooms: 1});
    				} else {
    				    energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3, {
    			            filter: e => e.resourceType == RESOURCE_ENERGY
    				    });
    				    if (energy.length) {
    				        creep.moveTo(energy[0]);
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
