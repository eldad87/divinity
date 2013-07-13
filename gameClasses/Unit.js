var Unit = CharacterContainer.extend({
    classId: 'Unit',

    /**
     *
     * @param actions - main actions, will be displayed when unit is selected
     * @param subActions - actions that will appear on navigation (I.e build)
     * @param armor
     * @param hp
     * @param mana
     * @param animationType
     */
    init: function (actions, subActions, armor, hp, mana, animationType) {
        this.implement(BaseEntity);

        CharacterContainer.prototype.init.call(this, animationType);

        this._currentAction = false;

        this.unitSettings(actions, subActions, armor, hp, mana);
        if(!ige.isServer) {
            this.renderHP();
        }
        this.addComponent(ControlComponent);
        this.streamSections(['transform', 'direction', 'unit']);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Unit; }