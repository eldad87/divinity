var ServerNetworkEvents = {
	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */
	_onPlayerConnect: function (socket) {
		// Don't reject the client connection
		return false;
	},

	_onPlayerDisconnect: function (clientId) {
		if (ige.server.players[clientId]) {
			// Remove the player from the game
			ige.server.players[clientId].destroy();

			// Remove the reference to the player entity
			// so that we don't leak memory
			delete ige.server.players[clientId];
		}
	},

	_onPlayerEntity: function (data, clientId) {
		if (!ige.server.players[clientId]) {
			ige.server.players[clientId] = new Huntress(clientId)
				// .addComponent(PlayerComponent)
				.streamMode(1)
				.mount(ige.server.objectLayer);

			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
		}
	},

	_onPlayerStopMove: function (data, clientId) {
        var playerEntity = ige.server.players[clientId];

        playerEntity
            .path.clear()
            .path.stop();
    },

	_onPlayerControlToTile: function (data, clientId) {
		var playerEntity = ige.server.players[clientId],
			newPath,
			currentPosition = playerEntity._translate,
			startTile;
		
		console.log('Path to: ', data);
		
		// Calculate the start tile from the current position by using the collision map
		// as a tile map (any map will do with the same tileWidth and height).
		//startTile = playerEntity._parent.pointToTile(currentPosition.toIso());
        if (playerEntity._parent.isometricMounts()) {
            startTile = playerEntity._parent.pointToTile(currentPosition.toIso());
        } else {
            startTile = playerEntity._parent.pointToTile(currentPosition);
        }
		
		console.log('startTile', startTile);
		
		// Generate a path to the destination tile and then start movement
		// along the path
		newPath = ige.server.pathFinder.aStar(ige.$('DirtLayer'), startTile, new IgePoint(parseInt(data[0]), parseInt(data[1]), 0), function (tileData, tileX, tileY) {
			// If the map tile data is set to 1, don't allow a path along it
			//return tileData !== 1;
            return !tileData;
		}, true, true);
		
		//console.log(newPath);
		
		// Start movement along the new path
        playerEntity
            .path.clear()
            .path.add(newPath)
            .path.start();
	}
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }