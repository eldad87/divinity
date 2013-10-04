var Unit = CharacterContainer.extend({
    classId: 'Unit',

    init: function (actions, armor, hp, mana, animationType) {
        CharacterContainer.prototype.init.call(this, animationType);

        this._currentAction = false;
        this._actionRepeaterUUID = false;
        this.unitSettings(actions, armor, hp, mana);
        if(!ige.isServer) {
            this.renderHP();
        }
        this.addComponent(ControlComponent);
        this.streamSections(['transform', 'direction', 'unit']);
    },

    addHP: function(val) {
        var hp = this.getUnitSetting('healthPoints', 'current');
        hp += val;

        if(hp<=0) {
            /* CEXCLUDE */
            if(ige.isServer) {
                    //Only the server can kill a unit
                    this.destroy();
            }
            /* CEXCLUDE */

            if(!ige.isServer) {
                hp = 1;
            }
        }

        this.setUnitSetting('healthPoints', 'current', hp);
        return this;
    },

    addMana: function(val) {
        var mana = this.getUnitSetting('manaPoints', 'current');
        mana += val;

        this.setUnitSetting('manaPoints', 'current', mana);
        return this;
    },

    streamSectionData: function (sectionId, data) {
        // Check if the section is one that we are handling
        if (sectionId === 'unit') {
            // Check if the server sent us data, if not we are supposed
            // to return the data instead of set it
            if (!ige.isServer) {
                if (data) {
                    // We have been given new data!
                    data = JSON.parse(data);
                    this.unitSettings(data.actions, data.armor, data.healthPoints, data.manaPoints);
                }
            }
            /* CEXCLUDE */
            if (ige.isServer) {
                // Return current data
                return JSON.stringify(this.unitSettings());
            }
            /* CEXCLUDE */
        } else {
            // The section was not one that we handle here, so pass this
            // to the super-class streamSectionData() method - it handles
            // the "transform" section by itself
            return CharacterContainer.prototype.streamSectionData.call(this, sectionId, data);
        }
    },

    renderHP: function() {
        var self = this;

        // Define the player fuel bar
        new EntityUiProgressBar()
            .id( self.id() + '_hp')
            .max(self.getUnitSetting('healthPoints').max)
            .min(0)
            .bindMethod(self, self.getUnitSetting ,['healthPoints', 'current'])
            //.bindData(self, 'currentHP')
            .top(-1 * self.size3d().y)
            .drawBounds(false)
            .drawBoundsData(false)
            .highlight(false)
            .width(self.size3d().x * 2)
            .height(5)
            .barColor('#00b343')
            .mount(this);
    },

    currentAction: function(val) {
        if (val !== undefined) {
            this._currentAction = val;
            this._actionRepeaterUUID = false; //Reset
            /*if(val===false) {
                ige.log('Clear action: ' + this._currentAction);
            } else {
                ige.log('Set new action: ' + val);
            }*/
            return this;
        }

        return this._currentAction;
    },

    action: function(actionName, args) {
        if(this._unitSettings.actions[actionName]==undefined) {
            throw new EventException('Invalid entity action is used');
        }
        this.currentAction(actionName);

        this[actionName + 'Action'].apply(this, args);

        if(!ige.isServer) {
            args.push(this.id());
            args.push(actionName);

            //Send action to server
            ige.network.send('action', args);
        }
    },

    getUnitSetting: function(settingName, attr, attr2) {
        if(settingName!=undefined &&
            attr!=undefined &&
            attr2!=undefined) {

            if(this._unitSettings[settingName][attr][attr2]==undefined) {
                return undefined;
            }

            return this._unitSettings[settingName][attr][attr2];
        } else if(settingName!=undefined &&
                    attr!=undefined) {

            if(this._unitSettings[settingName][attr]==undefined) {
                return undefined;
            }

            return this._unitSettings[settingName][attr];
        } else if(settingName!=undefined) {

            if(this._unitSettings[settingName]==undefined) {
                return undefined;
            }

            return this._unitSettings[settingName];
        }

        return this._unitSettings;
    },

    setUnitSetting: function(settingName, attr, attr2, attr3) {
        if(attr3!=undefined) {
            return this._unitSettings[settingName][attr][attr2] = attr3;
        } else if(attr2!=undefined) {
            return this._unitSettings[settingName][attr] = attr2;
        } else if(attr!=undefined) {
            return this._unitSettings[settingName] = attr;
        } else if(settingName!=undefined) {
            return this._unitSettings = settingName;
        }

        return this;
    },

    unitSettings: function(actions, armor, hp, mana) {
        if (    actions !== undefined   && armor   !== undefined   &&
                hp      != undefined  && mana    !== undefined )
        {
            this._unitSettings = {};
            this._unitSettings.actions       = actions;
            this._unitSettings.armor         = armor;
            this._unitSettings.healthPoints  = hp;
            this._unitSettings.manaPoints    = mana;

            return this;
        }

        return this._unitSettings;
    },

    /**
     * Actions
     */
    attackAction: function(targetEntityId) {
        var targetEntity = ige.$(targetEntityId);

        //Check if done attacking
        if(!targetEntity || targetEntity.alive()===false) {
            this.currentAction(false);
            return true;
        } else if(this.currentAction()!='attack') {
            return true;
        }

        var currentPosition = this._translate,
            targetEntityPosition = targetEntity._translate;

        if (this._parent.isometricMounts()) {
            currentPosition = this._parent.pointToTile(currentPosition.toIso());
            targetEntityPosition = this._parent.pointToTile(targetEntityPosition.toIso());
        } else {
            currentPosition = this._parent.pointToTile(currentPosition);
            targetEntityPosition = this._parent.pointToTile(targetEntityPosition);
        }


        //Check the distance between the unit and target
        var distance = Math.distance(currentPosition.x, currentPosition.y, targetEntityPosition.x, targetEntityPosition.y);

        //Get range
        var actionSetting   = this.getUnitSetting('actions' ,'attack'),
            attackRange     = actionSetting.range+ 1,
            isTargetInRange = attackRange>=distance,
            moveableUnit    = this.getUnitSetting('actions' ,'move') ? true : false,
            movementEndPoing;


        if(!isTargetInRange && !moveableUnit) {
            //Target is out of range, and unit cannot move
            return false;
        }

        if(!isTargetInRange) {
            movementEndPoing = this.path.endPoint();

            //Before moving, check if we already on the move
            if(movementEndPoing==null) {
                //Unit ISN'T MOVING, get closer to the target
                this.moveAction(targetEntityPosition);

                //Set repeater
                this._actionRepeater(actionSetting.cooldown, 'attack', [targetEntityId]);

                return true;
            } else {
                //Units IS MOVING, check the distance between the final-destination and the target
                if (this._parent.isometricMounts()) {
                    movementEndPoing = this._parent.pointToTile(movementEndPoing.toIso());
                }

                distance = Math.distance(movementEndPoing.x, movementEndPoing.y, targetEntityPosition.x, targetEntityPosition.y);
                if(attackRange<distance) {
                    //Destination is wrong, re-calc it
                    this.moveAction(targetEntityPosition);

                    //Set repeater
                    this._actionRepeater(actionSetting.cooldown, 'attack', [targetEntityId]);

                    return true;
                }
            }
        }


        //Target in IN RANGE
        if(moveableUnit) {
            //Stop moving
            this.moveStopAction();
        }


        var currentTime = new Date().getTime();
        if(currentTime <= (actionSetting['lastUsageTime'] + actionSetting.cooldown*1000)) {
            //Cool down still active

            //Set repeater
            this._actionRepeater( ((actionSetting['lastUsageTime'] + actionSetting.cooldown*1000) - currentTime) / 1000 , 'attack', [targetEntityId]);

            return false;
        }

        /**
         * Attack!!!
         */
        //Set cooldown
        this.setUnitSetting('actions', 'attack', 'lastUsageTime', currentTime);

        //Reduce Target's HP
        var dmg = this._caldFinalDmg(actionSetting, targetEntity.getUnitSetting('armor'));
        targetEntity.addHP( -1*dmg );

        //Set repeater
        this._actionRepeater(actionSetting.cooldown, 'attack', [targetEntity.id()]);

        return this;
    },

    _actionRepeater: function(timeInterval, actionName, args) {
        var self = this,
            id = ige.newId();
        this._actionRepeaterUUID = id;

        setInterval(function () {
            if(id!=self._actionRepeaterUUID) {
                return false;
            }

            self.action(actionName, args);
        }, timeInterval*1000);
    },

    _caldFinalDmg: function(attack, armor) {

        var dmgReduction = 0,
            dmg = attack.amount;

        //Calc dmg reduction
        if(armor.amount>0) { //Positive armor, reduce dmg
            dmgReduction = ((armor.amount)*0.06)/(1+0.06*(armor.amount));
            dmgReduction *= attack.amount;

        } else if(armor.amount<0) { //Negative armor, increase dmg
            dmgReduction = 2-0.94^(-armor.amount);
            dmgReduction = (dmgReduction*attack.amount) - attack.amount;
            dmgReduction *= -1;
        }
        dmg -= dmgReduction;

        //Calc attack/armor type I.e piercing attack vs fortified armor
        dmg *= ArmorAttackChart[attack.type][armor.type];

        return dmg;
    },

    moveStopAction: function() {
        this.path.clear();
        this.path.stop();
    },

    /**
     * Move entity
     * @param endTile
     * @private
     */
    moveAction: function (endTile) {
        // Get the tile co-ordinates that the mouse is currently over
        var currentPosition = this._translate,
            startTile,
            newPath,
            self = this,
            moveSetting = this.getUnitSetting('actions' ,'move'),

            tileChecker = function (tileData, tileX, tileY) {
                // If the map tile data is set, don't path along it
                return !tileData;
            };

        // Calculate which tile our character is currently "over"
        if (this._parent.isometricMounts()) {
            startTile = this._parent.pointToTile(currentPosition.toIso());
        } else {
            startTile = this._parent.pointToTile(currentPosition);
        }


        if(endTile==startTile) {
            return true; //Nothin to do
        }

        if (!ige.isServer) {
            // Create a path from the current position to the target tile
            newPath = ige.client.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);
        }

        /* CEXCLUDE */
        if (ige.isServer) {
            // Create a path from the current position to the target tile
            newPath = ige.server.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);
        }
        /* CEXCLUDE */

        // Tell the entity to start pathing along the new path
        this
            .path.clear()
            .path.add(newPath)
            .path.speed(moveSetting['speed']);

        //Check that this is a move request, and not a part of other requests, I.e attack
        if(this.currentAction()==='move') {
            this
                .path.on('traversalComplete', function() {
                    self.currentAction(false);
                });
            this
                .path.on('stop', function() {
                    self.currentAction(false);
                });
        }

        this
            .path.start()

    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Unit; }