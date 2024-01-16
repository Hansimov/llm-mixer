class EndpointStorageItem {}

class EndpointStorage {
    constructor() {
        this.init_database();
        this.render_endpoint_and_api_key_items();
    }
    init_database() {
        this.db = new Dexie("endpoints");
        this.db.version(1).stores({
            endpoints: "index, endpoint, api_key",
            default_model: "model",
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
                    <button class="btn px-0 remove-endpoint-and-key-button">
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
                    <button class="btn endpoint-submit-button">
                        <i class="fa fa-check"></i>
                    </button>
                </div>
            </div>
        `;
        return endpoint_and_api_key_item_html;
    }
    add_endpoint_and_api_key_item() {
        let endpoint_and_api_key_items = $("#endpoint-and-api-key-items");
        endpoint_and_api_key_items.prepend(
            this.get_endpoint_and_api_key_item_html()
        );
        this.bind_endpoint_and_api_key_buttons();
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
        });
    }
    bind_endpoint_and_api_key_buttons() {
        let endpoint_submit_buttons = $(".endpoint-submit-button");
        let self = this;
        endpoint_submit_buttons.click(function () {
            let endpoint_input = $(this)
                .parent()
                .parent()
                .find(".endpoint-input");
            let endpoint_input_value = endpoint_input.val().trim();
            let api_key_input = $(this)
                .parent()
                .parent()
                .find(".api-key-input");
            let api_key_input_value = api_key_input.val().trim();

            if (endpoint_input_value === "") {
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
        });
    }
    render_endpoint_and_api_key_items() {
        this.create_endpoint_and_api_key_items();
        this.bind_endpoint_and_api_key_buttons();
    }
}

export let endpoint_storage = new EndpointStorage();
