export class RangeNumberWidget {
    constructor({
        widget_id = null,
        label_text = null,
        default_val = null,
        min_val = null,
        max_val = null,
        step_val = null,
        range_col = 8,
        number_col = 4,
    } = {}) {
        this.widget_id = widget_id;
        this.label_text = label_text;
        this.default_val = default_val;
        this.min_val = min_val;
        this.max_val = max_val;
        this.step_val = step_val;
        this.range_col = range_col;
        this.number_col = number_col;
    }
    spawn_in_parent(parent) {
        this.create_widget();
        this.bind_update_functions();
        this.append_to_parent(parent);
    }
    remove() {
        this.widget.remove();
    }
    create_widget() {
        this.widget_html = `
        <label class="col-form-label">${this.label_text}</label>
            <div class="col-sm-${this.range_col} d-flex align-items-center">
                <input id="${this.widget_id}-range"
                    type="range" value="${this.default_val}"
                    min="${this.min_val}" max="${this.max_val}" step="${this.step_val}"
                    class="form-range"
                />
            </div>
            <div class="col-sm-${this.number_col}">
                <input id="${this.widget_id}-number"
                    type="number" value="${this.default_val}"
                    min="${this.min_val}" max="${this.max_val}" step="${this.step_val}"
                    class="form-control"
            />
        </div>`;
        this.widget = $(this.widget_html);
    }
    update_number_widget_value(value) {
        $(`#${this.widget_id}-number`).val(value);
    }
    update_range_widget_value(value) {
        $(`#${this.widget_id}-range`).val(value);
    }
    bind_update_functions() {
        let self = this;
        this.widget.find(`#${this.widget_id}-range`).on("input", function () {
            self.update_number_widget_value($(this).val());
        });
        this.widget.find(`#${this.widget_id}-number`).on("input", function () {
            self.update_range_widget_value($(this).val());
        });
    }
    append_to_parent(parent) {
        parent.append(this.widget);
    }
}
