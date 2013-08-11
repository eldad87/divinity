// Define our player character container classes
var Unit = BaseEntity.extend({
    classId: 'CharacterContainer',

    init: function (actions, subActions, armor, hp, mana, animationType) {
        var self = this;
        BaseEntity.prototype.init.call(this, actions, subActions, armor, hp, mana);
        this.addComponent(IgeVelocityComponent);

        // Setup the entity 3d bounds
        this.size3d(20, 20, 40);

        /* CEXCLUDE */
        if (ige.isServer) {
            /*self.box2dBody({
                type: 'dynamic',
                linearDamping: 0.0,
                angularDamping: 0.1,
                allowSleep: true,
                bullet: false,
                gravitic: true,
                fixedRotation: false,
                fixtures: [{
                    density: 1.0,
                    friction: 0.5,
                    restitution: 0.2,
                    shape: {
                        type: 'circle'
                    }
                }]
            });*/

            this.cannonBody({
                type: 'dynamic',
                mass: 1,
                angularDamping: 1.0,
                linearDamping: 0.05,
                allowSleep: false,
                sleepSpeedLimit: 0.1,
                sleepTimeLimit: 1000,
                fixtures: [{
                    shape: {
                        type: 'box'
                    }
                }]
            });
        }
        /* CEXCLUDE */




        if (!ige.isServer) {
            // Create a character entity as a child of this container
            self.character = new Character(animationType)
                .id(self.id() + '_character')
                .drawBounds(false)
                .originTo(0.5, 0.6, 0.5)
                .mount(self);

            //For debug, occupy the current entity position
            self.addComponent(EntityOccupyPositionComponent)
                .occupyPosition.enabled(true);

            // Check if the objectLayer is is iso mode
            if (ige.$('objectLayer').isometricMounts()) {
                // Set the co-ordinate system as isometric
                self.isometric(true);
            }
        }


        /*if (ige.isServer) {
            this.addComponent(IgePathComponent);
        }*/
        this.addComponent(IgePathComponent);

        // Define the data sections that will be included in the stream
        this.streamSections(['transform', 'unit', 'direction']);
    },

    _getMountedTextureEntity: function() {
        return this.character;
    },

    /**
     * Override the default IgeEntity class streamSectionData() method
     * so that we can check for the custom1 section and handle how we deal
     * with it.
     * @param {String} sectionId A string identifying the section to
     * handle data get / set for.
     * @param {*=} data If present, this is the data that has been sent
     * from the server to the client for this entity.
     * @return {*}
     */
    streamSectionData: function (sectionId, data) {
        // Check if the section is one that we are handling
        if (sectionId === 'direction') {
            // Check if the server sent us data, if not we are supposed
            // to return the data instead of set it
            if (!ige.isServer) {
                if (data) {
                    // We have been given new data!
                    this._streamDir = data;
                } else {
                    this._streamDir = 'stop';
                }
            } else {
                // Return current data
                return this._streamDir;
            }
        } else {
            // The section was not one that we handle here, so pass this
            // to the super-class streamSectionData() method - it handles
            // the "transform" section by itself
            return BaseEntity.prototype.streamSectionData.call(this, sectionId, data);
        }
    },

    update: function (ctx) {
        if (ige.isServer) {
            // Make sure the character is animating in the correct
            // direction - this variable is actually streamed to the client
            // when it's value changes!
            this._streamDir = this.path.currentDirection();
        } else {
            // Set the depth to the y co-ordinate which basically
            // makes the entity appear further in the foreground
            // the closer they become to the bottom of the screen
            this.depth(this._translate.y);

            if (this._streamDir) {
                if ((this._streamDir !== this._currentDir || !this.character.animation.playing())) {
                    this._currentDir = this._streamDir;

                    var dir = this._streamDir;
                    // The characters we are using only have four directions
                    // so convert the NW, SE, NE, SW to N, S, E, W
                    switch (this._streamDir) {
                        case 'SW':
                            dir = 'W';
                            break;

                        case 'SE':
                            dir = 'E';
                            break;

                        case 'NW':
                            dir = 'W';
                            break;

                        case 'NE':
                            dir = 'E';
                            break;
                    }

                    if (dir && dir !== 'stop') {
                        this.character.animation.start(dir);
                    } else {
                        this.character.animation.stop();
                    }
                }
            } else {
                this.character.animation.stop();
            }
        }

        IgeEntityBox2d.prototype.update.call(this, ctx);
    },

    getType: function() {
        return 'Unit';
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Unit; }