let allTabsCaroussel;
let loadingCaroussel;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    allTabsCaroussel = request;
});

getAllTabsCaroussel();

document.addEventListener('DOMContentLoaded', () => {
    insertSpinner();
    loading = setInterval(loop, 1000);

    let theme0 = document.getElementById('nes');
    let theme1 = document.getElementById('soft');
    let langBtn = document.getElementById('lang-btn');

    [theme0, theme1].forEach((element, index) => {
        element.addEventListener('click', e => {
            e.preventDefault();
            switchToTheme(e.target.id);
        });
    });

    langBtn.addEventListener('click', e => {

        if (e.target.title == "Protuguês Brasileiro") {
            e.target.src = "../icons/usa.png";
            e.target.title = "English USA";
            switchLang('english');
        } else {
            e.target.src = "../icons/brasil.png";
            e.target.title = "Protuguês Brasileiro";
            switchLang('portuguese');
        }


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

        console.log('allTabsCaroussel: ', allTabsCaroussel);

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
                                    alert('Invalid value');
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
                <span class="index">
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

function getAllTabsCaroussel() {

    chrome.runtime.sendMessage({ target: 'tabs' });

}

function receiveMessage(request) {

    return new Promise((resolve, reject) => {
        resolve(request);
    })

}

function switchToTheme(id) {

    switch (id) {
        case 'nes':
            document.getElementById('stylesheet').href = "/css/nes.min.css";
            break;
        case 'soft':
            document.getElementById('stylesheet').href = "/css/listing-soft.css";
            break;
        default:
            return false;
    }

    chrome.runtime.sendMessage({ target: 'themes', value: id });
}