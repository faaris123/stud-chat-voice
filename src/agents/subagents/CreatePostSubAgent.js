import { isLoggedIn, ofRandom } from "../Util"
import AIEmoteType from "../../components/chat/messages/AIEmoteType";

const createPostSubAgent = (end) => {

    let stage;

    // Copied logic from the lecture code examples
    let chatroom, title, content, confirm;

    const handleInitialize = async (promptData) => {
        // get the specified chatroom from the passed down data 
        chatroom = promptData
        // first check if the user is logged in
        if (!await isLoggedIn()) {
            return end(ofRandom([
                "You are not logged in, try logging in first.",
                "You are not signed in, try signing in first."
            ]))
        }
        // check if the user provided a valid chatroom name
        else if(chatroom === "any") {
            return end(ofRandom([
                "You did not specify a chatroom. Please try again.",
                "Please specify a chatroom and try again."
            ]))
        }
        // otherwise, start prompting the user for title, content, and confirmation
        else {
            stage = "FOLLOWUP_TITLE";
            return ofRandom([
                "Sure, what is the title of your post?",
                "Alright, what should the title of your post be?"
            ])
        }
    }

    // copied from lecture code example
    const handleReceive = async (prompt) => {
        switch(stage) {
            case "FOLLOWUP_TITLE": return await handleFollowupTitle(prompt);
            case "FOLLOWUP_CONTENT": return await handleFollowupContent(prompt);
            case "FOLLOWUP_CONFIRM": return await handleFollowupConfirm(prompt);
        }
    }

    // copied from lecture code example
    const handleFollowupTitle = async (prompt) => {
        title = prompt;
        stage = "FOLLOWUP_CONTENT";
        return ofRandom([
            "Great, and what is the post's content?",
            "Thanks, and what should be the content of your post?"
        ])
    }

    // copied from lecture code example
    const handleFollowupContent = async (prompt) => {
        content = prompt;
        stage = "FOLLOWUP_CONFIRM";
        return "Excellent! To confirm, you want to create this post titled '" + title + "' in " + chatroom + "?"
    }

    // copied from lecture code example
    const handleFollowupConfirm = async (prompt) => {
        confirm = prompt;
        // check if the user said no
        if (confirm.toLowerCase() === "no" || confirm.toLowerCase()[0] === "n") {
            return end(ofRandom([
                "Okay, the post will not be made.",
                "No worries! This post will not be made."
            ]))
        }
        // check if the user said yes
        if (confirm.toLowerCase() === "yes" || confirm.toLowerCase()[0] === "y") {
            const resp = await fetch("https://cs571api.cs.wisc.edu/rest/f24/hw11/messages?chatroom=" + chatroom, {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CS571-ID": CS571.getBadgerId(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                })
            })
            // if successful, then let the user know and change the icon based on AIEmoteType.js
            if (resp.status === 200) {
                return {
                    msg: end(ofRandom([
                        "Your message was successfully posted in " + chatroom + "!",
                        "All set! Your post has been made in " + chatroom
                    ])),
                    emote: AIEmoteType.SUCCESS
                }
            }
            // if not successful, then let the user know and change the icon based on AIEmoteType.js
            if (resp.status === 400) {
                return {
                    msg: end(ofRandom([
                        "You did not specify a title and/or a header.",
                        "Please include a title and a header!"
                    ])),
                    emote: AIEmoteType.ERROR
                }
            }
        }
    }

    return {
        handleInitialize,
        handleReceive
    }
}

export default createPostSubAgent;
