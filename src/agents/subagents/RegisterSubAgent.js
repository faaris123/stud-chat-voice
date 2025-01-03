import { isLoggedIn, ofRandom } from "../Util"
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

const createRegisterSubAgent = (end) => {

    let stage;

    // copied from lecture code example
    let username, password, confirmPassword;

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
            case "FOLLOWUP_CONFIRM": return await handleFollowupConfirm(prompt);
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
        // check if the password length is exactly 7 or not
        if (password.length !== 7) {
            return end("A pin must exactly be a 7-digit PIN code passed as a string.")
        }
        stage = "FOLLOWUP_CONFIRM";
        // return a object as per project instructions and based on TextApp.jsx
        // nextIsSensitive will mask the password when the user types it in 
        return {
            msg: ofRandom([
                "Great, can you confirm your password?",
                "Thanks, can you confirm your password?"
            ]),
            nextIsSensitive: true
        }
    }

    // copied from lecture code example
    const handleFollowupConfirm = async (prompt) => {
        confirmPassword = prompt;
        // check if the passwords match each other or not
        if (password !== confirmPassword) {
            return end("Passwords don't match.")
        }
        // check if both passwords are exactly 7 in lenght 
        if (password.length !== 7 && confirmPassword.length !== 7) {
            return end("A pin must exactly be a 7-digit PIN code passed as a string.")
        }

        const resp = await fetch("https://cs571api.cs.wisc.edu/rest/f24/hw11/register", {
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
                    "Successfully registered and logged in!",
                    "Success! You have been registered and logged in."
                ])),
                emote: AIEmoteType.SUCCESS
            }
        } 
        // if not successful, then let the user know and change the icon based on AIEmoteType.js
        if (resp.status === 409) {
            return {
                msg: end(ofRandom([
                    "Username taken!",
                    "That username is already registered!"
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

export default createRegisterSubAgent;