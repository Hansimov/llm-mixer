class ScreenScroller {
    constructor() {
        this.is_user_scrolling = false;
    }
    bind() {
        let self = this;
        $("#chat-session-container").on("wheel touchmove", function () {
            if ($("#send-user-input").attr("status") === "stop") {
                self.set_user_scrolling(true);
            }
        });
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
screen_scroller.bind();
