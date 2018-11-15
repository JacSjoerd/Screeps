module.exports = function() {
	StructureSpawn.prototype.respawnCreep =
		function(name) {
			console.log('Respawning ' + name);
			if (name == undefined || Memory.creeps[name] == undefined) {
				console.log('Memory.creeps[name]',name,' does not match Memory.creeps[name].name');
				return -1;
			}

			var role = Memory.creeps[name].role;
			var home = Memory.creeps[name].home;
			var energy = Game.rooms[home].energyCapacityAvailable;

			if (role == 'harvester') {
				var numberOfParts = Math.floor(energy / 200);
				// if somehow we are out of creeps, spawn 1 little harvester.
				creepsAlive = this.room.find(FIND_MY_CREEPS, {
					filter: c => c.memory.home == this.room.name
				}) || [];
				numberOfParts = (creepsAlive.length == 0) ? 1 : numberOfParts;

				// Max size of a harvester is 5x3 body parts
				numberOfParts = numberOfParts > 5 ? 5 : numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(WORK);
					body.push(CARRY);
					body.push(MOVE);
				}
			} else if (role == 'trucker') {
				var numberOfParts = Math.floor(energy / 200);
				numberOfParts = numberOfParts > 5 ? 5 : numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(CARRY);
					body.push(CARRY);
					body.push(MOVE);
				}
			} else if (role == 'upgrader') {
				var numberOfParts = Math.floor(energy / 350);
				numberOfParts = numberOfParts > 8 ? 8 : numberOfParts;
				var body = [WORK,CARRY,MOVE];
				for (let i = 1; i < numberOfParts; i++) {
					body.push(WORK);
					body.push(WORK);
					body.push(CARRY);
					body.push(CARRY);
					body.push(MOVE);
				}
			} else if (role == 'repairer'
					|| role == 'builder'
					|| role == 'newWorldBuilder'
					|| role == 'newWorldUpgrader'
					|| role == 'wallRepairer') {
				var numberOfParts = Math.floor(energy / 200);
				numberOfParts = numberOfParts > 6 ? 6 : numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(WORK);
					body.push(CARRY);
					body.push(MOVE);
				}
			} else if (role == 'longDistanceHarvester' || role == 'newWorldHarvester') {
				var numberOfParts = Math.floor(energy / 300);
				numberOfParts = numberOfParts > 5 ? 5 : numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(WORK);
					body.push(CARRY);
					body.push(MOVE);
				}
			}
			if (role == 'longDistanceTrucker') {
				var numberOfParts = Math.floor(energy / 200);
				numberOfParts = numberOfParts > 10 ? 10 : numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(CARRY);
					body.push(MOVE);
				}
			} else if (role == 'newWorldTrucker') {
				var numberOfParts = Math.floor(energy / 200);
				numberOfParts = numberOfParts > 6 ? 6: numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(CARRY);
					body.push(MOVE);
				}
			} else if (role == 'knight') {
				var numberOfParts = Math.floor(energy / 130);
				numberOfParts = numberOfParts > 25 ? 25 : numberOfParts;
				var body = [];
				for (let i = 0; i < numberOfParts; i++) {
					body.push(ATTACK);
				}
				for (let i = 0; i < numberOfParts; i++) {
					body.push(MOVE);
				}
			} else if (role == 'explorer') {
				var body = [MOVE];
			} else if (role == 'voyager') {
				var body = [MOVE];
			} else if (role == 'claimer') {
				var numberOfParts = Math.floor(energy / 650);
				body = numberOfParts == 1 ? [CLAIM,MOVE] : [CLAIM,CLAIM,MOVE,MOVE];
			}

			return this.spawnCreep(body, name);
		}

};
