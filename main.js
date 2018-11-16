var initiate = require('action.initiate');
require('prototype.creep')();
require('prototype.spawn')();
require('prototype.room')();
var roleHarvester = require('role.harvester');
var roleTrucker = require('role.trucker');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleKnight = require('role.knight');
var roleLongDistanceHarvester = require('role.longDistanceHarvester');
var roleLongDistanceTrucker = require('role.longDistanceTrucker');
var roleNewWorldHarvester = require('role.newWorldHarvester');
var roleNewWorldTrucker = require('role.newWorldTrucker');
var roleNewWorldBuilder = require('role.newWorldBuilder');
var roleNewWorldUpgrader = require('role.newWorldUpgrader');
var roleExplorer = require('role.explorer');
var roleVoyager = require('role.voyager');
var roleClaimer = require('role.claimer');

module.exports.loop = function () {
	console.log('--------------');
	// run through rooms

	initiate.do();
	// get all creeps that are alive and group by room
	groupedAliveCreeps = _.groupBy(Game.creeps, 'memory.home');

	// get creeps that are not alive and group by room
	groupedCreepsToBuild = _
		.chain(Memory.creeps)
		.filter(c => Game.creeps[c.name] == undefined)
		.groupBy('home')
		.value();

	for (let roomName in Game.rooms) {
		var room = Game.rooms[roomName];
		if (room.controller != undefined && room.controller.my) {
            new RoomVisual(roomName).text("My room!", 25, 25, {color: 'yellow'});
			if (room.memory.upgradeLevel == undefined || room.memory.upgradeLevel < room.controller.level) {
				console.log('Upgrading room to', room.controller.level);
				room.makeSitesLevel(room.controller.level);
			}

			// 1st check for harvesters, then for truckers, then for all creeps to respawn
			// get creeps that are not alive from this room
			let creepList = groupedCreepsToBuild[roomName] || [];
            if (creepList.length > 0) {
                new RoomVisual(room.name).text(' Build queue:' + creepList.length, 3, 1, { align: 'left' });
            }

			// get priority roles from this room
			let rebuildList = _.groupBy(groupedCreepsToBuild[roomName], 'role');
			if (rebuildList['harvester'] != undefined && rebuildList['harvester'].length > 0){
				room.respawnCreep(rebuildList['harvester'][0].name);
				console.log(roomName, 'has', rebuildList['harvester'][0].name, 'in the queue');
			} else if (rebuildList['trucker'] != undefined && rebuildList['trucker'].length > 0){
				room.respawnCreep(rebuildList['trucker'][0].name);
				console.log(roomName, 'has', rebuildList['trucker'][0].name, 'in the queue');
			} else if (rebuildList['knight'] != undefined && rebuildList['knight'].length > 0){
				room.respawnCreep(rebuildList['knight'][0].name);
				console.log(roomName, 'has', rebuildList['knight'][0].name, 'in the queue');
			} else if (creepList.length > 0){ // when all priority roles are checked and not found, take 1st creep from the list in this room.
				room.respawnCreep(creepList[0].name);
				console.log(roomName, 'has', creepList[0].name, 'in the queue');
			}


			// run creeps that are active (in Game.creeps)
			creepList = groupedAliveCreeps[roomName];
			if (creepList != undefined) {
				for (let creepMemory of creepList){
					creepName = creepMemory.name

					creep = Game.creeps[creepName];
					if (creep.memory.role == 'harvester') {
						roleHarvester.run(creep);
					}	else if (creep.memory.role == 'trucker') {
						roleTrucker.run(creep);
					}	else if (creep.memory.role == 'upgrader') {
						roleUpgrader.run(creep);
					}	else if (creep.memory.role == 'builder') {
						roleBuilder.run(creep);
					}	else if (creep.memory.role == 'repairer') {
						roleRepairer.run(creep);
					}	else if (creep.memory.role == 'wallRepairer') {
						roleWallRepairer.run(creep);
					}	else if (creep.memory.role == 'longDistanceHarvester') {
						roleLongDistanceHarvester.run(creep);
					}	else if (creep.memory.role == 'longDistanceTrucker') {
						roleLongDistanceTrucker.run(creep);
					}	else if (creep.memory.role == 'newWorldHarvester') {
						roleNewWorldHarvester.run(creep);
					}	else if (creep.memory.role == 'newWorldTrucker') {
						roleNewWorldTrucker.run(creep);
					}	else if (creep.memory.role == 'newWorldBuilder') {
						roleNewWorldBuilder.run(creep);
					}	else if (creep.memory.role == 'newWorldUpgrader') {
						roleNewWorldUpgrader.run(creep);
					}	else if (creep.memory.role == 'knight') {
						roleKnight.run(creep);
					}	else if (creep.memory.role == 'explorer') {
						roleExplorer.run(creep);
					}	else if (creep.memory.role == 'claimer') {
						roleClaimer.run(creep);
					}	else if (creep.memory.role == 'voyager') {
						roleVoyager.run(creep);
					}
				}
			}

			// tower targetting
			var enemiesInRoom = false;
			var towers = room.find(FIND_MY_STRUCTURES, {
				filter: (s) => s.structureType == STRUCTURE_TOWER
			})

			for (let tower of towers) {
				var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
				if (target != undefined) {
					tower.attack(target);
					room.memory.attacked = true;
					enemiesInRoom = true;
				}
			}

      // Update links
      if (room.memory.links != undefined && room.memory.links.length < room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LINK}).length) {
          room.assignLinks();
      }

			// link transfers
			if (room.storage != undefined && room.memory.links != undefined) {
				for (let link of room.memory.links) {
					if (link.type == 'sending') {
						sender = Game.getObjectById(link.id);
						receiver = Game.getObjectById(link.sendTo);
						if (sender != undefined && sender.cooldown == 0 && receiver != undefined) {
							sender.transferEnergy(receiver);
						}
					}
				}
			}

			// check perimeter after an attack
			if (room.memory.attacked != undefined && room.memory.attacked && enemiesInRoom == false) {
				room.memory.attacked = false;
				room.setPerimeter();
			}

			// clear flags in room
			if (room.memory.clearFlags == true) {
				flags = room.find(FIND_FLAGS);
				for (let flag of flags) {
					flag.remove();
				}
				room.memory.clearFlags = false;
			}

			// expand resources
			if (room.controller.level >= 3 && (room.memory.neighbourRooms == undefined || room.memory.neighbourRooms.allExplored == false)) {
				room.expandResources();
			}

			// find new rooms
			if (room.controller.level >= 4 && (room.memory.exploredRooms == undefined || room.memory.exploredRooms.allRoomsExplored == false)) {
				extensions = room.find(FIND_MY_STRUCTURES, {
					filter: e => e.structureType == STRUCTURE_EXTENSION
				});

				// only start expansion if we have enough extensions to support it
				if (extensions >= 10) {
					room.findExpansion();
				}
			}

			// Colonize new room
			if (room.controller.level >= 5) {
				let roomToColonize;
				for (let newRoom in Memory.rooms) {
					if (Memory.rooms[newRoom].colonizeByRoom == room.name && Memory.rooms[newRoom].suitableToColonize && !Memory.rooms[newRoom].initiated) {
						room.colonize(newRoom);
					}
				}
			}

		} else {
			claimer = room.find(FIND_MY_CREEPS, {
				filter: c => c.memory.role == 'claimer'
			});
			if (claimer.length > 0){
				if (room.controller != undefined && room.controller.reservation != undefined && room.controller.reservation.ticksToEnd > 3000) {
					claimer[0].memory.home = undefined;
					console.log(claimer[0].name, 'has no home anymore.');
				}
			}
			room.memory.initiated = false;
		}

	}

}
