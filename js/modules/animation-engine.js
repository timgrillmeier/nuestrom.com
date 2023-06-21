import { nuestrom } from '../../js/nuestrom.js'

export function processAnimationFrames() {
	if (nuestrom.config.dayNightCycle) {
		processDayNightCycle()
	}
}

function processDayNightCycle() {
	let ticksPerDay = (nuestrom.config.dayNightLength * 1000) / nuestrom.config.animationIntervalLength
	let timeIncrementPerTick = 2400 / ticksPerDay // max time in day is 2400

	nuestrom.world.time = nuestrom.world.time + timeIncrementPerTick // incremennt time
	if (nuestrom.world.time > 2400) {
		nuestrom.world.time = nuestrom.world.time - 2400 // prevent day going off forever
	}

	let matchFound = false
	for (let i = nuestrom.config.dayNightToneProfiles.length - 1; i >= 0; i--) {
		if (!matchFound && nuestrom.world.time > nuestrom.config.dayNightToneProfiles[i].time) {

			nuestrom.config.dayNightActiveProfile = nuestrom.config.dayNightToneProfiles[i].profile
			matchFound = true
		}
	}
}

