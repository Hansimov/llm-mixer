import { RangeNumberWidget } from "./range_number_widget.js";
import { AvailableModelsSelectWidget } from "./available_models_select_widget.js";

export class AgentInfoWidget {
    constructor({ agent } = {}) {
        this.agent = agent;
        this.widget_id = `agent-x-${this.agent.name}-x`;
        this.name_widget_id = `${this.widget_id}-name`;
        this.model_widget_id = `${this.widget_id}-model`;
        this.description_widget_id = `${this.widget_id}-description`;
        this.temperature_widget_id = `${this.widget_id}-temperature`;
        this.top_p_widget_id = `${this.widget_id}-top-p`;
        this.max_output_tokens_widget_id = `${this.widget_id}-max-output-tokens`;
        this.system_prompt_widget_id = `${this.widget_id}-system-prompt`;
    }
    spawn() {
        this.create_widget();
        this.append_to_agent_sidebar();
    }
    append_to_agent_sidebar() {
        let agent_info = $("#agent-info");
        agent_info.empty();
        agent_info.append(this.widget);
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
    create_widget() {
        this.widget_html = `
        <div id="${this.widget_id}">
            <!-- name -->
            <div class="form-floating mb-2">
                <input id="${this.name_widget_id} " class="form-control" type="text"/>
                <label class="form-label">Name</label>
            </div>
            <!-- model -->
            <div id="${this.model_widget_id}" class="form-floating mb-2">
                <label class="form-label">Model</label>
            </div>
        </div>
        `;
        this.widget = $(this.widget_html);
        this.create_model_widget();
    }
}
