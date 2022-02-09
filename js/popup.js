

//Adds a Listener to de DOM until it loads
document.addEventListener('DOMContentLoaded', () => {
    loadStates();
    let urlInput = document.getElementById("url-exception");
    let intervalInput = document.querySelector('#interval');
    let carousselInput = document.querySelector('#screen-time');
    let ptBr = document.getElementById('pt-BR');
    let enUs = document.getElementById('en-US');
    let theme0 = document.getElementById('theme-0');
    let theme1 = document.getElementById('theme-1');

    //Adds Listener to the OK button and sends Message to Background.
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

    //Adds Listener to REFRESH radios and sends Message to Background.
    document.querySelectorAll('.tg-reload').forEach((element, index, array) => {

        element.addEventListener('click', (e) => {

            let tgReload = document.getElementById('reload-on').checked;
            chrome.runtime.sendMessage({ target: 'toggle_reload', value: tgReload });
            tgReload ? createMessage('primary', 'Auto reload activated.', 2000) : createMessage('primary', 'Auto reload disabled.', 2000);

        }, false);

    })

    // Adds Listener to CAROUSSEL radios and sends Message to Background.
    document.querySelectorAll('.tg-caroussel').forEach((element, index, array) => {

        element.addEventListener('click', (e) => {

            let tgCaroussel = document.getElementById('caroussel-on').checked;
            chrome.runtime.sendMessage({ target: 'toggle_caroussel', value: tgCaroussel });
            tgCaroussel ? createMessage('primary', 'Caroussel activated.', 2000) : createMessage('primary', 'Caroussel disabled.', 2000);

        }, false);

    });

    document.getElementById("remove").addEventListener('click', (e) => {

        chrome.tabs.create({
            url: '../html/exceptions.html'
        })

    });

    // Adds Listeners to filter urlInput.
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

    //Adds Listeners to filter numberInputs.
    addEvents([intervalInput, carousselInput], 'keypress', (e) => {

        let lang = localStorage.getItem('lang');

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
        switchToTheme(e.target.id);
    });

    addEvents([ptBr, enUs], 'click', (e)=>{

        e.preventDefault();
        switchLang(e.target.id)


    });

    function switchToTheme(id) {

        let theme;

        switch (id) {
            case 'theme-0':
                theme = 'nes';
                document.getElementById('soft').rel = 'stylesheet alternate';
                document.getElementById(theme).rel = 'stylesheet';
                break;
            case 'theme-1':
                theme = 'soft'
                document.getElementById('nes').rel = 'stylesheet alternate';
                document.getElementById(theme).rel = 'stylesheet';
                break;
            default:
                return false;
        }
        chrome.runtime.sendMessage({ target: 'themes', value: theme });
    }

    function switchLang(id){
        let enTxt = document.querySelectorAll('span[lang=en-US]');
        let ptTxt = document.querySelectorAll('span[lang=pt-BR]');
        
        switch(id){
            case 'en-US':
                enTxt.forEach((span, index, array)=>{
                    span.classList.remove('hidden');
                });
                ptTxt.forEach((span, index, array)=>{
                    span.classList.add('hidden');
                });
            break;
            case 'pt-BR':
                ptTxt.forEach((span, index, array)=>{
                    span.classList.remove('hidden');
                });
                enTxt.forEach((span, index, array)=>{
                    span.classList.add('hidden');
                });
            break;
            default:
                return false;
                break;
        }
        chrome.runtime.sendMessage({target: 'lang', value: id})
    }

    function getStorage() {
        return new Promise((resolve, reject) => {
            let result = localStorage;
            resolve(result);
        })
    }

    function loadStates() {
        getStorage().then((result) => {

            //Checkboxes Elements
            let reloadOn = document.getElementById("reload-on");
            let reloadOff = document.getElementById("reload-off");
            let carousselOn = document.getElementById("caroussel-on");
            let carousselOff = document.getElementById("caroussel-off");
            //Checkboxes checked
            result.reloadActive == 'true' ? reloadOn.checked = true : reloadOff.checked = true;
            result.carousselActive == 'true' ? carousselOn.checked = true : carousselOff.checked = true;
            // //themes
            // result.theme == 'nes' ? switchToTheme('theme-0') : false;
            // result.theme == 'soft' ? switchToTheme('theme-1') : false;

            //Inputs
            document.querySelector('#interval').value = result.interval / 1000;
            document.querySelector('#screen-time').value = result.screenTime / 1000;

            //themes
            let theme = localStorage.getItem('theme');
            switch(theme){
                case 'nes':
                    switchToTheme('theme-0');
                break;
                case 'soft':
                    switchToTheme('theme-1');
                break;
                default:
                    return false;
            }
            //languages
            let lang = localStorage.getItem('lang');
            switchLang(lang);
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
        let span = `<span id="modal-text" class="nes-text is-${type} modal" style="margin: 16px 0px; text-align: center">${stg}</span>`
        document.querySelector(".modal-container").innerHTML = span;
        setTimeout(destroyMessage, interval);
    }

    function destroyMessage() {
        document.querySelector(".modal-container").innerHTML = '';
    }

});