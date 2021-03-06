let allTabsCaroussel;
let loadingCaroussel;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    allTabsCaroussel = request;
});

getAllTabsCaroussel();

document.addEventListener('DOMContentLoaded', () => {
    switchFlags();
    insertSpinner();
    loading = setInterval(loop, 1000);
    let resetBtn = document.querySelector('.reset_btn');
    resetBtn.addEventListener('click', e=>{
        e.preventDefault();
        localStorage.setItem('customCaroussel','');
        window.location.reload();
    });
    switchLang(localStorage.getItem('lang'));
    switchToTheme(localStorage.getItem('theme'));

});

function insertSpinner() {
    let list = document.getElementById('list');
    list.innerHTML = `<span class="center margin_y">Loading current tabs...</span>`;
}

function destroySpinner() {
    let list = document.getElementById('list');
    list.innerHTML = ``;
}

function loop() {

    allTabsCaroussel = Object.values(allTabsCaroussel);

    if (allTabsCaroussel[0] == "tabs" || allTabsCaroussel[0] == "toggle_reload") {
        return window.location.reload();
    } else {
        destroySpinner();
        clearInterval(loading);

        injectRows(allTabsCaroussel, 'list').then((tabs) => {

            let buttons = document.querySelectorAll('button');
            let inputs = document.querySelectorAll('input');
            buttons.forEach((button, index, array) => {
                button.addEventListener('click', e => {
                    e.preventDefault();
                    inputs.forEach((input, index, array) => {
                        if (button.id.indexOf(input.id) >= 0) {

                            tabs.forEach((tab, index, array) => {
                                if (tab.id == input.id && input.value >= 3) {
                                    save(tab.url, input.value);
                                }
                                if(tab.id == input.id && input.value < 3){
                                    alert('Invalid value: '+'\"'+input.value+'\"'+'\n\n*All values must be equal or greater than 3 seconds to avoid CPU stress.');
                                }
                            });

                        } else {
                            return false;
                        }

                    });

                });

            });

            switchLang(localStorage.getItem('lang'));
        });

    }
}

function save(url, value) {
    chrome.runtime.sendMessage({ target: 'saveCaroussel', url: url, value: value });
    alert('New custom screen time ('+value+' seconds) was registered.');
}

function injectRows(tabs, element) {

    return new Promise((resolve, reject) => {
        let list = document.getElementById(element);
        let customCaroussel;
        if (!localStorage.customCaroussel.length) {
            customCaroussel = [];
        } else {
            customCaroussel = JSON.parse(localStorage.customCaroussel);
        }

        tabs.forEach((tab, index, array) => {

            let value = localStorage.getItem('screenTime');
            customCaroussel.forEach((custom, index) => {
                if (custom.url == tab.url)
                value = custom.value;
            });

            list.innerHTML +=

                `<div class="list_content">
        <div class="flex_row">

            <div class="flex_row_left">
                <span class="index">
                    ${index + 1}.
                </span>
                <span class="url_name">
                    ${tab.url}
                </span>
            </div>

            <div class="flex_row_right">
                <input id="${tab.id}" type="number" value="${value}" maxlength="5" data-url="${tab.url}">
                <button id="${tab.id}-button" class="button save_button nes-btn is-success" data-lang="saveBtn">Save</button>
            </div>

        </div>`
        });

        resolve(tabs);

    });


}

function getAllTabsCaroussel() {
    chrome.runtime.sendMessage({ target: 'tabs' });
}

function receiveMessage(request) {

    return new Promise((resolve, reject) => {
        resolve(request);
    })

}