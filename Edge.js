class Edge {
    constructor(config) {
        this.node1 = config.node1;
        this.node2 = config.node2;

        // this.label = config.label || "";

        this.svg = null;

        this.#init();
    }

    #init() {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const d = `M ${this.node1.x} ${this.node1.y} L ${this.node2.x} ${this.node2.y}`;
        path.setAttribute("d", d);

        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");

        this.svg = path;
    }

    update() {
        const newPath = `M ${this.node1.x} ${this.node1.y} L ${this.node2.x} ${this.node2.y}`;
        // console.log('Edge updating:', newPath);
        this.svg.setAttribute("d", newPath);
    }
}