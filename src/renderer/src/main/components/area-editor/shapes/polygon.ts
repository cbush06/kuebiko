import Konva from 'konva';
import { DragPoint } from './drag-point';
import { Subject } from 'rxjs';

export class Polygon extends Konva.Group {
    private points: DragPoint[] = [];

    private readonly _change = new Subject<{ id: number; coords: Array<[number, number]> }>();
    public readonly change = this._change.asObservable();

    private line = new Konva.Line({
        lineCap: 'round',
        lineJoin: 'round',
        /*
         * line segments with a length of 29px with a gap
         * of 20px followed by a line segment of 0.001px (a dot)
         * followed by a gap of 20px
         */
        dash: [5, 5, 0.001, 5],
        stroke: '#00ff00',
        strokeWidth: 2,
        fill: 'rgba(0,255,0,0.3)',
    });

    private closed = false;
    get isClosed() {
        return this.closed;
    }

    private active = false;
    set isActive(value: boolean) {
        this.active = value;
        this.syncActiveStatus();
    }

    private readonly _mouseDown = new Subject<Konva.KonvaEventObject<MouseEvent>>();
    public readonly mouseDown = this._mouseDown.asObservable();

    constructor(coords: Array<[number, number]> = [], layer: Konva.Layer) {
        super({
            draggable: true,
        });
        this.add(this.line);
        this.on('click', (e) => (e.cancelBubble = true));
        this.on('mousedown', (e) => this._mouseDown.next(e));
        this.on('dragend', this.updatePointPositions);

        const loadInitialCoords = (e: Konva.KonvaEventObject<any>) => {
            if (e.child?._id === this._id) {
                if (coords.length) {
                    coords.forEach(([x, y]) =>
                        this.addPoint(new DragPoint(x, y, this.getStage()!)),
                    );
                    this.close();
                }
                layer.off('add', loadInitialCoords);
            }
        };

        layer.on('add', loadInitialCoords);
    }

    /**
     * Add a drag point and listen for close event if its the first point
     */
    public addPoint(point: DragPoint) {
        point.change.subscribe(() => this.updateLine());
        this.points.push(point);
        this.add(point);
        this.updateLine();

        // Forward point click events as polygon's own so the context menu is cleared
        point.on('mousedown', (e) =>
            this._mouseDown.next({
                evt: new MouseEvent('mousedown', { ...e.evt }),
                target: e.target,
                type: 'mousedown',
                pointerId: 0,
                currentTarget: this,
                cancelBubble: true,
            } as Konva.KonvaEventObject<MouseEvent>),
        );

        // If the first point is clicked when there are 3 or more, close the poly
        if (this.points.length === 1) {
            point.on('click', () => this.close());
        }
    }

    /**
     * Redraw the line connecting DragPoints
     */
    private updateLine() {
        this.line.points(this.points.flatMap((point) => [point.x(), point.y()]));
        this.drawScene();
        this._change.next({ id: this._id, coords: this.getPoints() });
    }

    /**
     * Close the polygon by connecting the last point to the first
     */
    private close() {
        if (this.points.length < 3) return;
        this.line.closed(true);
        this.closed = true;
    }

    /**
     * Sync the active status of the polygon to its points
     */
    private syncActiveStatus() {
        this.points.forEach((point) => (point.isActive = this.active));
        this.getLayer()?.drawScene();
    }

    /**
     * Reset point x-y coords to absolute coordinates
     */
    private updatePointPositions() {
        this.points.forEach((point) =>
            point.position({
                x: point.absolutePosition().x - this.absolutePosition().x,
                y: point.absolutePosition().y - this.absolutePosition().y,
            }),
        );
        this._change.next({ id: this._id, coords: this.getPoints() });
    }

    private getPoints() {
        return this.points.map((point) => [point.x(), point.y()] as [number, number]);
    }
}