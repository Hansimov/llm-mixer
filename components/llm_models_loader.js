import {
    request_available_models,
    available_models,
} from "../networks/llm_requester.js";

export async function setup_hardcoded_available_models_on_select(
    default_option = null
) {
    var select = $("#available-models-select");
    select.empty();
    const hardcoded_models = [
        "precise",
        "balanced",
        "creative",
        "precise-offline",
        "balanced-offline",
        "creative-offline",
    ];
    hardcoded_models.forEach((value, index) => {
        const option = new Option(value, value);
        select.append(option);
    });
    let default_model = "precise";
    let local_default_model = localStorage.getItem("default_model");
    if (local_default_model && hardcoded_models.includes(local_default_model)) {
        default_model = local_default_model;
    } else {
        localStorage.setItem("default_model", default_model);
    }
    select.val(default_model);
    console.log(`Default model: ${select.val()}`);
}

export async function setup_available_models_on_select(default_option = null) {
    var select = $("#available-models-select");
    select.empty();
    await request_available_models();
    const working_models = [
        "bing-precise",
        "bing-balanced",
        "bing-creative",
        // "bing-dall-e", // not work
        // "bing-gpt-4", // not work
        // "bing-gpt-4-32k", // not work
        // "bingo-precise", // in progress
        // "bingo-balanced", // in progress
        // "bingo-creative", // in progress
        "claude-2",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-internet",
        // "gpt-4", // not work
        // "gpt-4-32k", // not work
        // "gpt-4-internet", // not work
        // "pandora-gpt-3.5-turbo", // not work
        // "poe-claude-2-100k", // not work
        "poe-claude-instant",
        "poe-claude-instant-100k",
        // "poe-code-llama-13b",
        // "poe-code-llama-34b",
        // "poe-code-llama-7b",
        // "poe-dolly-v2-12b", // not work
        "poe-google-palm",
        "poe-gpt-3.5-turbo",
        // "poe-gpt-3.5-turbo-16k", // not work
        "poe-gpt-3.5-turbo-instruct",
        // "poe-gpt-4", // not work
        // "poe-gpt-4-32k", // not work
        // "poe-llama-2-13b",
        // "poe-llama-2-70b",
        // "poe-llama-2-7b",
        // "poe-nous-hermes-13b",
        // "poe-nous-hermes-l2-13b", // not work
        "poe-saga",
        "poe-solar-0-70b",
        // "poe-stablediffusion-xl", // not work
        // "poe-starcoderchat", // not work
        "poe-web-search",
    ];
    working_models.forEach((value, index) => {
        const option = new Option(value, value);
        if (available_models.includes(value)) {
            select.append(option);
        }
    });
    let default_model = "gpt-turbo-3.5";
    let local_default_model = localStorage.getItem("default_model");
    if (
        local_default_model &&
        working_models.includes(local_default_model) &&
        available_models.includes(local_default_model)
    ) {
        default_model = local_default_model;
    }
    select.val(default_model);
    console.log(`Default model: ${select.val()}`);
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
    console.log(`Default temperature: ${select.val()}`);
}
