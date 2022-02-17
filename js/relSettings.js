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
    list.innerHTML = `<span class="center margin_y">Loading current tabs...</span>`;
}

function destroySpinner() {
    let list = document.getElementById('list');

    list.innerHTML = ``;
}

function loop() {
    if (allTabs == undefined || allTabs.length < 0) {
        clearInterval(loading);
        loading = setInterval(loop, 1000);
        return false;
    } else {
        destroySpinner();
        clearInterval(loading);

        injectRows(allTabs, 'list').then((tabs) => {

            let radios = document.querySelectorAll('input[type=radio]');
            radios.forEach((radio, index, array) => {
                radio.addEventListener('change', e => {
                    save(radio.name, radio.value)

                });

            });
        });

    }

}

function getAllTabs() {

    chrome.runtime.sendMessage({ target: 'tabs' });
    return;

}

function save(url, value) {
    chrome.runtime.sendMessage({ target: 'saveAuto', url: url, value: value });
}

function injectRows(tabs, element) {

    return new Promise((resolve, reject) => {
        let list = document.getElementById(element);
        let customReload;
        if (!localStorage.customReload.length) {
            customReload = [];
        } else {
            customReload = JSON.parse(localStorage.customReload);
        }

        tabs.forEach((tab, index, array) => {

            let disabled;
            customReload.forEach((item, index, array) => {
                if (item.url == tab.url) {
                    disabled = item.value;
                }
            })

            let radioOn =
                `
                <div class="radio_div">
                    <label>
                        <input type="radio" class="nes-radio is-dark" name="${tab.url}" value="true" checked/>
                            <span>On</span>
                    </label>
            
                    <label>
                        <input type="radio" class="nes-radio is-dark" name="${tab.url}" value="false"/>
                            <span>Off</span>
                    </label>
                </div>
                `
            let radioOff =
                `
                <div class="radio_div">
                    <label>
                        <input type="radio" class="nes-radio is-dark" name="${tab.url}" value="true"/>
                            <span>On</span>
                    </label>
            
                    <label>
                        <input type="radio" class="nes-radio is-dark" name="${tab.url}" value="false" checked/>
                            <span>Off</span>
                    </label>
                </div>
                `

            list.innerHTML += `<div class="list_content">
                    <div class="flex_row">
        
                        <div class="flex_row_left">
                            <span class="index">
                                ${index}.
                            </span>
                            <span class="url_name">
                                ${tab.url}
                            </span>
                        </div>
        
                        <div class="flex_row_right">
                            ${(disabled == 'false') ? radioOff : radioOn}
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



