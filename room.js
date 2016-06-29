/**
 * Created by Siarhei Kryutsou on 16/06/16.
 */

'use strict';

const utils = require("./utils.js").getInstance();

var _freeCells = ['/1', '/2', '/3', '/4', '/5', '/6', '/7', '/8', '/9'];
var _initiatorId;
var _opponentId;
var _chatId;
var _gridScheme = "";
var _initiatorStartMessageData;
var _opponentStartMessageData;
var _currentPlayerData;
var turnNum = 0;
var _cellSymbol;
var gameOverSchemes = [
 "1,2,3",
 "1,4,7",
 "1,5,9",
 "2,5,8",
 "3,6,9",
 "3,5,7",
 "4,5,6",
 "7,8,9"
];

module.exports = class Room {
	constructor(chatId, initiatorId, initiatorStartMessageData) {
		console.log("Room:", chatId, "created by", initiatorId);
		_chatId = chatId;
		_initiatorId = initiatorId;
		_initiatorStartMessageData = initiatorStartMessageData;
	}

	setOpponent(userId, opponentStartMessageData) {
		_opponentId = userId;
		_opponentStartMessageData = opponentStartMessageData;
		_currentPlayerData = Math.random() < 0.5 ? _initiatorStartMessageData : _opponentStartMessageData;
	}

	get freeCells() {
		return _freeCells;
	}

	get isGameStarted() {
		return _initiatorId && _opponentId;
	}

	get initiatorId() {
		return _initiatorId;
	}

	get opponentId() {
		return _opponentId;
	}

	get gridScheme() {
		return _gridScheme;
	}

	get chatId() {
		return _chatId;
	}

	getCurrentPlayerId() {
		return utils.getUserId(_currentPlayerData);
	}

	getCurrentPlayerUserName() {
		return utils.getUserName(_currentPlayerData, true);
	}

	getCurrentPlayerReplyMessageId() {
		return utils.getMessageId(_currentPlayerData);
	}

	isTurnOfCurrentPlayer($) {
		let playerId = utils.getUserId($);
		return playerId === this.getCurrentPlayerId();
	}

	isCellFree(cellCommand) {
		return _freeCells.indexOf(cellCommand) > -1;
	}

	getGameOverScheme() {
		let xScheme = [];
		let oScheme = [];
		let gameOverScheme;
		for(let i = 0; i < _gridScheme.length / 2; i++) {
			if(i % 2 === 1) {
				oScheme.push(_gridScheme.charAt((i * 2) + 1));
			} else {
				xScheme.push(_gridScheme.charAt((i * 2) + 1));
			}
		}

		xScheme.sort();
		oScheme.sort();

		console.log("xScheme", xScheme.toString());
		console.log("oScheme", oScheme.toString());

		for(let i = 0; i < gameOverSchemes.length; i++) {
			//TODO: Проверять только символ текущего хода
			if(xScheme.toString().indexOf(gameOverSchemes[i].toString()) > -1) {
				gameOverScheme = gameOverSchemes[i].toString();
			} else if(oScheme.toString().indexOf(gameOverSchemes[i].toString()) > -1) {
				gameOverScheme = gameOverSchemes[i].toString();
			}
		}

		return gameOverScheme;

	}

	makeTurn(cellCommand, callback) {
		turnNum++;

		//

		//

		_cellSymbol = turnNum % 2 === 0 ? "o" : "x";
		let cellIndex = parseInt(cellCommand.charAt(1));

		_gridScheme += _cellSymbol + cellIndex;
		_freeCells.splice(_freeCells.indexOf(cellCommand), 1);

		let gameOverScheme = this.getGameOverScheme();

		if(turnNum > 4 && gameOverScheme) {
			callback(gameOverScheme);
			this.resetGame();
			return;
		}

		if(utils.getUserId(_currentPlayerData) === utils.getUserId(_initiatorStartMessageData)) {
			_currentPlayerData = _opponentStartMessageData;
		} else {
			_currentPlayerData = _initiatorStartMessageData;
		}
		callback();
	}

	resetGame() {
		_initiatorId = null;
		_opponentId = null;
		_freeCells = ['/1', '/2', '/3', '/4', '/5', '/6', '/7', '/8', '/9'];
		_gridScheme = "";
		turnNum = 0;
		_currentPlayerData = null;
	}
};