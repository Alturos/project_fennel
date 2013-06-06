module.exports = (function (){
	var displayable = {
		display_icon: undefined,
		display_state: undefined,
		augment_effect: undefined,
		augment: function (identity, value){
			if(this[this.augment_effect]){
				value = this[this.augment_effect].augment(identity, value);
			}
			return value;
		}
	};
	return displayable;
})();