import {
    jsonize_stream_data,
    stringify_stream_bytes,
} from "./stream_jsonizer.js";
import {
    update_message,
    create_messager,
    get_request_messages,
    ContentDisplayerUpdater,
} from "../components/chat_operator.js";

import { get_current_agent_info } from "../storages/agent_storage.js";

export class ChatCompletionsRequester {
    constructor({
        prompt,
        model = null,
        openai_endpoint = null,
        temperature = null,
        top_p = null,
        max_output_tokens = null,
    } = {}) {
        this.agent_info = get_current_agent_info();
        console.log("agent_info:", this.agent_info);
        this.prompt = prompt;
        this.model_id_with_endpoint = this.agent_info.model;
        this.openai_endpoint =
            openai_endpoint || this.extract_openai_endpoint_and_model()[0];
        this.model = model || this.extract_openai_endpoint_and_model()[1];
        this.system_prompt = this.agent_info.system_prompt;
        this.temperature = temperature || this.agent_info.temperature;
        this.top_p = top_p || this.agent_info.top_p;
        this.max_output_tokens =
            max_output_tokens || this.agent_info.max_output_tokens;
        this.backend_request_endpoint = "/chat/completions";
        this.controller = new AbortController();
    }
    extract_openai_endpoint_and_model() {
        let openai_endpoint = this.model_id_with_endpoint.split("|")[0];
        let model = this.model_id_with_endpoint.split("|")[1];
        return [openai_endpoint, model];
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
        this.system_message = {
            role: "system",
            content: this.system_prompt,
        };
        this.openai_request_messages.unshift(this.system_message);
        this.backend_request_body = {
            openai_endpoint: this.openai_endpoint,
            openai_request_method: "POST",
            openai_request_headers: this.openai_request_headers,
            openai_request_body: {
                model: this.model,
                messages: this.openai_request_messages,
                temperature: this.temperature,
                top_p: this.top_p,
                max_tokens: this.max_output_tokens,
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
        create_messager({
            role: "user",
            content: this.prompt,
            model: "",
            nickname: "You",
        });
        create_messager({
            role: "assistant",
            content: "",
            model: this.model,
            nickname: `${this.agent_info.name} (${this.model})`,
        });
    }
    async handle_read_stream_data(reader, buffer = "") {
        const { done, value } = await reader.read();
        if (done && buffer.length === 0) {
            return;
        }
        buffer += done ? "" : stringify_stream_bytes(value);
        let new_line_index;
        while ((new_line_index = buffer.indexOf("\n")) !== -1) {
            let json_line = buffer.slice(0, new_line_index);
            buffer = buffer.slice(new_line_index + 1);
            try {
                let json_chunks = jsonize_stream_data(json_line);
                if (!this.content_displayer_updater) {
                    this.content_displayer_updater =
                        new ContentDisplayerUpdater();
                }
                update_message(json_chunks, this.content_displayer_updater);
            } catch (e) {
                console.warn("Invalid JSON:", json_line);
            }
        }
        return this.handle_read_stream_data(reader, buffer);
    }
    async post() {
        this.construct_request_params();
        let response = await fetch(
            this.backend_request_endpoint,
            this.backend_request_params
        );
        let reader = response.body.getReader();
        return this.handle_read_stream_data(reader);
    }
    stop() {
        this.controller.abort();
    }
}

export class AvailableModelsRequester {
    constructor(openai_endpoint, openai_api_key = null) {
        this.openai_endpoint = openai_endpoint;
        this.openai_api_key = openai_api_key;
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
        if (this.openai_api_key) {
            this.openai_request_headers[
                "Authorization"
            ] = `Bearer ${this.openai_api_key}`;
        }
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
