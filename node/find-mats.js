"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mat_1 = require("./mat");
const simplify_paths_1 = require("./svg/fs/simplify-paths/simplify-paths");
const get_extreme_1 = require("./svg/fs/get-extreme");
const find_and_add_3_prongs_1 = require("./mat/find-mat/find-and-add-3-prongs");
const create_initial_cp_graph_1 = require("./mat/find-mat/create-initial-cp-graph");
;
const add_debug_info_1 = require("./mat/find-mat/add-debug-info");
const get_potential_2_prongs_1 = require("./mat/find-mat/get-potential-2-prongs");
const get_sharp_corners_1 = require("./mat/find-mat/get-sharp-corners");
const find_and_add_2_prongs_on_all_paths_1 = require("./mat/find-mat/find-and-add-2-prongs-on-all-paths");
const create_get_interesting_points_on_loop_1 = require("./mat/find-mat/create-get-interesting-points-on-loop");
const find_and_add_hole_closing_2_prongs_1 = require("./mat/find-mat/find-and-add-hole-closing-2-prongs");
const get_loop_area_1 = require("./loop/get-loop-area");
const normalize_loop_1 = require("./loop/normalize/normalize-loop");
/**
 * Find the Medial Axis Transforms (MATs) from the given array of bezier loops
 * representing shape boundaries.
 * @param bezierLoops An array of (possibly intersecting) loops with each loop
 * representing one or more piecewise smooth closed curves (i.e. shapes). Each
 * loop consists of an array of beziers represented by an array of control
 * points with 2,3 or 4 elements corresponding to linear, quadratic and cubic
 * beziers respectively. Each point is a two-element array (ordered pair), the
 * first of which is the x-coordinate and the second the y-coordinate.
 * @param maxFlatness The maximum value the flatness of a curve can have before
 * an additional MAT point is added in between. Defaults to 1.01. (Flatness is
 * measured as the total distance between control points of a curve divided by
 * the length of the curve. The value cannot be lower than 1.001 and must be
 * less than 2.
 * @param maxLength The maximum length a curve can have before an additional MAT
 * point is added in between. Together with maxFlatness it represents a
 * tolerance for the accuracy of the MAT. Defaults to 10. The value cannot be
 * lower than 1 or higher than 1000.
 */
function findMats(bezierLoops, maxFlatness = 1.01, maxLength = 10) {
    // Limit the tolerance to a reasonable level
    if (maxFlatness < 1.001 || maxFlatness >= 2) {
        maxFlatness = 1.01;
    }
    // Limit the tolerance to a reasonable level
    if (maxLength < 1 || maxLength > 1000) {
        maxLength = 10;
    }
    if (typeof _debug_ !== 'undefined') {
        let timing = _debug_.generated.timing;
        timing.simplify[0] = performance.now();
    }
    // We use 14 here since (14+3)*3 = 51 < 53 (signifcand length). In other
    // words if we change a bezier point coordinate to power basis we add
    // three more significant figures at most (due to multiplication by 6) to
    // get a bit length of 17 so we can multiply 3 coordinates together without
    // any round-off error.
    //let loops = loops_.map(loop => normalizeLoop(loop, max, 13));
    let loops = normalize_loop_1.normalizeLoops(bezierLoops, 14);
    let { loopss, xMap } = simplify_paths_1.simplifyPaths(loops);
    for (let i = 0; i < loopss.length; i++) {
        let loops = loopss[i].filter(loopHasNonNegligibleArea(0.1));
        loopss[i] = loops;
    }
    loopss = loopss.filter(loops => loops.length);
    if (typeof _debug_ !== 'undefined') {
        let timing = _debug_.generated.timing;
        timing.simplify[1] += performance.now() - timing.simplify[0];
    }
    let mats = [];
    for (let loops of loopss) {
        loops.sort(simplify_paths_1.ascendingByTopmostPoint);
        let mat = findPartialMat(loops, xMap, maxFlatness, maxLength);
        if (mat) {
            mats.push(mat);
        }
    }
    return mats;
}
exports.findMats = findMats;
/**
 * @hidden
 * @param minArea
 */
function loopHasNonNegligibleArea(minArea) {
    return (loop) => {
        let area = get_loop_area_1.getLoopArea(loop);
        return Math.abs(area) > minArea;
    };
}
/**
 * @hidden
 * Find the MAT of the given loops.
 * @param loops The loops (that as a precondition must be ordered from highest
 * (i.e. smallest y-value) topmost point loops to lowest)
 * @param xMap Intersection point map.
 * @param additionalPointCount
 */
function findPartialMat(loops, xMap, maxFlatness = 1.001, maxLength = 10) {
    let extreme = get_extreme_1.getExtreme(loops);
    add_debug_info_1.addDebugInfo1(loops);
    // Gets interesting points on the shape, i.e. those that makes sense to use 
    // for the 2-prong procedure.
    let pointsPerLoop = loops.map(create_get_interesting_points_on_loop_1.createGetInterestingPointsOnLoop(maxFlatness, maxLength));
    let for2ProngsPerLoop = get_potential_2_prongs_1.getPotential2Prongs(pointsPerLoop);
    let sharpCornersPerLoop = get_sharp_corners_1.getSharpCorners(pointsPerLoop);
    let cpTrees = new Map();
    let cpNode = create_initial_cp_graph_1.createInitialCpGraph(loops, cpTrees, sharpCornersPerLoop, xMap);
    find_and_add_hole_closing_2_prongs_1.findAndAddHoleClosing2Prongs(loops, cpTrees, extreme);
    if (typeof _debug_ !== 'undefined') {
        if (_debug_.directives.stopAfterHoleClosers) {
            return undefined;
        }
    }
    add_debug_info_1.addDebugInfo2(pointsPerLoop);
    cpNode = find_and_add_2_prongs_on_all_paths_1.findAndAdd2ProngsOnAllPaths(loops, cpTrees, for2ProngsPerLoop, extreme);
    add_debug_info_1.addDebugInfo3();
    if (typeof _debug_ !== 'undefined') {
        if (_debug_.directives.stopAfterTwoProngs) {
            return undefined;
        }
    }
    if (cpNode === undefined) {
        return undefined;
    }
    find_and_add_3_prongs_1.findAndAddAll3Prongs(cpTrees, cpNode, extreme);
    if (typeof _debug_ !== 'undefined') {
        if (_debug_.directives.stopAfterThreeProngs) {
            return undefined;
        }
    }
    let mat = new mat_1.Mat(cpNode, cpTrees);
    add_debug_info_1.addDebugInfo4(mat);
    return mat;
}
//# sourceMappingURL=find-mats.js.map