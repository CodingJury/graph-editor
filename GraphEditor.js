class GraphEditor {
    constructor(config) {
        this.graphDiv = config.graphDiv;

        this.graph = new Graph();
        this.graph.init();

        this.graphDiv.appendChild(this.graph.svg); // Add the graph SVG to the graph editor
    }
    
    init() {
        this.graph.addNode(200, 200);
        this.graph.addNode(330, 70);
        this.graph.addNode(200, 300);
        this.graph.addNode(400, 200);

        this.graph.addEdge(this.graph.nodes[0], this.graph.nodes[1]);
        this.graph.addEdge(this.graph.nodes[0], this.graph.nodes[2]);
        this.graph.addEdge(this.graph.nodes[1], this.graph.nodes[3]);
        this.graph.addEdge(this.graph.nodes[2], this.graph.nodes[3]);
    }
}