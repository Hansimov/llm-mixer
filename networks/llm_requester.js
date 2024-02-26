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
    constructor({
        prompt,
        model = null,
        temperature = 0.5,
        top_p = 0.95,
        openai_endpoint = null,
    } = {}) {
        this.prompt = prompt;
        this.openai_endpoint =
            openai_endpoint || this.extract_endpoint_and_model()[0];
        this.model = model || this.extract_endpoint_and_model()[1];
        this.temperature = temperature;
        this.top_p = top_p;
        this.backend_request_endpoint = "/chat/completions";
        this.controller = new AbortController();
    }
    extract_endpoint_and_model() {
        let model_id_with_endpoint = get_selected_llm_model();
        this.openai_endpoint = model_id_with_endpoint.split("|")[0];
        this.model = model_id_with_endpoint.split("|")[1];
        return [this.openai_endpoint, this.model];
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
                top_p: this.top_p,
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

// export var available_models = { "user-customized": ["notes"] };
export class AvailableModelsRequester {
    constructor(openai_endpoint) {
        this.openai_endpoint = openai_endpoint;
        this.backend_request_endpoint = "/models";
        this.controller = new AbortController();
        this.available_models = [];
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
    async get() {
        this.construct_request_params();
        return fetch(this.backend_request_endpoint, this.backend_request_params)
            .then((response) => response.json())
            .then((response_json) => {
                let data = response_json.data;
                data.forEach((item) => {
                    if (!this.available_models.includes(item.id)) {
                        this.available_models.push(item.id);
                    }
                });
                console.log(
                    `get available_models of ${this.openai_endpoint}:`,
                    this.available_models
                );
                return this.available_models;
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
    stop() {
        this.controller.abort();
    }
}
