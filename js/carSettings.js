let allTabs;
let loading;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    receiveMessage(request).then((resp) => {
        allTabs = resp;
    });

});

document.addEventListener('DOMContentLoaded', () => {
    getAllTabs();
    insertSpinner();
    loading = setInterval(loop, 1000);

});


function insertSpinner() {
    let list = document.getElementById('list');
    list.innerHTML = `<span class="center">Loading current tabs...</span>`;
}

function destroySpinner() {
    let list = document.getElementById('list');
    list.innerHTML = `<p class="title" data-lang="autoReloadSet">Caroussel Settings</p>`;
}

function loop() {
    if (allTabs == undefined) {
        return false;
    } else {
        destroySpinner();
        clearInterval(loading);

        injectRows(allTabs, 'list').then((tabs) => {
            let buttons = document.querySelectorAll('button');
            let inputs = document.querySelectorAll('input');
            buttons.forEach((button, index, array) => {
                button.addEventListener('click', e => {
                    e.preventDefault();
                    inputs.forEach((input, index, array) => {
                        if (button.id.indexOf(input.id) >= 0) {

                            tabs.forEach((tab, index, array) => {
                                if (tab.id == input.id) {
                                    save(tab.url, input.value);
                                }
                            });

                        } else {
                            return false;
                        }

                    });

                });

            });
        });
    }
}

function getAllTabs() {

    chrome.runtime.sendMessage({ target: 'tabs' });
    return 'abacate';

}

function save(url, value) {
    chrome.runtime.sendMessage({ target: 'saveCaroussel', url: url, value: value });
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

            let value = 0;
            customCaroussel.forEach((custom, index) => {
                if (custom.url == tab.url) value = custom.value;
            })

            list.innerHTML +=

                `<div class="list_content">
                <div class="flex_row">
    
                    <div class="flex_row_left">
                        <span>
                            ${index}.
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

function switchLang(id) {

    chrome.runtime.sendMessage({ target: 'lang', value: id });

    injectText(id);

}

function injectText(lang) {

    document.querySelectorAll('[data-lang]').forEach((element, index, array) => {

        element.innerHTML = text[lang][element.dataset.lang];

    })
}

function receiveMessage(request) {

    return new Promise((resolve, reject) => {
        resolve(request);
    })

}



