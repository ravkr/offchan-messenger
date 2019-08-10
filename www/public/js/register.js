const socketAddress = (location.protocol.match(/^https/) ? "wss" : "ws") + `://${location.host}${location.pathname}`;
const socket = new WebSocket(socketAddress);

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        let obj = {
            action: "login",
            // TODO: może jakieś ukryte pole w formularzu, jako zabezpieczenie
            login: loginForm.login.value,
            password: loginForm.password.value,
        };
        socket.send(JSON.stringify(obj));
    }
});

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        let obj = {
            action: "register",
            // TODO: może jakieś ukryte pole w formularzu, jako zabezpieczenie
            login: registerForm.login.value,
            password: registerForm.password.value,
            realName: registerForm.realName.value,
        };
        socket.send(JSON.stringify(obj));
    }
});
