var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},

        {name: 'BaseEntity', path: './gameClasses/BaseEntity'},
		{name: 'Character', path: './gameClasses/Character'},
		{name: 'PlayerComponent', path: './gameClasses/components/PlayerComponent'},
		{name: 'CommandComponent', path: './gameClasses/components/CommandComponent'},
		{name: 'ControlComponent', path: './gameClasses/components/ControlComponent'},
        {name: 'ArmorAttackChart', path: './gameClasses/ArmorAttackChart'},
        {name: 'Unit', path: './gameClasses/Unit'},
        {name: 'Archer', path: './gameClasses/Units/Archer'},
        {name: 'Huntress', path: './gameClasses/Units/Huntress'},
        {name: 'Wisp', path: './gameClasses/Units/Wisp'},
        {name: 'Building', path: './gameClasses/Building'},
        {name: 'TreeOfLife', path: './gameClasses/Buildings/TreeOfLife'},
		{name: 'tiledExample1', path: './maps/example'}
		//{name: 'EntityOccupyPositionComponent', path: './gameClasses/EntityOccupyPositionComponent'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }