class MessagerViewer {
    constructor(message) {
        this.message = message;
        this.create_elements();
    }
    create_elements() {
        this.container = $("<div>")
            .addClass("row no-gutters message-viewer position-relative")
            .addClass(`message-${this.message.role}`);
        this.create_role_displayer();
        this.create_content_displayer();
        this.create_button_group();
        this.container
            .append(this.role_displayer)
            .append(this.content_displayer)
            .append(this.button_group);
    }
    create_role_displayer() {
        this.role_displayer = $("<div>")
            .addClass("role-displayer")
            .css("z-index", "1");
        if (this.message.role === "user") {
            this.role_displayer.append("You");
        } else {
            this.role_displayer.append(this.message.model);
        }
    }
    create_content_displayer() {
        this.content_displayer = $("<div>")
            .addClass("content-displayer")
            .addClass(`chat-${this.message.role}`);
        this.content_displayer.text(this.message.content);
        this.content_displayer.data("raw_content", this.message.content);
    }
    create_button_group() {
        this.button_group = $("<div>")
            .addClass("position-absolute text-end px-1")
            .addClass("button-group")
            .css("z-index", "1")
            .css("padding", "auto");

        let btn_class = "btn pt-0 pl-3";
        if (this.message.role === "assistant") {
            this.regenerate_button = $("<button>")
                .addClass(btn_class)
                .addClass("regenerate-button")
                .attr("title", "Regenerate")
                .append($("<span>").addClass("fa fa-small fa-rotate"));
            this.button_group.append(this.regenerate_button);
        } else {
        }

        this.edit_button = $("<button>")
            .addClass(btn_class)
            .addClass("edit-button")
            .attr("title", "Edit")
            .append($("<span>").addClass("fa fa-small fa-edit"));
        this.button_group.append(this.edit_button);

        this.copy_button = $("<button>")
            .addClass(btn_class)
            .addClass("copy-button")
            .attr("title", "Copy")
            .append($("<span>").addClass("fa fa-small fa-copy"));
        this.button_group.append(this.copy_button);

        this.copy_button.click(function () {
            let content = $(this)
                .closest(".message-viewer")
                .find(".content-displayer")
                .data("raw_content");
            console.log("Copy");
            console.log(content);
            let clipboard = new ClipboardJS(this, {
                text: function () {
                    return content;
                },
            });
        });
    }
}

export class Messager {
    constructor(message) {
        this.message = message;
        this.create_viewer();
    }

    get_request_message() {
        this.request_message = {
            role: this.message.role,
            content: this.message.content,
        };
        return this.request_message;
    }

    create_viewer() {
        let messager_viewer = new MessagerViewer(this.message);
        this.viewer = messager_viewer.container;
    }
}

export class MessagerList {
    constructor(messagers_container) {
        this.messagers_container = messagers_container;
        this.messagers = [];
    }

    push(messager) {
        this.messagers.push(messager);
        this.messagers_container.append(messager.viewer);
    }

    pop(n = 1) {
        let popped_messagers = this.messagers.splice(-n, n);
        this.messagers_container.children().slice(-n).remove();
        return popped_messagers;
    }

    extend(messagers) {
        this.messagers = this.messagers.concat(
            messagers.map(function (messager) {
                return messager;
            })
        );
        this.messagers_container.append(
            messagers.map(function (messager) {
                return messager.viewer;
            })
        );
    }

    clear() {
        this.messagers = [];
        this.messagers_container.empty();
    }

    get_messages() {
        return this.messagers.map(function (messager) {
            return messager.message;
        });
    }
    get_request_messages() {
        return this.messagers.slice(0, -1).map(function (messager) {
            return messager.get_request_message();
        });
    }

    get_message_viewers() {
        return this.messagers.map(function (messager) {
            return messager.viewer;
        });
    }
}
