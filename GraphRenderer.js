class GraphRenderer {
    constructor(config) {
        this.graphDiv = config.graphDiv;

        this.graphEditor = null;
    }

    init() {
        this.graphEditor = new GraphEditor({
            graphDiv: this.graphDiv
        });
        this.graphEditor.init();
    }
}