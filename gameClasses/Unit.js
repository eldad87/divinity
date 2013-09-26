/**
 * Hold all game units definition
 */
attack = {normal:'normal', piercing:'piercing', siege:'siege', chaos:'chaos', magic:'magic', hero:'hero'};
armor = {unarmored:'unarmored', light:'light', medium:'medium', havey:'havey', hero:'hero', fortified:'fortified'};

armorAttachChart = {};
armorAttachChart[attack.normal]     = addAttackRatio(1, 1.5, 1, 0.7, 1, 1);
armorAttachChart[attack.piercing]   = addAttackRatio(2, 0.5, 1, 0.35, 0.5, 1.5);
armorAttachChart[attack.siege]      = addAttackRatio(1, 0.5, 1, 1.5, 0.5, 1.5);
armorAttachChart[attack.chaos]      = addAttackRatio(1, 1, 1, 1, 1, 1);
armorAttachChart[attack.magic]      = addAttackRatio(1, 1, 1, 1, 0.7, 1);
armorAttachChart[attack.hero]       = addAttackRatio(1, 1, 1, 0.5, 1, 1);

function addAttackRatio(light, medium, havey, fortified, hero, unarmored) {
    var ratio = {};

    ratio[armor.light]      = light;
    ratio[armor.medium]     = medium;
    ratio[armor.havey]      = havey;
    ratio[armor.fortified]  = fortified;
    ratio[armor.hero]       = hero;
    ratio[armor.unarmored]  = unarmored;

    return ratio;
}

var Unit = CharacterContainer.extend({
    classId: 'Unit',

    _unitSettings: {
        actions:        {},
        armor:          {type: 'none', amount: 0},
        healthPoints:   {max: 0, current: 0},
        manaPoints:     {max: 0, current: 0}
    },

    init: function (actions, armor, hp, mana, animationType) {
        CharacterContainer.prototype.init.call(this, animationType);

        this.addComponent(ControlComponent);
        this.unitSettings(actions, armor, hp, mana);
        this.streamSections(['transform', 'direction', 'unit']);
    },

    streamSectionData: function (sectionId, data) {
        if (sectionId !== 'unit') {
            return CharacterContainer.prototype.streamSectionData.call(this, sectionId, data);
        }

        if (!ige.isServer) {
            if (data) {
                // We have been given new data!
                this.unitSettings(data.actions, data.armor, data.healthPoints, data.manaPoints);
            }
        } else {
            // Return current data
            return this.unitSettings();
        }
    },

    action: function(actionName, args) {
        if(this._unitSettings.actions[actionName]==undefined) {
            throw new EventException('Invalid entity action is used');
        }

        this[actionName].call(this, args);
    },

    getActionSettings: function(actionName) {
        if(this._unitSettings.actions[actionName]==undefined) {
            return false;
        }
        return this._unitSettings.actions[actionName];
    },

    getUnitSetting: function(settingName) {
        return this._unitSettings[settingName];
    },

    unitSettings: function(actions, armor, hp, mana) {
        if (    actions !== undefined   && armor   !== undefined   &&
                hp      != undefined  && mana    !== undefined )
        {
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
    attackAction: function(targetEntity) {
        var currentPosition = this._translate,
                targetEntityPosition = targetEntity._translate;

        if (this._parent.isometricMounts()) {
            currentPosition = this._parent.pointToTile(currentPosition.toIso());
            targetEntityPosition = this._parent.pointToTile(targetEntityPosition.toIso());
        } else {
            currentPosition = this._parent.pointToTile(currentPosition);
            targetEntityPosition = this._parent.pointToTile(targetEntityPosition);
        }


        //Check the distance between the units
        var distance = Math.distance(currentPosition.x, currentPosition.y, targetEntityPosition.x, targetEntityPosition.y);

        //Get range
        var actionSetting = this.getActionSettings('attack'),
            attackRange = actionSetting.range+1;


        if(attackRange>=distance) {
            this.moveStopAction();

            //Attack
        } else {
            //Get closer to the target
            this.moveAction(targetEntityPosition);
        }

        /**
         * Every x seconds, check if in range
         *  NO: get closer
         *  Yes: Check if cooldown-ver
         *      No: Wait
         *      Yes: Attack
         */
    },

    moveStopAction: function() {
        this.path.clear().stop();
        if (!ige.isServer) {
            ige.network.send('playerStopMove');
        }
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
            // Send a message to the server asking to path to this tile
            ige.network.send('playerControlToTile', [endTile.x, endTile.y]);  //TODO: do it for all selected entities


            // Create a path from the current position to the target tile
            newPath = ige.client.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);
        } else {
            // Create a path from the current position to the target tile
            newPath = ige.server.pathFinder.aStar(ige.$('DirtLayer'), startTile, endTile, tileChecker, true, true);
        }

        // Tell the entity to start pathing along the new path
        this
            .path.clear()
            .path.add(newPath)
            .path.start();
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Unit; }