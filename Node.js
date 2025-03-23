class Node {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.label = config.label || "";
        this.onDragStart = config.onDragStart || (() => {});
        this.onDragEnd = config.onDragEnd || (() => {});

        this.svg = null;
        this.circle = null;  // Store reference to circle
        this.text = null;    // Store reference to text

        // Dragging state
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };

        this.#init();
    }

    #init() {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute("class", "node-group");
        group.setAttribute("cursor", "pointer");

        this.circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.circle.setAttribute("cx", this.x);
        this.circle.setAttribute("cy", this.y);
        this.circle.setAttribute("r", 19);
        this.circle.setAttribute("fill", "white");
        this.circle.setAttribute("stroke", "black");
        this.circle.setAttribute("stroke-width", "2");

        this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.text.setAttribute("x", this.x);
        this.text.setAttribute("y", this.y);
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
            this.dragOffset.x = this.x - (e.clientX - rect.left);
            this.dragOffset.y = this.y - (e.clientY - rect.top);
            
            // Prevent text selection during drag
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const rect = this.svg.ownerSVGElement.getBoundingClientRect();
            this.x = e.clientX - rect.left + this.dragOffset.x;
            this.y = e.clientY - rect.top + this.dragOffset.y;

            // Keep node within SVG bounds
            this.x = Math.max(20, Math.min(rect.width - 20, this.x));
            this.y = Math.max(20, Math.min(rect.height - 20, this.y));

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
        this.circle.setAttribute("cx", this.x);
        this.circle.setAttribute("cy", this.y);
        
        // Update text position
        this.text.setAttribute("x", this.x);
        this.text.setAttribute("y", this.y);
    }
}