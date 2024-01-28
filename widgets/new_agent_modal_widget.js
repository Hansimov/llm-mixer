import { RangeNumberWidget } from "./range_number_widget.js";
import { AvailableModelsSelectWidget } from "./available_models_select_widget.js";

export class NewAgentModalWidget {
    constructor({ widget_id = null } = {}) {
        this.widget_id = widget_id;
        this.name_widget_id = `${this.widget_id}-name`;
        this.model_widget_id = `${this.widget_id}-model`;
        this.description_widget_id = `${this.widget_id}-description`;
        this.temperature_widget_id = `${this.widget_id}-temperature`;
        this.top_p_widget_id = `${this.widget_id}-top-p`;
        this.max_output_tokens_widget_id = `${this.widget_id}-max-output-tokens`;
        this.system_prompt_widget_id = `${this.widget_id}-system-prompt`;
        this.save_button_id = `${this.widget_id}-save-button`;
        this.default_button_id = `${this.widget_id}-default-button`;
        this.close_button_id = `${this.widget_id}-close-button`;
    }
    spawn() {
        this.create_widget();
        this.append_to_body();
    }
    remove() {
        this.widget.remove();
    }
    create_model_widget() {
        this.model_widget = new AvailableModelsSelectWidget({
            widget_id: this.model_widget_id,
        });
        let model_widget_parent = this.widget.find(`#${this.model_widget_id}`);
        this.model_widget.spawn_in_parent(model_widget_parent, "prepend");
    }
    create_temperature_widget() {
        this.temperature_widget = new RangeNumberWidget({
            widget_id: this.temperature_widget_id,
            label_text: "Temperature",
            default_val: 0.5,
            min_val: 0,
            max_val: 1,
            step_val: 0.1,
        });
        let temperature_widget_parent = this.widget.find(
            `#${this.temperature_widget_id}`
        );
        this.temperature_widget.spawn_in_parent(temperature_widget_parent);
    }
    create_top_p_widget() {
        this.top_p_widget = new RangeNumberWidget({
            widget_id: this.top_p_widget_id,
            label_text: "Top P",
            default_val: 0.9,
            min_val: 0.0,
            max_val: 1.0,
            step_val: 0.01,
        });
        let top_p_widget_parent = this.widget.find(`#${this.top_p_widget_id}`);
        this.top_p_widget.spawn_in_parent(top_p_widget_parent);
    }
    create_max_output_tokens_widget() {
        this.max_output_tokens_widget = new RangeNumberWidget({
            widget_id: this.max_output_tokens_widget_id,
            label_text: "Max Output Tokens <code>(-1: auto)</code>",
            default_val: -1,
            min_val: -1,
            max_val: 32768,
            step_val: 1,
        });
        let max_output_tokens_widget_parent = this.widget.find(
            `#${this.max_output_tokens_widget_id}`
        );
        this.max_output_tokens_widget.spawn_in_parent(
            max_output_tokens_widget_parent
        );
    }
    create_widget() {
        this.widget_html = `
        <div id="${this.widget_id}" data-bs-backdrop="static" class="modal" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create New Agent</h5>
                        <button class="btn" data-bs-dismiss="modal">
                            <i class="fa fa-close"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- name -->
                        <div class="form-floating mb-2">
                            <input id="${this.name_widget_id}" class="form-control" type="text"/>
                            <label class="form-label">Name</label>
                        </div>
                        <!-- model -->
                        <div id="${this.model_widget_id}" class="form-floating mb-2">
                            <label class="form-label">Model</label>
                        </div>
                        <!-- system prompt -->
                        <div class="form-floating mb-2">
                            <textarea id="${this.system_prompt_widget_id}" class="form-control" rows="3"></textarea>
                            <label>System Prompt</label>
                        </div>
                        <a class="btn mx-0 px-0" data-bs-toggle="collapse" href="#new-agent-advanced-settings">
                            <b>Advanced Settings</b> <i class="fa fa-chevron-down"></i>
                        </a>
                        <div class="collapse" id="new-agent-advanced-settings">
                            <!-- description -->
                            <div class="form-floating my-2">
                                <textarea id="${this.description_widget_id}" class="form-control" rows="1"></textarea>
                                <label>Description</label>
                            </div>
                            <!-- temperature -->
                            <div id="${this.temperature_widget_id}" class="row mb-0"">
                            </div>
                            <!-- top_p -->
                            <div id="${this.top_p_widget_id}" class="row mb-0"">
                            </div>
                            <!-- max output tokens -->
                            <div id="${this.max_output_tokens_widget_id}" class="row mb-2">
                            </div>
                            <!-- max history messages token -->
                        </div>
                    </div>
                    <div class="modal-footer justify-content-end">
                        <button id="${this.save_button_id}" class="btn btn-success">Save</button>
                        <button id="${this.default_button_id}" class="btn btn-primary">Set to default</button>
                        <button id="${this.close_button_id}" class="btn btn-secondary"
                            data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.widget = $(this.widget_html);
        this.create_model_widget();
        this.create_temperature_widget();
        this.create_top_p_widget();
        this.create_max_output_tokens_widget();
    }
    append_to_body() {
        $("body").append(this.widget);
        document
            .getElementById(`${this.system_prompt_widget_id}`)
            .addEventListener(
                "input",
                function () {
                    this.style.height = 0;
                    this.style.height = this.scrollHeight + 3 + "px";
                },
                false
            );
        $(`#${this.system_prompt_widget_id}`)
            .css("resize", "none")
            .css("max-height", "200px");
        $(`#${this.description_widget_id}`).css("resize", "none");
    }
}
