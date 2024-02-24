import { AvailableModelsRequester } from "../networks/llm_requester.js";

class EndpointStorage {
    constructor() {
        this.init_database();
        this.load_local_endpoints().then(() => {
            this.create_endpoint_and_api_key_items();
            this.fill_available_models_select();
        });
    }
    init_database() {
        this.db = new Dexie("endpoints");
        this.db.version(1).stores({
            endpoints:
                "index, endpoint, api_key, need_protect, available_models",
        });
        this.db.endpoints.count((count) => {
            console.log(`${count} endpoints loaded from cookies.`);
        });
    }
    clear_database() {
        this.db.endpoints.count((count) => {
            console.log(`${count} endpoints would be cleared.`);
        });
        this.db.endpoints.clear();
    }
    async load_local_endpoints() {
        return fetch("/endpoints")
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                let count = Object.keys(data).length;
                console.log(`${count} endpoints loaded from local file.`);
                // data is array of endpoint items, each item has 4 keys:
                // - `endpoint`, `api_key`, `api_type`, `need_protect`
                // add these to db.endpoints
                data.forEach((endpoint) => {
                    this.db.endpoints.put({
                        index: endpoint.endpoint,
                        endpoint: endpoint.endpoint,
                        api_key: endpoint.api_key,
                        need_protect: endpoint.need_protect || false,
                    });
                });
            });
    }
    generate_endpoint_and_api_key_item_html() {
        let endpoint_and_api_key_item_html = `
            <div class="row mt-2 no-gutters">
                <div class="col-auto">
                    <button class="btn px-0 remove-endpoint-button">
                        <i class="fa fa-circle-minus"></i>
                    </button>
                </div>
                <div class="col pl-0">
                    <input class="form-control endpoint-input" rows="1"
                        placeholder="Input Endpoint URL, don't add /v1"
                    ></input>
                </div>
                <div class="col pl-0">
                    <input class="form-control api-key-input" rows="1"
                        placeholder="Input API Key, then click ✔️"
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
            this.generate_endpoint_and_api_key_item_html()
        );
        endpoint_and_api_key_items.append(endpoint_and_api_key_item);
        this.bind_endpoint_and_api_key_buttons(endpoint_and_api_key_item);
    }
    create_endpoint_and_api_key_items() {
        let endpoint_and_api_key_items = $("#endpoint-and-api-key-items");
        let endpoints = this.db.endpoints;
        endpoint_and_api_key_items.empty();

        endpoints.each((row) => {
            if (row.need_protect) {
                return;
            }
            let endpoint_and_api_key_item_html =
                this.generate_endpoint_and_api_key_item_html();
            let endpoint_and_api_key_item = $(endpoint_and_api_key_item_html);
            let endpoint_input =
                endpoint_and_api_key_item.find(".endpoint-input");
            endpoint_input.val(row.endpoint);
            let api_key_input =
                endpoint_and_api_key_item.find(".api-key-input");
            api_key_input.val(row.api_key);
            endpoint_and_api_key_items.append(endpoint_and_api_key_item);
            this.bind_endpoint_and_api_key_buttons(endpoint_and_api_key_item);
        });
        endpoint_and_api_key_items.hide();
    }
    bind_endpoint_and_api_key_buttons(endpoint_and_api_key_item) {
        // console.log("endpoint_and_api_key_item:", endpoint_and_api_key_item);
        let endpoint_submit_button = endpoint_and_api_key_item.find(
            ".submit-endpoint-button"
        );
        endpoint_submit_button.click(() => {
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
                this.db.endpoints.put({
                    index: endpoint_input_value,
                    endpoint: endpoint_input_value,
                    api_key: api_key_input_value,
                    need_protect: false,
                });
                console.log(`new_endpoint: ${endpoint_input_value}`);
            }
            this.fill_available_models_select(endpoint_input_value);
        });

        let remove_endpoint_buttons = endpoint_and_api_key_item.find(
            ".remove-endpoint-button"
        );
        remove_endpoint_buttons.click(() => {
            let endpoint_input =
                endpoint_and_api_key_item.find(".endpoint-input");
            let endpoint_input_value = endpoint_input.val();
            endpoint_and_api_key_item.remove();
            if (
                endpoint_input_value.trim() === "" ||
                this.db.endpoints.get(endpoint_input_value) === undefined
            ) {
                console.log("Endpoint not in endpoints");
            } else {
                this.db.endpoints.delete(endpoint_input_value);
                // remove models of current endpoint from available_models_select
                let available_models_select = $("#available-models-select");
                let model_value = this.construct_model_name_and_value(
                    endpoint_input_value,
                    ""
                )[1];
                available_models_select
                    .find(`option[value^="${model_value}"]`)
                    .remove();
                console.log(`remove endpoint: ${endpoint_input_value}`);
            }
        });
    }
    fetch_available_models(endpoint) {
        console.log("fetch available models for endpoint:", endpoint);
        // if endpoint not starts with http(s), skip
        // such as "user-customized", which is used for other local functions or agents
        if (endpoint.startsWith("http")) {
            let available_models_requester = new AvailableModelsRequester(
                endpoint
            );
            // update available_models field of endpoint index in db.endpoints
            return available_models_requester.get().then((available_models) => {
                this.db.endpoints.update(endpoint, {
                    available_models: JSON.stringify(available_models),
                });
                return available_models;
            });
        } else {
            return Promise.resolve([]);
        }
    }
    fill_available_models_select() {
        // fetch available_models for all endpoints, and then fill available_models_select
        let available_models_select = $("#available-models-select");
        available_models_select.empty();
        this.db.endpoints.toArray().then((endpoints) => {
            let promises = endpoints.map((row) => {
                return this.fetch_available_models(row.endpoint).then(
                    (available_models) => {
                        available_models.forEach((model_id) => {
                            let model_name_and_value =
                                this.construct_model_name_and_value(
                                    row.endpoint,
                                    model_id
                                );
                            let option = new Option(
                                model_name_and_value[0],
                                model_name_and_value[1]
                            );
                            available_models_select.append(option);
                        });
                    }
                );
            });
            Promise.all(promises).then(() => {
                this.set_default_model();
            });
        });
    }
    construct_model_name_and_value(endpoint, model_id) {
        let endpoint_hostname = new URL(endpoint).hostname
            .split(".")[0]
            .split("-")[0];
        let model_name = `${model_id} (${endpoint_hostname})`;
        let model_value = `${endpoint}|${model_id}`;
        return [model_name, model_value];
    }
    set_default_model() {
        let storage_default_model = localStorage.getItem("default_model");
        // format of storage_default_model is `{endpoint}|{model_id}`
        // if storage_default_model is null, or not in the available_models_select,
        // set as the first one of available_models_select
        let select = $("#available-models-select");
        if (
            storage_default_model &&
            select.find(`option[value="${storage_default_model}"]`).length > 0
        ) {
            select.val(storage_default_model);
            console.log(
                "load default model:",
                localStorage.getItem("default_model")
            );
        } else {
            let new_storage_default_model = select.find("option:first").val();
            select.val(new_storage_default_model);
            localStorage.setItem("default_model", new_storage_default_model);
            console.log(
                "set new default model:",
                localStorage.getItem("default_model")
            );
        }
    }
}

export let endpoint_storage = new EndpointStorage();
