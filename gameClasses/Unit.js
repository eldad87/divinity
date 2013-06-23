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

    unitSettings: {
        actions:        [],
        speed:          0,
        attack:         {type: 'none', amount: 0, cooldown: 0, range: 0},
        armor:          {type: 'none', amount: 0},
        healthPoints:   {max: 0, current: 0},
        manaPoints:     {max: 0, current: 0}
    },

    init: function (actions, speed, attack, armor, hp, mana, animationType) {
        this.unitSetting(actions, speed, attack, armor, hp, mana);
        CharacterContainer.prototype.init.call(this, animationType);
    },

    getUnitSetting: function(settingName) {
        return this.unitSettings[settingName];
    },

    unitSetting: function(actions, speed, attack, armor, hp, mana) {
        if (    actions !== undefined   && speed   !== undefined &&
                attack  !== undefined   && armor   !== undefined &&
                hp      != undefined    && mana    !== undefined )
        {
            this.unitSettings.actions       = actions;
            this.unitSettings.speed         = speed;
            this.unitSettings.attack        = attack;
            this.unitSettings.armor         = armor;
            this.unitSettings.healthPoints  = hp;
            this.unitSettings.manaPoints    = mana;

            return this;
        }

        return this.unitSettings;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Unit; }