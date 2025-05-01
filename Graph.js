class Graph {
    #assignedNodeIds;
    // #nodes;
    #edges;
    
    constructor() {
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
        
        // Initialize the graph
        this.init();
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
            }
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

            // Apply repulsion forces between all nodes
            this.nodes.forEach(node2 => {
                if (node1 === node2) return;

                const diff = node2.position.subtract(node1.position);
                const distance = diff.magnitude();
                
                if (distance === 0) return;

                // Repulsion force
                const force = diff.normalize().multiply(-this.repulsionStrength / (distance * distance));
                node1.applyForce(force);
            });

            // Apply spring forces for connected nodes
            this.#edges.forEach(edge => {
                if (edge.node1 === node1 || edge.node2 === node1) {
                    const otherNode = edge.node1 === node1 ? edge.node2 : edge.node1;
                    const diff = otherNode.position.subtract(node1.position);
                    const distance = diff.magnitude();
                    
                    if (distance === 0) return;

                    // Spring force
                    const displacement = distance - this.springLength;
                    const springForce = diff.normalize().multiply(displacement * this.springStrength);
                    node1.applyForce(springForce);
                }
            });

            // Update physics
            node1.updatePhysics(this.damping);

            // Keep nodes within bounds
            node1.position.x = Math.max(50, Math.min(450, node1.position.x));
            node1.position.y = Math.max(50, Math.min(450, node1.position.y));
        });

        // Update edge positions
        this.updateEdges();
    }

    updateEdges() {
        this.#edges.forEach(edge => edge.update(this.#edges, this.nodes));
    }
}