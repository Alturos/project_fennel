client.chat = {
	setup: function (dom_container_id){
		var game_container = document.getElementById(dom_container_id);
		this.container = document.createElement('div');
		this.container.setAttribute('id', 'chat');
		this.output = document.createElement('div');
		this.input = document.createElement('input');
		this.output.setAttribute('class', 'output');
		this.input.setAttribute('class', 'input');
		this.input.setAttribute('type', 'text');
		this.container.appendChild(this.output);
		this.container.appendChild(this.input);
		game_container.appendChild(this.container);
		var chat_rect = this.container.getClientRects()[0];
		var input_rect = this.input.getClientRects()[0];
		var chat_height = chat_rect.bottom - chat_rect.top;
		var input_height = input_rect.bottom - input_rect.top;
		this.output.style.height = ''+(chat_height - input_height)+'px';
		this.input.addEventListener('keyup', function (e){
			if(e.keyCode === 13){
				var the_message = client.chat.input.value
				client.chat.send_message(the_message);
				client.chat.input.value = '';
			}
		}, false);
	},
	receive_data: function (data){
		for(var message_index = 0; message_index < data.length; message_index++){
			var indexed_message = data[message_index];
			this.display_message(indexed_message);
		}
	},
	display_message: function (message){
		var message_line = document.createElement('span');
		var message_byline = document.createElement('span');
		var message_body = document.createElement('span');
		message_line.setAttribute('class', 'chat_line');
		message_byline.setAttribute('class', 'chat_byline');
		message_body.setAttribute('class', 'chat_body');
		message_byline.textContent = message.user;
		message_body.textContent = message.body;
		message_line.appendChild(message_byline);
		message_line.appendChild(message_body);
		this.output.appendChild(message_line);
		
		this.output.appendChild(document.createElement('br'));
		this.output.scrollTop = this.output.scrollHeight;
	},
	send_message: function (body){
		var message_data = {
			'chat': body
		}
		client.networking.send_message(message_data);
	}
};