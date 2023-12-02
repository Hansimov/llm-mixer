import {
    setup_hardcoded_available_models_on_select,
    setup_temperature_on_select,
} from "../components/llm_models_loader.js";

export class InputsBinder {
    constructor() {}
    bind() {
        setup_hardcoded_available_models_on_select();
        setup_temperature_on_select();
        let user_input_resizer = new UserInputResizer();
        user_input_resizer.bind();
        let chat_session_container_resize_binder =
            new ChatSessionContainerResizeBinder();
        chat_session_container_resize_binder.bind();
    }
}

class UserInputResizer {
    constructor() {}
    bind() {
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
}

class ChatSessionContainerResizeBinder {
    constructor() {}
    bind() {
        this.resize();
        $(window).on("resize", this.resize);
    }
    resize() {
        let user_interaction_height = $("#user-interactions").outerHeight(true);
        let page_height = $(window).height();
        $("#chat-session-container").css(
            "max-height",
            page_height - user_interaction_height + "px"
        );
    }
}
