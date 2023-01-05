import { nuestrom } from '../../js/nuestrom.js'
import { terrainSprites, terrainSpriteCanvas, terrainSpriteMasks } from '../../assets/terrain-sprites/terrain-sprites.js'
import { treeSprites, treeSpriteCanvas, treeSpriteMasks } from '../../assets/tree-sprites/tree-sprites.js'
import { groundSprites, groundSpriteCanvas, groundSpriteMasks } from '../../assets/ground-sprites/ground-sprites.js'

let tileSource = 'assets/tiles/32/'
let tileAppend = '-32-base'
let tileType = 'png'
let tileRenderAssets = []
let artifactRenderAssets = []
let artifactRenderMasks = []
let charAssetCanvas = document.createElement('canvas')

export async function renderFrame(staggeredRender = false) {
	// BENCHMARKING
	let timeStartEpoch = new Date()
	let timeStart = timeStartEpoch.getTime()

	// Update masks
	await updateAssetMasks()

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


	// Clear rect
	nuestrom.functional.canvasContext.clearRect(0,0,window.innerWidth,window.innerHeight)

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
					paintTileWithTimeout(count, nuestrom.functional.canvasContext, terrainSpriteCanvas[terrainTile], xRender, yRender - (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[0] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale))
					paintTileWithTimeout(count, nuestrom.functional.canvasContext, terrainSpriteMasks[terrainTile], xRender, yRender - (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[0] * nuestrom.config.tileScale), (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale))
					count += countIncrement
				} else {
					nuestrom.functional.canvasContext.drawImage(terrainSpriteCanvas[terrainTile], Math.floor(xRender), Math.floor(yRender - (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale)), Math.floor((terrainSprites[terrainTile].d[0] * nuestrom.config.tileScale)), Math.floor((terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale)))
					nuestrom.functional.canvasContext.globalAlpha = nuestrom.config.dayNightActiveProfile[3]
					nuestrom.functional.canvasContext.drawImage(terrainSpriteMasks[terrainTile], Math.floor(xRender), Math.floor(yRender - (terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale)), Math.floor((terrainSprites[terrainTile].d[0] * nuestrom.config.tileScale)), Math.floor((terrainSprites[terrainTile].d[1] * nuestrom.config.tileScale)))
					nuestrom.functional.canvasContext.globalAlpha = 1
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
					
					// console.log(xRender)
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
					nuestrom.functional.canvasContext.drawImage(artifactRenderAssets[verticalArtefact], Math.floor(xRender), Math.floor(yRender - (artifactRenderAssets[verticalArtefact].offsetHeight * nuestrom.config.tileScale)), Math.floor((artifactRenderAssets[verticalArtefact].offsetWidth * nuestrom.config.tileScale)), Math.floor((artifactRenderAssets[verticalArtefact].offsetHeight * nuestrom.config.tileScale)))
					let verticalScaling = 0
					let horizontalScaling = 0
					nuestrom.functional.canvasContext.globalAlpha = nuestrom.config.dayNightActiveProfile[3]
					nuestrom.functional.canvasContext.drawImage(artifactRenderMasks[verticalArtefact], Math.floor(xRender - horizontalScaling), Math.floor(yRender - verticalScaling - (artifactRenderAssets[verticalArtefact].offsetHeight * nuestrom.config.tileScale)), Math.floor((artifactRenderAssets[verticalArtefact].offsetWidth * nuestrom.config.tileScale) + horizontalScaling), Math.floor((artifactRenderAssets[verticalArtefact].offsetHeight * nuestrom.config.tileScale) + verticalScaling))
					nuestrom.functional.canvasContext.globalAlpha = 1
				}
			}

			laggardY++
		}
	}	
	

	// BENCHMARKING
	let timeEndEpoch = new Date()
	let timeEnd = timeEndEpoch.getTime()

	nuestrom.functional.renderFrameTime = timeEnd - timeStart
}

async function updateAssetMasks() {
	// Generate masks for terrain sprites
	terrainSpriteMasks.splice(0,(terrainSpriteMasks.length - 1))
	for (let i = 0; i < terrainSpriteCanvas.length; i++) {
		let assetCanvas = document.createElement('canvas')
		assetCanvas.style.width = terrainSprites[i].d[0]
		assetCanvas.style.height = terrainSprites[i].d[1]
		assetCanvas.setAttribute('width', terrainSprites[i].d[0] + 'px')
		assetCanvas.setAttribute('height', terrainSprites[i].d[1] + 'px')
		let assetCanvasContext = assetCanvas.getContext('2d')
		let spriteCanvasContext = terrainSpriteCanvas[i].getContext('2d')

		let imgData = spriteCanvasContext.getImageData(0, 0, terrainSprites[i].d[0], terrainSprites[i].d[1], { colorSpace: "srgb", willReadFrequently: true })
		for (let j = 0; j < imgData.data.length; j+=4) {
			imgData.data[j] = (nuestrom.config.dayNightActiveProfile[0])
			imgData.data[j+1] = (nuestrom.config.dayNightActiveProfile[1])
			imgData.data[j+2] = (nuestrom.config.dayNightActiveProfile[2])
		}

		assetCanvasContext.putImageData(imgData,0,0)
		terrainSpriteMasks.push(assetCanvas)

		// if (nuestrom.config.renderAssetSamples) {
		// 	document.body.appendChild(terrainSpriteMasks[i])
		// }
	}

	artifactRenderMasks.splice(0,(artifactRenderMasks.length - 1))
	for (let i = 0; i < artifactRenderAssets.length; i++) {
		if (artifactRenderAssets[i].offsetWidth != 0) {
			let assetCanvas = document.createElement('canvas')
			assetCanvas.style.width = artifactRenderAssets[i].offsetWidth
			assetCanvas.style.height = artifactRenderAssets[i].offsetHeight
			assetCanvas.setAttribute('width', artifactRenderAssets[i].offsetWidth + 'px')
			assetCanvas.setAttribute('height', artifactRenderAssets[i].offsetHeight + 'px')
			let assetCanvasContext = assetCanvas.getContext('2d')
			let spriteCanvasContext = artifactRenderAssets[i].getContext('2d')

			let imgData = spriteCanvasContext.getImageData(0, 0, artifactRenderAssets[i].offsetWidth, artifactRenderAssets[i].offsetHeight, { colorSpace: "srgb", willReadFrequently: true })
			for (let j = 0; j < imgData.data.length; j+=4) {
				imgData.data[j] = (nuestrom.config.dayNightActiveProfile[0])
				imgData.data[j+1] = (nuestrom.config.dayNightActiveProfile[1])
				imgData.data[j+2] = (nuestrom.config.dayNightActiveProfile[2])
			}

			assetCanvasContext.putImageData(imgData,0,0)
			artifactRenderMasks.push(assetCanvas)

			// if (nuestrom.config.renderAssetSamples) {
			// 	document.body.appendChild(artifactRenderMasks[i])
			// }
		}
	}

	// use for tree sprites
	// let imgData = terrainSpriteCanvas[i].getImageData(0, 0, treeSprites[i].d[0], treeSprites[i].d[1], { colorSpace: "srgb", willReadFrequently: true })

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
		
		terrainSpriteCanvas.push(assetCanvas)
		document.getElementById('sprite-house').appendChild(terrainSpriteCanvas[i])
		if (nuestrom.config.renderAssetSamples) {
			document.body.appendChild(terrainSpriteCanvas[i])
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
		document.getElementById('sprite-house').appendChild(artifactRenderAssets[i])
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

	document.getElementById('sprite-house').appendChild(charAssetCanvas)
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