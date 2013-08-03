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
			ige.server.players[clientId] = new Wisp(clientId);
            ServerNetworkEvents.notifyClientOnHisNewEntity(ige.server.players[clientId].id(), clientId);

            ige.server.players[clientId]
				.streamMode(1)
				.mount(ige.server.objectLayer);
		}
	},

    /**
     * Tell the client to track their player entity
     * @param entityId
     * @param clientId
     */
    notifyClientOnHisNewEntity: function(entityId, clientId) {
        ige.network.send('playerEntity', entityId, clientId);
    },

    /**
     *
     * @param data [EntityId, ActionName, Target, Args]
     * @param clientId
     * @private
     */
    _onAction: function (data, clientId) {
        ige.$(data[0]).
            action(data[1], data[2], data[3], clientId);
    }

};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }