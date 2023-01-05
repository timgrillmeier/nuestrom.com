import { setCookie, getCookie } from './modules/cookie.js'
import { processTick } from './modules/game-engine.js'
import { processAnimationFrames } from './modules/animation-engine.js'
import { preRender, renderFrame } from './modules/render-engine.js'

// Init basic game data
export const nuestrom = {
	player: {},
	world: {},
	mobs: [],
	groundArtifacts: [],
	verticalArtefacts: {},
	worldAmendments: {},
	worldTerrain: {},
	config: {
		debugMode: true,
		singleRun: false,
		slowRender: false,
		renderAssetSamples: false,
		staggeredRender: true,
		terrainNoiseScale: 12,
		tileScale: 4,
		tilePixelBase: 32,
		engineInterval: null, 
		engineIntervalLength: 50, 
		animationInterval: null,
		animationIntervalLength: 50,
		renderInterval: null,
		renderIntervalLength: 50,
		activeTileMultiplier: 2,
		activeTileSlack: 0,
		renderTileMultiplier: 1,
		renderTileSlack: 0,
		baseWalkingSpeed: 0.115,
		baseRunningModifier: 1.25,
		dayNightCycle: true,
		dayNightLength: 60, // time in seconds
		dayNightActiveProfile: '',
		dayNightToneProfiles: [
			{time: 530, profile: 'rgba(5,6,55,0.8)'},
			{time: 550, profile: 'rgba(18,15,89,0.6)'},
			{time: 610, profile: 'rgba(88,68,155,0.5)'},
			{time: 630, profile: 'rgba(154,102,180,0.4)'},
			{time: 650, profile: 'rgba(222,148,178,0.3)'},
			{time: 720, profile: 'rgba(253,198,174,0.2)'},
			{time: 740, profile: 'rgba(255,255,255,0.0)'},
			{time: 1730, profile: 'rgba(244,243,190,0.1)'},
			{time: 1750, profile: 'rgba(247,205,144,0.2)'},
			{time: 1800, profile: 'rgba(230,88,78,0.3)'},
			{time: 1810, profile: 'rgba(151,30,103,0.4)'},
			{time: 1820, profile: 'rgba(65,19,120,0.5)'},
			{time: 1830, profile: 'rgba(27,18,116,0.6)'},
			{time: 1840, profile: 'rgba(5,6,55,0.8)'},
			{time: 1900, profile: 'rgba(3,3,34,0.8)'},
		], // starts at "0:00am"
		dayNightBrightnessProfile: [], // start at "0:00am"
	},
	functional: {
		keyState: {w:false,a:false,s:false,d:false,Shift:false,'+':false,'-':false},
		keyCommands: [],
		currentTileMeta: '',
		renderFrameTime: 0,
	}
}



// Input monitoring data
/*
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
		}
		if (tileRenderSizeInPixels == 256) {
			tileRenderSizeInPixels = 128
		}
	}

	if (keyState.Shift && keyState['+'] && !recentZoomChange) {
		recentZoomChange = true
		setTimeout(() => {
			recentZoomChange = false
		},100)
		if (tileRenderSizeInPixels == 128) {
			tileRenderSizeInPixels = 256
		}
		if (tileRenderSizeInPixels == 64) {
			tileRenderSizeInPixels = 128
		}

		renderSampleFromCameraPosOnX = Math.floor((windowDimensions.width / tileRenderSizeInPixels)) + tileRenderSlack
		renderSampleFromCameraPosOnY = Math.floor((windowDimensions.height / tileRenderSizeInPixels) * 2) + (tileRenderSlack * 3)
	}

	if (keyState.w || keyState.a || keyState.s || keyState.d) {
		// console.log('----')
		// console.log(cameraX)
		// console.log(cameraY)
	}
*/


export default function main() {
	if (nuestrom.config.debugMode) {
		console.log('Starting up Nuestrom...')
	}

	initWorld()
}

function initWorld() {
	// Init canvas object
	nuestrom.functional.canvasElement = initCanvas()
	nuestrom.functional.canvasContext = nuestrom.functional.canvasElement.getContext('2d')
	nuestrom.functional.canvasContext.imageSmoothingEnabled = false

	// Get cookie data, if set
	let savedData = getCookieData()

	// Pre-render Assets
	preRender()

	// Initialise the world, player, mob, and other data
	initNuestromData(savedData)

	initRoutines()

	initEvents()

	// setInterval(() => {
	// 	console.log(nuestrom.player.coords)
	// },500)
}

function initEvents() {
	window.addEventListener('keyup', (e) => {
		nuestrom.functional.keyCommands.push([e.key,false])
		saveWorldData()
	})
	window.addEventListener('keydown', (e) => {
		nuestrom.functional.keyCommands.push([e.key,true])
		saveWorldData()
	})
}

function initCanvas() {
	if (nuestrom.config.debugMode) {
		console.log('Initialising Canvas...')
	}

	// Get canvas element in DOM
	let canvasElement = document.getElementById('canvas');

	// Make canvas window width and height
	canvasElement.style.width = window.innerWidth + 'px'
	canvasElement.style.height = window.innerHeight + 'px'
	canvasElement.setAttribute('width', window.innerWidth + 'px')
	canvasElement.setAttribute('height', window.innerHeight + 'px')

	return canvasElement
}

function getCookieData() {
	if (nuestrom.config.debugMode) {
		console.log('Looking for saved data...')
	}

	let cookieData = {}
	let playerData = getCookie('player-data')
	let worldData = getCookie('world-data')
	let mobData = getCookie('mob-data')
	let amendmentData = getCookie('world-data')

	if (nuestrom.config.debugMode) {
		if (playerData != '' || worldData != '' || mobData != '' || amendmentData != '') {
			console.log('Saved data found!') 
		} else {
			console.log('No data found!') 
		}
	}

	if (playerData != '') {
		cookieData.playerData = JSON.parse(playerData)
	} else {
		cookieData.playerData = null
	}

	if (worldData != '') {
		cookieData.worldData = JSON.parse(worldData)
	} else {
		cookieData.worldData = null
	}

	if (mobData != '') {
		cookieData.mobData = JSON.parse(mobData)
	} else {
		cookieData.mobData = null
	}

	if (amendmentData != '') {
		cookieData.amendmentData = JSON.parse(amendmentData)
	} else {
		cookieData.amendmentData = null
	}

	return cookieData
}

function initNuestromData(savedData) {
	let saveNeeded = false

	if (savedData.playerData != null) {
		nuestrom.player = savedData.playerData
	} else {
		initPlayerData()
		saveNeeded = true
	}

	if (savedData.worldData != null) {
		nuestrom.world = savedData.worldData
	} else {
		initWorldData()
		saveNeeded = true
	}

	if (savedData.mobData != null) {
		nuestrom.mobs = savedData.mobData
	} else {
		// There is no initialisation of mobs if not saved
	}

	if (savedData.amendmentData != null) {
		nuestrom.worldAmendments = savedData.amendmentData
	} else {
		// There is no initialisation of world amendments if not saved
	}

	if (saveNeeded) {
		saveWorldData()
	}
}

// Updates nuestrom.player object with default data
function initPlayerData() {
	nuestrom.player = {
		coords: {x: 1000, y: 1000, z: 0},
		inventory: [],
		health: 40, 
	}
}

// Generates seeds for various attributes
// Updates the nuestrom.world object with default data
function initWorldData() {
	let terrainSeed = Math.floor(Math.random() * 1000) // generates number between 1 and 1000 an saves as terrain seed
	let treeSeed = Math.floor(Math.random() * 1000) // generates number between 1 and 1000 an saves as terrain seed

	nuestrom.world = {
		terrainSeed: terrainSeed,
		treeSeed: treeSeed,
		time: 600,
		weather: 'clear', // clear, overcast, rain, fog, stormy
		temperature: 15, // degrees Celcius
	}
}

// Saves all data 
function saveWorldData() {
	// TODO get player, world, mob, and amendments, convert to JSON, and save as cookies

	let playerDataJSON = JSON.stringify(nuestrom.player)
	setCookie('player-data', playerDataJSON, 1)

	let worldDataJSON = JSON.stringify(nuestrom.world)
	setCookie('world-data', worldDataJSON, 1)

}

function initRoutines() {
	// Start processing the game
	if (nuestrom.config.debugMode) {
		console.log('Game engine started.')
	}
	if (nuestrom.config.singleRun) {
		processTick()
	} else {
		nuestrom.config.engineInterval = setInterval(() => {
			processTick()
		},nuestrom.config.engineIntervalLength)
	}

	// Start processing the animations
	if (nuestrom.config.debugMode) {
		console.log('Animations started.')
	}
	if (nuestrom.config.singleRun) {
		processAnimationFrames()
	} else {
		nuestrom.config.animationInterval = setInterval(() => {
			processAnimationFrames()
		},nuestrom.config.animationIntervalLength)
	}

	// Start rendering the game
	if (nuestrom.config.debugMode) {
		console.log('Render engine started.')
	}
	if (nuestrom.config.slowRender || nuestrom.config.singleRun) {
		setTimeout(() => {
			renderFrame()
		},150)
	} else {
		if (nuestrom.config.staggeredRender) {
			nuestrom.config.renderInterval = setInterval(() => {
				requestAnimationFrame(renderFrame)
			},nuestrom.config.renderIntervalLength)
		} else {
			renderFrame(nuestrom.config.staggeredRender)
		}
	}
}








