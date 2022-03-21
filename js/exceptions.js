document.addEventListener('DOMContentLoaded', () => {
    let frame = document.querySelector(".frame");
    loadExceptions(frame);
    switchFlags();
    let resetBtn = document.querySelector('.reset_btn');
    if(localStorage.getItem('urlExceptions').length < 1 ) resetBtn.style["display"] = "none";
    resetBtn.addEventListener('click', e=>{
        e.preventDefault();
        localStorage.setItem('urlExceptions','');
        window.location.reload();
    });
    switchLang(localStorage.getItem('lang'));
    switchToTheme(localStorage.getItem('theme'));
});

function getStorage() {
    return new Promise((resolve, reject) => {
        let result = chrome.storage.sync.get(resp=>{ return resp});
        resolve(result);
    })
}

function loadExceptions(parent) {
    getStorage().then((result) => {

        let arr = result.urlExceptions.split(',');

        arr.forEach((url, index, array) => {

            if (url.length > 0) {

                parent.innerHTML +=
                    `<div class="row" >
                <div class="flex_item"><span class="url">"${url}"</span></div>
                <div class="flex_item"><button class="remove_button nes-btn is-error" value=${url} data-lang="remove">Remove</button><div>
            </div>`;
            } else if (index == 0 && url.length == 0) {
                parent.innerHTML = `<p style="text-align: center">There are no exception words.</p>`
            }
        });

        document.querySelectorAll('.remove_button').forEach((element, index, array) => {

            element.addEventListener('click', (e) => {

                e.preventDefault();
                chrome.runtime.sendMessage({ target: 'delete-exception', value: e.target.value });
                location.reload();
            }, false)

        });

        switchLang(localStorage.getItem('lang'));

    })
}