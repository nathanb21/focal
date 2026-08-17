# Focal

Focal is a chat application which helps users find relevant information within documentation that they may have spread across their organisation. This is focused on a pharma user whom may search for DNA sequence information in sample reports etc.

I wanted to make sure the system felt trusted, ensuring the "Controlled workspace" with the green shield checkmark is shown, and the indexed documents displayed in the bottom right. I chose clean white colours with blue as this feels a bit more clinical, which relates to the setting. In reality, this would likely be white-labelable and themed to the users environment.

## Notes on Focal development

Start time: 8pm
End time: 10pm (ish)

I shared the initial brief with Claude (Sonnet), and came up with a spec for how I want the application to work, tech stack, primary colours and application layout. I then had this create the [seed prompt](./.implementation-notes/seed-prompt.md).

Using Codex with Luna on Extra High reasoning I shared the seed prompt and it put the application together, largely how I wanted it. Whilst this was working I used ChatGPT to build the logo, and set up the GitHub repo + made sure Vercel was linked.

Once the UI was built it largely worked how I wanted it to, however, I made quite a few tweaks to remove duplicate information from the display, reduce some visual noise, add animation, implement the chat ordering (by date) and added the search functionality.

Changes I'd make if I had more time:
- I don't like the logo - I found an "F" icon I liked and thought I could merge it with a document icon, but it's too complicated.
- Also the AI icon; needs refinement!
- I'd review the code more thoroughly.
- I'd make the search / filter functionality nicer - probably create a pop-up in the center of the screen which can be filtered with the list of chats displaying below it - similar to the OSX spotlight search.
- In reality a solution like this would be very sensitive to patient data and a client would be highly concerned about any data leakage, so steps would need to be demonstrated to ensure that's not possible (e.g., adding user auth logins, timeouts, audit logs etc.) - there's not enough time to do this appropriately for this task.