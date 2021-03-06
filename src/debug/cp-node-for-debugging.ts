
import { CpNode       } from '../cp-node';
import { PointOnShape } from '../point-on-shape';
import { Circle       } from '../circle';
import { Generated } from './debug';


/**
 * @hidden
 * Class used for debugging only. 
 */
class CpNodeForDebugging {
    cpsSimple: string[][];

    constructor(
            public generated  : Generated,
            public cpNode     : CpNode) {
    }
}


export { CpNodeForDebugging }
