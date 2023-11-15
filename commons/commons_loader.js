export class CommonsLoader {
    constructor() {}
    load() {
        load_live_js();
    }
}

function load_live_js() {
    if (window.location.protocol !== "https:") {
        var script = document.createElement("script");
        script.src = "./commons/live.js";
        document.head.appendChild(script);
    }
}
