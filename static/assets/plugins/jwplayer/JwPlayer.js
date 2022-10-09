class JwPlayer {
    constructor(elementId) {
        this.player = jwplayer(elementId).setup({
            file: "./media/videos/3/master.m3u8",
            "logo": {
                "file": "./static/assets/images/vidoneplus-logo-1.png",
                "link": "https://google.com",
                "hide": "true",
                "position": "top-left"
            },
            
            // shows a small player on scroll
            "floating": {
                "dismissible": false
            },
            image: './media/images/logo.jpg',
            width: "100%",
            height: "100%",
            stretching: "bestfit"
        });
        this.addComment();
    }
    
    addComment() {
        let player = this;
        this.player.addButton(
            "./static/assets/buttons/comment.svg",
            "add comment",
            showModal,
            "add_comment"
        );
        this.add_comment = document.createElement('div');
        this.add_comment.classList.add('modal', 'fade');
        this.add_comment.setAttribute('id', 'add_comment');
        this.add_comment.setAttribute('tabindex', '-1');
        this.add_comment.setAttribute('aria-labelledby', 'add_comment_modal');
        this.add_comment.setAttribute('aria-hidden', 'true');
        this.add_comment.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-dark" id="add_comment_modal">comment</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form name="set_tip">
                            <div class="mb-3">
                                <label for="tip" class="form-label text-dark">point tip</label>
                                <input required autofocus type="text" class="form-control" name="tip" id="tip">
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
            player.player.pause();
            let current_time = player.player.getPosition(); // === progress_bar.style.width
            console.log(current_time);
            // player.player.duration === 100%
            let progress_bar = document.querySelector('div.jw-progress');
            let current_position = progress_bar.style.width;
            let point = document.createElement('span');
            point.style.position = 'fixed';
            point.style.left = current_position;
            point.style.height = '5px';
            point.style.width = '5px';
            point.style.backgroundColor = 'red';
            point.style.transition = 'all 0.3s';
            document.querySelector('div.jw-slider-container').appendChild(point);
            point.addEventListener('mouseover', function () {
                point.style.transform = 'scale(1.2)';
            });
            
            point.addEventListener('mouseleave', function () {
                point.style.transform = 'scale(1)';
            });
            
            if (!this.add_comment_modal) {
                this.add_comment_modal = new bootstrap.Modal(document.getElementById("add_comment"));
            }
            this.add_comment_modal.show();
        }
    }
}