module.exports = {
	run: function(creep) {
		if (creep.room.name == creep.memory.targetRoom) {
			let target = Game.getObjectById(creep.memory.target);
			if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {maxRooms: 1});
			} else {
				closeTrucker = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
					filter: c => c.memory.role == 'longDistanceTrucker'
				});
				if (closeTrucker != undefined) {
						creep.transfer(closeTrucker[0], RESOURCE_ENERGY);
				}

				// call claimer if there is an unclaimed controller
				if (creep.room.controller.reservation === undefined || creep.room.controller.reservation.ticksToEnd < 2000) {
				    new RoomVisual(creep.room.name).text('Need claimer!', 24, 24, {color: 'red'});
					let home = creep.memory.home;
					let targetRoom = creep.room.name;
					let availableClaimers = creep.room.find(FIND_MY_CREEPS, {filter: c => c.role == 'claimer'}).length;
					if (availableClaimers == 0) {
						Memory.creeps['claimer'+home+targetRoom] = {name: 'claimer'+home+targetRoom, role: 'claimer', home: home, targetRoom: targetRoom, claim: false}
					}
				}
			}
		} else {
			let target = Game.getObjectById(creep.memory.target);
			if (target == null) {
				let targetLocation = new RoomPosition(24, 24, creep.memory.targetRoom);
				creep.moveTo(targetLocation, {range: 20});
			} else {
				creep.moveTo(Game.getObjectById(creep.memory.target));
			}
		}

		creep.attackCheck();
	}
}
