module.exports = {
	run: function(creep) {
		if (creep.room.name == creep.memory.targetRoom) {
			room = creep.room
			home = Game.rooms[creep.memory.home];
			myCreeps = creep.room.find(FIND_MY_CREEPS);
			console.log(creep.name,'found', myCreeps.length,'creeps in room');
			if (myCreeps.length <= 1 && room.controller != undefined) {
				sources = room.find(FIND_SOURCES);
				for (let source of sources) {
					console.log('Source id ' + source.id + ' found by ' + creep.name);
					// create 1 longDistanceHarvester + 4 longDistanceTruckers
					Memory.creeps['ldHarvester' + source.id] = {name: 'ldHarvester' + source.id, role: 'longDistanceHarvester', home: home.name, targetRoom: source.room.name, target: source.id, working: false};
					Memory.creeps['ldTrucker' + source.id + '_0'] = {name: 'ldTrucker' + source.id + '_0', role: 'longDistanceTrucker', home: home.name, targetRoom: source.room.name, target: source.id, working: false};
					Memory.creeps['ldTrucker' + source.id + '_1'] = {name: 'ldTrucker' + source.id + '_1', role: 'longDistanceTrucker', home: home.name, targetRoom: source.room.name, target: source.id, working: false};
					Memory.creeps['ldTrucker' + source.id + '_2'] = {name: 'ldTrucker' + source.id + '_2', role: 'longDistanceTrucker', home: home.name, targetRoom: source.room.name, target: source.id, working: false};
					Memory.creeps['ldTrucker' + source.id + '_3'] = {name: 'ldTrucker' + source.id + '_3', role: 'longDistanceTrucker', home: home.name, targetRoom: source.room.name, target: source.id, working: false};
				}

			} else {
				console.log('No controller for ' + creep.name);
			}
			creep.suicide();
			delete Memory.creeps[creep.name];
		} else {
			creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom), {range: 20});
		}
	}
};
