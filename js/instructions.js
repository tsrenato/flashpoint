
document.addEventListener('DOMContentLoaded', ()=>{
    switchFlags();
    switchLang(localStorage.getItem('lang'));
    switchToTheme(localStorage.getItem('theme'));
})