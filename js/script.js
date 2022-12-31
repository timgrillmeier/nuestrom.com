// import 'PerlinNoiseGenerator' from 'assets/lib/PerlinNoiseGenerator.js'

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
let worldLengthX = 500
let worldLengthY = 500
let tileRenderSizeInPixels = 50
let tileRenderSlack = 1 // used to expand the tile render sample to prevent render sample cliping
let renderInterval = 30 // time between frames
let inputInterval = 5 // how often input is assessed and values updated
let walkingSpeed = 0.1 // tiles per inputInterval
let runModifier = 1.5
let noiseScale = 12

debugmode()



// ------------------------------------

// Input data
let inputData = {
	'w': false,
	'a': false,
	's': false,
	'd': false,
}
let keyState = {w:false,a:false,s:false,d:false,Shift:false}
let keyCommands = []
let renderFrameTime = 1
let renderFrameInterval = null

window.addEventListener('keyup', (e) => keyCommands.push([e.key,false]));
window.addEventListener('keydown', (e) => keyCommands.push([e.key,true]));

// Camera pos
let cameraX = Math.floor(worldLengthX / 2)
let cameraY = Math.floor(worldLengthY / 2)

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

	if (keyState.w && keyState.a) {
		cameraY -= activeSpeed * 1.5
		cameraX -= activeSpeed * 0.75
	} else if (keyState.w && keyState.d) {
		cameraY -= activeSpeed * 1.5
		cameraX += activeSpeed * 0.75
	} else if (keyState.s && keyState.a) {
		cameraY += activeSpeed * 1.5
		cameraX -= activeSpeed * 0.75
	} else if (keyState.s && keyState.a) {
		cameraY += activeSpeed * 1.5
		cameraX -= activeSpeed * 0.75
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



function debugmode() {
	document.getElementById('debug-console').style.display = 'block'
	setInterval(() => {
		let output = ''
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
		// output += renderFrameTime + 'ms'
		output += (1000 / renderFrameTime).toFixed(0) + 'fps'
		
		document.getElementById('debug-console').innerHTML = output
	},10)
	console.log('Debug mode active.')
}

// Tile data
let tileSource = 'assets/tiles/'
let tileType = 'png'
let tileMap = [
	'grass',
	'grass-patchy',
	'dirt-patchy',
	'dirt',
]

tileMapBase64 = [
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAAPBJREFUSEvtlLENwjAUROMBaGAIZqBmB1oWYBwWoGUH6szAENAwQNC3dNJxfNvfTYRQUsWx89+/O9tpmOFJMzCGBdLl8u/ZdRhP02P9yipu20u4wdDC/f04bZ6rAQCD2Nie6+7crFFdYMXZfIAAYGhNmQvRzr2ipeQ92AeEPYcl3K2qsrHNewoZliElW9h7LuZZiG+cnb1bZom7V1s0bFanxdAE1DE0K/Fs0sUtQGmDZCU8yYFrpwzlDNRGzH1lojtFlZX89kL3zk31nERtbN0AzdPqZcb5RK6XEAR2cWaR4vivC9J1v9PiBdLl3P/Y9QbiCbeiunOdfQAAAABJRU5ErkJggg==',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAAQRJREFUSEtjZKADYKSDHQyjlpAUyoMvuDbUOf6fHC0H9sVe9YVEO5Aohc434//nLn3EALMAZAmIDwIBTfsJmoFXAchw5MCHWQSzANlSfD7Dagm6y4Xf8TJEbb+K4hNcMY/NMhRLkMMcFiTIrkX3FYgPksfmQ2TLwJbgChaQHLIv0OMFm0OQ1YDYoDhjRHY9eljjMxTdMJCPsAUrSB3YJ9iCCRYUuCIeFoyEHAL2CbIhyBGO7lJkS2FyIJe/FfoMjxPk4MOIE/SUgu4zmDy2IEKPdGz5Bm8+ITYYCZUABHMrtjjDFSy48g5RlsA0I8cZ1csuksp1LIpJ8gm5lo1aQlLI0SW4APB4uIhRMNgaAAAAAElFTkSuQmCC',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAAR9JREFUSEtjZKADYKSDHQyjlpAUyoMvuJxvxv/PXfoI7IuApv1EO5AohRvqHP9PjpZjgFkAsgTEB4G96gsJmoFXAchw5MCHWQSzANlSfD7Dagm6y5d5ajO8FfqM4hNkyz9L+TLwPtuMMxhRLEEOc1iQILsWZjDMJyA+SB6bD5F9BrYEV7CA5JB9gR4v2BwCU2OWMpMh9nsrOM4YYa6/zuHCsCf4FtixMNfjimxcrscWrCAzwD7BFkzIloFcdWpOOkqw4HIIsu9AFoB9ghyBsAiHiSEbhM2HMJejy6EnbaypC91nyBGO7gP0SMeWb/DmE0LBiBwKJOcT9NIPm89gPiCmeCFYJGCLM1CQEWM4TC9JlpBUviMpHrWEpJAbPsEFALT5wZQWlF2SAAAAAElFTkSuQmCC',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAANdJREFUSEtjZKADYKSDHQyjlpAUyoMvuDbUOf6HeSGgaT/RDiRKIbLh6OFEjGV4LUE33CF5OsOBuZlY4wOfZVgtQTd8mac2Q9T2q0RFNjbLUCxBN/wOtxuDytddGIZPjpZjyF36CEUcXS2yZWBL0A1HNoQUX2DzKsgyRnyRiq4Jmw+IcRDcJ7iChqiIwKMI7BNkeZiv0F2MywGgoHwr9BkjfkD696ovhJuNN3XhS7K4HE8wdaFrxBdf+FITujkDn+Px+YyY4gSmnyifUJrCRi0hKQSHT3ABADqYZYicNgQqAAAAAElFTkSuQmCC',
]

// World init
let worldData = []
noise.seed(seed)
let max = 0, min = 4
for (let i = 0; i < worldLengthX; i++) {
	let arr = []
	for (let j = 0; j < worldLengthY; j++) {

		let tile = Math.floor(noise.simplex2(i / noiseScale, j / noiseScale) * tileMapBase64.length)
		// let tile = Math.floor(Math.random() * tileMap.length)
		if (tile < 0){
			tile = 0
		}
		if (tile > 3){
			tile = 3
		}

		arr.push(tile)
	}
	worldData.push(arr)
}


// Determine render sample depth
let renderSampleFromCameraPosOnX = Math.floor((windowDimensions.width / tileRenderSizeInPixels)) + tileRenderSlack
let renderSampleFromCameraPosOnY = Math.floor((windowDimensions.height / tileRenderSizeInPixels) * 2) + tileRenderSlack


// Render world
let canvasContext = canvasElement.getContext('2d')
canvasContext.imageSmoothingEnabled = false



tilePrerenderedCanvases = []
for (let i = 0; i < tileMapBase64.length; i++) {
	let image = new Image()
	image.src = tileMapBase64[i]

	let tileCanvas = document.createElement('canvas')

	tileCanvas.style.width = tileRenderSizeInPixels
	tileCanvas.style.height = tileRenderSizeInPixels

	tileCanvas.setAttribute('width', tileRenderSizeInPixels + 'px')
	tileCanvas.setAttribute('height', tileRenderSizeInPixels + 'px')

	let tileCanvasContext = tileCanvas.getContext('2d')
	tileCanvasContext.imageSmoothingEnabled = false


	// tileCanvasContext.fillStyle = 'purple'
	// tileCanvasContext.fillRect(0, 0, tileRenderSizeInPixels, tileRenderSizeInPixels)
	image.onload = () => {
		tileCanvasContext.drawImage(image, 0, 0, tileRenderSizeInPixels, tileRenderSizeInPixels)
	}
	


	tilePrerenderedCanvases.push(tileCanvas)
	// document.body.appendChild(tilePrerenderedCanvases[i])
}

renderFrameInterval = setInterval(() => {
	requestAnimationFrame(renderFrame)
},renderInterval)

// renderFrame()
function renderFrame() {
	// let grass = new Image(tileRenderSizeInPixels, tileRenderSizeInPixels)
	// grass.src = tileSource + tileMap[0] + '.' + tileType
	// grass.src = tileMapBase64[0]
	// canvasContext.drawImage(grass, 0, 0, tileRenderSizeInPixels, tileRenderSizeInPixels)
	canvasContext.clearRect(0, 0, windowDimensions.width, windowDimensions.height)

	let worldDataOffsetX = cameraX - renderSampleFromCameraPosOnX + (tileRenderSlack * 2)
	let worldDataOffsetY = cameraY - renderSampleFromCameraPosOnY + (tileRenderSlack * 2)
	let timeStartEpoch = new Date()
	let timeStart = timeStartEpoch.getTime()

	for (let i = Math.floor(cameraX - renderSampleFromCameraPosOnX); i < cameraX + renderSampleFromCameraPosOnX; i++) {
		for (let j = Math.floor(cameraY - renderSampleFromCameraPosOnY); j < cameraY + renderSampleFromCameraPosOnY; j++) {

			try {
				if (i >=0 && i < worldData.length) {
					if (j >=0 && j < worldData[i].length) {
						
						let tileCanvas = tilePrerenderedCanvases[worldData[i][j]]
						// console.log(tileCanvas)
						Math.floor(originX = ((i - worldDataOffsetX) * tileRenderSizeInPixels) + ((j % 2) * (tileRenderSizeInPixels / 2)))
						Math.floor(originY = (j - worldDataOffsetY) * (tileRenderSizeInPixels / 4))
						canvasContext.drawImage(tileCanvas, originX, originY, tileRenderSizeInPixels, tileRenderSizeInPixels)
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

	let timeEndEpoch = new Date()
	let timeEnd = timeEndEpoch.getTime()

	renderFrameTime = timeEnd - timeStart

	// Draw character
	let charDimensions = 40
	canvasContext.fillStyle = 'red'
	canvasContext.fillRect((windowDimensions.width / 2) - (charDimensions / 2),(windowDimensions.height / 2) - (charDimensions / 2),charDimensions,charDimensions)

	// requestAnimationFrame(renderFrame)
}
