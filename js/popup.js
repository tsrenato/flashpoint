//Adds a Listener to de DOM until it loads
document.addEventListener('DOMContentLoaded', () => {
    let timeout;
    let ptBr = document.getElementById('portuguese');
    let enUs = document.getElementById('english');
    let theme0 = document.getElementById('nes');
    let theme1 = document.getElementById('soft');
    let urlInput = document.getElementById("url-exception");
    let reloadOn = document.getElementById("reload-on");
    let reloadOff = document.getElementById("reload-off");
    let carousselOn = document.getElementById("caroussel-on");
    let carousselOff = document.getElementById("caroussel-off");
    let tgReloadEl = document.querySelectorAll('.tg-reload');
    let tgCarousselEl = document.querySelectorAll('.tg-caroussel');
    let protectPage = document.getElementById("protect-page");
    let intervalInput = document.querySelector('#interval');
    let carousselInput = document.querySelector('#screen-time');

    loadStates();

    document.querySelector('#send-url').addEventListener('click', (e) => {

        e.preventDefault();

        let urlException = document.querySelector('#url-exception').value;
        if (urlException.length >= 32) {

            createMessage('error', 'Too much characters. Try a shorter and more specific part from the url.', 3000);
            return false;
        }
        if (urlException <= 2) {
            createMessage('error', 'Too few characters. Try a short and specific part from the url.', 3000);
            return false;
        }
        chrome.runtime.sendMessage({ target: e.target.id, value: urlException });
        document.querySelector('#url-exception').value = '';
        createMessage('success', 'Exception word added.', 2000);

    }, false);

    document.getElementById("remove").addEventListener('click', (e) => {

        chrome.tabs.create({
            url: '../html/exceptions.html'
        })

    });

    document.getElementById("reload-settings").addEventListener('click', (e) => {

        chrome.tabs.create({
            url: '../html/relSettings.html'
        })

    });

    document.getElementById("caroussel-settings").addEventListener('click', (e) => {

        chrome.tabs.create({
            url: '../html/carSettings.html'
        })

    });

    protectPage.addEventListener('click', e => {
        transformBtn(e.target, 'is-error');
        chrome.runtime.sendMessage({ target: 'blockCurrent' });
    });

    addEvents([urlInput], 'keypress change', (e) => {

        if (e.key === 'Enter') {

            if (e.target.value.length >= 32) {
                e.preventDefault();
                createMessage('error', 'Too much characters. Try a shorter and more specific part through the url.', 3000);
                e.target.value = '';
            }

            e.preventDefault();
            document.getElementById("send-url").click();
            e.target.value = '';
            return;

        }
    });

    tgReloadEl.forEach((element, index, array) => {

        element.addEventListener('click', (e) => {

            let tgReload = document.getElementById('reload-on').checked;
            chrome.runtime.sendMessage({ target: 'toggle_reload', value: tgReload });
            tgReload ? createMessage('primary', 'Auto reload activated.', 2000) : createMessage('primary', 'Auto reload disabled.', 2000);

        }, false);

    })

    tgCarousselEl.forEach((element, index, array) => {

        element.addEventListener('click', (e) => {

            let tgCaroussel = document.getElementById('caroussel-on').checked;
            console.log(typeof tgCaroussel, tgCaroussel);
            chrome.runtime.sendMessage({ target: 'toggle_caroussel', value: tgCaroussel });
            tgCaroussel ? createMessage('primary', 'Caroussel activated.', 2000) : createMessage('primary', 'Caroussel disabled.', 2000);

        }, false);

    });

    addEvents([intervalInput, carousselInput], 'keypress', (e) => {

        if (e.key == 'Enter') {

            if (isNaN(intervalInput.value) || isNaN(carousselInput.value)) {
                e.preventDefault();
                e.target.value = 5;
                createMessage('error', 'Format not accepted. Only number are accepted in this case.', 3000);
                return false;
            }

            if (intervalInput.value < 3 || carousselInput.value < 3) {
                e.preventDefault();
                createMessage('error', 'Values below 3 seconds may cause an unstopable loop.', 3000);
                return false;
            }

            if (intervalInput.value.length >= 5 || carousselInput.value.length >= 5) {
                e.preventDefault();
                createMessage('error', 'Interval time is too high. Extension will work better with lower intervals.', 3000);
                return false
            }

            switch (e.target.id) {
                case 'interval':
                    chrome.runtime.sendMessage({ target: 'interval', value: intervalInput.value });
                    createMessage('success', 'Auto reloading interval changed to ' + intervalInput.value + ' seconds.', 3000);
                    break;
                case 'screen-time':
                    chrome.runtime.sendMessage({ target: 'screen-time', value: carousselInput.value });
                    createMessage('success', 'Caroussel interval changed to ' + carousselInput.value + ' seconds.', 3000);
                    break;
                default:
                    return;
            }
        }

    });

    addEvents([theme0, theme1], 'click', (e) => {
        e.preventDefault();
        switchPopUpTheme(e.target.id);
    });

    addEvents([ptBr, enUs], 'click', (e) => {

        e.preventDefault();
        switchLang(e.target.id)
    });


    function switchPopUpTheme(id) {
        switch (id) {
            case 'nes':
                document.getElementById('css-soft').rel = 'stylesheet alternate';
                document.getElementById('css-' + id).rel = 'stylesheet';
                break;
            case 'soft':
                document.getElementById('css-nes').rel = 'stylesheet alternate';
                document.getElementById('css-' + id).rel = 'stylesheet';
                break;
            default:
                return false;
        }
        chrome.runtime.sendMessage({ target: 'themes', value: id });
    }
    
    function transformBtn(button, stgClass) {
        button.classList.toggle(stgClass);
        let lang = localStorage.getItem('lang');

        if (button.className.indexOf(stgClass) > -1) {
            button.innerHTML = 'Disable'
            button.dataset.lang = 'disable'
            switchLang(lang);
        } else {
            button.innerHTML = 'Enable'
            button.dataset.lang = 'enable'
            switchLang(lang);
        }
    }

    function getStorage() {
        return new Promise((resolve, reject) => {
            let result = localStorage;
            resolve(result);
        })
    }

    function loadStates() {
        getStorage().then((result) => {

            //Checkboxes checked
            result.reloadActive == 'true' ? reloadOn.checked = true : reloadOff.checked = true;
            result.carousselActive == 'true' ? carousselOn.checked = true : carousselOff.checked = true;

            //Inputs
            document.querySelector('#interval').value = result.interval;
            document.querySelector('#screen-time').value = result.screenTime;

            //themes
            let theme = localStorage.getItem('theme');
            switchPopUpTheme(theme);

            //languages
            let lang = localStorage.getItem('lang');
            switchLang(lang);

            //Prevent Current Page from Auto Reload Button
            let blockCurrent = localStorage.getItem('blockCurrentPage')
            if (blockCurrent == 'true') {
                protectPage.classList.add('is-error');
                protectPage.innerHTML = '<span data-lang="disable">Disable</span>'
            } else {
                protectPage.classList.remove('is-error');
                protectPage.innerHTML = '<span data-lang="enable">Enable</span>'
            }

            //Off button
            insertOffBtn()

        })
    }

    function addEvents(elements, events, f) {

        elements.forEach((element, index, array) => {

            events.split(' ').forEach((event, index, array) => {

                element.addEventListener(event, f)

            })

        })

    }

    function createMessage(type, stg, interval) {
        clearInterval(timeout);
        let span = `<div id="message" class="nes-text is-${type} soft-message message">${stg}</div>`
        document.querySelector(".modal-container").innerHTML = span;
        timeout = setTimeout(destroyMessage, interval);
    }

    function destroyMessage() {
        document.querySelector(".modal-container").innerHTML = '';
    }

    function insertOffBtn() {

        if (localStorage.getItem('reloadActive') == 'true' || localStorage.getItem('carousselActive') == 'true') {
            document.querySelector('.off_btn_container').innerHTML = `<img src="../icons/off.png" class="off_btn" title="Stop">`;
            document.querySelector('.off_btn').addEventListener('click', e => {
                e.preventDefault();
                chrome.runtime.sendMessage({ target: 'toggle_reload', value: false });
                chrome.runtime.sendMessage({ target: 'toggle_caroussel', value: false });
                reloadOff.checked = true;
                carousselOff.checked = true;
            });

        } else {
            document.querySelector('.off_btn_container').innerHTML = '';
        }

        
    }

});