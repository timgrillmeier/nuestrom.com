import { nuestrom } from '../../js/nuestrom.js'
import { seed, simplex2 } from './perlin.js'
import { terrainSprites } from '../../assets/terrain-sprites/terrain-sprites.js'
import { treeSprites } from '../../assets/tree-sprites/tree-sprites.js'
import { groundSprites } from '../../assets/ground-sprites/ground-sprites.js'

let debugWindowOpen = false

export function processTick() {
	/* APPROACH
	1. Use window width and height to determine the number of tiles from the player position to be processed
	2. Determine if a tile needs to be generated and generate it
	3. Process those entities within the "player area"
	*/

	if (nuestrom.config.debugMode) {
		if (!debugWindowOpen){
			debugWindowOpen = true
		}

		debugmode()
	}

	// Get bounding x, y
	let currentTileDisplaySizeInPixels = nuestrom.config.tilePixelBase * nuestrom.config.tileScale
	let activeTilesFromOrigin =  {
		x: Math.floor(((window.innerWidth / 2) / currentTileDisplaySizeInPixels) * nuestrom.config.activeTileMultiplier) + nuestrom.config.activeTileSlack,
		y: Math.floor(((window.innerHeight / 2) / currentTileDisplaySizeInPixels) * nuestrom.config.activeTileMultiplier) + nuestrom.config.activeTileSlack
	}

	let processingCoordBounds = {
		xLower: Math.floor(nuestrom.player.coords.x - (activeTilesFromOrigin.x * 1)),
		xUpper: Math.floor(nuestrom.player.coords.x + (activeTilesFromOrigin.x * 1)),
		yLower: Math.floor(nuestrom.player.coords.y - (activeTilesFromOrigin.y * 3)),
		yUpper: Math.floor(nuestrom.player.coords.y + (activeTilesFromOrigin.y * 3)),
	}

	// Review tiles in active area
	for (let y = processingCoordBounds.yLower; y <= processingCoordBounds.yUpper; y++) {
		for (let x = processingCoordBounds.xLower; x <= processingCoordBounds.xUpper; x++) {

			let terrainTile = getWorldTerrainTile(x, y)

			if (terrainTile == null) {
				generateAndSetWorldTerrainTile(x, y)
			}
		}
	}

	// Review inputs for player movement
	let commandArr = nuestrom.functional.keyCommands
	nuestrom.functional.keyCommands = []

	for (let i = 0; i < commandArr.length; i++) {
		nuestrom.functional.keyState[commandArr[i][0]] = commandArr[i][1]
	}

	let activeSpeed = nuestrom.config.baseWalkingSpeed
	if (nuestrom.functional.keyState.Shift) {
		activeSpeed = nuestrom.config.baseWalkingSpeed * nuestrom.config.baseRunningModifier
	}

	if (nuestrom.functional.keyState.w && nuestrom.functional.keyState.a) {
		nuestrom.player.coords.y -= activeSpeed * 1.5
		nuestrom.player.coords.x -= activeSpeed * 0.75
	} else if (nuestrom.functional.keyState.w && nuestrom.functional.keyState.a) {
		nuestrom.player.coords.y -= activeSpeed * 1.5
		nuestrom.player.coords.x += activeSpeed * 0.75
	} else if (nuestrom.functional.keyState.w && nuestrom.functional.keyState.d) {
		nuestrom.player.coords.y -= activeSpeed * 1.5
		nuestrom.player.coords.x += activeSpeed * 0.75
	} else if (nuestrom.functional.keyState.s && nuestrom.functional.keyState.a) {
		nuestrom.player.coords.y += activeSpeed * 1.5
		nuestrom.player.coords.x -= activeSpeed * 0.75
	} else if (nuestrom.functional.keyState.s && nuestrom.functional.keyState.d) {
		nuestrom.player.coords.y += activeSpeed * 1.5
		nuestrom.player.coords.x += activeSpeed * 0.75
	} else {
		if (nuestrom.functional.keyState.w) {
			nuestrom.player.coords.y -= (activeSpeed * 2)
		}

		if (nuestrom.functional.keyState.s) {
			nuestrom.player.coords.y += (activeSpeed * 2)
		}

		if (nuestrom.functional.keyState.a) {
			nuestrom.player.coords.x -= activeSpeed
		}

		if (nuestrom.functional.keyState.d) {
			nuestrom.player.coords.x += activeSpeed
		}
	}
}

function debugmode() {
	document.getElementById('debug-console').style.display = 'block'
	let output = ''

	if (nuestrom.functional.currentTileMeta != '') {
		output += 'Tile Meta:<br>'
		output += nuestrom.functional.currentTileMeta + '<br>'
		output += '<br>'
	}

	if (nuestrom.config.dayNightCycle != '') {
		output += 'Time:<br>'
		output += nuestrom.world.time.toFixed(0) + '<br>'
		output += '<br>'
	}

	output += 'Keys:<br>'
	output += 'W: ' + nuestrom.functional.keyState['w'] + '<br>'
	output += 'A: ' + nuestrom.functional.keyState['a'] + '<br>'
	output += 'S: ' + nuestrom.functional.keyState['s'] + '<br>'
	output += 'D: ' + nuestrom.functional.keyState['d'] + '<br>'
	output += 'Shift: ' + nuestrom.functional.keyState['Shift'] + '<br>'

	output += '<br>'
	output += 'Player Coords:<br>'
	output += 'x: ' + nuestrom.player.coords.x.toFixed(4) + '<br>'
	output += 'y: ' + nuestrom.player.coords.y.toFixed(4) + '<br>'

	output += '<br>'
	output += 'Frame Render Time:<br>'
	output += nuestrom.functional.renderFrameTime + 'ms<br>'
	output += (1000 / nuestrom.functional.renderFrameTime).toFixed(0) + 'fps'
	
	document.getElementById('debug-console').innerHTML = output
}

function getWorldTerrainTile(x, y) {
	if (typeof nuestrom.worldTerrain['('+Math.abs(x)+','+Math.abs(y)+')'] != 'undefined') {
		return nuestrom.worldTerrain['('+Math.abs(x)+','+Math.abs(y)+')']
	} else {
		return null
	}
}

function validateTerrainTile(tile) {
	if (typeof tile == 'undefined' || tile == null) {
		return null
	} else {
		return tile
	}
}

function setWorldTerrainTile(x, y, tile) {
	nuestrom.worldTerrain['('+Math.abs(x)+','+Math.abs(y)+')'] = tile
}

function setWorldArtefact(x, y, tile) {
	nuestrom.verticalArtefacts['('+Math.abs(x)+','+Math.abs(y)+')'] = tile
}

function generateAndSetWorldTerrainTile(x, y) {
	let worldTerrainTile = generateWorldTerrainTile(x, y)
	setWorldTerrainTile(x, y, worldTerrainTile)

	let worldArtefact = generateWorldArtefact(x, y)
	setWorldArtefact(x, y, worldArtefact)
}

function generateWorldTerrainTile(x, y) {
	// Add tile
	seed(nuestrom.world.terrainSeed)
	let tile = Math.floor(simplex2(x / nuestrom.config.terrainNoiseScale, y / nuestrom.config.terrainNoiseScale) * terrainSprites.length)

	if (tile < 0) {
		tile = 0
	} else if (tile > terrainSprites.length - 1) {
		tile = terrainSprites.length - 1
	}

	return tile
}

function generateWorldArtefact(x, y) {
	seed(nuestrom.world.treeSeed)
	let verticalArtefact = Math.floor(simplex2(x / 1, y / 0.5) * 4)

	if (verticalArtefact >= 1) {
		verticalArtefact = 0
	} else {
		verticalArtefact = null
	}
	
	return verticalArtefact
}









