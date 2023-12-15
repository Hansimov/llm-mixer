import { ButtonsBinder } from "./components/buttons_binder.js";
import { InputsBinder } from "./components/inputs_binder.js";

$(document).ready(function () {
    let buttons_binder = new ButtonsBinder();
    buttons_binder.bind();
    let inputs_binder = new InputsBinder();
    inputs_binder.bind();
});
