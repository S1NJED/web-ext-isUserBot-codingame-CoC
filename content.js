async function getCodinGamerByName(username) {
    let url = "https://www.codingame.com/services/search/search";

    let req = await fetch(url, {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json;charset=UTF-8'
        },
        'body': '[' + username +  ',fr,props.type]'
    });

    let res = await req.json();
    return res.filter((elem) => elem['name'] == username)[0];

}

async function getCodinGamerByPublicHandle(publicHandle) {
    let url = "https://www.codingame.com/services/CodinGamer/findCodingamePointsStatsByHandle";

    let req = await fetch(url, {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json;charset=UTF-8'
        },
        'body': '[' + publicHandle + ']'
    });
    let res = await req.json();
    return res['codingamer'];

}

async function isUserBot(username) {
    let req = await getCodinGamerByName(username);
    let userPublicHandle = req['id'];
    req = await getCodinGamerByPublicHandle(userPublicHandle);
    return !req.onlineSince // check if user have a onlineSince property since bots do not have one.
}

async function updateNames(nodes) {

    for (let node of nodes) {
        let htmlElem = node.querySelector('.place > .place-container > .clash-info.player-info > p');
        const username = htmlElem.title;
        let publicClashHandle = getPublicClashHandle();
        console.table(players);
        if (players['publicClashHandle'] == publicClashHandle) {

            // check if not user in players[]
            if ( !players['usernames'].some(elem => {return elem.username == username}) ) {
                let is_bot = false;

                if (await isUserBot(username)) {
                    is_bot = true;
                    htmlElem.innerHTML = "<p style='color: red;'>[BOT] " + username + "</p>";
                }
                // console.log("Player is bot: " + is_bot);

                const data = {
                    "username": username,
                    "is_bot": is_bot
                };
                players['usernames'].push(data);
            }

        }
        else {
            players['publicClashHandle'] = publicClashHandle;
            players['usernames'] = [];
        }
        
    }
}

function getPublicClashHandle() {
    const htmlPath = "div.copy-url-wrapper > input";
    const htmlElem = document.querySelector(htmlPath);
    const baseUrl = "https://www.codingame.com/clashofcode/clash/";
    return htmlElem.getAttribute('value').replace(baseUrl, '');
}

// ---------------------------------------------------------------------------
const players = {
    "publicClashHandle": "",
    "usernames": []
};



const observer = new MutationObserver(async function(mutationsList, observer) {
    
    const targetDiv = document.querySelector("div.player-wrapper");
    for (let mutation of mutationsList) {
        if (mutation.target === targetDiv) {
            await updateNames(targetDiv.childNodes);
        }
    }
});
  

function getMessage(req, sender, sendRes) {
    
    const loop = setInterval(() => {
        const targetDiv = document.querySelector("div.player-wrapper");
        if (targetDiv != null) {
            updateNames(targetDiv.childNodes);
            clearInterval(loop)
        }

    }, 250)
    
    observer.observe(document, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeOldValue: true 
    });
    
}

browser.runtime.onMessage.addListener(getMessage)