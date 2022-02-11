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
    console.log('Spinner Spinning...');
}

function destroySpinner() {
    console.log('--> ', allTabs)
    console.log('Spinner Stoping...');
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
                                    save(tab.id, tab.url, input.value);
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

function save(id, url, value) {
    chrome.runtime.sendMessage({ target: 'saveAuto', id: id, url: url, value: value });
}

function injectRows(tabs, element) {

    return new Promise((resolve, reject) => {
        let list = document.getElementById(element);

        tabs.forEach((tab, index, array) => {
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
                        <input id="${tab.id}" type="number" value="0" maxlength="5">
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



