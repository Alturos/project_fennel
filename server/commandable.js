module.exports = (function (){
	var commandable = Object.create(Object, {
		command: {value: function (message){}}
	});
	return commandable;
})();