class Edge {
    constructor(config) {
        this.node1 = config.node1;
        this.node2 = config.node2;

        // this.label = config.label || "";

        this.svg = null;
        this.curveOffset = 0;  // Will store how much to curve this edge

        this.#init();
    }

    #init() {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        this.svg = path;
        this.update();
    }

    #lineIntersectsNode(x1, y1, x2, y2, node) {
        if (node === this.node1 || node === this.node2) return false;

        const nodeRadius = 19; // Same as circle radius in Node class
        const x0 = node.x;
        const y0 = node.y;

        // Vector from line start to node center
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Vector from line start to circle center
        const cx = x0 - x1;
        const cy = y0 - y1;

        // Length of line
        const lengthSquared = dx * dx + dy * dy;

        // Project circle center onto line
        let t = Math.max(0, Math.min(1, (cx * dx + cy * dy) / lengthSquared));

        // Point on line closest to circle center
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        // Distance from closest point to circle center
        const distanceSquared = (projX - x0) * (projX - x0) + (projY - y0) * (projY - y0);

        return distanceSquared < (nodeRadius * nodeRadius);
    }

    #calculateNodeIntersections(allNodes) {
        const x1 = this.node1.x;
        const y1 = this.node1.y;
        const x2 = this.node2.x;
        const y2 = this.node2.y;

        let intersectingNodes = [];
        
        allNodes.forEach(node => {
            if (this.#lineIntersectsNode(x1, y1, x2, y2, node)) {
                intersectingNodes.push(node);
            }
        });

        return intersectingNodes;
    }

    #calculateCurveOffset(allNodes) {
        const intersectingNodes = this.#calculateNodeIntersections(allNodes);
        
        // If no nodes intersect, use straight line
        if (intersectingNodes.length === 0) {
            return 0;
        }

        const dx = this.node2.x - this.node1.x;
        const dy = this.node2.y - this.node1.y;
        const edgeLength = Math.sqrt(dx * dx + dy * dy);
        
        // Base curve offset on edge length and number of intersecting nodes
        let offset = edgeLength * 0.2 * Math.min(intersectingNodes.length, 2);
        
        // Determine curve direction based on where most intersecting nodes are
        let sumOffsetDirection = 0;
        const midX = (this.node1.x + this.node2.x) / 2;
        const midY = (this.node1.y + this.node2.y) / 2;
        
        intersectingNodes.forEach(node => {
            // Vector from line midpoint to node
            const toNodeX = node.x - midX;
            const toNodeY = node.y - midY;
            
            // Cross product with edge direction determines which side the node is on
            const crossProduct = dx * toNodeY - dy * toNodeX;
            sumOffsetDirection += Math.sign(crossProduct);
        });

        // Curve away from the side with more nodes
        const direction = -Math.sign(sumOffsetDirection) || 1;
        return offset * direction * 2; // two is a multiplier to make the curve more pronounced
    }

    update(allEdges, allNodes) {
        if (allNodes) {
            this.curveOffset = this.#calculateCurveOffset(allNodes);
        }

        if (this.curveOffset === 0) {
            // Use straight line
            const d = `M ${this.node1.x} ${this.node1.y} L ${this.node2.x} ${this.node2.y}`;
            this.svg.setAttribute("d", d);
            return;
        }

        // Calculate control point for quadratic curve
        const dx = this.node2.x - this.node1.x;
        const dy = this.node2.y - this.node1.y;
        const midX = (this.node1.x + this.node2.x) / 2;
        const midY = (this.node1.y + this.node2.y) / 2;
        
        // Calculate perpendicular offset for control point
        const nx = -dy;  // Normal vector x
        const ny = dx;   // Normal vector y
        const length = Math.sqrt(nx * nx + ny * ny);
        const normalizedNx = nx / length;
        const normalizedNy = ny / length;
        
        // Control point is perpendicular to midpoint
        const controlX = midX + normalizedNx * this.curveOffset;
        const controlY = midY + normalizedNy * this.curveOffset;
        
        // Create curved path
        const d = `M ${this.node1.x} ${this.node1.y} Q ${controlX} ${controlY} ${this.node2.x} ${this.node2.y}`;
        this.svg.setAttribute("d", d);
    }
}