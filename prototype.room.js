module.exports = function() {

	Room.prototype.createRoadConstruction =
		function(RoomPositionA, RoomPositionB){
			var path = this.findPath(RoomPositionA, RoomPositionB, {ignoreCreeps: true});
			var roadLength = '';
			for (let step of path) {
				if (step != undefined) {
					this.createConstructionSite(step.x, step.y, STRUCTURE_ROAD);
					roadLength += '.';
				}
			}
			console.log('Road:', roadLength);
		}

	Room.prototype.findBuildSpot =
		function() {
			let xOffset = 7;
			let yOffset = 7;
			let xEnd = 42;
			let yEnd = 42;
			let square = new RoomPosition(5, 5, this.name);
			let squareSize = 0;

			while (xOffset < xEnd) {
				while (yOffset < yEnd) {
					let size = 0;

					// check the position itself
					let spot = this.getPositionAt(xOffset, yOffset);
					let terrain = spot.lookFor(LOOK_TERRAIN);
					if (terrain != 'wall') {
						let wallHit = false;
						while (xOffset + size < xEnd && yOffset + size < yEnd && wallHit == false) {
							size++;
							let step = 0;
							while (step < size && wallHit == false) {
								spot = this.getPositionAt(xOffset + step, yOffset + size);
								wallHit = spot.lookFor(LOOK_TERRAIN) == 'wall' ? true : false;

								spot = this.getPositionAt(xOffset + size, yOffset + step);
								wallHit = wallHit || (spot.lookFor(LOOK_TERRAIN) == 'wall' ? true : false);
								step++;
							}
						}
					}

					if (squareSize <= size) {
						squareSize = size;
						square.x = xOffset;
						square.y = yOffset;
						console.log('in between result:', square.x, square.y, squareSize);
					}

					yOffset++;
				}
				yOffset = 0;
				xOffset++;
			}
			console.log('result:', square.x, square.y, squareSize);
			halfSize = _.floor(squareSize/2);
			this.memory.buildLocation = {x: square.x + halfSize, y: square.y + halfSize, size: halfSize};
		}

	Room.prototype.createExtensionConstruction =
		function() {
			let controllerLevel = this.controller.level;
			let buildList = [
				{start:  0, end:  0},
				{start:  0, end:  4},
				{start:  5, end:  9},
				{start: 10, end:  19},
				{start: 20, end:  29},
				{start: 30, end:  39},
				{start: 40, end:  49},
				{start: 50, end:  59}
			];

			for (i = buildList[controllerLevel - 1].start; i <= buildList[controllerLevel - 1].end; i++) {
				let x = Memory.constructionSites.extension[i].x + this.memory.buildLocation.x;
				let y = Memory.constructionSites.extension[i].y + this.memory.buildLocation.y;
				this.createConstructionSite(x, y, STRUCTURE_EXTENSION);
			}

			return 0;
		}

	Room.prototype.getLinkPosition =
		function(source) {
			let area = this.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
			let freeSpots = _.filter(area, t => t.type == 'terrain' && t.terrain != 'wall');
			let buildPosition = new RoomPosition(0, 0, this.name);;

			if (freeSpots.length == 1) {
				let extendedArea = this.lookAtArea(freeSpots[0].y - 1, freeSpots[0].x - 1, freeSpots[0].y + 1, freeSpots[0].x + 1, true);
				let extendedFreeSpots = _.filter(extendedArea, t => t.type == 'terrain' && t.terrain != 'wall');

				// Make sure you dont build at the center point of the area, this is the one and only entry to the source.
				if (extendedFreeSpots[0].x != freeSpots[0].x && extendedFreeSpots[0].y != freeSpots[0].y) {
					buildPosition.x = extendedFreeSpots[0].x;
					buildPosition.y = extendedFreeSpots[0].y;
				} else {
					buildPosition.x = extendedFreeSpots[1].x;
					buildPosition.y = extendedFreeSpots[1].y;
				}
			} else if (freeSpots.length > 1) {
				// Dont have to check for center position here as center is the source and source is always on wall terrain.
				useNumber = _.floor(freeSpots.length / 2);
				buildPosition.x = freeSpots[useNumber].x;
				buildPosition.y = freeSpots[useNumber].y;
			}

			return buildPosition;
		}

	Room.prototype.createLinkConstruction =
		function(linkNumber) {
			this.memory.links = this.memory.links || [];

			let sources = this.find(FIND_SOURCES);
			let constructionSite = new RoomPosition(this.memory.buildLocation.x, this.memory.buildLocation.y, this.name);
			let range1 = constructionSite.getRangeTo(sources[0].pos);
			let range2 = constructionSite.getRangeTo(sources[1].pos);
			let linkPosition = new RoomPosition(24, 24, this.name);
			let nrOfLinks = this.memory.links.length;

			switch (linkNumber) {
				case 2:
						let targetSource1 = range1 > range2 ? sources[0] : sources[1];
						linkPosition = this.getLinkPosition(targetSource1);
						this.createConstructionSite(linkPosition, STRUCTURE_LINK);
						break;
				case 3:
						// Closest source has already a link, now get farthest away
						let targetSource2 = range1 > range2 ? sources[1] : sources[0];
						linkPosition = this.getLinkPosition(targetSource2);
						this.createConstructionSite(linkPosition, STRUCTURE_LINK);
						break;

			}
		}

	// assign roles to the links
	Room.prototype.assignLinks =
		function() {
		    this.memory.links = this.memory.links || [];

			let buildLocation = new RoomPosition(this.memory.buildLocation.x, this.memory.buildLocation.y, this.name);
			let links = this.find(FIND_MY_STRUCTURES, {
				filter: s => s.structureType == STRUCTURE_LINK
			})

			// when there are 2 links, these are the initial links at lvl 5
			if (links.length == 2 || this.memory.links.length == 0) {
				// receiving link is the link closest to the buildLocation
				let receivingLink = buildLocation.findClosestByRange(FIND_MY_STRUCTURES, {
					filter: s => s.structureType == STRUCTURE_LINK
				});
				this.memory.links[0] = {id: receivingLink.id, type: 'receiving'};

				let sendingLink = _.filter(links, l => l.id != receivingLink.id)[0];
				this.memory.links[1] = {id: sendingLink.id, type: 'sending', sendTo: receivingLink.id};
				// find the source near the link
				let nearSourceId = sendingLink.pos.findClosestByRange(FIND_SOURCES).id;
				// find the harvester of that source
				let nearHarvester = _.find(Memory.creeps, c => c.target == nearSourceId);
				// find the trucker of that harvester
				let nearTrucker = _.find(Memory.creeps, c => c.pickUp == nearHarvester.name);
				// redirect the trucker to the link at the building location.
				nearTrucker.pickUp = receivingLink.id;
			} else if (links.length == 3) {
				// add new link to the room memory

				let newLink = _.filter(links, l => l.id != this.memory.links[0].id && l.id != this.memory.links[1])[0];
				this.memory.links[2] = {id: newLink.id, type: 'sending', sendTo: this.memory.links[0].id};

				if (this.storage != undefined) {
					// find the source near the link
					let nearSourceId = newLink.pos.findClosestByRange(FIND_SOURCES).id;
					// find the harvester of that source
					let nearHarvester = _.find(Memory.creeps, c => c.target == nearSourceId);
					// find the trucker of that harvester
					let nearTrucker = _.find(Memory.creeps, c => c.pickUp == nearHarvester);
					// redirect the trucker to the storage at the building location.
					nearTrucker.pickUp = this.storage.id;
				}
			}
		}

	Room.prototype.makeSitesLevel =
		function(controllerLevel) {

			if (this.memory.buildLocation != undefined) {
				var x,y,result = 0;
				console.log('Upgrading to', controllerLevel);
				switch (controllerLevel) {
					case 1:
						// Set the spot to build structures.
						this.findBuildSpot();
						// 1st spawn
						x = this.memory.buildLocation.x + Memory.constructionSites.spawn[0].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.spawn[0].y;
						result = this.createConstructionSite(x, y, STRUCTURE_SPAWN);
						console.log('Spawn 0 set at',x,y, 'has result:', result);

						// room is now upgraded to level 1
						this.memory.upgradeLevel = 1;
						break;
					case 2:
						// Build Extensions
						this.createExtensionConstruction();

						// Roads to sources
						let startOfRoad = this.find(FIND_MY_SPAWNS)[0].pos;
						for (let source of this.find(FIND_SOURCES)) {
							console.log(this.name, source.pos);
							this.createRoadConstruction(startOfRoad, source.pos);
						}
						// Road to controller
						this.createRoadConstruction(startOfRoad, this.controller.pos);

						// room is now upgraded to level 2
						this.memory.upgradeLevel = 2;
					break;
					case 3:
						// Build Extensions
						this.createExtensionConstruction(5);

						// Roads to exits
						for (let direction of [FIND_EXIT_TOP, FIND_EXIT_RIGHT, FIND_EXIT_BOTTOM, FIND_EXIT_LEFT]){
							let startOfRoad = this.find(FIND_MY_SPAWNS)[0].pos;
							var exitLocation = startOfRoad.findClosestByPath(direction);
							if (exitLocation != undefined) {
								this.createRoadConstruction(startOfRoad, exitLocation);
							}
						}

						x = this.memory.buildLocation.x + Memory.constructionSites.tower[0].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.tower[0].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TOWER);

						// Populate room with own creeps
						let sources = this.find(FIND_SOURCES);
						Memory.creeps['harvester' + this.name + '_0'] = {name: 'harvester' + this.name + '_0', role: 'harvester',	home: this.name,	target: sources[0].id, working: false};
						Memory.creeps['trucker' + this.name + '_0'] = {name: 'trucker' + this.name + '_0', role: 'trucker',	home: this.name,	pickUp: 'harvester' + this.name + '_0', dropOff: null, working: false};
						Memory.creeps['harvester' + this.name+ '_1'] = {name: 'harvester' + this.name + '_1', role: 'harvester',	home: this.name,	target: sources[1].id, working: false};
						Memory.creeps['trucker' + this.name+ '_1'] = {name: 'trucker' + this.name+ '_1', role: 'trucker',	home: this.name,	pickUp: 'harvester' + this.name + '_1', dropOff: null, working: false};
						Memory.creeps['upgrader' + this.name] = {name: 'upgrader' + this.name, role: 'upgrader',	home: this.name,	working: false};
						Memory.creeps['builder' + this.name] = {name: 'builder' + this.name, role: 'builder',	home: this.name,	working: false};
						Memory.creeps['repairer' + this.name] = {name: 'repairer' + this.name, role: 'repairer',	home: this.name,	working: false};

						// room is now upgraded to level 3
						this.memory.upgradeLevel = 3;
					break;
					case 4:
						x = this.memory.buildLocation.x + Memory.constructionSites.storage[0].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.storage[0].y;
						result = this.createConstructionSite(x, y, STRUCTURE_STORAGE);

						// start building defense
						this.setPerimeter();
						// and a wall repairer
						Memory.creeps['wallRepairer' + this.name] = {name: 'wallRepairer' + this.name, role: 'wallRepairer',	home: this.name,	repairCounter: 0, target: null, working: false};

						// Build Extensions
						this.createExtensionConstruction(10);

						// remove room from the colonize list
						delete(this.memory.suitableToColonize);
						delete(this.memory.colonizeByRoom);

						// room is now upgraded to level 4
						this.memory.upgradeLevel = 4;
					break;
					case 5:
						x = this.memory.buildLocation.x + Memory.constructionSites.link[0].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.link[0].y;
						result = this.createConstructionSite(x, y, STRUCTURE_LINK);

						this.createLinkConstruction(2);

						// rerun setPerimeter to close any rampart gaps.
						this.setPerimeter();

						x = this.memory.buildLocation.x + Memory.constructionSites.tower[1].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.tower[1].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TOWER);


						Memory.creeps['trucker' + this.name+ '_2'] = {name: 'trucker' + this.name+ '_2', role: 'trucker',	home: this.name,	pickUp: this.storage.id, dropOff: 'upgrader' + this.name, working: false};

						// Build Extensions
						this.createExtensionConstruction(10);

						// room is now upgraded to level 5
						this.memory.upgradeLevel = 5;
					break;
					case 6:
					// Build Extensions
					this.createLinkConstruction(3);

					// Create another upgrader when there is enough energy
					if (this.container != undefined && this.container.store[RESOURCE_ENERGY] > 300000) {
						Memory.creeps['upgrader' + this.name + '_1'] = {name: 'upgrader' + this.name + '_1', role: 'upgrader',	home: this.name,	working: false};
						Memory.creeps['trucker' + this.name+ '_3'] = {name: 'trucker' + this.name+ '_3', role: 'trucker',	home: this.name,	pickUp: this.storage.id, dropOff: 'upgrader' + this.name + '_1', working: false};
					}

					this.createExtensionConstruction(10);

					// room is now upgraded to level 6
					this.memory.upgradeLevel = 6;
					break;
					case 7:
						x = this.memory.buildLocation.x + Memory.constructionSites.tower[2].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.tower[2].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TOWER);

						x = this.memory.buildLocation.x + Memory.constructionSites.spawn[1].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.spawn[1].y;
						result = this.createConstructionSite(x, y, STRUCTURE_SPAWN);

						x = this.memory.buildLocation.x + Memory.constructionSites.terminal[0].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.terminal[0].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TERMINAL);

						// Build Extensions
						this.createExtensionConstruction(10);

						// room is now upgraded to level 7
						this.memory.upgradeLevel = 7;
					break;
					case 8:
						x = this.memory.buildLocation.x + Memory.constructionSites.tower[3].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.tower[3].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TOWER);

						x = this.memory.buildLocation.x + Memory.constructionSites.tower[4].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.tower[4].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TOWER);

						x = this.memory.buildLocation.x + Memory.constructionSites.tower[5].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.tower[5].y;
						result = this.createConstructionSite(x, y, STRUCTURE_TOWER);

						x = this.memory.buildLocation.x + Memory.constructionSites.spawn[2].x;
						y = this.memory.buildLocation.y + Memory.constructionSites.spawn[2].y;
						result = this.createConstructionSite(x, y, STRUCTURE_SPAWN);

						// Build Extensions
						this.createExtensionConstruction(10);

						// room is now upgraded to level 8
						this.memory.upgradeLevel = 8;
					break;
					default:

				}
			} else {
				this.findBuildSpot();
			}
		}

	Room.prototype.respawnCreep =
		function(creepName) {
			var spawns = this.find(FIND_MY_SPAWNS);
			var spawnResult = null;
			var i = 0;
			while (spawnResult != OK && i < spawns.length) {
				if (spawns[i].spawning == null) {
					spawnResult = spawns[i].respawnCreep(creepName);
				}
				i++;
			}

		}

  // find neigbouring rooms for additional resources
	Room.prototype.expandResources =
		function() {
			// setup room variables
			console.log('Setting exploration variables for ' + this.name);
			this.memory.neighbourRooms = {
				allExplored: true,
			}

			console.log(this.name,'examining directions');
			exits = Game.map.describeExits(this.name);
			for (direction in exits) {
				console.log('Sending explorer', direction);
				Memory.creeps['explorer'+this.name+'_'+direction] = {name: 'explorer'+this.name+'_'+direction, role: 'explorer', home: this.name, targetRoom: exits[direction]};
			}
		}

  // Find good new rooms to colonize
	Room.prototype.findExpansion =
		function() {
			var roomsToExplore = {};

			// get the list of rooms to explore
			for (let neighbour of ['north', 'east', 'south', 'west']) {
				if (this.memory.neighbourRooms[neighbour].room != undefined) {
					startRoom = this.memory.neighbourRooms[neighbour].room;
					adjacentRooms = Game.map.describeExits(startRoom);
					for (let room in adjacentRooms) {
						if (Memory.rooms[adjacentRooms[room]] == undefined) {
							roomsToExplore[adjacentRooms[room]] = {} ;
						}
					}
				}
			}

			// create a peeping Tom per room
			for (room in roomsToExplore) {
				if (Memory.rooms[room] == undefined) {
					Memory.creeps['voyager'+this.name+room] = {name: 'voyager'+this.name+room, role: 'voyager', targetRoom: room};
					Memory.rooms[room] = {initiated: false};
				}
			}
		}

	Room.prototype.colonize =
		function(roomToColonize) {
			// Only expand to it when initiated by myself.
			console.log(this.name,'to colonize',roomToColonize);
			if (Memory.rooms[roomToColonize].colonizeByRoom != undefined && Memory.rooms[roomToColonize].colonizeByRoom == this.name) {
				extensions = this.find(FIND_MY_STRUCTURES, {
					filter: e => e.structureType == STRUCTURE_EXTENSION
				});
				// start expanding when extensions are build
				if ( Memory.rooms[roomToColonize].initiated == false && extensions.length >= 30) {
					// Send claimer, harvester, trucker and builder to new room, spawn them by creating creeps in memory
					if (Game.creeps['claimer'+roomToColonize] == undefined) {
						Memory.creeps['claimer'+roomToColonize] = {name: 'claimer'+roomToColonize, role: 'claimer', home: this.name, targetRoom: roomToColonize, claim: true, working: false};
					}
					if (Game.creeps['newWorldHarvester1'+roomToColonize] == undefined) {
						Memory.creeps['newWorldHarvester1'+roomToColonize] = {name: 'newWorldHarvester1'+roomToColonize, role: 'newWorldHarvester', home: this.name, target: roomToColonize, source: 0, working: false};
					}
					if (Game.creeps['newWorldHarvester2'+roomToColonize] == undefined) {
						Memory.creeps['newWorldHarvester2'+roomToColonize] = {name: 'newWorldHarvester2'+roomToColonize, role: 'newWorldHarvester', home: this.name, target: roomToColonize, source: 1, working: false};
					}
					if (Game.creeps['newWorldBuilder'+roomToColonize] == undefined) {
						Memory.creeps['newWorldBuilder'+roomToColonize] = {name: 'newWorldBuilder'+roomToColonize, role: 'newWorldBuilder', home: this.name, target: roomToColonize, working: false};
					}
					if (Game.creeps['newWorldUpgrader'+roomToColonize] == undefined) {
						Memory.creeps['newWorldUpgrader'+roomToColonize] = {name: 'newWorldUpgrader'+roomToColonize, role: 'newWorldUpgrader', home: this.name, target: roomToColonize, working: false};
					}
					if (Game.creeps['newWorldTrucker1'+roomToColonize] == undefined) {
						Memory.creeps['newWorldTrucker1'+roomToColonize] = {name: 'newWorldTrucker1'+roomToColonize, role: 'newWorldTrucker', home: this.name, target: 'newWorldHarvester1'+roomToColonize, targetRoom: roomToColonize, working: false};
					}
					if (Game.creeps['newWorldTrucker2'+roomToColonize] == undefined) {
						Memory.creeps['newWorldTrucker2'+roomToColonize] = {name: 'newWorldTrucker2'+roomToColonize, role: 'newWorldTrucker', home: this.name, target: 'newWorldHarvester2'+roomToColonize, targetRoom: roomToColonize, working: false};
					}
					this.memory.initiated = true;
				}
			}
		}

	Room.prototype.constructPerimeter =
		function (x, y, rampartCounter) {
			locationInfo = this.lookAt(x, y);
			let buildType = undefined;
			for (info of locationInfo) {
				if (info.type == 'structure') {
				 	if (info.structure.structureType == STRUCTURE_ROAD) {
						buildType = STRUCTURE_RAMPART;
						console.log('Found road.');
					} else {
						buildType = buildType || STRUCTURE_WALL;
					}
				}
			}
			buildType = buildType || STRUCTURE_WALL;

			if (buildType == STRUCTURE_RAMPART) {
				this.createConstructionSite(x, y, STRUCTURE_RAMPART);
				rampartCounter = 0;
			} else {
				if (rampartCounter >= 7) {
					this.createConstructionSite(x, y, STRUCTURE_RAMPART);
					rampartCounter = 0;
				} else {
					this.createConstructionSite(x, y, STRUCTURE_WALL);
					rampartCounter++;
				}
			}
			return rampartCounter;
		}

	Room.prototype.setPerimeter =
		function() {
			boundaryParameters = [
	        {x: 1, y: 0, direction: 1, xCoord: 0, yCoord: 0}, // North side, need to go down from border (+) for perimeter
	        {x: 0, y: 1, direction: -1, xCoord: 49, yCoord: 0},// East side, need to go left from border (-) for perimeter
	        {x: 1, y: 0, direction: -1, xCoord: 0, yCoord: 49},// South side, need to go up from border (-) for perimeter
	        {x: 0, y: 1, direction: 1, xCoord: 0, yCoord: 0}  // West side, need to go right from border (+) for perimeter
        ];

			for (let parameter of boundaryParameters) {
				atGap = false;
				rampartCounter = 3;

				for (let i = 2; i < 47; i++) {
					x = i * parameter.x;
					y = i * parameter.y;
					if (this.lookAt(x + parameter.xCoord, y + parameter.yCoord)[0].terrain == 'plain') {
						if (!atGap) {
							constructionSiteX = (1 * parameter.y * parameter.direction) + ((x - 2) * parameter.x) + parameter.xCoord;
							constructionSiteY = (1 * parameter.x * parameter.direction) + ((y - 2) * parameter.y) + parameter.yCoord;
							rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

							constructionSiteX = (2 * parameter.y * parameter.direction) + ((x - 2) * parameter.x) + parameter.xCoord;
							constructionSiteY = (2 * parameter.x * parameter.direction) + ((y - 2) * parameter.y) + parameter.yCoord;
							rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

							constructionSiteX = (2 * parameter.y * parameter.direction) + ((x - 1) * parameter.x) + parameter.xCoord;
							constructionSiteY = (2 * parameter.x * parameter.direction) + ((y - 1) * parameter.y) + parameter.yCoord;
							rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

							atGap = true;
						}

						constructionSiteX = (2 * parameter.y * parameter.direction) + (x * parameter.x) + parameter.xCoord;
						constructionSiteY = (2 * parameter.x * parameter.direction) + (y * parameter.y) + parameter.yCoord;
						rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

					} else {
						if (atGap) {
							constructionSiteX = (2 * parameter.y * parameter.direction) + (x * parameter.x) + parameter.xCoord;
							constructionSiteY = (2 * parameter.x * parameter.direction) + (y * parameter.y) + parameter.yCoord;
							rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

							constructionSiteX = (2 * parameter.y * parameter.direction) + ((x + 1) * parameter.x) + parameter.xCoord;
							constructionSiteY = (2 * parameter.x * parameter.direction) + ((y + 1) * parameter.y) + parameter.yCoord;
							rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

							constructionSiteX = (1 * parameter.y * parameter.direction) + ((x + 1) * parameter.x) + parameter.xCoord;
							constructionSiteY = (1 * parameter.x * parameter.direction) + ((y + 1) * parameter.y) + parameter.yCoord;
							rampartCounter = this.constructPerimeter(constructionSiteX, constructionSiteY, rampartCounter);

							rampartCounter = 3;
							atGap = false;
						}
					}

				}

			}
		}
};
