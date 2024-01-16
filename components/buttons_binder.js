import { ChatCompletionsRequester } from "../networks/llm_requester.js";
import {
    stop_latest_message_animation,
    start_latest_message_animation,
    create_new_chat_session,
    get_latest_message_content_displayer,
    get_selected_llm_model,
    create_messager,
} from "./chat_operator.js";
import { setup_available_models_on_select } from "./llm_models_loader.js";

import { screen_scroller } from "./screen_scroller.js";
import { chat_history_storer } from "../networks/chat_history_storer.js";
import { endpoint_storage } from "../networks/endpoint_storage.js";

export class ButtonsBinder {
    constructor() {}
    bind() {
        let send_user_input_binder = new SendUserInputButtonBinder();
        send_user_input_binder.bind();
        let new_chat_binder = new NewChatButtonBinder();
        new_chat_binder.bind();
        let toggle_endpoint_and_api_key_items_button_binder =
            new ToggleEndpointAndApiKeyItemsButtonBinder();
        toggle_endpoint_and_api_key_items_button_binder.bind();
        let add_endpoint_and_api_key_item_button_binder =
            new AddEndpointAndApiKeyItemButtonBinder();
        add_endpoint_and_api_key_item_button_binder.bind();
        let scroll_to_bottom_binder = new ScrollToBottomButtonBinder();
        scroll_to_bottom_binder.bind();
        let screenshot_button_binder = new ScreenshotButtonBinder();
        screenshot_button_binder.bind();
        let chat_history_sidebar_toggle_button_binder =
            new ChatHistorySidebarToggleButtonBinder();
        chat_history_sidebar_toggle_button_binder.bind();
        let clear_chat_history_button_binder =
            new ClearChatHistoryButtonBinder();
        clear_chat_history_button_binder.bind();
        let available_models_select_binder = new AvailableModelsSelectBinder();
        available_models_select_binder.bind();
    }
}

class SendUserInputButtonBinder {
    constructor() {
        this.requester = null;
    }
    bind() {
        const button = $("#send-user-input");
        button.attr("status", "send").attr("title", "Send");
        button.click(async () => {
            await this.handle_user_input(button);
        });

        $("#user-input").keypress(async (event) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                button.attr("status") === "send"
            ) {
                event.preventDefault();
                await this.send(button);
            }
        });
    }
    async handle_user_input(button) {
        let user_input_content = $("#user-input").val();
        if (user_input_content === "") {
            return;
        }
        let status = button.attr("status");
        if (status === "send") {
            this.send(button);
        } else if (status === "stop") {
            this.stop(button);
            return;
        } else {
            console.log("No action");
        }
    }

    async send(button) {
        // console.log("Send");
        let button_icon = button.find("i");
        button.attr("status", "stop").attr("title", "Stop");
        button_icon.removeClass().addClass("fa fa-circle-pause fa-fade-fast");
        await this.post_user_input();
        await this.stop(button);
    }

    async post_user_input() {
        let user_input_content = $("#user-input").val();
        console.log(user_input_content);
        if (get_selected_llm_model() == "notes") {
            create_messager("user", user_input_content);
        } else {
            this.requester = new ChatCompletionsRequester(user_input_content);
            this.requester.create_messager_components();
            start_latest_message_animation();
            await this.requester.post();
            this.requester.stop();
        }
    }

    async stop(button) {
        // console.log("Stop");
        let button_icon = button.find("i");
        stop_latest_message_animation();
        button.attr("status", "send").attr("title", "Send");
        button_icon
            .removeClass()
            .addClass("fa fa-paper-plane")
            .addClass("icon-success");
        hljs.highlightAll();
        console.log(get_latest_message_content_displayer().data("raw_content"));
        screen_scroller.set_user_scrolling(false);
    }
}

class NewChatButtonBinder {
    constructor() {}
    bind() {
        const button = $("#new-chat-session");
        button.attr("status", "new").attr("title", "New Chat");
        button.click(() => {
            chat_history_storer.save_current_chat_session();
            create_new_chat_session();
        });
    }
}

class ToggleEndpointAndApiKeyItemsButtonBinder {
    constructor() {}
    bind() {
        const button = $("#toggle-endpoint-and-api-key-items-button");
        button.attr("title", "Toggle endpoint and api key items");
        button.click(() => {
            $("#endpoint-and-api-key-items").toggle();
        });
    }
}
class AddEndpointAndApiKeyItemButtonBinder {
    constructor() {}
    bind() {
        const button = $("#add-endpoint-and-api-key-item-button");
        button.attr("title", "Add endpoint and api key item");
        button.click(() => {
            endpoint_storage.add_endpoint_and_api_key_item();
        });
    }
}

class ScrollToBottomButtonBinder {
    constructor() {}
    bind() {
        const button = $("#scroll-to-bottom-button");
        button.attr("title", "Scroll to bottom");
        button.click(() => {
            screen_scroller.set_user_scrolling(false);
            screen_scroller.scroll_to_bottom(true);
        });
    }
}

class ScreenshotButtonBinder {
    constructor() {}
    bind() {
        const button = $("#screenshot-button");
        button.attr("title", "Take screenshot for whole chat");
        button.click(() => {
            let screenshot_padding = 20;
            // default padding is 0.75em (12px)
            // p-1 (4px)(0.25em); p-2 (8px)(0.5em); p-3 (16px)(1em);
            let container_padding = 12;
            let right_offset = 20;
            html2canvas($("#messagers-container")[0], {
                x: -(container_padding + screenshot_padding),
                width:
                    $("#messagers-container").width() +
                    container_padding * 2 +
                    screenshot_padding * 2 +
                    right_offset,
            }).then((canvas) => {
                var link = document.createElement("a");
                let date = new Date();
                let date_string = date.toISOString().split("T")[0];
                let time_string = date
                    .toTimeString()
                    .split(" ")[0]
                    .replace(/:/g, "-");
                let datetime_string = `${date_string}_${time_string}`;
                link.download = `chat_${datetime_string}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            });
        });
    }
}

class ChatHistorySidebarToggleButtonBinder {
    constructor() {}
    get_show_sidebar_storage() {
        return localStorage.getItem("show_chat_history_sidebar");
    }
    bind() {
        const sidebar = $("#chat-history-sidebar");

        // this line is not to check value as false,
        // but to check item not existed in localStorage
        if (!this.get_show_sidebar_storage()) {
            localStorage.setItem("show_chat_history_sidebar", "true");
        }
        if (this.get_show_sidebar_storage() === "true") {
            sidebar.addClass("show");
        }

        const toggle_button = $("#chat-history-sidebar-toggle-button");
        toggle_button.click(() => {
            sidebar.toggleClass("show");
            localStorage.setItem(
                "show_chat_history_sidebar",
                sidebar.hasClass("show").toString()
            );
        });

        const close_button = $("#chat-history-sidebar-close-button");
        close_button.click(() => {
            sidebar.removeClass("show");
            localStorage.setItem("show_chat_history_sidebar", "false");
        });
    }
}

class ClearChatHistoryButtonBinder {
    constructor() {}
    bind() {
        const button = $("#clear-chat-history-button");
        button.attr("title", "Clear chat history");
        button.click(() => {
            chat_history_storer.clear_database();
        });
    }
}

class AvailableModelsSelectBinder {
    constructor() {}
    bind() {
        const select = $("#available-models-select");
        select.change(() => {
            console.log(select.val());
            localStorage.setItem("default_model", select.val());
        });
    }
}
