
import { drawFs } from "flo-draw";


/** @hidden */
function looseBoundingBox(g: SVGGElement, box: number[][]) {
	let $box = drawFs.rect(g, box, 'thin5 brown nofill');
	
	return $box;
}


export { looseBoundingBox }
