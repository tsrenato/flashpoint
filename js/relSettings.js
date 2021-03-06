let allTabs;
let loading;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    allTabs = request;
});

getAllTabs();

document.addEventListener('DOMContentLoaded', () => {
    switchFlags();
    let resetBtn = document.querySelector('.reset_btn');
    resetBtn.addEventListener('click', e=>{
        e.preventDefault();
        localStorage.setItem('customReload','');
        window.location.reload();
    });
    insertSpinner();
    loading = setInterval(loop, 1000);
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

    allTabs = Object.values(allTabs);

    if (allTabs[0] == "tabs" || allTabs[0] == "toggle_reload") {
        return window.location.reload();
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

    tabs = Object.values(tabs);

    return new Promise((resolve, reject) => {
        let list = document.getElementById(element);
        let customReload;
        if (!localStorage.customReload.length) {
            customReload = [];
        } else {
            customReload = JSON.parse(localStorage.customReload);
        }

        if (tabs[0].target == 'tabs') return window.location.reload();

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
                            <span data-lang="on">On</span>
                    </label>
            
                    <label>
                        <input type="radio" class="nes-radio is-dark" name="${tab.url}" value="false"/>
                            <span data-lang="off">Off</span>
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
                                ${index + 1}.
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

function receiveMessage(request) {

    return new Promise((resolve, reject) => {
        resolve(request);
    })

}
