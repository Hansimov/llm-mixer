import {
    jsonize_stream_data,
    stringify_stream_bytes,
} from "../converters/stream_jsonizer.js";
import {
    update_message,
    create_messager,
    get_request_messages,
    get_selected_llm_model,
    get_selected_temperature,
} from "../components/chat_operator.js";

function concat_urls(...urls) {
    let new_url = urls
        .map((url) => url.replace(/^\/|\/$/g, ""))
        .filter((url) => url !== "")
        .join("/");
    console.log(new_url);
    return new_url;
}

export class ChatCompletionsRequester {
    constructor(
        prompt,
        model = null,
        temperature = null,
        openai_endpoint = null
    ) {
        this.prompt = prompt;
        this.model = model || get_selected_llm_model() || "gpt-turbo-3.5";
        this.temperature =
            temperature !== null ? temperature : get_selected_temperature();

        this.openai_endpoint =
            openai_endpoint || localStorage.getItem("openai_endpoint");
        this.backend_request_endpoint = "/chat/completions";
        this.controller = new AbortController();
    }
    construct_openai_request_headers() {
        this.backend_request_headers = {
            "Content-Type": "application/json",
        };
        this.openai_request_headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("openai_api_key")}`,
        };
    }
    construct_backend_request_body() {
        this.openai_request_messages = get_request_messages();
        this.backend_request_body = {
            openai_endpoint: this.openai_endpoint,
            openai_request_method: "POST",
            openai_request_headers: this.openai_request_headers,
            openai_request_body: {
                model: this.model,
                messages: this.openai_request_messages,
                temperature: this.temperature,
                stream: true,
            },
        };
    }
    construct_request_params() {
        this.construct_openai_request_headers();
        this.construct_backend_request_body();
        this.backend_request_params = {
            method: "POST",
            headers: this.backend_request_headers,
            body: JSON.stringify(this.backend_request_body),
            signal: this.controller.signal,
            stream: true,
        };
    }
    create_messager_components() {
        create_messager("user", this.prompt);
        create_messager("assistant", "", this.model, this.temperature);
    }
    post() {
        this.construct_request_params();
        return fetch(this.backend_request_endpoint, this.backend_request_params)
            .then((response) => response.body)
            .then((rb) => {
                const reader = rb.getReader();
                return reader.read().then(function process({ done, value }) {
                    if (done) {
                        return;
                    }
                    let json_chunks = jsonize_stream_data(
                        stringify_stream_bytes(value)
                    );
                    update_message(json_chunks);
                    return reader.read().then(process);
                });
            })
            .catch((error) => console.error("Error:", error));
    }
    stop() {
        this.controller.abort();
    }
}

export var available_models = [];
export function request_available_models() {
    var url = "https://magic-api.ninomae.live/v1/models";
    let request_options = {
        method: "GET",
    };
    return fetch(url, request_options)
        .then((response) => response.json())
        .then((response_json) => {
            response_json.data.forEach((item) => {
                available_models.push(item.id);
            });
            available_models.sort();
            console.log(available_models);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
