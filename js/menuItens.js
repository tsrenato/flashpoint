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
    e.preventDefault();
    switchFlags();
});

function switchFlags() {

    let flag = document.getElementById('lang-btn');

    if (flag.title == "Protuguês Brasileiro") {
        flag.src = "../icons/usa.png";
        flag.title = "English USA";
        switchLang('english');
    } else {
        flag.src = "../icons/brasil.png";
        flag.title = "Protuguês Brasileiro";
        switchLang('portuguese');
    }
}