module.exports = {
  do: function() {
    // Set the build locations for the different room levels
    // coordinates are relative to center of build location
    Memory.constructionSites = Memory.constructionSites || {
        spawn: [
          {x: -4, y:  5},
          {x: -5, y:  2},
          {x: -2, y:  5}
        ],
        tower: [
          {x: -3, y:  0},
          {x:  0, y:  3},
          {x: -4, y:  1},
          {x: -1, y:  4},
          {x: -5, y:  0},
          {x:  0, y:  5}
        ],
        storage: [
          {x: -4, y:  4}
        ],
        link: [
          {x: -5, y:  5}
        ],
        terminal: [
          {x: -5, y:  3}
        ],
        extension: [
          // room level 2
          {x: -4, y:  2}, {x: -3, y:  2}, {x: -2, y:  4}, {x: -2, y:  3}, {x: -1, y:  3},

          // room level 3
          {x: -3, y:  1}, {x: -2, y:  1}, {x: -2, y:  0}, {x: -1, y:  2}, {x: -0, y:  2},

          // room level 4
          {x: -1, y:  0}, {x: -1, y: -1}, {x:  0, y: -1}, {x:  0, y: -2}, {x:  1, y: -2},
          {x:  0, y:  1}, {x:  1, y:  1}, {x:  1, y:  0}, {x:  2, y:  0}, {x:  2, y: 11},

          // room level 5
          {x:  3, y: -2}, {x:  3, y: -3}, {x:  2, y: -3}, {x:  2, y: -4}, {x:  1, y: -4},
          {x:  1, y: -5}, {x:  0, y: -3}, {x:  0, y: -5}, {x: -1, y: -3}, {x: -1, y: -5},

          // room level 6
          {x: -1, y: -2}, {x: -2, y: -1}, {x: -2, y: -2}, {x: -2, y: -4}, {x: -2, y: -5},
          {x: -3, y: -1}, {x: -3, y: -3}, {x: -3, y: -4}, {x: -4, y: -1}, {x: -4, y: -2},

          // room level 7
          {x: -4, y: -3}, {x:  4, y: -2}, {x:  4, y: -1}, {x:  3, y:  0}, {x:  3, y:  1},
          {x:  2, y:  1}, {x:  2, y:  2}, {x:  1, y:  3}, {x:  5, y: -1}, {x:  5, y:  0},

          // room level 8
          {x:  5, y:  1}, {x:  5, y:  2}, {x:  4, y:  2}, {x:  1, y:  2}, {x:  1, y:  4},
          {x:  2, y:  4}, {x:  3, y:  4}, {x:  3, y:  3}, {x:  4, y:  3}, {x: -4, y:  3}
          // last extension at location of former container

        ]
      }

    if (Object.keys(Game.creeps).length == 0) {
      // make sure that the 1st spawn has name 'Spawn1'
      let spawn = Object.keys(Game.spawns)[0];
      room = Game.spawns[spawn].room;
      roomName = room.name;

      sources = room.find(FIND_SOURCES);
      Memory.creeps = Memory.creeps || {};
      Memory.creeps['harvester' + roomName + '_0'] = {name: 'harvester' + roomName + '_0', role: 'harvester',	home: roomName,	target: sources[0].id, working: false};
      Memory.creeps['trucker' + roomName + '_0'] = {name: 'trucker' + roomName + '_0', role: 'trucker',	home: roomName,	pickUp: 'harvester' + roomName + '_0', dropOff: null, working: false};
      Memory.creeps['harvester' + roomName+ '_1'] = {name: 'harvester' + roomName + '_1', role: 'harvester',	home: roomName,	target: sources[1].id, working: false};
      Memory.creeps['trucker' + roomName+ '_1'] = {name: 'trucker' + roomName+ '_1', role: 'trucker',	home: roomName,	pickUp: 'harvester' + roomName + '_1', dropOff: null, working: false};
      Memory.creeps['upgrader' + roomName] = {name: 'upgrader' + roomName, role: 'upgrader',	home: roomName,	working: false};
      Memory.creeps['builder' + roomName] = {name: 'builder' + roomName, role: 'builder',	home: roomName,	working: false};
      Memory.creeps['repairer' + roomName] = {name: 'repairer' + roomName, role: 'repairer',	home: roomName,	working: false};
    }
  }
}
