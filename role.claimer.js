module.exports = {
	run: function(creep) {
		    if (creep.memory.targetRoom == undefined) {
		        creep.memory.targetRoom = creep.memory.target;
		    }
		if (creep.room.name == creep.memory.targetRoom) {
			if (creep.memory.claim) {
				if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller, {maxRooms: 1});
				}

				console.log('Controller level', creep.room.controller.level);
				if (creep.room.controller.level >= 2) {
					creep.suicide();
					delete Memory.creeps[creep.name];
				}
			} else {
				if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller, {maxRooms: 1});
				}
			}
		} else {
			creep.moveTo(new RoomPosition(24, 24, creep.memory.targetRoom), {range: 20});
		}
	}
};
