// import 'PerlinNoiseGenerator' from 'assets/lib/PerlinNoiseGenerator.js'
import { setCookie, getCookie } from 'assets/lib/cookie.js'

// Canvas init
let canvasElement = document.getElementById('canvas');

let windowDimensions = {}
windowDimensions.width = window.innerWidth
windowDimensions.height = window.innerHeight

canvasElement.style.width = windowDimensions.width + 'px'
canvasElement.style.height = windowDimensions.height + 'px'

canvasElement.setAttribute('width', windowDimensions.width + 'px')
canvasElement.setAttribute('height', windowDimensions.height + 'px')

let seed = '678'
// let png = new PerlinNoiseGenerator()
// png.setSeed(seed)





// World dimensions
let worldLengthX = 20
let worldLengthY = 10
let tileRenderSizeInPixels = 128 // 32, 64, 128, 256, etc.
let tileRenderSlack = 1 // used to expand the tile render sample to prevent render sample cliping
let renderInterval = 30 // time between frames
let inputInterval = 5 // how often input is assessed and values updated
let walkingSpeed = 0.015 // tiles per inputInterval
let runModifier = 1.25
let noiseScale = 12

// World options
let dayNightCycle = true
let dayNightLength = 60 // time in seconds
let dayNightToneProfile = ['rgba(100,100,100,'+dayNightLength+')'] // starts at "0:00am"
let dayNightBrightnessProfile = [] // start at "0:00am"

// Debug options
let paintSlow = false
let tileOutline = false
let tileOutlineOnHover = true
let displayCords = false
let renderAssetSamples = true
debugmode()



// ------------------------------------

let currentTileMeta = ''

// Mouse cords
let mouseCords = {x: 0, y: 0}
document.addEventListener('mousemove', onMouseUpdate, false)
document.addEventListener('mouseenter', onMouseUpdate, false)

function onMouseUpdate(e) {
	mouseCords.x = e.pageX
	mouseCords.y = e.pageY
}


// Input data
let inputData = {
	'w': false,
	'a': false,
	's': false,
	'd': false,
}
let keyState = {w:false,a:false,s:false,d:false,Shift:false,'+':false,'-':false}
let keyCommands = []
let renderFrameTime = 1
let renderFrameInterval = null

window.addEventListener('keyup', (e) => keyCommands.push([e.key,false]));
window.addEventListener('keydown', (e) => keyCommands.push([e.key,true]));

// Determine render sample depth
let renderSampleFromCameraPosOnX = Math.floor((windowDimensions.width / tileRenderSizeInPixels)) + tileRenderSlack
let renderSampleFromCameraPosOnY = Math.floor((windowDimensions.height / tileRenderSizeInPixels) * 2) + (tileRenderSlack * 3)

// Camera pos
let cameraX = Math.floor(worldLengthX / 2)
let cameraY = Math.floor(worldLengthY / 2)

let menuActive = false

// Zoom toggle controls
recentZoomChange = false
recentCameraChange = false

// Input monitoring data
setInterval(() => {
	let commandArr = keyCommands
	keyCommands = []

	for (let i = 0; i < commandArr.length; i++) {
		keyState[commandArr[i][0]] = commandArr[i][1]
	}


	let activeSpeed = walkingSpeed

	if (keyState.Shift) {
		activeSpeed = activeSpeed * runModifier
	}

	if (keyState.Esc && !menuActive) {
		document.getElementById('screen-menu')
		menuActive = true
	}

	if (keyState.Shift && keyState['_'] && !recentZoomChange) {
		recentZoomChange = true
		setTimeout(() => {
			recentZoomChange = false
		},100)
		if (tileRenderSizeInPixels == 128) {
			tileRenderSizeInPixels = 64

			// cameraY -= 0
			// cameraX += 6
			console.log(cameraX)
			console.log(cameraY)
		}
		if (tileRenderSizeInPixels == 256) {
			tileRenderSizeInPixels = 128

			// cameraY += 2
			// cameraX += 3
		} 

		// originX = ((j - worldDataOffsetX) * tileRenderSizeInPixels) - ((i % 2) * (tileRenderSizeInPixels / 2))
		// originY = (i - worldDataOffsetY) * (tileRenderSizeInPixels / 3.6)

		renderSampleFromCameraPosOnX = Math.floor((windowDimensions.width / tileRenderSizeInPixels)) + tileRenderSlack
		renderSampleFromCameraPosOnY = Math.floor((windowDimensions.height / tileRenderSizeInPixels) * 2) + (tileRenderSlack * 3)
	}

	if (keyState.Shift && keyState['+'] && !recentZoomChange) {
		recentZoomChange = true
		setTimeout(() => {
			recentZoomChange = false
		},100)
		if (tileRenderSizeInPixels == 128) {
			tileRenderSizeInPixels = 256

			// cameraY -= 2
			// cameraX -= 3
			// console.log(windowDimensions.height / 256)
			// console.log(windowDimensions.width / 256)
		}
		if (tileRenderSizeInPixels == 64) {
			tileRenderSizeInPixels = 128

			// cameraY += 0
			// cameraX -= 6
		}

		renderSampleFromCameraPosOnX = Math.floor((windowDimensions.width / tileRenderSizeInPixels)) + tileRenderSlack
		renderSampleFromCameraPosOnY = Math.floor((windowDimensions.height / tileRenderSizeInPixels) * 2) + (tileRenderSlack * 3)
	}

	if (keyState.w || keyState.a || keyState.s || keyState.d) {
		// console.log('----')
		// console.log(cameraX)
		// console.log(cameraY)
	}

	if (keyState.w && keyState.a) {
		cameraY -= activeSpeed * 1.5
		cameraX -= activeSpeed * 0.75
	} else if (keyState.w && keyState.a) {
		cameraY -= activeSpeed * 1.5
		cameraX += activeSpeed * 0.75
	} else if (keyState.w && keyState.d) {
		cameraY -= activeSpeed * 1.5
		cameraX += activeSpeed * 0.75
	} else if (keyState.s && keyState.a) {
		cameraY += activeSpeed * 1.5
		cameraX -= activeSpeed * 0.75
	} else if (keyState.s && keyState.d) {
		cameraY += activeSpeed * 1.5
		cameraX += activeSpeed * 0.75
	} else {
		if (keyState.w) {
			cameraY -= (activeSpeed * 2)
		}

		if (keyState.s) {
			cameraY += (activeSpeed * 2)
		}

		if (keyState.a) {
			cameraX -= activeSpeed
		}

		if (keyState.d) {
			cameraX += activeSpeed
		}
	}

	

	

}, inputInterval)


// Debug console
function debugmode() {
	document.getElementById('debug-console').style.display = 'block'
	setInterval(() => {
		let output = ''

		if (currentTileMeta != '') {
			output += 'Tile Meta:<br>'
			output += currentTileMeta + '<br>'
			output += '<br>'
		}

		output += 'Keys:<br>'
		output += 'W: ' + keyState['w'] + '<br>'
		output += 'A: ' + keyState['a'] + '<br>'
		output += 'S: ' + keyState['s'] + '<br>'
		output += 'D: ' + keyState['d'] + '<br>'
		output += 'Shift: ' + keyState['Shift'] + '<br>'

		output += '<br>'
		output += 'Camera Pos:<br>'
		output += 'oPosX: ' + cameraX.toFixed(4) + '<br>'
		output += 'oPosY: ' + cameraY.toFixed(4) + '<br>'

		output += '<br>'
		output += 'Frame Render Time:<br>'
		output += renderFrameTime + 'ms<br>'
		output += (1000 / renderFrameTime).toFixed(0) + 'fps'
		
		document.getElementById('debug-console').innerHTML = output
	},10)
	console.log('Debug mode active.')
}

// Tile assets data
let tileSource = 'assets/tiles/32/'
let tileAppend = '-32-base'
let tileType = 'png'
let tileMap = [
	{s:'grass',d:[32,16]},
	{s:'grass-patchy',d:[32,16]},
	{s:'dirt-patchy',d:[32,16]},
	{s:'dirt',d:[32,16]},
]
let tileArtifacts = [
	{s:'tree-pine-medium',d:[32,64],h: true},
]

let tileGroundArtifacts = [
	{s:'flowers-blue',d:[32,16],h: false},
	{s:'flowers-purple',d:[32,16],h: false},
	{s:'flowers-red',d:[32,16],h: false},
	{s:'flowers-white',d:[32,16],h: false},
	{s:'flowers-yellow',d:[32,16],h: false},
	{s:'puddle',d:[32,16],h: false},
]

// World init
let worldData = []
noise.seed(seed)
let max = 0, min = 4
for (let i = 0; i < worldLengthX; i++) {
	let arr = []
	for (let j = 0; j < worldLengthY; j++) {

		let tile = {base: 0, artifacts: [], groundArtifacts: []}

		// Determine tile base with smooth noise
		tile.base = Math.floor(noise.simplex2(i / noiseScale, j / noiseScale) * tileMap.length)
		if (tile.base < 0){
			tile.base = 0
		}
		if (tile.base > (tileMap.length - 1)) {
			tile.base = tileMap.length - 1
		}

		// Determine artifacts
		if (tile.base <= 1) {
			let artifactChance = 0.05
			if (1 == Math.floor(Math.random() * (1 / artifactChance))) { // chance of 1/artifaceFance tile gets an artifact
				let artifactIndex = Math.floor(Math.random() * tileGroundArtifacts.length - 3)
				if (artifactIndex < 0) {
					artifactIndex = 0
				}
				if (artifactIndex > (tileGroundArtifacts.length - 1)) {
					artifactIndex = tileGroundArtifacts.length - 1
				}
				tile.groundArtifacts.push(artifactIndex)
			}
		}

		if (tile.base == 3) {
			let artifactChance = 0.5
			if (1 == Math.floor(Math.random() * (1 / artifactChance))) { // chance of 1/artifaceFance tile gets an artifact
				tile.groundArtifacts.push(tileGroundArtifacts.length - 1)
			}
		}
		

		arr.push(tile)
	}
	worldData.push(arr)
}

// Add trees
noise.seed('5678')
for (let i = 0; i < worldLengthX; i++) {
	let arr = []
	for (let j = 0; j < worldLengthY; j++) {
		if (worldData[i][j].artifacts.length == 0 && worldData[i][j].groundArtifacts.length == 0) {
			// Note noise scale set to 0.5 screates really nice tile based scattering of trees
			if (Math.floor(noise.simplex2(i / 1, j / 0.5) * 4) >= 1) {
				worldData[i][j].artifacts.push(0)
			}
		}
	}
}




// Render world
let canvasContext = canvasElement.getContext('2d')
canvasContext.imageSmoothingEnabled = false

// Pre-render all assets
tileRenderAssets = []
for (let i = 0; i < tileMap.length; i++) {
	let asset = new Image()
	// image.src = tileMapBase64[i] // using base64 encoded images
	asset.src = tileSource + tileMap[i].s + tileAppend + '.' + tileType

	let assetCanvas = document.createElement('canvas')

	assetCanvas.style.width = tileMap[i].d[0]
	assetCanvas.style.height = tileMap[i].d[1]

	assetCanvas.setAttribute('width', tileMap[i].d[0] + 'px')
	assetCanvas.setAttribute('height', tileMap[i].d[1] + 'px')

	let assetCanvasContext = assetCanvas.getContext('2d')
	assetCanvasContext.imageSmoothingEnabled = false

	asset.onload = () => {
		assetCanvasContext.drawImage(asset, 0, 0, tileMap[i].d[0], tileMap[i].d[1])
	}
	


	tileRenderAssets.push(assetCanvas)
	document.body.appendChild(tileRenderAssets[i])
}

// Pre-render all assets
artifactRenderAssets = []
for (let i = 0; i < tileArtifacts.length; i++) {
	let asset = new Image()
	// image.src = tileMapBase64[i] // using base64 encoded images
	asset.src = tileSource + tileArtifacts[i].s + tileAppend + '.' + tileType

	let assetCanvas = document.createElement('canvas')

	assetCanvas.style.width = tileArtifacts[i].d[0]
	assetCanvas.style.height = tileArtifacts[i].d[1]

	assetCanvas.setAttribute('width', tileArtifacts[i].d[0] + 'px')
	assetCanvas.setAttribute('height', tileArtifacts[i].d[1] + 'px')

	let assetCanvasContext = assetCanvas.getContext('2d')
	assetCanvasContext.imageSmoothingEnabled = false

	asset.onload = () => {
		assetCanvasContext.drawImage(asset, 0, 0, tileArtifacts[i].d[0], tileArtifacts[i].d[1])
	}
	


	artifactRenderAssets.push(assetCanvas)
	if (renderAssetSamples) {
		document.body.appendChild(artifactRenderAssets[i])
	}
}

artifactRenderGroundAssets = []
for (let i = 0; i < tileGroundArtifacts.length; i++) {
	let asset = new Image()
	// image.src = tileMapBase64[i] // using base64 encoded images
	asset.src = tileSource + tileGroundArtifacts[i].s + tileAppend + '.' + tileType

	let assetCanvas = document.createElement('canvas')

	assetCanvas.style.width = tileGroundArtifacts[i].d[0]
	assetCanvas.style.height = tileGroundArtifacts[i].d[1]

	assetCanvas.setAttribute('width', tileGroundArtifacts[i].d[0] + 'px')
	assetCanvas.setAttribute('height', tileGroundArtifacts[i].d[1] + 'px')

	let assetCanvasContext = assetCanvas.getContext('2d')
	assetCanvasContext.imageSmoothingEnabled = false

	asset.onload = () => {
		assetCanvasContext.drawImage(asset, 0, 0, tileGroundArtifacts[i].d[0], tileGroundArtifacts[i].d[1])
	}
	


	artifactRenderGroundAssets.push(assetCanvas)
	if (renderAssetSamples) {
		document.body.appendChild(artifactRenderGroundAssets[i])
	}
}

let outlineRenderAsset = null
if (tileOutline) {
	let asset = new Image()
	asset.src = tileSource + 'outline-white' + tileAppend + '.' + tileType

	let assetCanvas = document.createElement('canvas')

	assetCanvas.style.width = 32
	assetCanvas.style.height = 16

	assetCanvas.setAttribute('width', 32 + 'px')
	assetCanvas.setAttribute('height', 16 + 'px')

	let assetCanvasContext = assetCanvas.getContext('2d')
	assetCanvasContext.imageSmoothingEnabled = false

	asset.onload = () => {
		assetCanvasContext.drawImage(asset, 0, 0, 32, 16)
	}

	outlineRenderAsset = assetCanvas
	if (renderAssetSamples) {
		document.body.appendChild(assetCanvas)
	}
}

let fullOutlineRenderAsset = null
if (tileOutlineOnHover) {
	let asset = new Image()
	asset.src = tileSource + 'outline-white-full' + tileAppend + '.' + tileType

	let assetCanvas = document.createElement('canvas')

	assetCanvas.style.width = 32
	assetCanvas.style.height = 16

	assetCanvas.setAttribute('width', 32 + 'px')
	assetCanvas.setAttribute('height', 16 + 'px')

	let assetCanvasContext = assetCanvas.getContext('2d')
	assetCanvasContext.imageSmoothingEnabled = false

	asset.onload = () => {
		assetCanvasContext.drawImage(asset, 0, 0, 32, 16)
	}

	fullOutlineRenderAsset = assetCanvas
	if (renderAssetSamples) {
		document.body.appendChild(assetCanvas)
	}
}


let charAsset = new Image()
charAsset.src = tileSource + 'char-2' + tileAppend + '.' + tileType

let charAssetCanvas = document.createElement('canvas')

charAssetCanvas.style.width = 32
charAssetCanvas.style.height = 32

charAssetCanvas.setAttribute('width', 32 + 'px')
charAssetCanvas.setAttribute('height', 32 + 'px')

let assetCanvasContext = charAssetCanvas.getContext('2d')
assetCanvasContext.imageSmoothingEnabled = false

charAsset.onload = () => {
	assetCanvasContext.drawImage(charAsset, 0, 0, 32, 32)
}

if (renderAssetSamples) {
	document.body.appendChild(charAssetCanvas)
}


// Process day/night cycle
if (dayNightCycle) {
	dayNightInterval = setInterval(() => {
		requestAnimationFrame(applyLightingMasks)
	}, dayNightLength * 1000)
}

function applyLightingMasks() {

}



// Start animation
if (paintSlow) {
	setTimeout(() => {
		requestAnimationFrame(renderFrame)
	},100)
} else {
	renderFrameInterval = setInterval(() => {
		requestAnimationFrame(renderFrame)
	},renderInterval)
	requestAnimationFrame(renderFrame)
}

// renderFrame()

function paintTileWithTimeout(delay, ctx, asset, x, y, xoffset, yoffset) {
	setTimeout(() => {
		ctx.drawImage(asset, x, y, xoffset, yoffset)
	},delay)
}

// Game data variables
player = {}
mobs = []
grondArtifacts = []
verticalArtifacts = []
worldAmendments = []
worldTerrain = []

// initPlayerCoords


function renderFrame() {
	/* APPROACH
	1. Get x, y, z coords of player
	2. Calculate worlddata subset for rendering
		2.1 Review screensize and current display scaling (i.e. zoom)
		2.2 Calculate the furthest x, y coords away from the player coords
		2.3 Using the furthest x, y coords define the subset of world data to render
	3. Using the furthest x, y coords, loop through the world data in the following order
		3.1 Ground level rendering
			3.1.1 Loop through world ground tiles row-by-row
			3.1.2 Loop through sprites on only ground level row-by-row
		3.2 Loop through sprites with verticality row-by-row
			3.2.1 Render trees, rocks, plants, etc.
			3.2.2 Render entities (inc. the player)
			3.2.3 Render buildings (walls, roofs, doors, windows, etc.)
			3.2.4 Render virtual assets (e.g. anything that's about to be placed like buildings, crates, items, etc.)
	4. Fetch all rendered assets through a function which applies lighting affects
		4.1 Take the coords of light sources and the coords of the asset in the world
		4.2 Use these coords to apply a gradient over this sprite factoring in the day night tones, the biome tones, and the weather tones
		4.3 Apply the lighting affects straight to the canvas
	*/
}


function renderFramev1() {
	// let grass = new Image(tileRenderSizeInPixels, tileRenderSizeInPixels)
	// grass.src = tileSource + tileMap[0] + '.' + tileType
	// grass.src = tileMapBase64[0]
	// canvasContext.drawImage(grass, 0, 0, tileRenderSizeInPixels, tileRenderSizeInPixels)
	canvasContext.clearRect(0, 0, windowDimensions.width, windowDimensions.height)

	let worldDataOffsetX = cameraX - renderSampleFromCameraPosOnX + (tileRenderSlack * 2)
	let worldDataOffsetY = cameraY - renderSampleFromCameraPosOnY + (tileRenderSlack * 2)
	let timeStartEpoch = new Date()
	let timeStart = timeStartEpoch.getTime()

	let tileMetaAlreadyProvided = false

	let charDrawn = false

	let charDimensions = [32,32]
	let count = 0


	// RENDER TILES AND GROUND DETAILS
	for (let i = Math.floor(cameraY - renderSampleFromCameraPosOnY); i < cameraY + renderSampleFromCameraPosOnY; i++) {
		
		let originX = 0, originY = 0

		for (let j = Math.floor(cameraX - renderSampleFromCameraPosOnX); j < cameraX + renderSampleFromCameraPosOnX; j++) {

			try {
				if (i >=0 && i < worldData.length) {
					if (j >=0 && j < worldData[i].length) {
						
						let assetCanvas = tileRenderAssets[worldData[i][j].base]
						// console.log(assetCanvas)
						originX = ((j - worldDataOffsetX) * tileRenderSizeInPixels) - ((i % 2) * (tileRenderSizeInPixels / 2))
						originY = (i - worldDataOffsetY) * tileRenderSizeInPixels / 3.6 // (tileRenderSizeInPixels / 3.6)
						
						if (paintSlow) {
							paintTileWithTimeout(count, canvasContext, assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileMap[worldData[i][j].base].d[1])), tileRenderSizeInPixels, tileRenderSizeInPixels/2)
							count += 5
						} else {
							canvasContext.drawImage(assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileMap[worldData[i][j].base].d[1])), tileRenderSizeInPixels, tileRenderSizeInPixels/2)
						}


						for (let k = 0; k < worldData[i][j].groundArtifacts.length; k++) {
							assetCanvas = artifactRenderGroundAssets[worldData[i][j].groundArtifacts[k]]

							if (paintSlow) {
								paintTileWithTimeout(count, canvasContext, assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileGroundArtifacts[worldData[i][j].groundArtifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileGroundArtifacts[worldData[i][j].groundArtifacts[k]].d[1])
								count += countIncrement
							} else {
								// console.log(assetCanvas)
								canvasContext.drawImage(assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileGroundArtifacts[worldData[i][j].groundArtifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileGroundArtifacts[worldData[i][j].groundArtifacts[k]].d[1])
							}
						}
					

						// Draw outline over TILE only
						if (tileOutline) {
							assetCanvas = outlineRenderAsset
							canvasContext.drawImage(assetCanvas, originX, (originY - (tileRenderSizeInPixels / 32) * 16), tileRenderSizeInPixels, tileRenderSizeInPixels/2)
						}

						let tileAsPolygon = [
							[originX,originY - (tileRenderSizeInPixels / 4)],
							[originX + (tileRenderSizeInPixels / 2),originY],
							[originX + (tileRenderSizeInPixels),originY - (tileRenderSizeInPixels / 4)],
							[originX + (tileRenderSizeInPixels / 2),originY - (tileRenderSizeInPixels / 2)],
						]


						// Paint hover of tile on x,y cords based on mouse position
						if (
							tileOutlineOnHover
							&& !tileMetaAlreadyProvided
							&& inside([mouseCords.x, mouseCords.y], tileAsPolygon)
							) {
							tileMetaAlreadyProvided = true
							currentTileMeta = '[x:'+j+',y:'+i+']:'+tileMap[worldData[i][j].base].s
							assetCanvas = fullOutlineRenderAsset
							canvasContext.drawImage(assetCanvas, originX, (originY - (tileRenderSizeInPixels / 32) * 16), tileRenderSizeInPixels, tileRenderSizeInPixels/2)
						}

						if (displayCords) {
							canvasContext.fillStyle = 'black'
							canvasContext.font = "10px sans-serif"
							canvasContext.fontStyle = "bold"
							canvasContext.fillText('[x:'+j+',y:'+i+']: '+tileMap[worldData[i][j].base].s,(originX + 4), (originY + 5), tileRenderSizeInPixels - 5)
							canvasContext.fillStyle = 'red'
							canvasContext.fillRect((originX), (originY), 4, 4)
						}
						
					}
				}
			}
			catch(e) { 
				// Catch error and log to console
				console.warn(e)
				clearInterval(renderFrameInterval)
				renderFrameInterval = null
			}
		}

	}

	// RENDER ASSETS AND PLAYER
	count = 0
	countIncrement = 17
	for (let i = Math.floor(cameraY - renderSampleFromCameraPosOnY); i < cameraY + renderSampleFromCameraPosOnY; i++) {
		
		let originX = 0, originY = 0

		for (let j = Math.floor(cameraX - renderSampleFromCameraPosOnX); j < cameraX + renderSampleFromCameraPosOnX; j++) {
			
			try {
				if (i >=0 && i < worldData.length) {

					if (j >=0 && j < worldData[i].length) {

						// let assetCanvas = tileRenderAssets[worldData[i][j].base]
						originX = ((j - worldDataOffsetX) * tileRenderSizeInPixels) - ((i % 2) * (tileRenderSizeInPixels / 2))
						originY = (i - worldDataOffsetY) * (tileRenderSizeInPixels / 3.6)

						canvasContext.globalAlpha = 1
						
						// Add tile artifacts BEHIND char
						if (worldData[i][j].artifacts.length > 0 && originY < (windowDimensions.height / 2) + (charDimensions[1] / 2) + 38) {
							
							for (let k = 0; k < worldData[i][j].artifacts.length; k++) {
								assetCanvas = artifactRenderAssets[worldData[i][j].artifacts[k]]
								if (paintSlow) {
									paintTileWithTimeout(count, canvasContext, assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])
									count += countIncrement
								} else {
									canvasContext.drawImage(assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])
								}
							}
						}
					}
				}
			}
			catch(e) {
				console.warn(e)
				clearInterval(renderFrameInterval)
				renderFrameInterval = null
			}
		}


		// Add character
		if (charDrawn == false && originY >= (windowDimensions.height / 2) + (charDimensions[1] / 2)) {
			charDrawn = true // mark as drawn
			canvasContext.fillStyle = 'darkred'
			if (paintSlow) {
				paintTileWithTimeout(count, canvasContext, charAssetCanvas, ((tileRenderSizeInPixels / 32) * (windowDimensions.width / 2) - (charDimensions[0] / 2)),((tileRenderSizeInPixels / 32) * (windowDimensions.height / 2) - (charDimensions[1] / 2)),((tileRenderSizeInPixels / 32) * charDimensions[0]),((tileRenderSizeInPixels / 32) * charDimensions[1]))

				setTimeout(() => {
					// canvasContext.fillRect((windowDimensions.width / 2) - (charDimensions[0] / 2),(windowDimensions.height / 2) - (charDimensions[1] / 2),charDimensions[0],charDimensions[1])
				}, count)
				count += countIncrement
			} else {
				// canvasContext.fillRect((windowDimensions.width / 2) - (charDimensions[0] / 2),(windowDimensions.height / 2) - (charDimensions[1] / 2),charDimensions[0],charDimensions[1])
				canvasContext.drawImage(charAssetCanvas,
					(windowDimensions.width / 2) - ((tileRenderSizeInPixels / 32) * (charDimensions[0] / 2)),
					(windowDimensions.height / 2) - ((tileRenderSizeInPixels / 32) * (charDimensions[1] / 2)),
					((tileRenderSizeInPixels / 32) * charDimensions[0]),
					((tileRenderSizeInPixels / 32) * charDimensions[1])
				)

				canvasContext.drawImage(charAssetCanvas, ((tileRenderSizeInPixels / 32) * (windowDimensions.width / 2) - (charDimensions[0] / 2)),((tileRenderSizeInPixels / 32) * (windowDimensions.height / 2) - (charDimensions[1] / 2)),((tileRenderSizeInPixels / 32) * charDimensions[0]),((tileRenderSizeInPixels / 32) * charDimensions[1]))
			}
		}


		for (let j = Math.floor(cameraX - renderSampleFromCameraPosOnX); j < cameraX + renderSampleFromCameraPosOnX; j++) {
			
			try {
				if (i >=0 && i < worldData.length) {

					if (j >=0 && j < worldData[i].length) {

						// let assetCanvas = tileRenderAssets[worldData[i][j].base]
						originX = ((j - worldDataOffsetX) * tileRenderSizeInPixels) - ((i % 2) * (tileRenderSizeInPixels / 2))
						originY = (i - worldDataOffsetY) * (tileRenderSizeInPixels / 3.6)
						
						// canvasContext.globalAlpha = 0.8
						// canvasContext.globalCompositeOperation = "source-over"

						// Add tile artifacts IN FRONT OF char
						if (worldData[i][j].artifacts.length > 0 && originY >= (windowDimensions.height / 2) + (charDimensions[1] / 2) + 38) {
							for (let k = 0; k < worldData[i][j].artifacts.length; k++) {
								assetCanvas = artifactRenderAssets[worldData[i][j].artifacts[k]]
								if (paintSlow) {
									paintTileWithTimeout(count, canvasContext, assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])
									count += countIncrement
								} else {
									canvasContext.drawImage(assetCanvas, originX, (originY - ((tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])
								}

								canvasContext.fillStyle = "rgba(255,0,0,0.5)";
								canvasContext.fillRect(originX, (originY - ((tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1])), tileRenderSizeInPixels, (tileRenderSizeInPixels / 32) * tileArtifacts[worldData[i][j].artifacts[k]].d[1]);
							}
						}



					}
				}
			}
			catch(e) {
				console.warn(e)
				clearInterval(renderFrameInterval)
				renderFrameInterval = null
			}
		}

	}



	// BENCHMARKING
	let timeEndEpoch = new Date()
	let timeEnd = timeEndEpoch.getTime()

	renderFrameTime = timeEnd - timeStart
	// console.log(charDrawCount)
	
	// requestAnimationFrame(renderFrame)
}

function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};
