
let _tabIndex = 1;
let _setCaroussel;
let _setIntReload;
let _tag = '.: Flashpoint :. | ';
let _currentPage;

localStorage.length ? false : initializeEnv();

toggleCaroussel((getItem('carousselActive') == 'true'));
toggleReload((getItem('reloadActive') == 'true'));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (sender.origin.indexOf('popup.html')) {
        switch (request.target) {

            case 'interval':
                setItem('interval', request.value * 1000);
                if (getItem('reloadActive') == "true") {
                    clearInterval(_setIntReload);
                    toggleReload(true);
                }

                console.log(_tag + 'Reload interval is now ' + request.value + ' seconds.');

                break;

            case 'screen-time':
                setItem('screenTime', request.value * 1000);
                if (getItem('carousselActive') == "true") {
                    clearInterval(_setCaroussel);
                    toggleCaroussel(true);
                }
                console.log(_tag + 'Tab screen time is now ' + request.value + ' seconds.');

                break;
            case 'send-url':
                let _urlExceptions = [getItem('urlExceptions')];
                if (_urlExceptions[0] == 'Default' || _urlExceptions[0].length < 1) _urlExceptions = []
                _urlExceptions.push(request.value);
                setItem('urlExceptions', _urlExceptions);
                console.log(_tag + 'The ' + request.value + ' url is now in caroussels blacklist.');

                break;
            case 'toggle_reload':
                setItem('reloadActive', request.value);
                toggleReload(request.value);
                console.log(request.value ? _tag + 'Auto reload pages is active.' : _tag + 'Auto reload pages is disabled.');
                break;

            case 'toggle_caroussel':
                setItem('carousselActive', request.value);
                toggleCaroussel(request.value);
                console.log(request.value ? _tag + 'Caroussel pages is active.' : _tag + 'Caroussel is disabled.');
                break;

            case 'delete-exception':
                let exceptions = getItem('urlExceptions').split(',');

                exceptions.splice(exceptions.indexOf(request.value), 1);
                setItem('urlExceptions', exceptions);
                console.log(request.value, ' have been removed from blacklist.')
                break;

            case 'themes':
                setItem('theme', request.value);
                console.log('theme was changed to ', request.value);
                break;

            case 'lang':
                setItem('lang', request.value);
                console.log('lang was changed to ', request.value);
                break;
            default:
                return false;
        }
    }

});

// Methods

function reload() {

    chrome.tabs.query({ active: true }, result => {
        _currentPage = result[0];

        chrome.tabs.query({}, tabs => {
            tabs.forEach((tab, index, array) => {
                chrome.tabs.update(tab.id, { url: tab.url });
            })
        })

    });

}

function getHorses() {

    let exceptions = getItem('urlExceptions').split(',');
    let _horses = [];

    return new Promise((resolve, reject) => {

        getAllTabs().then((tabs) => {

            let newTabs = tabs;
            let addresses = Object.keys(newTabs);

            addresses = addresses.filter(address => {

                let found = true;

                if (exceptions[0].length < 1) exceptions = ['Default'];

                exceptions.forEach((url, index, array) => {
                    if (newTabs[address].url.indexOf(url) != -1)
                        found = false;
                })

                return found;

            })

            _horses = addresses.map(adress => newTabs[adress].id);

            resolve(_horses);

        });

    });
}

function caroussel() {

    getHorses().then((_horses) => {
        let horseList = _horses;

        if (horseList.length > 0) {
            if (_tabIndex < horseList.length) {
                chrome.tabs.update(horseList[_tabIndex], { selected: true });
                _tabIndex++;
            } else {
                _tabIndex = 0;
                chrome.tabs.update(horseList[_tabIndex], { selected: true });
                _tabIndex = 1;
            }
        }
    })

}

function toggleReload(bool) {

    if (bool) {
        clearInterval(_setIntReload);
        _setIntReload = null;
        _setIntReload = setInterval(reload, getItem('interval'));
    } else {
        clearInterval(_setIntReload);
        _setIntReload = null;
        setItem('reloadActive', false);
    }
}

function toggleCaroussel(bool) {
    if (bool) {
        clearInterval(_setCaroussel);
        _setCaroussel = null;
        _setCaroussel = setInterval(caroussel, getItem('screenTime'))
    } else {
        clearInterval(_setCaroussel);
        _setCaroussel = null;
        setItem('carousselActive', false);
    }
}

function getStorage(key) {
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(key, (values) => {
            resolve(values);
        })

    });
}

function getAllStored() {
    return new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (values) => {
            resolve(values);
        })
    });
}

function getAllCaller() {
    getAllStored().then((json) => {

        if (json.length > 0) {

            FlashpointStates = json;
            toggleRefresh(FlashpointStates.reloadActive);
        } else {
            chrome.storage.local.set({
                interval: 5000,
                screenTime: 5000,
                horses: null,
                urlExceptions: [],
                reloadActive: false,
                carousselActive: false,
                theme: 'soft'
            });
        }
    })

}

function initializeEnv() {

    let propsList = [
        'interval',
        'screenTime',
        'urlExceptions',
        'reloadActive',
        'carousselActive',
        'theme',
        'lang'

    ]

    propsList.forEach((value, index, array) => {
        switch (value) {
            case 'interval':
            case 'screenTime':
                setItem(value, 5000);
                break;
            case 'reloadActive':
            case 'carousselActive':
                setItem(value, false);
                break;
            case 'theme':
                setItem(value, 'soft')
                break;
            case 'lang':
                setItem(value, 'en-US')
                break;
            default:
                setItem(value, '');
        }

    });
}

function consoleStorage() {
    console.log(_tag + 'My Local States\n', localStorage);
}

function getAllTabs() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({}, tabs => {

            let result = {};

            tabs.forEach((tab, index) => {
                result[index] = { id: tab.id, url: tab.url }
            })

            resolve(result);
        })
    })
}

//localstorage setter
function setItem(key, value) {
    localStorage.setItem(key, value);
}
//localstorage getter
function getItem(key) {
    return localStorage.getItem(key);
}


