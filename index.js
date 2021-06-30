const socket = io('http://192.168.1.119:25565');
// const socket = io('http://2.49.126.46:25565', { transports: ["websocket"] });

const username = prompt('What is your name?');
appendMessage("Server", '<b>You joined</b>');
socket.emit('new-user', username);

const emojiNameToLink = {
    ":Zoro:": "https://media.tenor.com/images/06da1118b43b557bfd75771851236792/tenor.gif",
    ":SeemsGood:": "https://static-cdn.jtvnw.net/emoticons/v1/64138/1.0",
    ":Ahegao:": "https://static-cdn.jtvnw.net/emoticons/v1/305783629/2.0",
    ":Thinking:": "https://static-cdn.jtvnw.net/emoticons/v1/1773743/2.0",
    ":CreepySmile:": "https://cdn.discordapp.com/avatars/427752688932093953/27dc8f59ba6f6581c4ca8042cc2aa1c4.png",
    ":GregSad:": "https://media.discordapp.net/attachments/799923760353640449/859346741098446888/GregSad.webp"
}

function toggleEmojiMenu() {
    document.getElementById("emoji-menu").hidden = !document.getElementById("emoji-menu").hidden;
}

function loadEmojiSelectorDiv() {
    var emojiMenu = document.getElementById("emoji-menu");
    emojiMenu.innerHTML = "";
    Object.entries(emojiNameToLink).forEach(([key, value]) => {
        const emojiHTML = `<img src=${value} title=${key} width='26px' height='26px' src=${value} style='padding: 4px;' onclick='appendEmojiToInput("${value}");'>`;
        emojiMenu.innerHTML += emojiHTML;
    });
}

function appendEmojiToInput(emojiSrc) {
    document.getElementById("main-input").innerHTML += `<img width='26px' height='26px' src=${emojiSrc}>`;
}

function getCurrentTime() {
    // var date = new Date();
    // var text = date.getHours() + ":" + date.getMinutes();
    return new Date().toLocaleTimeString();
}

function appendMessage(name, messageHTML) {
    var el = document.createElement("div");
    el.innerHTML = ("<span style='font-size: 10px; vertical-align: center;'>" + getCurrentTime() + "</span>")
    el.innerHTML += (" <span style='color: red;'><b>" + name + "</b></span>: ");
    el.innerHTML += messageHTML;
    var div = document.getElementById("message-log");
    div.appendChild(el);
    // div.scrollTop = div.scrollHeight - div.clientHeight; // For static scrolling.

    // For smooth scrolling
    $('#message-log').animate({
        scrollTop: div.scrollHeight - div.clientHeight
     }, 100);
}

function parseEmoji() {
    var fullString = document.getElementById("main-input").innerHTML;
    var oldCaretIndex = getCaretIndex();

    Object.entries(emojiNameToLink).forEach(([key, value]) => {
        if (fullString.includes(key)) {
            const emojiHTML = "<img width='26px' height='26px' src=" + value + ">";
            fullString = fullString.replace(key, emojiHTML);
            document.getElementById("main-input").innerHTML = fullString;
            oldCaretIndex -= (key.length-1);
            if (oldCaretIndex < 0) {
                oldCaretIndex = 0;
            }
            setCaretIndex(oldCaretIndex);
        }
    });
}

function textNodesUnder(node) {
    var all = [];
    for (node=node.firstChild;node;node=node.nextSibling){
        if (node.nodeType==3) {
            all.push(node);
        }
        else {
            all = all.concat(textNodesUnder(node));
        }
    }
    return all;
}

function getCaretIndex() {
    var contentEditable = document.getElementById("main-input");
    var index = 0;
    var selection = window.getSelection();
    var textNodes = textNodesUnder(contentEditable);
    for(var i = 0; i < textNodes.length; i++) {
        var node = textNodes[i];
        var isSelectedNode = node === selection.focusNode;
        if(isSelectedNode) {
            index += selection.focusOffset;
            break;
        }
        else {
            index += node.textContent.length;
        }
    }
    return index;
}

function setCaretIndex(newCaretIndex) {
    var contentEditable = document.getElementById("main-input");
    var cumulativeIndex = 0;
    var relativeIndex = 0;
    var targetNode = null;

    var textNodes = textNodesUnder(contentEditable);

    for(var i = 0; i < textNodes.length; i++) {
        var node = textNodes[i];
        
        if(newCaretIndex <= cumulativeIndex + node.textContent.length) {
            targetNode = node;
            relativeIndex = newCaretIndex - cumulativeIndex;
            break;
        }

        cumulativeIndex += node.textContent.length;
    }

    var range = window.document.createRange();
    range.setStart(targetNode, relativeIndex);
    range.setEnd(targetNode, relativeIndex);
    range.collapse();

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

document.addEventListener('keyup', e => {
    // if(e.code == "ArrowLeft" || e.code == "ArrowRight" || e.code == "ArrowUp" || e.code == "ArrowDown" || e.code == "Backspace" || e.code.startsWith("Alt") || e.code.startsWith("Control") || e.code.startsWith("Shift") || e.code == "CapsLock" || e.code == "Enter" || e.code == "Delete") {
        // console.log("works!");
    // }
    // else {
        parseEmoji();
    // }
});

document.addEventListener('keydown', e => {
    if (e.code == "Enter") {
        if (document.getElementById("main-input").innerHTML != "") {
            appendMessage(username, document.getElementById("main-input").innerHTML);
            socket.emit('send-chat-message', document.getElementById("main-input").innerHTML);
        }
        setTimeout(()=>{
            document.getElementById("main-input").innerHTML = "";
        }, 0);
    }
});

function sendButton() {
    if (document.getElementById("main-input").innerHTML != "") {
        appendMessage(username, document.getElementById("main-input").innerHTML);
        socket.emit('send-chat-message', document.getElementById("main-input").innerHTML);
    }
    setTimeout(()=>{
        document.getElementById("main-input").innerHTML = "";
    }, 0);
}

socket.on('chat-message', data => {
    appendMessage(data.name, data.message)
});

socket.on('user-connected', name => {
    appendMessage("Server", `${name} connected`);
});

socket.on('user-disconnected', name => {
    appendMessage("Server", `${name} disconnected`);
});

loadEmojiSelectorDiv();
