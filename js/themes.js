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