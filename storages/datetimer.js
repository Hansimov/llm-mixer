class Datetimer {
    constructor() {}
    now() {
        return moment().format("YYYY-MM-DD HH:mm:ss");
    }
    now_with_ms() {
        return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    }
    now_as_pathname() {
        return moment().format("YYYY-MM-DD_HH-mm-ss");
    }
    now_with_ms_as_pathname() {
        return moment().format("YYYY-MM-DD_HH-mm-ss_SSS");
    }
}

export let datetimer = new Datetimer();
