class Graph {
    #assignedNodeIds;
    // #nodes;
    #edges;
    
    constructor(config) {
        this.svg = null;

        this.nodeLabel = 1;

        this.nodes = []; // Array of Node instances
        this.#edges = []; // Array of Edge instances

        this.selectedNode = null;
        this.isDragging = false;  // Track if any node is being dragged

        // Force simulation parameters
        this.springLength = 100;  // Desired length between connected nodes
        this.springStrength = 0.05;  // Spring force strength
        this.repulsionStrength = 1000;  // Repulsion force strength
        this.damping = 0.9;  // Velocity damping factor
        
        // Start animation loop
        this.startForceSimulation();
    }
    
    init() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute("width", 500);
        this.svg.setAttribute("height", 500);

        // Create groups for edges and nodes
        this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Add edges group first (so it's below), then nodes group
        this.svg.appendChild(this.edgesGroup);
        this.svg.appendChild(this.nodesGroup);
        
        // Add click listener to detect empty space clicks
        this.svg.addEventListener('click', (event) => {
            
            // Find the closest group element (if clicking on circle or text within node)
            const nodeGroup = event.target.closest('.node-group');
            
            if (event.target === this.svg) {
                if(this.selectedNode == null) {
                    // Click is on empty space
                    const rect = this.svg.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    this.handleEmptySpaceClick(x, y);
                } else {
                    this.selectedNode.svg.classList.remove("selected-node");
                    this.selectedNode = null;
                }
            } else if (nodeGroup) {
                // Find the Node instance that corresponds to this DOM element
                const clickedNode = this.nodes.find(node => node.svg === nodeGroup);
                
                if (this.selectedNode == null) {
                    this.selectedNode = clickedNode;
                    this.selectedNode.svg.classList.add("selected-node");
                } else {
                    this.addEdge(this.selectedNode, clickedNode);
                    this.selectedNode.svg.classList.remove("selected-node");
                    this.selectedNode = clickedNode;
                    this.selectedNode.svg.classList.add("selected-node");
                }
            }
        });
    }

    handleEmptySpaceClick(x, y) {
        this.addNode(x, y);
    }

    addNode(x, y) {
        const label = this.nodeLabel;
        this.nodeLabel++;

        const nodeInstance = new Node({
            x, 
            y, 
            label,
            onDragStart: () => {
                this.isDragging = true;
            },
            onDragEnd: () => {
                this.isDragging = false;
            },
            // onDragMove: () => {
            //     // Update edges when node moves
            //     this.updateEdges();
            // }
        });
        
        // Initialize velocity
        nodeInstance.vx = 0;
        nodeInstance.vy = 0;
        this.nodes.push(nodeInstance);
        this.nodesGroup.appendChild(nodeInstance.svg);
    }

    addEdge(node1, node2) {
        // Don't add edge if it's the same node
        if (node1 === node2) return;

        // Check if edge already exists between these nodes
        const edgeExists = this.#edges.some(edge => 
            (edge.node1 === node1 && edge.node2 === node2) || 
            (edge.node1 === node2 && edge.node2 === node1)
        );

        // Only add edge if it doesn't exist
        if (!edgeExists) {
            const edgeInstance = new Edge({node1, node2});
            this.#edges.push(edgeInstance);
            this.edgesGroup.appendChild(edgeInstance.svg);
        }
    }

    startForceSimulation() {
        console.log("starting force simulation");
        setInterval(() => this.updateForces(), 16); // ~60fps
    }

    updateForces() {
        // Skip if less than 2 nodes
        if (this.nodes.length < 2) return;

        // Calculate forces for each node
        this.nodes.forEach(node1 => {
            // Skip force calculation for dragged nodes
            if (node1.isDragging) return;

            node1.fx = 0;
            node1.fy = 0;
            node1.vx = node1.vx || 0;
            node1.vy = node1.vy || 0;

            // Apply repulsion forces between all nodes
            this.nodes.forEach(node2 => {
                if (node1 === node2) return;

                const dx = node2.x - node1.x;
                const dy = node2.y - node1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) return;

                // Repulsion force
                const force = this.repulsionStrength / (distance * distance);
                const forceX = (dx / distance) * force;
                const forceY = (dy / distance) * force;
                
                node1.fx -= forceX;
                node1.fy -= forceY;
            });

            // Apply spring forces for connected nodes
            this.#edges.forEach(edge => {
                if (edge.node1 === node1 || edge.node2 === node1) {
                    const otherNode = edge.node1 === node1 ? edge.node2 : edge.node1;
                    const dx = otherNode.x - node1.x;
                    const dy = otherNode.y - node1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance === 0) return;

                    // Spring force
                    const displacement = distance - this.springLength;
                    const force = displacement * this.springStrength;
                    const forceX = (dx / distance) * force;
                    const forceY = (dy / distance) * force;
                    
                    node1.fx += forceX;
                    node1.fy += forceY;
                }
            });

            // Update velocity and position only for non-dragged nodes
            node1.vx = (node1.vx + node1.fx) * this.damping;
            node1.vy = (node1.vy + node1.fy) * this.damping;

            // Update position
            node1.x += node1.vx;
            node1.y += node1.vy;

            // Keep nodes within bounds
            node1.x = Math.max(50, Math.min(450, node1.x));
            node1.y = Math.max(50, Math.min(450, node1.y));

            // Update node position in SVG
            node1.updatePosition();
        });

        // Update edge positions
        this.updateEdges();
    }

    updateEdges() {
        this.#edges.forEach(edge => edge.update(this.#edges, this.nodes));
    }
}