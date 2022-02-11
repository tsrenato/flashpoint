function initialize(){
    chrome.runtime.sendMessage({target: 'tabs'}, resp=>{
        console.log(resp)
    })

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