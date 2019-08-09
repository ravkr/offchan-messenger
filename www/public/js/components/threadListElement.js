class ThreadListElement extends HTMLElement {
    constructor() {
        super();

        let elementData = JSON.parse(this.getAttribute("data"));
        console.log(elementData);

        const shadow = this.attachShadow({mode: "open"});

        const listElement = document.createElement("div");
        listElement.setAttribute("class", "listElement");

        const sectionProfilePicture = document.createElement("section");
        sectionProfilePicture.innerHTML = `
        <div class="profilePicture">
            <img class="normalThumbnail" src="${elementData.picture}">
        </div>
        `;
        listElement.appendChild(sectionProfilePicture);


        const sectionMessagePreview = document.createElement("section");
        sectionMessagePreview.setAttribute("class", "messagePreview");
        sectionMessagePreview.innerHTML = `
        <div class="messageSender">${elementData.name}</div>
        <div class="messageText">
            <span class="">${elementData.snippet}</span>
        </div>
        `;
        // TODO: wyżej powinno być podzielone na wysyłającego i na wiadomość;
        // np. tak:
        //      <span class="">Ty: <span>lol xD</span></span>
        listElement.appendChild(sectionMessagePreview);


        const sectionTime = document.createElement("section");
        sectionTime.innerHTML = "<time class=\"timestamp\" title=\"Dziś\" data-utime=\"1564852492.264\">19:14</time>";
        listElement.appendChild(sectionTime);

        const style = document.createElement("style");
        style.textContent = `

:host(:hover) {
    /*background-color: #292929;*/
    /* 0.15 też jest fajne */
    background-color: rgba(255, 255, 255, .1);
}
:host {
    margin: 0 0.3em;
    border-radius: 0.6em;
}

img.normalThumbnail {
    width: 50px;
    height: 50px;
}

.profilePicture {
    padding-right: 0.6em;
}

.listElement {
    display: flex;
    /*padding: 0 .6em;*/
}

.messagePreview {
    flex: 1;
    display: flex;
    flex-direction: column;
}
        `;

        shadow.appendChild(style);
        shadow.appendChild(listElement);
    }
}

customElements.define("thread-list-element", ThreadListElement);
