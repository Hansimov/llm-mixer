class ChatHistoryStorer {
    constructor() {
        this.init_database();
    }
    init_database() {
        this.db = new Dexie("chat_history");
        this.db.version(1).stores({
            chat_history: "index, html, saved_datetime"
        });
        this.db.chat_history.count((count) => {
            console.log(`${count} records loaded from chat_history.`);
        });
    }
    get_current_datetime_string() {
        return moment().format("YYYY-MM-DD_HH:mm:ss.SSS");
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
                html: chat_container_html,
                saved_datetime: chat_saved_datetime,
            });
            console.log(
                `${messagers_container.children().length} messages saved at ${chat_saved_datetime}.`
            );
        }
    }
}

export let chat_history_storer = new ChatHistoryStorer();
