document.addEventListener('DOMContentLoaded', () => {
    let frame = document.querySelector(".frame");
    loadExceptions(frame);

    let theme0 = document.getElementById('nes');
    let theme1 = document.getElementById('soft');

    [theme0, theme1].forEach((element, index) => {
        element.addEventListener('click', e => {
            e.preventDefault();
            switchToTheme(e.target.id);
        });
    });

});

function getStorage() {
    return new Promise((resolve, reject) => {
        let result = localStorage;
        resolve(result);
    })
}

function loadExceptions(parent) {
    getStorage().then((result) => {

        let arr = result.urlExceptions.split(',');
    
        arr.forEach((url, index, array) => {
           
            if(url.length > 0){

                parent.innerHTML +=
            `<div class="row" >
                <div class="flex_item"><span class="url">"${url}"</span></div>
                <div class="flex_item"><button class="remove_button nes-btn is-error" value=${url}>Remove</button><div>
            </div>`;
            }else if(index == 0 && url.length == 0){
                parent.innerHTML = `<p style="text-align: center">There are no exception words.</p>`
            }
        });

        document.querySelectorAll('.remove_button').forEach((element, index, array) => {

            element.addEventListener('click', (e)=>{

                e.preventDefault();
                chrome.runtime.sendMessage({target: 'delete-exception', value: e.target.value});
                location.reload();
            }, false)

        }); 

        

    })
}

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
