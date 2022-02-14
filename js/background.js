
let _tabIndex = 0;
let _setCaroussel;
let _setIntReload;
let _tag = '.: Flashpoint :. | ';
let _currentPage;

localStorage.length ? false : initializeEnv();

toggleCaroussel((getItem('carousselActive') == 'true'));
toggleReload((getItem('reloadActive') == 'true'));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

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
            break;
        case 'lang':
            setItem('lang', request.value);
            break;
        case 'tabs':
            chrome.tabs.query({}, tabs => {
                chrome.tabs.sendMessage(sender.tab.id, tabs);
            })
            break;
        case 'saveAuto':
        case 'saveCaroussel':
            let customCaroussel = getItem('customCaroussel');

            if (!customCaroussel.length)
                customCaroussel = [];
            else
                customCaroussel = JSON.parse(customCaroussel);

            let found = false;
            customCaroussel.forEach((obj, index, array) => {

                if (obj.url == request.url && obj.value == request.value) {
                    found = true;
                }
            })

            if (!found) {
                customCaroussel.forEach((tab, index, array) => {
                    if (tab.url == request.url) {
                        console.log(customCaroussel)
                        customCaroussel.splice(index, 1);
                        console.log(customCaroussel)
                    }
                })
                customCaroussel.push({ url: request.url, value: request.value });
                setItem('customCaroussel', JSON.stringify(customCaroussel))
            }


            break;
        default:
            return false;
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

            _horses = addresses.map(address => address = { id: newTabs[address].id, url: newTabs[address].url });

            resolve(_horses);

        });

    });
}

function caroussel() {
    clearInterval(_setCaroussel);
    _setCaroussel = null;

    getHorses().then((_horses) => {
        let horseList = _horses;

        if (horseList.length > 0) {

            if (_tabIndex == horseList.length) {
                _tabIndex = 0;
                _setCaroussel = setInterval(caroussel, 500);
                return false;
            }

            if (_tabIndex < horseList.length) {

                JSON.parse(getItem('customCaroussel')).forEach((customTab, customTabIdx) => {

                    if (horseList[_tabIndex]) {

                        if (customTab.url == horseList[_tabIndex].url) {
                            chrome.tabs.update(horseList[_tabIndex].id, { selected: true });
                            _tabIndex++;
                            _setCaroussel = setInterval(caroussel, (customTab.value * 1000))
                            return false;
                        } else {
                            chrome.tabs.update(horseList[_tabIndex].id, { selected: true });
                            _tabIndex++;
                            _setCaroussel = setInterval(caroussel, getItem('interval'));
                        }


                    }

                });




            }


        }
    })

}

function toggleCaroussel(bool) {
    if (bool) {
        clearInterval(_setCaroussel);
        _setCaroussel = null;
        _setCaroussel = setInterval(caroussel, 2000)
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
        'lang',
        'customReload',
        'customCaroussel'

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
                setItem(value, 'english')
                break;
            case 'customReload':
            case 'customCaroussel':
                setItem(value, '[]');
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


