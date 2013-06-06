module.exports = (function (){
	var id_manager = {
		ids: {},
		//recycled_ids: Object.create(DM.list),
		generate_id: function (mover){
			var id
			/*if(this.recycled_ids.length){
				id = recycled_ids[0];
				recycled_ids.remove(id);
			} else{ for(var tries...*/
			for(var tries = 0; tries < 36; tries++){
				var attempt = Math.random().toString(36);
				if(attempt in this.ids){ continue}
				id = attempt
			}
			if(!id){ console.log("ID Assignment Failure"); return undefined}
			mover.id = id;
			this.ids[id] = mover;
			return id;
		},
		recycle_id: function (mover){
			delete this.ids[mover.id];
			delete mover.id;
			/* Memory Leak Test:
			var success1 = delete this.ids[mover.id];
			var success2 = delete mover.id;
			if(!success1 || !success2){ console.log("Deletion Failure")}
			var id_length = 0
			for(var key in this.ids){ id_length++}
			console.log(id_length)
			*/
		}
	}
	return id_manager;
})()