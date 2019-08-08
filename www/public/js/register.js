const socketAddress = (location.protocol.match(/^https/) ? "wss" : "ws") + `://${location.host}${location.pathname}`;
const socket = new WebSocket(socketAddress);

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        let obj = {
            action: "register",
            // TODO: może jakieś ukryte pole w formularzu, jako zabezpieczenie
            login: registerForm.login.value,
            password: registerForm.password.value,
        };
        socket.send(JSON.stringify(obj));
        console.log("rejestracja", obj);
    }
});
