import { setup_temperature_on_select } from "../components/llm_models_loader.js";

export class InputsBinder {
    constructor() {}
    bind() {
        setup_temperature_on_select();
        let user_input_resizer = new UserInputResizer();
        user_input_resizer.bind();
        let chat_session_container_resize_binder =
            new ChatSessionContainerResizeBinder();
        chat_session_container_resize_binder.bind();
        let chat_history_sidebar_resize_binder =
            new ChatHistorySidebarResizeBinder();
        chat_history_sidebar_resize_binder.bind();
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
        $(window).resize(this.resize.bind(this));
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

class ChatHistorySidebarResizeBinder {
    constructor() {
        this.USER_INTERACTIONS_MAX_WIDTH = 900;
        this.SIDEBAR_GAP = 20;
        this.SIDEBAR_MAX_WIDTH = 300;
        this.SIDEBAR_MIN_WIDTH = 120;
    }
    bind() {
        this.resize();
        $(window).resize(this.resize.bind(this));
    }
    get_window_width() {
        return $(window).width();
    }
    get_user_interations_width() {
        return $("#user-interactions").width();
    }
    get_side_margin() {
        return (
            (this.get_window_width() - this.get_user_interations_width()) / 2 -
            this.SIDEBAR_GAP
        );
    }
    need_to_show() {
        let sidebar = $("#chat-history-sidebar");
        return (
            !sidebar.hasClass("show") &&
            localStorage.getItem("show_chat_history_sidebar") === "true"
        );
    }
    resize() {
        let sidebar = $("#chat-history-sidebar");
        let is_sidebar_show = sidebar[0].classList.contains("show");
        if (this.get_side_margin() >= this.SIDEBAR_MAX_WIDTH) {
            if (this.need_to_show()) {
                sidebar.addClass("show");
            }
            sidebar.css("max-width", this.SIDEBAR_MAX_WIDTH + "px");
            sidebar.css("min-width", this.SIDEBAR_MIN_WIDTH + "px");
        } else if (this.get_side_margin() <= this.SIDEBAR_MIN_WIDTH) {
            if (is_sidebar_show) {
                sidebar.removeClass("show");
            }
            sidebar.css("max-width", this.SIDEBAR_MAX_WIDTH + "px");
            sidebar.css("min-width", this.SIDEBAR_MIN_WIDTH + "px");
        } else {
            if (this.need_to_show()) {
                sidebar.addClass("show");
            }
            sidebar.css("max-width", this.get_side_margin());
            sidebar.css("min-width", this.SIDEBAR_MIN_WIDTH + "px");
        }
    }
}
