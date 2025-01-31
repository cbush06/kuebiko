import Konva from 'konva';
import { Subject } from 'rxjs';

export class DragPoint extends Konva.Circle {
    public static readonly RADIUS = 5;

    private dragging = false;

    private readonly _change = new Subject<[number, number]>();
    public readonly change = this._change.asObservable();

    private static readonly DRAG_POINT_CONFIG: Partial<Konva.CircleConfig> = {
        radius: DragPoint.RADIUS,
        fill: '#ccc',
        stroke: '#0000ff',
        strokeWidth: 2,
        listening: true,
    };

    private active = false;
    get isActive() {
        return this.active;
    }
    set isActive(value: boolean) {
        this.active = value;
        this.visible(value);
        if (!value) this.dragEnd();
    }

    constructor(x: number, y: number, stage: Konva.Stage) {
        super({
            ...DragPoint.DRAG_POINT_CONFIG,
            x,
            y,
        });
        this.on('click', (e) => (e.cancelBubble = true));

        this.on('mousedown', this.dragStart);
        stage.on('mousemove', (e) => this.drag(e));

        this.on('mouseup', () => {
            this.dragEnd();
            this.getStage()!.container().style.cursor = 'grab';
        });
        stage.on('mouseup', (e) => this.dragEnd(e));

        this.on('mouseover', () => {
            if (this.dragging) return;
            this.getStage()!.container().style.cursor = 'grab';
        });

        this.on('mouseout', () => {
            if (this.dragging) return;
            this.getStage()!.container().style.cursor = 'default';
        });
    }

    private dragStart(e: Konva.KonvaEventObject<MouseEvent>) {
        e.cancelBubble = true;
        this.dragging = true;
        this.getStage()!.container().style.cursor = 'grabbing';
    }

    private drag(e: Konva.KonvaEventObject<MouseEvent>) {
        if (!this.dragging) return;
        e.cancelBubble = true;

        // Get stage from event
        const evtStage = e.target.getStage()!;

        // Prevent leaving the stage
        if (
            evtStage.getPointerPosition()!.x < 0 ||
            evtStage.getPointerPosition()!.y < 0 ||
            evtStage.getPointerPosition()!.x > evtStage.width() ||
            evtStage.getPointerPosition()!.y > evtStage.height()
        )
            return;

        // Update position from absolute coordinates relative to its parent
        this.position({
            x: evtStage.getPointerPosition()!.x - this.parent!.absolutePosition().x,
            y: evtStage.getPointerPosition()!.y - this.parent!.absolutePosition().y,
        });

        this._change.next([this.x(), this.y()]);

        // Redraw
        this.drawScene();
    }

    private dragEnd(e?: Konva.KonvaEventObject<MouseEvent>) {
        if (e) e.cancelBubble = true;
        this.dragging = false;
        this._change.next([this.x(), this.y()]);
    }
}