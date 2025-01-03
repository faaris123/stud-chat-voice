import createChatDelegator from "./ChatDelegator";
import { getLoggedInUsername, isLoggedIn, logout, ofRandom } from "./Util"

const createChatAgent = () => {
    const CS571_WITAI_ACCESS_TOKEN = "JZ6APJ6WMKBR4NZZLRLBQUQOGWZTTT2Q"; // Put your CLIENT access token here.

    // Used the previous HW and lecture code examples a lot for this HW
    const delegator = createChatDelegator();

    let chatrooms = [];

    const handleInitialize = async () => {
        const resp = await fetch("https://cs571api.cs.wisc.edu/rest/f24/hw11/chatrooms", {
            headers: {
                "X-CS571-ID": CS571.getBadgerId()
            }
        });
        const data = await resp.json();
        chatrooms = data;

        return "Welcome to BadgerChat! My name is Bucki, how can I help you?";
    }

    const handleReceive = async (prompt) => {
        if (delegator.hasDelegate()) { return delegator.handleDelegation(prompt); }
        const resp = await fetch(`https://api.wit.ai/message?q=${encodeURIComponent(prompt)}`, {
            headers: {
                "Authorization": `Bearer ${CS571_WITAI_ACCESS_TOKEN}`
            }
        })
        const data = await resp.json();
        if (data.intents.length > 0) {
            switch (data.intents[0].name) {
                case "get_help": return handleGetHelp();
                case "get_chatrooms": return handleGetChatrooms();
                case "get_messages": return handleGetMessages(data);
                case "login": return handleLogin();
                case "register": return handleRegister();
                case "create_message": return handleCreateMessage(data);
                case "logout": return handleLogout();
                case "whoami": return handleWhoAmI();
            }
        }
        return "Sorry, I didn't get that. Type 'help' to see what you can do!";
    }

    const handleGetHelp = async () => {
        // Used ofRandom() from Util.js
        return ofRandom([
            "Try asking 'tell me the latest 3 messages', or ask for more help!",
            "Try asking 'register for an account', or ask for more help!",
            "Try asking 'log me in', or ask for more help!",
            "Try asking 'what are the chatrooms', or ask for more help!"
        ]);
    }

    const handleGetChatrooms = async () => {
        // Used this source to make the entries in the array into one string: https://www.w3schools.com/jsref/jsref_join.asp
        return "Of course, there are " + chatrooms.length.toString() + " chatrooms: " + chatrooms.join(", ")
    }

    const handleGetMessages = async (data) => {
        // Copied snippet from previous HW
        const hasSpecifiedChatroom = data.entities["chatroom:chatroom"] ? true : false
        const hasSpecifiedNumber = data.entities["wit$number:number"] ? true : false

        const chatroom = hasSpecifiedChatroom ? data.entities["chatroom:chatroom"][0].value : "any"
        const numMsgs = hasSpecifiedNumber ? Math.floor(data.entities["wit$number:number"][0].value) : 1;

        // If statement if the user included both the number of messages and the chatroom
        if (chatroom !== "any" && numMsgs !== 1) {
            const resp = await fetch(`https://cs571api.cs.wisc.edu/rest/f24/hw11/messages?chatroom=${chatroom}&num=${numMsgs}`, {
                headers: {
                    "X-CS571-ID": CS571.getBadgerId()
                }
            })
            const msgs = await resp.json()
            // Copied logic for each return statement from lecture code examples
            return msgs.messages.map(c => "In '" + c.chatroom + "', '" + c.poster + "' created a post titled '" + c.title + "' saying '" + c.content + "'")
        }

        // Else if statement if the user only included the chatroom
        else if (chatroom !== "any") {
            const resp = await fetch(`https://cs571api.cs.wisc.edu/rest/f24/hw11/messages?chatroom=${chatroom}`, {
                headers: {
                    "X-CS571-ID": CS571.getBadgerId()
                }
            })
            const msgs = await resp.json()
            return msgs.messages.map(c => "In '" + c.chatroom + "', '" + c.poster + "' created a post titled '" + c.title + "' saying '" + c.content + "'")
        }

        // Else if statement if the user only included the number of messages
        else if (numMsgs !== 1) {
            const resp = await fetch(`https://cs571api.cs.wisc.edu/rest/f24/hw11/messages?num=${numMsgs}`, {
                headers: {
                    "X-CS571-ID": CS571.getBadgerId()
                }
            })
            const msgs = await resp.json()
            return msgs.messages.map(c => "In '" + c.chatroom + "', '" + c.poster + "' created a post titled '" + c.title + "' saying '" + c.content + "'")
        }

        // Else if statement if the user did not included the chatroom or the number of messages 
        else if (chatroom === "any" && numMsgs === 1) {
            const resp = await fetch(`https://cs571api.cs.wisc.edu/rest/f24/hw11/messages`, {
                headers: {
                    "X-CS571-ID": CS571.getBadgerId()
                }
            })
            const msgs = await resp.json()
            return msgs.messages.map(c => "In " + c.chatroom + ", " + c.poster + " created a post titled " + c.title + " saying " + c.content)
        }
    }

    const handleLogin = async () => {
        return await delegator.beginDelegation("LOGIN");
    }

    const handleRegister = async () => {
        return await delegator.beginDelegation("REGISTER");
    }

    const handleCreateMessage = async (data) => {
        // Copied snippet from previous HW
        const hasSpecifiedChatroom = data.entities["chatroom:chatroom"] ? true : false
        const chatroom = hasSpecifiedChatroom ? data.entities["chatroom:chatroom"][0].value : "any"

        // Pass down chatroom so it is useable in the subagent 
        return await delegator.beginDelegation("CREATE", chatroom);
    }

    const handleLogout = async () => {
        // Used isLoggedIn() and logout() from Util.js
        if (await isLoggedIn()) {
            await logout()
            return "You have been logged out"
        }
        else {
            return "You are not logged in"
        }
    }

    const handleWhoAmI = async () => {
        // Used isLoggedIn() and getLoggedInUsername() from Util.js
        if (await isLoggedIn()) {
            let user = await getLoggedInUsername()
            return "You are logged in as " + user
        }
        else {
            return "You are not logged in."
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createChatAgent;
