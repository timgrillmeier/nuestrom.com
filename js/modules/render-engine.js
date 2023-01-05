import { nuestrom } from '../../js/nuestrom.js'
import { terrainSprites } from '../../assets/terrain-sprites/terrain-sprites.js'
import { treeSprites } from '../../assets/tree-sprites/tree-sprites.js'
import { groundSprites } from '../../assets/ground-sprites/ground-sprites.js'

let tileSource = 'assets/tiles/32/'
let tileAppend = '-32-base'
let tileType = 'png'
let tileRenderAssets = []
let artifactRenderAssets = []
let charAssetCanvas = document.createElement('canvas')

export function renderFrame(staggeredRender = false) {
	// BENCHMARKING
	let timeStartEpoch = new Date()
	let timeStart = timeStartEpoch.getTime()

	// Get bounding x, y
	let currentTileDisplaySizeInPixels = nuestrom.config.tilePixelBase * nuestrom.config.tileScale
	let activeTilesFromOrigin =  {
		x: ((((window.innerWidth / 2) / currentTileDisplaySizeInPixels) * nuestrom.config.renderTileMultiplier) + nuestrom.config.renderTileSlack),
		y: ((((window.innerHeight / 2) / (currentTileDisplaySizeInPixels / 2)) * nuestrom.config.renderTileMultiplier) + nuestrom.config.renderTileSlack)
	}

	let processingCoordBounds = {
		xLower: Math.floor(nuestrom.player.coords.x - (activeTilesFromOrigin.x) - 1),
		xUpper: Math.floor(nuestrom.player.coords.x + (activeTilesFromOrigin.x) + 1),
		yLower: Math.floor(nuestrom.player.coords.y - (activeTilesFromOrigin.y * 2) - 1),
		yUpper: Math.floor(nuestrom.player.coords.y + (activeTilesFromOrigin.y * 2) + 4),
	}

	

	// Review tiles in active area
	let canvasOffset = {
		x: (activeTilesFromOrigin.x * -0.5),
		y: (activeTilesFromOrigin.y * 2)
	}

	let xTranslate = 0
	if (nuestrom.player.coords.x < 0) {
		xTranslate = nuestrom.player.coords.x - (activeTilesFromOrigin.x)
	} else {
		xTranslate = nuestrom.player.coords.x - (activeTilesFromOrigin.x) // this works
	}

	// xTranslate = (window.innerHeight / 2)

	let yTranslate = 0
	if (nuestrom.player.coords.y < 0) {
		yTranslate = nuestrom.player.coords.y - (activeTilesFromOrigin.y * 2) + 1
	} else {
		yTranslate = nuestrom.player.coords.y - (activeTilesFromOrigin.y * 2) + 1
	}

	let count = 0
	let countIncrement = 15
	let characterDrawn = false
	let laggardY = processingCoordBounds.yLower - 5

	for (let y = processingCoordBounds.yLower; y <= processingCoordBounds.yUpper + 5; y++) {
		for (let x = processingCoordBounds.xLower; x <= processingCoordBounds.xUpper; x++) {

			let xRender = 0
			if (x > 0) {
				xRender = (x - xTranslate)
			} else {
				xRender = (x - xTranslate)
			}
			xRender = (xRender * currentTileDisplaySizeInPixels) + ((currentTileDisplaySizeInPixels / 2) * (Math.abs(y) % 2))


			let yRender = 0
			if (y > 0) {
				yRender = (y - yTranslate)
			} else {
				yRender = (y - yTranslate)
			}
			yRender = (yRender * currentTileDisplaySizeInPixels) / 3.56

			let terrainTile = getWorldTerrainTile(x, y)
			if (terrainTile != null) {
				
				if (nuestrom.config.slowRender) {
					paintTileWithTimeout(count, nuestrom.functional.canvasContext, tileRenderAssets[terrainTile], xRender, yRender - (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[0] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale))
					count += countIncrement
				} else {
					nuestrom.functional.canvasContext.drawImage(tileRenderAssets[terrainTile], xRender, yRender - (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[0] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale))
				}
			}

			laggardY++
		}
	}	

	for (let y = processingCoordBounds.yLower; y <= processingCoordBounds.yUpper + 5; y++) {
		for (let x = processingCoordBounds.xLower; x <= processingCoordBounds.xUpper; x++) {
			if (y > (nuestrom.player.coords.y + 0.5) && !characterDrawn) {
				

				// Draw rect in player coords
				let xRender = 0
				if (nuestrom.player.coords.x > 0) {
					xRender = (nuestrom.player.coords.x - xTranslate)
				} else {
					xRender = (nuestrom.player.coords.x - xTranslate)
				}
				xRender = xRender * currentTileDisplaySizeInPixels

				let yRender = 0
				if (nuestrom.player.coords.y > 0) {
					yRender = (nuestrom.player.coords.y - yTranslate)
				} else {
					yRender = (nuestrom.player.coords.y - yTranslate)
				}
				yRender = (yRender * currentTileDisplaySizeInPixels) / 3.56

				if (nuestrom.world.time < 600 || nuestrom.world.time > 1830) {
					// it's night, draw a light
					// let grad = nuestrom.functional.canvasContext.createRadialGradient(0, 0, 10, 0,0, 20)
					// grad.addColorStop(0,'rgba(255,255,255,0)')
					// grad.addColorStop(0.2,'blue')
					// grad.addColorStop(0.5,'rgba(247,205,144,1)')
					// grad.addColorStop(0.6,'red')
					// grad.addColorStop(1,'rgba(247,205,144,0.7)')

					// nuestrom.functional.canvasContext.fillStyle = grad
					// nuestrom.functional.canvasContext.setTransform((currentTileDisplaySizeInPixels * 2),0,0,currentTileDisplaySizeInPixels,0,0);
					// nuestrom.functional.canvasContext.fillRect(xRender, yRender, xRender + 100, yRender + 100)
				
					
					console.log(xRender)
					let gradient = nuestrom.functional.canvasContext.createRadialGradient(xRender, yRender * 2, currentTileDisplaySizeInPixels / 3, xRender, yRender * 2, currentTileDisplaySizeInPixels);
					gradient.addColorStop(1, "rgba(244,243,190, 0.0)");
					gradient.addColorStop(0.2, "rgba(244,243,190, 0.3)");
					gradient.addColorStop(0, "rgba(244,243,190, 0.5)");
					nuestrom.functional.canvasContext.setTransform(1, 0, 0, 0.5, 0, 0);
					nuestrom.functional.canvasContext.fillStyle = gradient
					nuestrom.functional.canvasContext.fillRect(xRender - (currentTileDisplaySizeInPixels * 2), ((yRender * 2) - currentTileDisplaySizeInPixels), currentTileDisplaySizeInPixels * 4, currentTileDisplaySizeInPixels * 2);
					nuestrom.functional.canvasContext.setTransform(1, 0, 0, 1, 0, 0);

					nuestrom.functional.canvasContext.resetTransform()
				}

				characterDrawn = true 
				drawChar(xTranslate, yTranslate, currentTileDisplaySizeInPixels)
			} 

			let xRender = 0
			if (x > 0) {
				xRender = (x - xTranslate)
			} else {
				xRender = (x - xTranslate)
			}
			xRender = (xRender * currentTileDisplaySizeInPixels) + ((currentTileDisplaySizeInPixels / 2) * (Math.abs(y) % 2))


			let yRender = 0
			if (y > 0) {
				yRender = (y - yTranslate)
			} else {
				yRender = (y - yTranslate)
			}
			yRender = (yRender * currentTileDisplaySizeInPixels) / 3.56

			let verticalArtefact = getVerticalArtefact(x, y)
			if (verticalArtefact != null) {
				if (nuestrom.config.slowRender) {
					paintTileWithTimeout(count, nuestrom.functional.canvasContext, artifactRenderAssets[verticalArtefact], xRender, laggardYRender - (treeSprites[verticalArtefact].d[1] * nuestrom.config.tileScale), (treeSprites[verticalArtefact].d[0] * nuestrom.config.tileScale), (treeSprites[verticalArtefact].d[1] * nuestrom.config.tileScale))
					count += countIncrement
				} else {
					nuestrom.functional.canvasContext.drawImage(artifactRenderAssets[verticalArtefact], xRender, yRender - (treeSprites[verticalArtefact].d[1] * nuestrom.config.tileScale), (treeSprites[verticalArtefact].d[0] * nuestrom.config.tileScale), (treeSprites[verticalArtefact].d[1] * nuestrom.config.tileScale))
				}
			}

			laggardY++
		}
	}	

	// Draw day/night
	// console.log(nuestrom.functional.dayNightActiveProfile)
	// console.log(nuestrom.functional.dayNightActiveAlpha)
	nuestrom.functional.canvasContext.fillStyle = nuestrom.config.dayNightActiveProfile
	nuestrom.functional.canvasContext.globalAlpha = nuestrom.config.dayNightActiveAlpha
	nuestrom.functional.canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight)

	nuestrom.functional.canvasContext.globalAlpha = 1
	

	// BENCHMARKING
	let timeEndEpoch = new Date()
	let timeEnd = timeEndEpoch.getTime()

	nuestrom.functional.renderFrameTime = timeEnd - timeStart
}

function drawChar(xTranslate, yTranslate, currentTileDisplaySizeInPixels) {
	// Draw rect in player coords
	let xRender = 0
	if (nuestrom.player.coords.x > 0) {
		xRender = (nuestrom.player.coords.x - xTranslate)
	} else {
		xRender = (nuestrom.player.coords.x - xTranslate)
	}
	xRender = xRender * currentTileDisplaySizeInPixels

	let yRender = 0
	if (nuestrom.player.coords.y > 0) {
		yRender = (nuestrom.player.coords.y - yTranslate)
	} else {
		yRender = (nuestrom.player.coords.y - yTranslate)
	}
	yRender = (yRender * currentTileDisplaySizeInPixels) / 3.56

	// nuestrom.functional.canvasContext.fillStyle = 'blue'
	// nuestrom.functional.canvasContext.fillRect(xRender, yRender, 8, 8)
	if (nuestrom.config.slowRender) {
		paintTileWithTimeout(count, nuestrom.functional.canvasContext, charAssetCanvas,xRender - (currentTileDisplaySizeInPixels / 2), yRender - currentTileDisplaySizeInPixels, currentTileDisplaySizeInPixels, currentTileDisplaySizeInPixels)
		count += countIncrement
		// setTimeout(() => {
		// 	nuestrom.functional.canvasContext.fillStyle = 'blue'
		// 	nuestrom.functional.canvasContext.fillRect(xRender, yRender, 8, 8)
		// },count)
	} else {
		nuestrom.functional.canvasContext.drawImage(charAssetCanvas,xRender - (currentTileDisplaySizeInPixels / 2), yRender - currentTileDisplaySizeInPixels, currentTileDisplaySizeInPixels, currentTileDisplaySizeInPixels)
	}
}

export function preRender() {
	// Pre-render all tiles
	for (let i = 0; i < terrainSprites.length; i++) {
		let asset = new Image()
		// image.src = tileMapBase64[i] // using base64 encoded images
		asset.src = tileSource + terrainSprites[i].s + tileAppend + '.' + tileType

		let assetCanvas = document.createElement('canvas')

		assetCanvas.style.width = terrainSprites[i].d[0]
		assetCanvas.style.height = terrainSprites[i].d[1]

		assetCanvas.setAttribute('width', terrainSprites[i].d[0] + 'px')
		assetCanvas.setAttribute('height', terrainSprites[i].d[1] + 'px')

		let assetCanvasContext = assetCanvas.getContext('2d')
		assetCanvasContext.imageSmoothingEnabled = false

		asset.onload = () => {
			assetCanvasContext.drawImage(asset, 0, 0, terrainSprites[i].d[0], terrainSprites[i].d[1])
		}
		
		tileRenderAssets.push(assetCanvas)
		if (nuestrom.config.renderAssetSamples) {
			document.body.appendChild(tileRenderAssets[i])
		}
	}

	// Pre-render tree
	for (let i = 0; i < treeSprites.length; i++) {
		let asset = new Image()
		// image.src = tileMapBase64[i] // using base64 encoded images
		asset.src = tileSource + treeSprites[i].s + tileAppend + '.' + tileType

		let assetCanvas = document.createElement('canvas')

		assetCanvas.style.width = treeSprites[i].d[0]
		assetCanvas.style.height = treeSprites[i].d[1]

		assetCanvas.setAttribute('width', treeSprites[i].d[0] + 'px')
		assetCanvas.setAttribute('height', treeSprites[i].d[1] + 'px')

		let assetCanvasContext = assetCanvas.getContext('2d')
		assetCanvasContext.imageSmoothingEnabled = false

		asset.onload = () => {
			assetCanvasContext.drawImage(asset, 0, 0, treeSprites[i].d[0], treeSprites[i].d[1])
		}

		artifactRenderAssets.push(assetCanvas)
		if (nuestrom.config.renderAssetSamples) {
			document.body.appendChild(artifactRenderAssets[i])
		}
	}

	// Render char
	let charAsset = new Image()
	charAsset.src = tileSource + 'char-2' + tileAppend + '.' + tileType

	charAssetCanvas.style.width = 32
	charAssetCanvas.style.height = 32

	charAssetCanvas.setAttribute('width', 32 + 'px')
	charAssetCanvas.setAttribute('height', 32 + 'px')

	let assetCanvasContext = charAssetCanvas.getContext('2d')
	assetCanvasContext.imageSmoothingEnabled = false

	charAsset.onload = () => {
		assetCanvasContext.drawImage(charAsset, 0, 0, 32, 32)
	}

	if (nuestrom.config.renderAssetSamples) {
		document.body.appendChild(charAssetCanvas)
	}
}

function paintTileWithTimeout(delay, ctx, asset, x, y, xoffset, yoffset) {
	setTimeout(() => {
		ctx.drawImage(asset, x, y, xoffset, yoffset)
	},delay)
}

function getWorldTerrainTile(x, y) {
	if (typeof nuestrom.worldTerrain['('+Math.abs(x)+','+Math.abs(y)+')'] != 'undefined') {
		return nuestrom.worldTerrain['('+Math.abs(x)+','+Math.abs(y)+')']
	} else {
		return null
	}
}


function getVerticalArtefact(x, y) {
	if (typeof nuestrom.verticalArtefacts['('+Math.abs(x)+','+Math.abs(y)+')'] != 'undefined') {
		return nuestrom.verticalArtefacts['('+Math.abs(x)+','+Math.abs(y)+')']
	} else {
		return null
	}
}