
document.addEventListener('DOMContentLoaded', ()=>{
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
})




function switchLang(id) {

    chrome.runtime.sendMessage({ target: 'lang', value: id });

    injectText(id);

}

function injectText(lang) {

    document.querySelectorAll('[data-lang]').forEach((element, index, array) => {

        element.innerHTML = text[lang][element.dataset.lang];

    })
}