import { isLoggedIn, ofRandom } from "../Util"
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

const createLoginSubAgent = (end) => {

    let stage;

    // copied from lecture code example
    let username, password;

    const handleInitialize = async (promptData) => {
        // first check if the user is logged in
        // used isLoggedIn() and ofRandom() from Util.js
        if (await isLoggedIn()) {
            return end(ofRandom([
                "You are already logged in, try logging out first.",
                "You are already signed in, try signing out first."
            ]))
        }
        // otherwise, prompt the user for their username and password
        else {
            stage = "FOLLOWUP_USERNAME";
            return ofRandom([
                "Sure, what is your username?",
                "Alright, what is your username?"
            ])
        }
    }

    // copied from lecture code example
    const handleReceive = async (prompt) => {
        switch(stage) {
            case "FOLLOWUP_USERNAME": return await handleFollowupUsername(prompt);
            case "FOLLOWUP_PASSWORD": return await handleFollowupPassword(prompt);
        }
    }

    // copied from lecture code example
    const handleFollowupUsername = async (prompt) => {
        username = prompt;
        stage = "FOLLOWUP_PASSWORD";
        // return a object as per project instructions and based on TextApp.jsx
        // nextIsSensitive will mask the password when the user types it in 
        return {
            msg: ofRandom([
                "Great, and what is your password?",
                "Thanks, and what is your password?"
            ]),
            nextIsSensitive: true
        }
    }

    // copied from lecture code example
    const handleFollowupPassword = async (prompt) => {
        password = prompt;
        const resp = await fetch("https://cs571api.cs.wisc.edu/rest/f24/hw11/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CS571-ID": CS571.getBadgerId(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                pin: password
            })
        })
        // if successful, then let the user know and change the icon based on AIEmoteType.js
        if (resp.status === 200) {
            return {
                msg: end(ofRandom([
                    "Successfully logged in!",
                    "Success! You have been logged in."
                ])),
                emote: AIEmoteType.SUCCESS
            }
        }
        // if not successful, then let the user know and change the icon based on AIEmoteType.js
        else {
            return {
                msg: end(ofRandom([
                    "Sorry, that username and password is incorrect.",
                    "Sorry, your username or password is incorrect.",
                ])),
                emote: AIEmoteType.ERROR
            }
        }      
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createLoginSubAgent;