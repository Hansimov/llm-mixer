import {
    available_models,
    AvailableModelsRequester,
} from "../networks/llm_requester.js";

class EndpointStorageItem { }

class EndpointStorage {
    constructor() {
        this.init_database();
        this.create_endpoint_and_api_key_items();
        this.fill_available_models_select("user-customized");
    }
    init_database() {
        this.db = new Dexie("endpoints");
        this.db.version(1).stores({
            endpoints: "index, endpoint, api_key",
        });
        this.db.endpoints.count((count) => {
            console.log(`${count} endpoints loaded.`);
        });
    }
    clear_database() {
        this.db.endpoints.clear();
        console.log("endpoints cleared.");
    }
    get_endpoint_and_api_key_item_html() {
        let endpoint_and_api_key_item_html = `
            <div class="row mt-2 no-gutters">
                <div class="col-auto">
                    <button class="btn px-0 remove-endpoint-button">
                        <i class="fa fa-circle-minus"></i>
                    </button>
                </div>
                <div class="col pl-0">
                    <input class="form-control endpoint-input" rows="1"
                        placeholder="Input Endpoint URL"
                    ></input>
                </div>
                <div class="col pl-0">
                    <input class="form-control api-key-input" rows="1"
                        placeholder="Input API Key, then click √"
                    ></input>
                </div>
                <div class="col-auto px-0">
                    <button class="btn submit-endpoint-button">
                        <i class="fa fa-check"></i>
                    </button>
                </div>
            </div>
        `;
        return endpoint_and_api_key_item_html;
    }
    add_endpoint_and_api_key_item() {
        let endpoint_and_api_key_items = $("#endpoint-and-api-key-items");
        let endpoint_and_api_key_item = $(
            this.get_endpoint_and_api_key_item_html()
        );
        endpoint_and_api_key_items.prepend(endpoint_and_api_key_item);
        this.bind_endpoint_and_api_key_buttons(endpoint_and_api_key_item);
    }
    create_endpoint_and_api_key_items() {
        let endpoint_and_api_key_items = $("#endpoint-and-api-key-items");
        let endpoints = this.db.endpoints;
        endpoint_and_api_key_items.empty();

        endpoints.each((row) => {
            let endpoint_and_api_key_item_html =
                this.get_endpoint_and_api_key_item_html();
            let endpoint_and_api_key_item = $(endpoint_and_api_key_item_html);
            let endpoint_input =
                endpoint_and_api_key_item.find(".endpoint-input");
            endpoint_input.val(row.endpoint);
            let api_key_input =
                endpoint_and_api_key_item.find(".api-key-input");
            api_key_input.val(row.api_key);
            endpoint_and_api_key_items.prepend(endpoint_and_api_key_item);
            this.bind_endpoint_and_api_key_buttons(endpoint_and_api_key_item);
        });
        endpoints.each((row) => {
            this.fill_available_models_select(row.endpoint);
        });
    }
    bind_endpoint_and_api_key_buttons(endpoint_and_api_key_item) {
        let self = this;
        // console.log("endpoint_and_api_key_item:", endpoint_and_api_key_item);
        let endpoint_submit_button = endpoint_and_api_key_item.find(
            ".submit-endpoint-button"
        );
        endpoint_submit_button.click(function () {
            let endpoint_input =
                endpoint_and_api_key_item.find(".endpoint-input");
            let endpoint_input_value = endpoint_input.val().trim();
            let api_key_input =
                endpoint_and_api_key_item.find(".api-key-input");
            let api_key_input_value = api_key_input.val().trim();

            if (endpoint_input_value.trim() === "") {
                console.log("Endpoint is empty.");
                return;
            } else {
                self.db.endpoints.put({
                    index: endpoint_input_value,
                    endpoint: endpoint_input_value,
                    api_key: api_key_input_value,
                });
                console.log(`new_endpoint: ${endpoint_input_value}`);
            }
            self.fill_available_models_select(endpoint_input_value);
        });

        let remove_endpoint_buttons = endpoint_and_api_key_item.find(
            ".remove-endpoint-button"
        );
        remove_endpoint_buttons.click(function () {
            let endpoint_input =
                endpoint_and_api_key_item.find(".endpoint-input");
            let endpoint_input_value = endpoint_input.val();
            endpoint_and_api_key_item.remove();
            if (
                endpoint_input_value.trim() === "" ||
                self.db.endpoints.get(endpoint_input_value) === undefined
            ) {
                console.log("Endpoint not in endpoints");
            } else {
                self.db.endpoints.delete(endpoint_input_value);
            }
            console.log(`remove endpoint: ${endpoint_input_value}`);

            // TODO: remove models of current endpoint from available_models_select
        });
    }
    async fill_available_models_select(endpoint) {
        var select = $("#available-models-select");
        console.log("fetch available models for endpoint:", endpoint);
        // if endpoint not starts with http
        if (endpoint.startsWith("http")) {
            let available_models_requester = new AvailableModelsRequester(endpoint);
            await available_models_requester.get();
        } else {
        }
        available_models[endpoint].forEach((value, index) => {
            const option = new Option(value, value);
            select.append(option);
        });

        let flatten_available_models = [];
        Object.entries(available_models).forEach(([key, value]) => {
            flatten_available_models.push(...value);
        });
        flatten_available_models = [...new Set(flatten_available_models)];
        // console.log("flatten_available_models:", flatten_available_models);

        // set default model
        let default_model = "";
        let storage_default_model = localStorage.getItem("default_model");
        console.log("storage_default_model:", storage_default_model);
        if (
            storage_default_model &&
            flatten_available_models.includes(storage_default_model)
        ) {
            default_model = storage_default_model;
        } else if (flatten_available_models) {
            default_model = flatten_available_models[0];
            localStorage.setItem("default_model", default_model);
        } else {
            default_model = "";
        }
        select.val(default_model);
        console.log(`default_model: ${select.val()}`);
    }
}

export let endpoint_storage = new EndpointStorage();
