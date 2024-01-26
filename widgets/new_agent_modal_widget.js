import { RangeNumberWidget } from "./range_number_widget.js";

export class NewAgentModalWidget {
    constructor() {
        this.widget_id = "new-agent-modal";
    }
    spawn() {
        this.create_widget();
        this.append_to_body();
    }
    remove() {
        this.widget.remove();
    }
    create_temperature_widget() {
        this.temperature_widget_id = `${this.widget_id}-temperature`;
        this.temperature_widget = new RangeNumberWidget({
            widget_id: this.temperature_widget_id,
            label_text: "Temperature",
            default_val: 0,
            min_val: 0,
            max_val: 1,
            step_val: 0.1,
        });
        this.temperature_widget.spawn_in_parent(
            this.widget.find(`#${this.temperature_widget_id}`)
        );
    }
    create_max_output_tokens_widget() {
        this.max_output_tokens_widget_id = `${this.widget_id}-max-output-tokens`;
        this.max_output_tokens_widget = new RangeNumberWidget({
            widget_id: this.max_output_tokens_widget_id,
            label_text: "Max Output Tokens",
            default_val: -1,
            min_val: -1,
            max_val: 32768,
            step_val: 1,
        });
        this.max_output_tokens_widget.spawn_in_parent(
            this.widget.find(`#${this.temperature_widget_id}`)
        );
    }
    create_widget() {
        this.widget_html = `
        <div id="${this.widget_id}" data-bs-backdrop="static" class="modal" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">Create New Agent</h4>
                        <button class="btn" data-bs-dismiss="modal">
                            <i class="fa fa-close"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- nickname -->
                        <div class="form-floating mb-2">
                            <input id="${this.widget_id}-nickname" class="form-control" type="text" placeholder="Nickname" />
                            <label for="new-agent-model-nickname" class="form-label">Nickname</label>
                        </div>
                        <!-- model -->
                        <div class="form-floating mb-2">
                            <select id="${this.widget_id}-model" class="form-select" type="text"></select>
                            <label for="${this.widget_id}-model" class="form-label">Model</label>
                        </div>
                        <!-- temperature -->
                        <div id="${this.temperature_widget_id}" class="row mb-0"">
                        </div>
                        <!-- max output tokens -->
                        <div id="${this.max_output_tokens_widget_id}" class="row mb-2">
                        </div>
                        <!-- system prompt -->
                        <div class="form-floating mb-2">
                            <textarea id="${this.widget_id}-system-prompt" class="form-control" placeholder="System Prompt"
                                rows="3"></textarea>
                            <label for="${this.widget_id}-system-prompt">System Prompt</label>
                        </div>
                        <!-- max token -->
                        <!-- max history messages token -->
                    </div>
                    <div class="modal-footer justify-content-end">
                        <button id="new-agent-model-save-button" class="btn btn-success">Save</button>
                        <button id="new-agent-model-close-button" class="btn btn-secondary"
                            data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.widget = $(this.widget_html);
        this.create_temperature_widget();
        this.create_max_output_tokens_widget();
    }
    append_to_body() {
        $("body").append(this.widget);
        document
            .getElementById("new-agent-modal-system-prompt")
            .addEventListener(
                "input",
                function () {
                    this.style.height = 0;
                    this.style.height = this.scrollHeight + 3 + "px";
                },
                false
            );
    }
}
