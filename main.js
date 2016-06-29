/**
 * Created by sergeykrivtsov on 6/15/16.
 */

'use strict';

//import classes
const Room = require("./room.js");
const GridGenerator = require("./gridGenerator.js");

//import singletons
const utils = require("./utils.js").getInstance();

const tg = require('telegram-node-bot')('143854178:AAEWF_11KoWC7MfcvLiybvhmVvu5Oh6ZbWU');
const roomsByChatId = {};

const gridGenerator = new GridGenerator();

tg.router
	.when(['/start'], 'CommandsController')
	.when(['/1', '/2', '/3', '/4', '/5', '/6', '/7', '/8', '/9'], 'CellController');

tg.controller('CommandsController', ($) => {
	tg.for('/start', ($) => {
		if(utils.getChatType($) !== "group") {
			$.sendMessage("Sorry, this is multiplayer game, you must crate Group chat, invite me and your friends for playing.");
		} else {
			var username = utils.getUserName($, true);
			var userId = utils.getUserId($);
			var chatId = utils.getChatId($);
			var room = roomsByChatId[chatId];

			if(room) {
				if(room.isGameStarted) {
					$.sendMessage(username + " sorry, but the game is already in progress, wait until the game is over.");
				} else if(userId !== room.initiatorId) {
					room.setOpponent(userId, $);

					//let currentPlayer = room.currenPlayer;

					$.sendMessage("Starting game.\n" + room.getCurrentPlayerUserName() + ", your turn!");

					sendGridToCurrentPlayer(room);

				} else {
					$.sendMessage(username + " wait for your opponent send /start command.");
				}
			} else {
				room = new Room(chatId, userId, $);
				roomsByChatId[chatId] = room;
				$.sendMessage("Cool!\n" + username + " ready for challenge!\nWaiting command /start from opponent...");
			}
		}
	})
});

tg.controller('CellController', ($) => {
	let chatId = utils.getChatId($);
	let room = roomsByChatId[chatId];
	let userId = utils.getUserId($);

	if(!room) {
		$.sendMessage(utils.getUserName($, true) + ", started games is not found. You can initiate game by /start command.");
	} else {
		if(room.isTurnOfCurrentPlayer($)) {
			console.log("is turn of current player");
			let command = utils.getCommand($);
			if(room.isCellFree(command)) {
				let lastPlayerUserName = room.getCurrentPlayerUserName();
				room.makeTurn(command, (gameOverScheme) => {
					if(gameOverScheme) {
						sendCongrats(room, lastPlayerUserName, gameOverScheme);
					} else {
						sendGridToCurrentPlayer(room);
					}
				});
			} else {
				//TODO: Проверить, если ты выбрал занятую клетку
				let messageText = utils.getUserName($, true) + ", this cell is selected, please make correct turn: " + room.freeCells.join(" ");
				let params = {
					reply_to_message_id: utils.getMessageId($),
					reply_markup: JSON.stringify({
						keyboard: [room.freeCells],
						resize_keyboard: true,
						one_time_keyboard: true,
						selective: true
					})
				};

				$.sendMessage(messageText, params);
			}
		} else {
			console.log("is turn of other player!!!");
			$.sendMessage(utils.getUserName($, true) + ", please wait, it is not your turn.");
		}
	}
});

function sendCongrats(room, winner, scheme) {
	gridGenerator.drawGrid(room.gridScheme, (file) => {
		let params = {
			caption: "Game over!\n" + winner + " win!\nCongratulations!"
		};
		tg.sendPhoto(room.chatId, file, params);
	}, scheme);

	delete roomsByChatId[room.chatId];
}

function sendGridToCurrentPlayer(room) {
	if(room.freeCells.length) {
		const params = {
			caption: "Select cell: " + room.freeCells.join(" "),
			reply_to_message_id: room.getCurrentPlayerReplyMessageId(),
			reply_markup: JSON.stringify({
				keyboard: [room.freeCells],
				resize_keyboard: true,
				one_time_keyboard: true,
				selective: true
			})
		};

		gridGenerator.drawGrid(room.gridScheme, (file) => {
			console.log("send file");
			tg.sendPhoto(room.chatId, file, params);
		});
	} else {
		//TODO: close keyboards
		//TODO: game over
		gridGenerator.drawGrid(room.gridScheme, (file) => {
			tg.sendPhoto(room.chatId, file);
		});
	}
}

console.log("RUN!");