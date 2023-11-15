import { ButtonsBinder } from "./components/buttons_binder.js";
import { InputsBinder } from "./components/inputs_binder.js";
import { CommonsLoader } from "./commons/commons_loader.js";

$(document).ready(function () {
    let buttons_binder = new ButtonsBinder();
    buttons_binder.bind();
    let inputs_binder = new InputsBinder();
    inputs_binder.bind();
    let commons_loader = new CommonsLoader();
    commons_loader.load();
});
