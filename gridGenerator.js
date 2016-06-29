/**
 * Created by alardeveloper on 17/06/16.
 */

'use strict';

const fs = require("fs");
const Canvas = require("canvas");

const width = 300;
const height = 300;
const lineHeight = 4;
const gridColor = "#9b9b9b";
const backgroundColor = "#FFFFFF";
const font = "OpenSans";
const fontSize = 40;
const fontColor = "#5397dc";
const fontStyle = fontSize + "px " + font;
const symbolSize = 60;
const symbolLineHeight = 6;
const nullColor = "#dc5353";
const crossColor = "#37b06d";
const gameOverLineHeight = 2;
const gameOverLineColor = "#000000";
const lineMargin = lineHeight / 3;
const leftMargin = Math.round(width / 3);
const topMargin = Math.round(height / 3);
const leftX = Math.round(leftMargin - lineMargin);
const rightX = Math.round(width - leftMargin - lineMargin);
const topY = Math.round(topMargin - lineMargin);
const bottomY = Math.round(height - topMargin - lineMargin);
const cellWidth = width / 3;
const cellHeight = height / 3;
const fontTopMargin = Math.round(fontSize * 0.75);
const cellLabels = ["/1", "/2", "/3", "/4", "/5", "/6", "/7", "/8", "/9"];
const fileDirectory = "./tictactoe/grid/";

let canvas;
let ctx;


module.exports = class GridGenerator {

	constructor() {
		canvas = new Canvas(width, height);
		ctx = canvas.getContext("2d");
	}

	drawGrid(gridScheme, callback, gameOverScheme) {
		let fileName = "grid_" + gridScheme;
		let filePath = fileDirectory + fileName + ".jpg";

		fs.exists(filePath, (exists) => {
			if(exists) {
				console.log("file", filePath, "exists");
				callback(fs.createReadStream(filePath));
			} else {
				console.log("file", filePath, "not exists, draw it");
				this._drawKeyboard();

				if(gridScheme) {
					for(let i = 0; i < gridScheme.length / 2; i++) {
						let turnCode = gridScheme.substr(2 * i, 2);
						let cellCode = turnCode.charAt(0);
						let cellIndex = parseInt(turnCode.charAt(1)) - 1;
						this._drawTurn(cellIndex, cellCode);
					}
				}

				if(gameOverScheme) {
					this._drawGameOver(gameOverScheme);
				}

				this._saveFile(filePath, callback);
			}
		});
	}

	_drawGameOver(gameOverScheme) {
		console.log("_drawGameOver", gameOverScheme);
		var startCellIndex = parseInt(gameOverScheme.charAt(0)) - 1;
		var endCellIndex = parseInt(gameOverScheme.charAt(gameOverScheme.length - 1)) -1;

		console.log(startCellIndex, endCellIndex);

		let halfSize = Math.round(symbolSize / 2);
		let startX = startCellIndex % 3;
		let startY = parseInt(startCellIndex / 3);
		let endX = endCellIndex % 3;
		let endY = parseInt(endCellIndex / 3);
		let startCellCenterX = (cellWidth * startX) + (cellWidth / 2);
		let startCellCenterY = (cellHeight * startY) + (cellHeight / 2);
		let endCellCenterX = (cellWidth * endX) + (cellWidth / 2);
		let endCellCenterY = (cellHeight * endY) + (cellHeight / 2);

		/*startCellCenterX += -halfSize + (halfSize * (startCellIndex % 3));
		startCellCenterY += -halfSize + (halfSize * parseInt(startCellIndex / 3));
		endCellCenterX += 	-halfSize + (halfSize * (endCellIndex % 3));
		endCellCenterY += 	-halfSize + (halfSize * parseInt(endCellIndex / 3));*/

		if(startCellIndex === endCellIndex - 2) {
			//
			// * * *
			//
			startCellCenterX -= halfSize;
			endCellCenterX += halfSize;
		}

		if(startCellIndex === endCellIndex - 6) {
			//	*
			//  *
			//	*
			startCellCenterY -= halfSize;
			endCellCenterY += halfSize;
		}

		if(startCellIndex === 0 && endCellIndex === 8) {
			//	*
			//	 *
			//	  *
			startCellCenterX -= halfSize;
			startCellCenterY -= halfSize;
			endCellCenterX += halfSize;
			endCellCenterY += halfSize;
		}

		if(startCellIndex === 2 && endCellIndex === 6) {
			//	  *
			//	 *
			//	*
			startCellCenterX += halfSize;
			startCellCenterY -= halfSize;
			endCellCenterX -= halfSize;
			endCellCenterY += halfSize;
		}


		ctx.beginPath();
		ctx.moveTo(startCellCenterX, startCellCenterY);
		ctx.lineTo(endCellCenterX, endCellCenterY);
		ctx.lineWidth = gameOverLineHeight;
		ctx.strokeStyle = gameOverLineColor;
		ctx.stroke();
	}

	_drawKeyboard() {
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = gridColor;
		ctx.fillRect(leftX, 0, lineHeight, height);
		ctx.fillRect(rightX, 0, lineHeight, height);
		ctx.fillRect(0, topY, width, lineHeight);
		ctx.fillRect(0, bottomY, width, lineHeight);

		ctx.font = fontStyle;
		ctx.fillStyle = fontColor;

		for (let i = 0; i < cellLabels.length; i++) {
			let x = i % 3;
			let y = parseInt(i / 3);
			let labelX = (cellWidth * x) + (cellWidth / 2) - (fontSize / 2);
			let labelY = fontTopMargin + (cellHeight * y) + (cellHeight / 2) - (fontSize / 2) + 5;
			ctx.fillText(cellLabels[i], labelX, labelY);
		}

	}


	_drawNull(x, y) {
		ctx.beginPath();
		ctx.arc(x, y, symbolSize / 2, 0, 2 * Math.PI);
		ctx.lineWidth = symbolLineHeight;
		ctx.strokeStyle = nullColor;
		ctx.stroke();
	}


	_drawCross(left, top, right, bottom ) {
		ctx.beginPath();
		ctx.moveTo(left, top);
		ctx.lineTo(right, bottom);
		ctx.moveTo(right, top);
		ctx.lineTo(left, bottom);
		ctx.lineWidth = symbolLineHeight;
		ctx.strokeStyle = crossColor;
		ctx.stroke();
	}


	_drawTurn(cellNum, symbolCode) {
		let halfSize = Math.round(symbolSize / 2);
		let x = cellNum % 3;
		let y = parseInt(cellNum / 3);
		let cellCenterX = (cellWidth * x) + (cellWidth / 2);
		let cellCenterY = (cellHeight * y) + (cellHeight / 2);
		let left = cellCenterX - halfSize;
		let top = cellCenterY - halfSize;
		let right = cellCenterX + halfSize;
		let bottom = cellCenterY + halfSize;

		//ctx.clearRect(left, top, symbolSize, symbolSize);
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(left, top, symbolSize, symbolSize);

		if(symbolCode === "x") {
			this._drawCross(left, top, right, bottom);
		} else {
			this._drawNull(cellCenterX, cellCenterY);
		}

	}

	_saveFile(fileName, onComplete) {
		var out = fs.createWriteStream(fileName);
		var stream = canvas.jpegStream({quality: 85});

		stream.on('data', (chunk) => {
			out.write(chunk);
		});

		stream.on("end", () => {
			var readStream = fs.createReadStream(fileName);
			readStream.resume();
			readStream.on('end', () => {
				readStream.close();
				onComplete(fs.createReadStream(fileName));
			});
		});
	}
};