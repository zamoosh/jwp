class JwPlayer {
    progress_bar_width;
    wrong_scale;
    player;
    add_comment_modal;
    add_comment;
    markers = [];
    
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
        this.preventForm();
        if (markers) {
            this.markers = this.markers.concat(markers);
            this.setMarkers(this.markers);
        }
        this.fixPointPosition();
    }
    
    addCommentButton() {
        let player = this;
        
        // function closeModal(player) {
        //     player.add_comment_modal.close();
        // }
        
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
                                <input required autofocus type="text" class="form-control" name="point" id="point">
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
            
            /*let progress_bar = document.querySelector("div.jw-progress");
            let current_position = Number(progress_bar.style.width.replace("%", ""));
            let full_width = progress_bar.parentElement.getBoundingClientRect().width;
            let left = (current_position * full_width) / 100;*/
            
            let point = player.createPoint();
            document.querySelector("div.jw-progress").appendChild(point);
            /*let point = document.createElement("span");
            point.style.position = "fixed";
            point.style.left = `${left}px`;
            point.style.height = "100%";
            point.style.width = "5px";
            point.style.zIndex = "1080";
            point.style.backgroundColor = "red";
            point.style.transition = "all 0.3s";
            document.querySelector("div.jw-progress").appendChild(point);
            point.addEventListener("mouseover", function () {
                point.style.transform = "scale(1.2)";
            });
            
            point.addEventListener("mouseleave", function () {
                point.style.transform = "scale(1)";
            });*/
            
            player.add_comment_modal = new bootstrap.Modal(document.getElementById("add_comment"));
            player.add_comment_modal.show();
        }
    }
    
    createPoint(marker) {
        let point;
        let progress_bar = document.querySelector("div.jw-progress");
        let full_width = progress_bar.parentElement.getBoundingClientRect().width;
        if (marker) {
            console.log(marker.title, marker.time);
        } else {
            let current_position = Number(progress_bar.style.width.replace("%", ""));
            let left = (current_position * full_width) / 100;
            point = document.createElement("span");
            point.style.position = "absolute";
            point.style.left = `${left}px`;
            point.style.height = "100%";
            point.style.width = "5px";
            point.style.zIndex = "1080";
            point.style.backgroundColor = "red";
            point.style.transition = "all 0.3s";
            point.addEventListener("mouseover", function () {
                point.style.transform = "scale(1.2)";
            });
            
            point.addEventListener("mouseleave", function () {
                point.style.transform = "scale(1)";
            });
        }
        return point;
    }
    
    preventForm() {
        let player = this;
        let form = document.querySelector("form[name='set_point']");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            let point = form.querySelector("input[name='point']");
            player.add_comment_modal.hide();
            point.value = "";
        });
    }
    
    setMarkers(markers) {
        let player = this;
        this.player.on("firstFrame", function () {
            console.log(player.player.getDuration());
            for (const marker of markers) {
                player.createPoint(marker);
            }
        });
    }
    
    createMarkers(title, time) {
        console.log("creating markers");
        return {"title": title, "time": time};
    }
    
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
}