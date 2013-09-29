/**
 * Hold all game units attacks/armors definitions
 */
attack = {normal:'normal', piercing:'piercing', siege:'siege', chaos:'chaos', magic:'magic', hero:'hero'};
armor = {unarmored:'unarmored', light:'light', medium:'medium', havey:'havey', hero:'hero', fortified:'fortified'};

var ArmorAttackChart = {};
ArmorAttackChart[attack.normal]     = addAttackRatio(1, 1.5, 1, 0.7, 1, 1);
ArmorAttackChart[attack.piercing]   = addAttackRatio(2, 0.5, 1, 0.35, 0.5, 1.5);
ArmorAttackChart[attack.siege]      = addAttackRatio(1, 0.5, 1, 1.5, 0.5, 1.5);
ArmorAttackChart[attack.chaos]      = addAttackRatio(1, 1, 1, 1, 1, 1);
ArmorAttackChart[attack.magic]      = addAttackRatio(1, 1, 1, 1, 0.7, 1);
ArmorAttackChart[attack.hero]       = addAttackRatio(1, 1, 1, 0.5, 1, 1);

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

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ArmorAttackChart; }