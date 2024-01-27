export class AvailableModelsSelectWidget {
    constructor({ widget_id = null, widget_title = null } = {}) {
        this.widget_id = widget_id;
        this.widget_title = widget_title || "Available Models";
        this.observer = null;
        this.available_models_select = $("#available-models-select");
    }
    spawn_in_parent(parent, position = "append") {
        this.create_widget();
        this.update_select_options();
        if (position === "prepend") {
            parent.prepend(this.widget);
        } else {
            parent.append(this.widget);
        }
        this.observe_changes();
    }
    create_widget() {
        this.widget_html = `
        <select class="form-select" id="${this.widget_id}-select" title="${this.widget_title}"></select>
        `;
        this.widget = $(this.widget_html);
    }
    update_select_options() {
        let options = this.available_models_select.find("option");
        this.widget.empty();
        options.each((i, option) => {
            this.widget.append($(option).clone());
        });
    }
    observe_changes() {
        this.observer = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === "childList") {
                    this.update_select_options();
                }
            }
        });
        this.observer.observe(this.available_models_select[0], {
            attributes: false,
            childList: true,
            subtree: true,
        });
    }
}
