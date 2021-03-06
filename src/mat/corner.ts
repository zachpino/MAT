
/**
 * @hidden
 * Represents a corner on the shape boundary, i.e. a point where two bezier
 * curves meet. This class is typically used internally only.
 */
class Corner {
    /**
     * @param tangents The unit tangents at the points t === 1 of the 
     * first curve and at t === 0 of the second respectively.
     * @param crossTangents The cross of the unit tangents. 
     * @param isSharp True if the corner is sharp, i.e. > 0 radians as one goes
     * in a positive direction around the shape boundary.
     * @param isDull True if the corner is dull, i.e. < 0 radians as one goes
     * in a positive direction around the shape boundary.
     * @param isQuiteSharp True if the corner is quite sharp, i.e. > δ radians 
     * as one goes in a positive direction around the shape boundary where δ is 
     * some pre-determined parameter.
     * @param isQuiteDull True if the corner is quite dull, i.e. < δ radians 
     * as one goes in a positive direction around the shape boundary where δ is 
     * some pre-determined parameter.
     */
    constructor(
            public tangents: number[][],
            public crossTangents: number,
            public isSharp: boolean,
            public isDull: boolean,
            public isQuiteSharp: boolean,
            public isQuiteDull: boolean) {
    }
}


export { Corner }
