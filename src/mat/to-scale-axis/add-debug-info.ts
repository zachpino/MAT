
declare var _debug_: MatDebug; 

import { MatDebug } from '../../debug/debug';
import { Mat    } from '../../mat';


/**
 * @hidden
 * @param sat 
 */
function addDebugInfo(sat: Mat) {
	if (typeof _debug_ === 'undefined') { return; }

	let generated = _debug_.generated;
	generated.elems.sat.push(sat);

	let timing = generated.timing;
	timing.sats[1] += performance.now() - timing.sats[0];   
}


export { addDebugInfo }
