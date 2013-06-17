var ClientNetworkEvents = {
	/**
	 * Is called when a network packet with the "playerEntity" command
	 * is received by the client from the server. This is the server telling
	 * us which entity is our player entity so that we can track it with
	 * the main camera!
	 * @param data The data object that contains any data sent from the server.
	 * @private
	 */
	_onPlayerEntity: function (data) {
        ige.log('Stream onPlayerEntity');

		if (ige.$(data)) {
			// Add the player control component
            var eObj = ige.$(data);
            if(!eObj.Control) {
                eObj
                    .addComponent(ControlComponent);
            }
            eObj.Control.controlType( eObj.Control.typeOwn );
		} else {
			// The client has not yet received the entity via the network
			// stream so lets ask the stream to tell us when it creates a
			// new entity and then check if that entity is the one we
			// should be tracking!
			var self = this;
			self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
				if (entity.id() === data) {
					// Add the player control component
                    if(!entity.Control) {
                        entity
                            .addComponent(ControlComponent);
                    }
                    entity.Control.controlType( entity.Control.typeOwn );


					// Turn off the listener for this event now that we
					// have found and started tracking our player entity
					ige.network.stream.off('entityCreated', self._eventListener, function (result) {
						if (!result) {
							this.log('Could not disable event listener!', 'warning');
						}
					});
				}
			});
		}
	},

    _onEntityCreated: function(entity) {
        //Check if control is not set yet
        if(!entity.Control) {
            entity
                .addComponent(ControlComponent)
                .Control.controlType (entity.Control.typeEnemy);
        }

        ige.log('Stream entity created with ID: ' + entity.id());
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }