class ScreenScroller {
    constructor() {
        this.is_user_scrolling = false;
    }
    get_user_scrolling() {
        return this.is_user_scrolling;
    }
    set_user_scrolling(val = true) {
        this.is_user_scrolling = val;
    }
    scroll_to_bottom(animate = false) {
        if (this.get_user_scrolling()) {
            return;
        }
        console.log("scroll_to_bottom");
        if (animate) {
            $("#chat-session-container").animate(
                {
                    scrollTop: $("#chat-session-container").prop(
                        "scrollHeight"
                    ),
                },
                500
            );
        } else {
            $("#chat-session-container").prop(
                "scrollTop",
                $("#chat-session-container").prop("scrollHeight")
            );
        }
    }
}

export let screen_scroller = new ScreenScroller();
