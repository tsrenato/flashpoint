//Adds a Listener to de DOM until it loads

document.addEventListener('DOMContentLoaded', () => {

    loadStates();

    let urlInput = document.getElementById("url-exception");
    let intervalInput = document.querySelector('#interval');
    let carousselInput = document.querySelector('#screen-time');

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
            e.preventDefault();
            document.getElementById("send-url").click();
            e.target.value = ' ';
            return;

        }

        if (e.target.value.length >= 32) {
            e.preventDefault();
            createMessage('error', 'Too much characters. Try a shorter and more specific part through the url.', 3000);
            e.target.value = '';
        }

    });

    //Adds Listeners to filter numberInputs.
    addEvents([intervalInput, carousselInput], 'change', (e) => {

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

    });

    addEvents([intervalInput, carousselInput], 'keypress', (e) => {

        if (e.key == 'Enter') {
            switch (e.target.id) {
                case 'interval':
                    chrome.runtime.sendMessage({ target: 'interval', value: intervalInput.value });
                    createMessage('success', 'Auto reloading every '+intervalInput.value+' seconds.', 3000);
                    break;
                case 'screen-time':
                    chrome.runtime.sendMessage({ target: 'screen-time', value: carousselInput.value });
                    createMessage('success', 'Switching tabs every '+carousselInput.value+' seconds.', 3000);
                    break;
                default:
                    return;
            }
        }

    });

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
            //Inputs
            document.querySelector('#interval').value = result.interval / 1000;
            document.querySelector('#screen-time').value = result.screenTime / 1000;
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
        let span = `<span id="modal-text" class="nes-text is-${type}" style="margin: 8px 0px; text-align: center">${stg}</span>`
        document.querySelector(".modal").innerHTML = span;
        setTimeout(destroyMessage, interval);
    }

    function destroyMessage() {
        document.querySelector(".modal").innerHTML = '';
    }

});