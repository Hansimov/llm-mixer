import { AgentInfoWidget } from "../widgets/agent_info_widget.js";

class AgentStorageItem {
    constructor(agent_storage) {
        this.agent_storage = agent_storage;
    }
}

export function get_current_agent_info() {
    let widget_id = "agent-info";
    let agent_info_widget = $(`#${widget_id}`);
    let name = agent_info_widget.find(`#${widget_id}-name`).val();
    let model = agent_info_widget.find(`#${widget_id}-model-select`).val();
    let system_prompt = agent_info_widget
        .find(`#${widget_id}-system-prompt`)
        .val();
    let description = agent_info_widget.find(`#${widget_id}-description`).val();
    let temperature = parseFloat(
        agent_info_widget.find(`#${widget_id}-temperature-number`).val()
    );
    let top_p = parseFloat(
        agent_info_widget.find(`#${widget_id}-top-p-number`).val()
    );
    let max_output_tokens = parseInt(
        agent_info_widget.find(`#${widget_id}-max-output-tokens-number`).val()
    );
    return {
        name: name,
        model: model,
        system_prompt: system_prompt,
        description: description,
        temperature: temperature,
        top_p: top_p,
        max_output_tokens: max_output_tokens,
    };
}

class AgentStorage {
    constructor() {
        this.init_database();
        this.load_local_agents().then(() => {
            this.fill_agents_select();
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
                        index: agent.index || agent.name,
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

    fill_agents_select() {
        // fetch agents, and then fill agents_select
        let agents_select = $("#agents-select");
        agents_select.empty();
        this.db.agents.toArray().then((agents) => {
            let promises = agents.map((agent) => {
                let option_name = agent.name;
                let option_value = agent.name;
                let option = new Option(option_name, option_value);
                agents_select.append(option);
            });
            Promise.all(promises).then(() => {
                this.set_default_agent();
                this.set_agent_info();
            });
        });
    }
    set_default_agent() {
        let storage_default_agent = localStorage.getItem("default_agent");

        let select = $("#agents-select");
        if (
            storage_default_agent &&
            select.find(`option[value="${storage_default_agent}"]`).length > 0
        ) {
            select.val(storage_default_agent);
            console.log(
                "load default agent:",
                localStorage.getItem("default_agent")
            );
        } else {
            let new_storage_default_agent = select.find("option:first").val();
            select.val(new_storage_default_agent);
            localStorage.setItem("default_agent", new_storage_default_agent);
            console.log(
                "set new default agent:",
                localStorage.getItem("default_agent")
            );
        }
    }
    get_current_agent() {
        let current_agent_name = $("#agents-select").val();
        console.log("current_agent_name:", current_agent_name);
        return this.db.agents.get(current_agent_name);
    }
    set_agent_info() {
        this.get_current_agent().then((agent) => {
            let agent_info_widget = new AgentInfoWidget({
                agent: agent,
            });
            agent_info_widget.spawn();
        });
    }
}

export let agent_storage = new AgentStorage();
