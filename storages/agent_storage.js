class AgentStorageItem {
    constructor(agent_storage) {
        this.agent_storage = agent_storage;
    }
}

class AgentStorage {
    constructor() {
        this.init_database();
        this.load_local_agents().then(() => {
            this.create_agent_items();
        });
    }
    init_database() {
        this.db = new Dexie("agents");
        this.db.version(1).stores({
            agents: "index, name, model, description, temperature, top_p, max_output_tokens, system_prompt, need_protect",
        });
        this.db.agents.count((count) => {
            console.log(`${count} agents loaded.`);
        });
    }
    clear_database() {
        this.db.agents.count((count) => {
            console.log(`${count} agents would be cleared.`);
        });
        this.db.agents.clear();
    }
    async load_local_agents() {
        return fetch("/agents")
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                let count = Object.keys(data).length;
                console.log(`${count} local agents loaded.`);
                // data is array of agent items, each item has 7 keys:
                // - name, model, description, temperature, top_p, max_output_tokens, system_prompt, need_protect
                data.forEach((agent) => {
                    this.db.agents.put({
                        index: agent.name,
                        name: agent.name,
                        description: agent.description || "",
                        model: agent.model,
                        temperature: agent.temperature || 0.5,
                        top_p: agent.top_p || 0.9,
                        max_output_tokens: agent.max_output_tokens || -1,
                        system_prompt: agent.system_prompt || "",
                        need_protect: agent.need_protect || false,
                    });
                });
            });
    }

    generate_agent_item_html(agent) {
        let agent_item_html = `
        <div class="my-2 row no-gutters">
            <button id="${agent.name}-agent-button" title="${agent.system_prompt}"  class="agent-button" type="button">
            <i class="fa fa-arrow-circle-o-right"></i> ${agent.name}
            </button>
        </div>
        `;
        return agent_item_html;
    }

    create_agent_items() {
        let chat_agents_sidebar_items = $("#chat-agents-sidebar-items");
        chat_agents_sidebar_items.empty();
        this.db.agents.each((agent) => {
            let agent_item_html = this.generate_agent_item_html(agent);
            chat_agents_sidebar_items.append(agent_item_html);
        });
    }

    set_default_agent() {
        let storage_default_agent = localStorage.getItem("default_agent");

        // let select = $("#agent-select");
        if (
            storage_default_agent
            // && select.find(`option[value="${storage_default_agent}"]`).length > 0
        ) {
            // select.val(storage_default_agent);
            console.log(
                "load default agent:",
                localStorage.getItem("default_agent")
            );
        } else {
            // let new_storage_default_agent = select.find("option:first").val();
            // select.val(new_storage_default_agent);
            // localStorage.setItem("default_agent", new_storage_default_agent);
            console.log(
                "set new default agent:",
                localStorage.getItem("default_agent")
            );
        }
    }
}

export let agent_storage = new AgentStorage();
