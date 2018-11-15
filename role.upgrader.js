module.exports = {
	run: function(creep) {
		if (creep.isWorking()){
			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller);
			} else if (!creep.pos.isNearTo(creep.room.controller)) { // move closer to reduce road blocking
				creep.moveTo(creep.room.controller);
			}
		} else {
			creep.getEnergy();
			if (creep.carry.energy >= 100) {
				creep.memory.working = true;
			}
		}
	}
}
