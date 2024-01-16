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
