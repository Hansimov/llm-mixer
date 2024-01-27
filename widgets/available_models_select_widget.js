export class AvailableModelsSelectWidget {
    constructor({ widget_id = null, widget_title = null } = {}) {
        this.widget_id = widget_id;
        this.widget_title = widget_title || "Available Models";
    }
    spawn_in_parent(parent, position = "append") {
        this.create_widget();
        this.update_select_options();
        if (position === "prepend") {
            parent.prepend(this.widget);
        } else {
            parent.append(this.widget);
        }
    }
    create_widget() {
        this.widget_html = `
        <select class="form-select" id="${this.widget_id}-select" title="${this.widget_title}"></select>
        `;
        this.widget = $(this.widget_html);
    }
    update_select_options() {
        let available_models_select = $("#available-models-select");
        let options = available_models_select.find("option");
        this.widget.empty();
        options.each((i, option) => {
            this.widget.append($(option).clone());
        });
    }
}
