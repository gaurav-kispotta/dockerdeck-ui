import { InternalNode, Node, Position } from '@xyflow/react';

// returns the position (top,right,bottom or right) passed node compared to
interface NodeInternals {
    positionAbsolute: {
        x: number;
        y: number;
    };
    handleBounds: {
        source: Array<{
            position: Position;
            width: number;
            height: number;
            x: number;
            y: number;
        }>;
    };
}

function getParams(nodeA: InternalNode<Node>, nodeB: InternalNode<Node>): [number, number, Position] {
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);

    const horizontalDiff = Math.abs(centerA.x - centerB.x);
    const verticalDiff = Math.abs(centerA.y - centerB.y);

    let position: Position;

    // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
    if (horizontalDiff > verticalDiff) {
        position = centerA.x > centerB.x ? Position.Left : Position.Right;
    } else {
        // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
        position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
    }

    const [x, y] = getHandleCoordsByPosition(nodeA, position);
    return [x, y, position];
}

interface Handle {
    position: Position;
    width: number;
    height: number;
    x: number;
    y: number;
}

function getHandleCoordsByPosition(node: InternalNode<Node>, handlePosition: Position): [number, number] {
    // all handles are from type source, that's why we use handleBounds.source here
    if (!node.internals.handleBounds || !node.internals.handleBounds.source) {
        throw new Error('Handle bounds or handle bounds source is not defined');
    }

    const handle: Handle | undefined = node.internals.handleBounds.source.find(
        (h) => h.position === handlePosition,
    );

    if (!handle) {
        throw new Error(`Handle with position ${handlePosition} not found`);
    }

    let offsetX = handle.width / 2;
    let offsetY = handle.height / 2;

    // this is a tiny detail to make the markerEnd of an edge visible.
    // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
    // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
    switch (handlePosition) {
        case Position.Left:
            offsetX = 0;
            break;
        case Position.Right:
            offsetX = handle.width;
            break;
        case Position.Top:
            offsetY = 0;
            break;
        case Position.Bottom:
            offsetY = handle.height;
            break;
    }

    const x = node.internals.positionAbsolute.x + handle.x + offsetX;
    const y = node.internals.positionAbsolute.y + handle.y + offsetY;

    return [x, y];
}

interface NodeCenter {
    x: number;
    y: number;
}

function getNodeCenter(node: InternalNode<Node>): NodeCenter {
    return {
        x: node.internals.positionAbsolute.x + (node.measured.width ?? 0) / 2,
        y: node.internals.positionAbsolute.y + (node.measured.height ?? 0) / 2,
    };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
interface EdgeParams {
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    sourcePos: Position;
    targetPos: Position;
}

export function getEdgeParams(source: InternalNode<Node>, target: InternalNode<Node>): EdgeParams {
    const [sx, sy, sourcePos] = getParams(source, target);
    const [tx, ty, targetPos] = getParams(target, source);

    return {
        sx,
        sy,
        tx,
        ty,
        sourcePos,
        targetPos,
    };
}