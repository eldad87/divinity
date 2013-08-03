var ClientNetworkEvents = {
    /**
     * Hold all not-yet-created owner entities (id).
     */
    _playerEntities: [],

	/**
	 * Is called when a network packet with the "playerEntity" command
	 * is received by the client from the server. This is the server telling
	 * us which entity is our player entity so that we can track it with
	 * the main camera!
	 * @param data The data object that contains any data sent from the server.
	 * @private
	 */
	_onPlayerEntity: function (data) {
        ige.log('Stream onPlayerEntity: ' + data);

		if (ige.$(data)) {
			// Set as owner
            ige.$(data).Control.controlType( CommandComponent.prototype.typeOwn );
		} else {
            ClientNetworkEvents._playerEntities.push(data);
		}
	},

    /**
     * Every time a new entity is created by the server
     * @param entity
     * @private
     */
    _onEntityCreated: function(entity) {
        var isOwner = ClientNetworkEvents._playerEntities.indexOf(entity.id());
        if(isOwner!==-1) {
            delete ClientNetworkEvents._playerEntities[isOwner];
        }
        //Check if control is not set yet
        entity
            .highlight(false)
            .drawBounds(false)
            .drawBoundsData(false)
            .Control.enableMouseHandler()
            .Control.controlType(
                isOwner!==-1 ?
                    CommandComponent.prototype.typeOwn :
                    CommandComponent.prototype.typeEnemy
            );

        ige.log('Stream entity created with ID: ' + entity.id());
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }