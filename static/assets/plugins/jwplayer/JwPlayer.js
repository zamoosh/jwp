class JwPlayer {
    progress_bar_container;
    progress_tooltip;
    progress_bar_width;
    wrong_scale;
    player;
    add_comment_modal;
    add_comment;
    markers = [];
    comment_list;
    
    constructor(elementId, markers) {
        this.player = jwplayer(elementId).setup({
            file: "./media/videos/3/master.m3u8",
            tracks: [
                {
                    "kind": "captions",
                    "file": "./markers.vtt",
                    "label": "English"
                }
            ],
            // see this for more info: https://docs.jwplayer.com/players/docs/jw8-styling-and-behavior#implementing-your-css
            skin: {
                name: "myskin"
            },
            logo: {
                "file": "./static/assets/images/vidoneplus-logo-1.png",
                "link": "https://google.com",
                "hide": "true",
                "position": "top-left"
            },
            // shows a small player on scroll
            // "floating": {
            //     "dismissible": true
            // },
            image: "./media/images/logo.jpg",
            width: "100%",
            height: "100%",
            stretching: "bestfit"
        });
        this.addCommentButton();
        this.addCommentList(elementId);
        this.preventForm();
        if (markers) {
            this.updateMarkers(markers);
            this.setMarkers(this.markers);
        }
        this.fixPointPosition();
    }
    
    // this method adds "add comment" button.
    addCommentButton() {
        let player = this;
        this.player.addButton(
            "./static/assets/buttons/comment.svg",
            "add comment",
            showModal,
            "add_comment"
        );
        this.add_comment = document.createElement("div");
        this.add_comment.classList.add("modal", "fade");
        this.add_comment.setAttribute("id", "add_comment");
        this.add_comment.setAttribute("tabindex", "-1");
        this.add_comment.setAttribute("aria-labelledby", "add_comment_modal");
        this.add_comment.setAttribute("aria-hidden", "true");
        this.add_comment.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-dark" id="add_comment_modal">comment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form name="set_point">
                            <div class="mb-3">
                                <label for="point" class="form-label text-dark">point</label>
                                <input required autofocus type="text" maxlength="255" class="form-control" name="point" id="point">
                            </div>
                            <div class="mb-3">
                                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">close</button>
                                <button type="submit" class="btn btn-primary btn-sm">save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.add_comment);
        
        function showModal() {
            player.player.setFullscreen(false);
            player.player.pause();
            if (!player.add_comment_modal)
                player.add_comment_modal = new bootstrap.Modal(document.getElementById("add_comment"));
            player.add_comment_modal.show();
        }
    }
    
    // this method returns a POINT to add It in progress bar
    createPoint(marker) {
        let player = this;
        let point;
        let progress_bar = document.querySelector("div.jw-progress");
        let full_width = progress_bar.parentElement.getBoundingClientRect().width;
        let left;
        if (marker) {
            left = full_width * (marker.time / this.player.getDuration());
            point = document.createElement("span");
            point.style.position = "absolute";
            point.style.left = `${left}px`;
            point.style.height = "100%";
            point.style.width = "7px";
            point.style.zIndex = "1080";
            point.style.backgroundColor = "red";
            point.style.transition = "all 0.1s";
            point.dataset.text = marker.title;
            point.addEventListener("mousemove", function () {
                player.progress_tooltip.style.fontSize = "16px";
                player.progress_tooltip.style.overflow = "hidden";
                let space = Math.floor(marker.title.replaceAll(" ", "").length / 8);
                while (space > 0) {
                    let left_space = Number(point.style.left.replace("px", ""));
                    if ((space * 120) + 20 < left_space) {
                        space = space * 120;
                        break;
                    }
                    space--;
                }
                player.progress_tooltip.style.minWidth = `${space}px`;
                player.progress_tooltip.style.transition = "min-width 0.1s, font-size 0.1s";
                player.progress_tooltip.style.whiteSpace = "normal";
                let text = player.progress_tooltip.innerHTML;
                player.progress_tooltip.innerHTML = `
                    <div style="color: #333333">${point.dataset.text}</div>
                    <div style='height: 8px'></div>
                    <div style="color: #333333">${text}</div>
                `;
            });
            
            point.addEventListener("mouseleave", function () {
                player.progress_tooltip.style.fontSize = "10px";
                player.progress_tooltip.style.minWidth = "44px";
            });
        }
        return point;
    }
    
    // this method maps the point to the progress bar
    addPointToProgress(point) {
        if (!this.progress_bar_container) {
            this.progress_bar_container = document.querySelector("div.jw-progress");
            this.progress_tooltip = document.querySelector('span.jw-time-time');
        }
        this.progress_bar_container.appendChild(point);
    }
    
    // this method prevents the "add comment form" from being processed
    preventForm() {
        let player = this;
        let form = document.querySelector("form[name='set_point']");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            let title = form.querySelector("input[name='point']");
            let marker = player.createMarker(title.value, Math.floor(player.player.getPosition() * 10) / 10);
            player.markers.push(marker);
            player.add_comment_modal.hide();
            title.value = "";
            let point = player.createPoint(marker);
            player.addPointToProgress(point);
        });
    }
    
    // this method sets markers before loading the player
    setMarkers(markers) {
        let player = this;
        this.player.on("firstFrame", function () {
            let duration = player.player.getDuration();
            for (const marker of markers) {
                if (marker.time <= duration) {
                    let point = player.createPoint(marker);
                    player.addPointToProgress(point);
                }
            }
        });
    }
    
    // this method creates a marker object
    createMarker(title, time) {
        return {"title": title, "time": time, "id": this.markers.length + 1};
    }
    
    updateMarkers(markers) {
        for (let i = 0; i < markers.length; i++) {
            let marker = this.createMarker(markers[i].title, markers[i].time);
            this.markers.push(marker);
        }
    }
    
    // this method fixes the position of points in progress bar
    fixPointPosition() {
        let player = this;
        let progress_bar;
        this.player.on('ready', function () {
            progress_bar = document.querySelector('div.jw-progress');
            player.progress_bar_width = progress_bar.parentElement.getBoundingClientRect().width;
        });
        
        player.player.on('fullscreen', function () {
            setTimeout(function () {
                let p_w = progress_bar.parentElement.getBoundingClientRect().width;
                if (!player.wrong_scale)
                    player.wrong_scale = p_w / player.progress_bar_width;
                let points = progress_bar.children;
                for (let point of points) {
                    let left2;
                    let left1 = Number(point.style.left.replace('px', ''));
                    if (p_w === player.progress_bar_width) {
                        left2 = left1 / player.wrong_scale;
                    } else {
                        left2 = left1 * player.wrong_scale;
                    }
                    point.style.left = `${left2}px`;
                }
            }, 100);
        });
    }
    
    // this method adds a button to the toolbar to see all points
    addCommentList(elementId) {
        let player = this;
        
        // toggle side menu (comment list panel)
        function toggleSideMenu() {
            let side_menu = player.comment_list;
            if (side_menu.ariaExpanded === "false") {
                side_menu.ariaExpanded = "true";
                side_menu.style.width = "30%";
            } else {
                side_menu.ariaExpanded = "false";
                side_menu.style.width = "0";
            }
        }
        
        player.player.addButton(
            "./static/assets/buttons/list.svg",
            "comment list",
            toggleSideMenu,
            "comment list"
        );
        
        this.player.on('firstFrame', function () {
            let wrapper = document.getElementById(elementId);
            let side_menu = document.createElement("div");
            side_menu.ariaExpanded = "false";
            side_menu.style.width = "0";
            side_menu.style.height = "100%";
            side_menu.style.position = "absolute";
            side_menu.style.top = "0";
            side_menu.style.right = "0";
            side_menu.style.backgroundColor = "#1a1a1aba";
            side_menu.style.zIndex = "1080";
            side_menu.style.transition = "all 0.3s";
            player.comment_list = side_menu;
            wrapper.appendChild(side_menu);
            
            let close = document.createElement("button");
            close.classList.add("btn");
            close.innerHTML = `
                <svg style="color: white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
            `;
            close.style.transition = "all 0.3s";
            close.style.position = "absolute";
            close.style.left = "10px";
            close.style.top = "10px";
            side_menu.appendChild(close);
            
            close.addEventListener('click', function () {
                toggleSideMenu();
            });
        });
    }
}