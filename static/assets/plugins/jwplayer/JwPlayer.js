class JwPlayer {
    progress_bar_width;
    wrong_scale;
    player;
    add_comment_modal;
    
    
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
        this.addComment();
        this.preventForm();
        if (markers)
            this.setMarkers();
        this.fixPointPosition();
    }
    
    addComment() {
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
            let current_time = player.player.getPosition(); // === progress_bar.style.width
            // player.player.duration === 100%
            let progress_bar = document.querySelector("div.jw-progress");
            let current_position = Number(progress_bar.style.width.replace("%", ""));
            let full_width = progress_bar.parentElement.getBoundingClientRect().width;
            let left = (current_position * full_width) / 100;
            
            let point = document.createElement("span");
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
            });
            
            player.add_comment_modal = new bootstrap.Modal(document.getElementById("add_comment"));
            player.add_comment_modal.show();
        }
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
    
    setMarkers() {
        console.log('setting markers');
    }
    
    fixPointPosition() {
        let player = this;
        let progress_bar;
        this.player.on('meta', function () {
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