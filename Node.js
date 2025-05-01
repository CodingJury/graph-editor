class Node {
    constructor(config) {
        this.position = new Vector(config.x || 0, config.y || 0);
        this.velocity = new Vector(0, 0);
        this.force = new Vector(0, 0);
        
        this.label = config.label || "";
        this.onDragStart = config.onDragStart || (() => {});
        this.onDragEnd = config.onDragEnd || (() => {});

        this.svg = null;
        this.circle = null;  // Store reference to circle
        this.text = null;    // Store reference to text

        // Dragging state
        this.isDragging = false;
        this.dragOffset = new Vector(0, 0);

        this.#init();
    }

    // Getters and setters for x and y to maintain compatibility
    get x() { return this.position.x; }
    get y() { return this.position.y; }
    set x(value) { this.position.x = value; }
    set y(value) { this.position.y = value; }

    #init() {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute("class", "node-group");
        group.setAttribute("cursor", "pointer");

        this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circle.setAttribute("cx", this.position.x);
        this.circle.setAttribute("cy", this.position.y);
        this.circle.setAttribute("r", 19);
        this.circle.setAttribute("fill", "white");
        this.circle.setAttribute("stroke", "black");
        this.circle.setAttribute("stroke-width", "2");

        this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.text.setAttribute("x", this.position.x);
        this.text.setAttribute("y", this.position.y);
        // text.setAttribute("dy", "0.35em");
        this.text.setAttribute("text-anchor", "middle");
        this.text.setAttribute("dominant-baseline", "middle");
        this.text.setAttribute("fill", "black");
        this.text.setAttribute("font-size", "16");
        this.text.setAttribute("font-weight", "bold");
        this.text.setAttribute("font-family", "Arial, sans-serif");
        // text.setAttribute("text-decoration", "none");
        // text.setAttribute("user-select", "none");
        // text.setAttribute("pointer-events", "none");
        // text.setAttribute("transform", "translate(0, 0)");
        this.text.textContent = this.label;
        
        group.appendChild(this.circle);
        group.appendChild(this.text);

        this.svg = group;

        // Add drag event listeners
        this.#setupDragListeners();
    }

    #setupDragListeners() {
        this.svg.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.onDragStart();
            const rect = e.target.ownerSVGElement.getBoundingClientRect();
            const mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);
            this.dragOffset = this.position.subtract(mousePos);
            
            // Prevent text selection during drag
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const rect = this.svg.ownerSVGElement.getBoundingClientRect();
            const mousePos = new Vector(e.clientX - rect.left, e.clientY - rect.top);
            this.position = mousePos.add(this.dragOffset);

            // Keep node within SVG bounds
            this.position.x = Math.max(20, Math.min(rect.width - 20, this.position.x));
            this.position.y = Math.max(20, Math.min(rect.height - 20, this.position.y));

            // Update position
            this.updatePosition();
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.onDragEnd();
            }
        });
    }

    updatePosition() {
        // Update circle position
        this.circle.setAttribute("cx", this.position.x);
        this.circle.setAttribute("cy", this.position.y);
        
        // Update text position
        this.text.setAttribute("x", this.position.x);
        this.text.setAttribute("y", this.position.y);
    }

    // Method to apply a force vector
    applyForce(force) {
        this.force = this.force.add(force);
    }

    // Method to update physics
    updatePhysics(damping) {
        if (this.isDragging) {
            this.velocity = new Vector(0, 0);
            this.force = new Vector(0, 0);
            return;
        }

        // Update velocity with force
        this.velocity = this.velocity.add(this.force).multiply(damping);
        
        // Update position with velocity
        this.position = this.position.add(this.velocity);
        
        // Reset force
        this.force = new Vector(0, 0);
        
        // Update visual position
        this.updatePosition();
    }
}