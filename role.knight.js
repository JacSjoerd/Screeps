module.exports = {
	run: function(creep) {
		// if carrying load go home to deliver
		var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
							|| creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
							|| creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES);

		if (creep.room.name == creep.memory.targetRoom || target != undefined) {
			if (target != undefined) {
				creep.moveTo(target);
				creep.attack(target);
				creep.memory.idleCounter = 0;
			} else {
				// make sure the idleCounter exists
				creep.memory.idleCounter = creep.memory.idleCounter || 0;
				// increase idleCounter
				creep.memory.idleCounter++;

                creep.moveTo(24, 24, {range: 20});
				// looks kind of safe of 250 idle ticks, lets decomission
				if (creep.memory.idleCounter > 250) {
					delete(Memory.creeps[creep.name]);
					creep.suicide();
				}
			}

		} else {
			if (creep.memory.targetRoom != undefined) {
				targetRoom = new RoomPosition(24, 24, creep.memory.targetRoom);
				creep.moveTo(targetRoom, {range: 20});
			}
		}
	}
}
