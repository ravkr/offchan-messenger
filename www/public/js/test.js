
function initTest() {
	document.querySelector("#loginScreen").style.display = "none"
	document.querySelector("#messengerScreen").style.display = ""
}


socket.addEventListener("message", (msg) => {
	let response = JSON.parse(msg.data);
    console.log(response);
    if (response.result === "SUCCESS") {
    	initTest();

    }
    // console.log(msg);
    // ACCOUNT_DOES_NOT_EXIST
    // PASSWORD_WRONG
});
