import { AbstractQuestionEvaluator } from '@renderer/store/test-delivery-store/question-evaluators/abstract-question-evaluator';
import { Point } from '@renderer/db/models/point';
import { points, polygon } from '@turf/helpers';
import { pointsWithinPolygon } from '@turf/points-within-polygon';
import { Feature, GeoJsonProperties, Polygon } from 'geojson';



class HotspotQuestionEvaluator extends AbstractQuestionEvaluator<Point[][], Point[][]> {
    /**
     * Polygonize ensures the first and last points are the same, so that the polygon is closed.
     * @param points
     */
    static polygonize(points: Point[][]): Feature<Polygon, GeoJsonProperties> {
        if (points.length != 1) {
            throw new Error('Hotspot question evaluator only supports single polygon');
        }

        const poly1 = points[0];
        if (
            poly1.length < 4 ||
            poly1[0].x !== poly1[poly1.length - 1].x ||
            poly1[0].y !== poly1[poly1.length - 1].y
        ) {
            poly1.push(poly1[0]);
        }

        return polygon([poly1.map((point) => [point.x, point.y])]);
    }

    evaluate(correctResponse: Point[][], response: Point[][]): number {
        // Convert the poly to standard [[x,y], ...] format
        const correctPolygon = HotspotQuestionEvaluator.polygonize(correctResponse);

        const responsePoints = points(response[0].map((point) => [point.x, point.y]));

        // Restrict to one point response
        if (responsePoints.features.length !== 1) {
            return 0;
        }

        // Check if the response point is inside any of the correct polygons
        const ptsWithin = pointsWithinPolygon(responsePoints, correctPolygon);

        return ptsWithin.features.length > 0 ? 1 : 0;
    }

    isSingleResponseCorrect(correctResponse: Point[][], response: Point[][] | undefined): boolean {
        if (!response) {
            return false;
        }
        return this.evaluate(correctResponse, response) === 1;
    }
}

export const HOTSPOT_QUESTION_EVALUATOR = new HotspotQuestionEvaluator();
