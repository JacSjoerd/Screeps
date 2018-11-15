module.exports = {
	run: function(creep) {
		if (creep.isWorking()){
			// stay a while with current barricade
			var nextBarricade = false;
			if (creep.memory.repairCounter == undefined || creep.memory.repairCounter > 20 || creep.memory.target == undefined) {
				creep.memory.repairCounter = 0;
				nextBarricade = true;
			}

			if (nextBarricade) {
				let room = Game.rooms[creep.memory.home];
				var barricades = room.find(FIND_STRUCTURES, {
					filter: (s) =>  s.hits < s.hitsMax && (s.structureType == STRUCTURE_WALL || (s.structureType == STRUCTURE_RAMPART && s.my))
				});

				if (barricades[0] != undefined){
					var lowestBarricade;
					for (let barricade of barricades) {
						if (lowestBarricade == undefined || barricade.hits < lowestBarricade.hits) {
							lowestBarricade = barricade;
						}
					}
					creep.memory.target = lowestBarricade.id;
				}
			} else {
				barricade = Game.getObjectById(creep.memory.target);
				if (barricade != undefined) {
					if (creep.repair(barricade) == OK) {
						creep.memory.repairCounter++;
					}
					creep.moveTo(barricade, {rooms: 1});
				} else {
					creep.moveTo(24,24);
					delete creep.memory.target;
				}
			}
		} else {
			creep.getEnergy();
		}

	}
};
