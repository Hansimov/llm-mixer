import { ChatCompletionsRequester } from "../networks/llm_requester.js";
import {
    stop_latest_message_animation,
    start_latest_message_animation,
    create_new_chat_session,
    get_latest_message_content_displayer,
} from "./chat_operator.js";
import { setup_available_models_on_select } from "./llm_models_loader.js";

import { screen_scroller } from "../storage/states.js";

export class ButtonsBinder {
    constructor() { }
    bind() {
        let send_user_input_binder = new SendUserInputButtonBinder();
        send_user_input_binder.bind();
        let new_chat_binder = new NewChatButtonBinder();
        new_chat_binder.bind();
        let openai_endpoint_binder = new OpenaiEndpointButtonBinder();
        openai_endpoint_binder.bind();
        let openai_api_key_binder = new OpenaiAPIKeyButtonBinder();
        openai_api_key_binder.bind();
        let show_endpoint_and_key_binder = new ShowEndpointAndKeyButtonBinder();
        show_endpoint_and_key_binder.bind();
        let scroll_to_bottom_binder = new ScrollToBottomButtonBinder();
        scroll_to_bottom_binder.bind();
        let screenshot_button_binder = new ScreenshotButtonBinder();
        screenshot_button_binder.bind();
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

    async post_user_input() {
        let user_input_content = $("#user-input").val();
        console.log(user_input_content);
        this.requester = new ChatCompletionsRequester(user_input_content);
        this.requester.create_messager_components();
        start_latest_message_animation();
        await this.requester.post();
    }

    async send(button) {
        console.log("Send");
        let button_icon = button.find("i");
        button.attr("status", "stop").attr("title", "Stop");
        button_icon.removeClass().addClass("fa fa-circle-pause fa-fade-fast");
        await this.post_user_input();
        await this.stop(button);
    }
    async stop(button) {
        console.log("Stop");
        let button_icon = button.find("i");
        this.requester.stop();
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
    constructor() { }
    bind() {
        const button = $("#new-chat-session");
        button.attr("status", "new").attr("title", "New Chat");
        button.click(() => {
            create_new_chat_session();
        });
    }
}

class OpenaiEndpointButtonBinder {
    constructor() { }
    bind() {
        const button = $("#openai-endpoint-button");
        button.attr("title", "Submit Endpoint");
        const stored_openai_endpoint = localStorage.getItem("openai_endpoint");
        if (stored_openai_endpoint) {
            $("#openai-endpoint").val(stored_openai_endpoint);
            setup_available_models_on_select();
            console.log(`GET OpenAI Endpoint: ${stored_openai_endpoint}`);
        }
        button.click(() => {
            console.log($("#openai-endpoint").val());
            localStorage.setItem(
                "openai_endpoint",
                $("#openai-endpoint").val()
            );
            setup_available_models_on_select();
        });
    }
}

class OpenaiAPIKeyButtonBinder {
    constructor() { }
    bind() {
        const button = $("#openai-api-key-button");
        button.attr("title", "Submit API Key");
        const stored_openai_api_key = localStorage.getItem("openai_api_key");
        if (stored_openai_api_key) {
            $("#openai-api-key").val(stored_openai_api_key);
            console.log(`GET OpenAI API Key: ${stored_openai_api_key}`);
        }
        button.click(() => {
            console.log($("#openai-api-key").val());
            localStorage.setItem("openai_api_key", $("#openai-api-key").val());
        });
    }
}

class ShowEndpointAndKeyButtonBinder {
    constructor() { }
    bind() {
        const button = $("#show-endpoint-and-key-button");
        button.attr("title", "Show endpoint and api key");

        if (localStorage.getItem("openai_endpoint")) {
            $("#openai-endpoint").parent().hide();
            $("#openai-endpoint-button").parent().hide();
        }

        if (localStorage.getItem("openai_api_key")) {
            $("#openai-api-key").parent().hide();
            $("#openai-api-key-button").parent().hide();
        }

        button.click(() => {
            $("#openai-endpoint").parent().toggle();
            $("#openai-endpoint-button").parent().toggle();
            $("#openai-api-key").parent().toggle();
            $("#openai-api-key-button").parent().toggle();
        });
    }
}

class ScrollToBottomButtonBinder {
    constructor() { }
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
    constructor() { }
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

class AvailableModelsSelectBinder {
    constructor() { }
    bind() {
        const select = $("#available-models-select");
        select.change(() => {
            console.log(select.val());
            localStorage.setItem("default_model", select.val());
        });
    }
}
