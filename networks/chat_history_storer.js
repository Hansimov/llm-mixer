class ChatHistoryStorer {
    constructor() {
        this.init_database();
        this.render_chat_history_sidebar_items();
    }
    init_database() {
        this.db = new Dexie("chat_history");
        this.db.version(1).stores({
            chat_history: "index, title, html, saved_datetime",
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

    get_current_datetime_string() {
        return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
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
        let datetime_string = moment().format("YYYY-MM-DD_HH-mm-ss_SSS");
        let chat_index = `chat_${datetime_string}`;
        return chat_index;
    }
    create_chat_title() {
        let chat_title = moment().format("YYYY-MM-DD HH:mm:ss");
        return chat_title;
    }
    render_chat_history_sidebar_items() {
        let chat_history_sidebar_items = $("#chat-history-sidebar-items");
        let chat_history = this.db.chat_history;
        chat_history_sidebar_items.empty();
        chat_history.each((chat_history_item) => {
            let chat_history_item_html = `
                <li class="nav-item">
                    <a class="nav-link" href="#${chat_history_item.index}">
                    ${chat_history_item.title}
                    </a>
                </li>
            `;
            chat_history_sidebar_items.append(chat_history_item_html);
        });
    }
    save_current_chat_session() {
        let chat_container_html = this.get_chat_container_html();
        if (chat_container_html === null) {
            console.log("Empty messagers_container, no chat session to save.");
            return;
        } else {
            let chat_index = this.create_chat_index();
            let chat_title = this.create_chat_title();
            let chat_saved_datetime = this.get_current_datetime_string();
            this.db.chat_history.put({
                index: chat_index,
                title: chat_title,
                html: chat_container_html,
                saved_datetime: chat_saved_datetime,
            });
            this.render_chat_history_sidebar_items();

            let messagers_container = $("#messagers-container");
            let messages_count = messagers_container.children().length;
            console.log(
                `${messages_count} messages saved at ${chat_saved_datetime}.`
            );
        }
    }
}

export let chat_history_storer = new ChatHistoryStorer();
