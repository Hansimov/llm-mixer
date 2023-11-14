import {
    setup_available_models_on_select,
    setup_temperature_on_select,
} from "./components/llm_models_loader.js";
import { bind_chat_buttons } from "./components/buttons_binder.js";

function auto_resize_user_input() {
    // https://stackoverflow.com/questions/37629860/automatically-resizing-textarea-in-bootstrap
    document.getElementById("user-input").addEventListener(
        "input",
        function () {
            this.style.height = 0;
            this.style.height = this.scrollHeight + 3 + "px";
        },
        false
    );
}

function load_live_js() {
    if (window.location.protocol !== "https:") {
        var script = document.createElement("script");
        script.src = "./common/live.js";
        document.head.appendChild(script);
    }
}

function setup_interactive_components() {
    setup_available_models_on_select();
    setup_temperature_on_select();
    auto_resize_user_input();
    bind_chat_buttons();
    adjust_messagers_container_max_height();
    $(window).on("resize", adjust_messagers_container_max_height);
}

function adjust_messagers_container_max_height() {
    var user_interaction_height = $("#user-interactions").outerHeight(true);
    var page_height = $(window).height();
    $("#chat-session-container").css(
        "max-height",
        page_height - user_interaction_height + "px"
    );
}

$(document).ready(function () {
    load_live_js();
    setup_interactive_components();
});
