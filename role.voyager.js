module.exports = {
	run: function(creep) {
		if (creep.room.name != creep.memory.targetRoom) {
			creep.moveTo(new RoomPosition(25,25,creep.memory.targetRoom), {range: 20});
		} else {
			room = creep.room
			home = Game.rooms[creep.memory.home];

			if (creep.moveTo(room.controller) == OK || creep.pos.isNearTo(room.controller)) {
				sources = creep.room.find(FIND_SOURCES);
				if (sources.length > 1) {
					console.log('Controller found by ' + creep.name + ', ' + creep.room.name + ' is suitable for colonizing.');
					Memory.rooms[room.name].suitableToColonize = true;
					Memory.rooms[room.name].colonizeByRoom = creep.memory.home;
				} else {
					console.log('No controller found by ' + creep.name + ', ' + creep.room.name + ' has 1 source so not suitable for colonizing.');
					Memory.rooms[room.name].suitableToColonize = false;
				}
			} else {
				console.log('No controller found by ' + creep.name + ', ' + creep.room.name + ' not suitable for colonizing.');

				Memory.rooms[room.name].suitableToColonize = false;
			}
			creep.suicide();
			delete Memory.creeps[creep.name];
		}
	}
};
