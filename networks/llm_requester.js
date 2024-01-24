import {
    jsonize_stream_data,
    stringify_stream_bytes,
} from "./stream_jsonizer.js";
import {
    update_message,
    create_messager,
    get_request_messages,
    get_selected_llm_model,
    get_selected_temperature,
} from "../components/chat_operator.js";

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
            openai_endpoint || get_endpoint_by_model(this.model);
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
    async post() {
        this.construct_request_params();
        const response = await fetch(
            this.backend_request_endpoint,
            this.backend_request_params
        );
        const reader = response.body.getReader();
        let buffer = "";
        return reader.read().then(function process({ done, value }) {
            if (done) {
                return;
            }
            buffer += stringify_stream_bytes(value);
            let boundary = buffer.lastIndexOf("\n");
            if (boundary !== -1) {
                let input = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 1);
                let json_chunks = jsonize_stream_data(input);
                update_message(json_chunks);
            }
            return reader.read().then(process);
        });
    }
    stop() {
        this.controller.abort();
    }
}

export var available_models = { "user-customized": ["notes"] };
export class AvailableModelsRequester {
    constructor(openai_endpoint) {
        this.openai_endpoint = openai_endpoint;
        this.backend_request_endpoint = "/models";
        this.controller = new AbortController();
    }
    construct_openai_request_headers() {
        this.backend_request_headers = {
            "Content-Type": "application/json",
        };
        this.openai_request_headers = {
            "Content-Type": "application/json",
        };
    }
    construct_backend_request_body() {
        this.backend_request_body = {
            openai_endpoint: this.openai_endpoint,
            openai_request_method: "GET",
            openai_request_headers: this.openai_request_headers,
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
        };
    }
    get() {
        this.construct_request_params();
        return fetch(this.backend_request_endpoint, this.backend_request_params)
            .then((response) => response.json())
            .then((response_json) => {
                let data = response_json.data;
                if (!(this.openai_endpoint in available_models)) {
                    available_models[this.openai_endpoint] = [];
                }
                data.forEach((item) => {
                    if (
                        !available_models[this.openai_endpoint].includes(
                            item.id
                        )
                    ) {
                        available_models[this.openai_endpoint].push(item.id);
                    }
                });
                console.log("available_models:", available_models);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    stop() {
        this.controller.abort();
    }
}

export function get_endpoint_by_model(model) {
    let endpoint = "";
    Object.entries(available_models).forEach(([key, value]) => {
        if (value.includes(model)) {
            endpoint = key;
            return endpoint;
        }
    });
    return endpoint;
}
