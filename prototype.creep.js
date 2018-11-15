module.exports = function() {

	Creep.prototype.moveToRoom =
		function(targetRoom) {
			const exitDir = Game.map.findExit(creep.room, targetRoom);
			const exit = creep.pos.findClosestByPath(exitDir);
			this.moveTo(exit, {maxRooms: 1});
		}

	Creep.prototype.moveFastTo =
		function(target) {
			from = this.pos;
			to = target.pos;
			let ret = PathFinder.search(from, {pos: to, range: 1}, {
				plainCost:  2,
				swampCost: 10,
				roomCallback: function(roomName) {
					let room = Game.rooms[roomName];
					if (!room) return;
					let costs = new PathFinder.CostMatrix;

	        room.find(FIND_STRUCTURES).forEach(function(struct) {
	          if (struct.structureType === STRUCTURE_ROAD) {
	            // Favor roads over plain tiles
	            costs.set(struct.pos.x, struct.pos.y, 1);
	          } else if (struct.structureType !== STRUCTURE_CONTAINER &&
	                     (struct.structureType !== STRUCTURE_RAMPART ||
	                      !struct.my)) {
	            // Can't walk through non-walkable buildings
	            costs.set(struct.pos.x, struct.pos.y, 0xff);
	          }
	        });

	        return costs;
				},
			});

			let pos = ret.path[0];
			creep.move(creep.pos.getDirectionTo(pos));
		}

	// return if the creep is working or not
	Creep.prototype.isWorking =
		function() {
			// creeps only work when carrying energy or resources
			if (this.memory.working == true && (this.carry[RESOURCE_ENERGY] < 30) && (this.carry[RESOURCE_ENERGY] <= this.carryCapacity * 0.1)) {
				this.memory.working = false;
			} else if (this.memory.working == false && this.carry[RESOURCE_ENERGY] == this.carryCapacity) {
				this.memory.working = true;
			}

			return this.memory.working;
		}

	// Find any unfilled structures that can hold energy
	Creep.prototype.findEmptyStructure =
		function() {
			// Check for structures to drop off
			// Prio 1: Spawns and Extensions
			var structure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter: (s) => (s.structureType == STRUCTURE_SPAWN
							|| s.structureType == STRUCTURE_EXTENSION)
							&& s.energy < s.energyCapacity
			});
			// Prio 2: Stuctures that can contain energy
			if (structure === null) {
				structure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (s) => (s.structureType == STRUCTURE_TOWER
							&& s.energy < s.energyCapacity)
				});
			}
			// Prio 3: Storage room
			if (structure === null) {
				structure = this.room.find(FIND_STRUCTURES, {
					filter: (s) => (s.structureType == STRUCTURE_STORAGE
							&& _.sum(s.store) < s.storeCapacity)
				})[0];
			}
			// Prio 4: Terminals for transport to other rooms
			if (structure === null && creep.room.terminal != undefined) {
				structure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (s) => (s.structureType == STRUCTURE_TERMINAL
							&& _.sum(s.store) < s.storeCapacity)
				});
			}

			return structure;
		}

	// Find empty working creatures to drop off energy.
	Creep.prototype.findEmptyWorker =
	 function() {
			return this.pos.findClosestByPath(FIND_MY_CREEPS, {
				filter: c => c.getActiveBodyparts(WORK) > 0  && (c.carry[RESOURCE_ENERGY] <= 0.2 * c.carryCapacity) && c.memory.role != 'harvester' && c.memory.role != 'newWorldHarvester'
			});
		}

	Creep.prototype.getEnergy =
		function() {
			container = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0})[0];

			if (this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > 0){
				if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
					this.moveTo(creep.room.storage);
				}
			} else {
				var source = this.pos.findClosestByPath(FIND_SOURCES, {
					filter: (s) => s.energy > 0
				});
				if (this.harvest(source) == ERR_NOT_IN_RANGE) {
					this.moveTo(source);
				}
			}
		}

	Creep.prototype.attackCheck =
		function() {
			if (this.hits < this.hitsMax) {
				enemies = this.room.find(FIND_HOSTILE_CREEPS);
				if (enemies.length > 0) {
					console.log(this.name, 'calling for a knight');
					Memory.creeps['knight'+this.memory.home+this.room.name] = {name: 'knight'+this.memory.home+this.room.name, role: 'knight', home: this.memory.home, targetRoom: this.room.name}
				}
			}
		}
};
