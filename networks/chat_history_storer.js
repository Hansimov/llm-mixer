class ChatHistoryStorer {
    constructor() {
        this.init_database();
        this.render_chat_history_sidebar_items();
    }
    init_database() {
        this.db = new Dexie("chat_history");
        this.db.version(1).stores({
            chat_history: "index, display_title, html, saved_datetime"
        });
        this.db.chat_history.count((count) => {
            console.log(`${count} records loaded from chat_history.`);
        });
    }
    clear_database() {
        this.db.chat_history.clear();
        this.render_chat_history_sidebar_items();
        console.log("chat_history cleared.");
    }
    render_chat_history_sidebar_items() {
        let chat_history_sidebar_items = $("#chat-history-sidebar-items");
        let chat_history = this.db.chat_history;
        chat_history_sidebar_items.empty();
        chat_history.each((chat_history_item) => {
            let chat_history_item_html = `
                <li class="nav-item">
                    <a class="nav-link" href="#${chat_history_item.index}">${chat_history_item.display_title}</a>
                </li>
            `;
            chat_history_sidebar_items.append(chat_history_item_html);
        });
    }
    get_current_datetime_string() {
        return moment().format("YYYY-MM-DD_HH-mm-ss.SSS");
    }
    get_chat_container_html() {
        let messagers_container = $("#messagers-container");
        if (messagers_container.children().length > 0) {
            return messagers_container[0].outHTML;
        } else {
            return null;
        }
    }
    create_chat_index() {
        let date_string = this.get_current_datetime_string();
        let chat_index = `chat_${date_string}`;
        return chat_index;
    }
    save_current_chat_session() {
        let chat_container_html = this.get_chat_container_html();
        let messagers_container = $("#messagers-container");
        if (chat_container_html === null) {
            console.log("Empty messagers_container, no chat session to save.");
            return;
        } else {
            let chat_index = this.create_chat_index();
            let chat_saved_datetime = this.get_current_datetime_string();
            this.db.chat_history.put({
                index: chat_index,
                display_title: chat_index,
                html: chat_container_html,
                saved_datetime: chat_saved_datetime,
            });
            this.render_chat_history_sidebar_items();
            console.log(
                `${messagers_container.children().length} messages saved at ${chat_saved_datetime}.`
            );
        }
    }
}

export let chat_history_storer = new ChatHistoryStorer();
