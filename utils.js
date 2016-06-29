/**
 * Created by alardeveloper on 16/06/16.
 */

'use strict';

let singleton = Symbol();
let singletonEnforcer = Symbol();

class Utils {
	constructor(enforcer) {
		if (enforcer !== singletonEnforcer) {
			throw "Cannot construct singleton"
		}
	}

	static getInstance() {
		if (!this[singleton]) {
			this[singleton] = new Utils(singletonEnforcer);
		}
		return this[singleton];
	}

	getUserName(data, addAtSumbol) {
		addAtSumbol = !!addAtSumbol;
		var result = data.user.username;
		if(addAtSumbol) {
			result = "@" + result;
		}
		return result;
	}

	getChatId(data) {
		return data.chatId;
	};

	getUserId(data) {
		return data.user.id;
	}

	getChatType(data) {
		return data.message.chat.type;
	}

	getMessageId(data) {
		return data.message.message_id;
	}

	getMessageText(data) {
		return data.message.text;
	}

	getCommand(data) {
		let command;
		if(data.query) {
			command = data.query.command;
 		} else {
			command = this.getMessageText(data).substr(0, 2);
		}
		return command;
	}
}

module.exports = Utils;