class ChatStorageItem {
    constructor(chat_history_storage) {
        this.chat_history_storage = chat_history_storage;
    }
    create_index() {
        let datetime_string = moment().format("YYYY-MM-DD_HH-mm-ss_SSS");
        let chat_index = `chat_${datetime_string}`;
        return chat_index;
    }
    create_title() {
        let chat_title = moment().format("YYYY-MM-DD HH:mm:ss");
        return chat_title;
    }
    get_messagers_container_html() {
        let messagers_container = $("#messagers-container");
        if (messagers_container.children().length > 0) {
            return messagers_container[0].outHTML;
        } else {
            return null;
        }
    }
    get_current_datetime_string() {
        return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    }
    construct() {
        this.html = this.get_messagers_container_html();
        this.index = this.create_index();
        this.title = this.create_title();
        this.saved_datetime = this.get_current_datetime_string();
        this.message_count = $("#messagers-container").children().length;
    }
}

class ChatHistoryStorage {
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
        let chat_storage_item = new ChatStorageItem(this);
        chat_storage_item.construct();
        if (chat_storage_item.html === null) {
            console.log("Empty messagers_container, no chat session to save.");
            return;
        } else {
            this.db.chat_history.put({
                index: chat_storage_item.index,
                title: chat_storage_item.title,
                html: chat_storage_item.html,
                saved_datetime: chat_storage_item.saved_datetime,
            });
            this.render_chat_history_sidebar_items();
            console.log(
                `${chat_storage_item.message_count} messages saved at ${chat_storage_item.saved_datetime}.`
            );
        }
    }
}

export let chat_history_storage = new ChatHistoryStorage();
