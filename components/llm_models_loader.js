import {
    available_models,
    AvailableModelsRequester,
} from "../networks/llm_requester.js";

export async function setup_available_models_on_select(default_option = null) {
    var select = $("#available-models-select");
    select.empty();
    let available_models_requester = new AvailableModelsRequester();
    await available_models_requester.get();
    available_models.forEach((value, index) => {
        const option = new Option(value, value);
        select.append(option);
    });
    let default_model = "";
    let local_default_model = localStorage.getItem("default_model");
    if (local_default_model && available_models.includes(local_default_model)) {
        default_model = local_default_model;
    } else if (available_models) {
        default_model = available_models[0];
        localStorage.setItem("default_model", default_model);
    } else {
        default_model = "";
    }

    select.val(default_model);
    console.log(`default_model: ${select.val()}`);
}

export async function setup_temperature_on_select(default_option = null) {
    var select = $("#temperature-select");
    select.empty();
    if (default_option === null) {
        default_option = "0";
    }
    for (let i = 10; i >= 0; i--) {
        const value = i / 10;
        const option = new Option(value, value);
        select.append(option);
        if (value === Number(default_option)) {
            $(option).prop("selected", true);
        }
    }
    console.log(`default_temperature: ${select.val()}`);
}
