# Account authenticity triage

Use this when someone points at an account that carries their brand or project name, or asks "is this real?". The goal is a fast verdict backed by evidence, not a hunch.

## Steps

1. Check any notes or history you have for the handle first. Having no record of an account that uses the person's own brand is a signal, not proof; they may have created it somewhere else.
2. Pull the profile and the full timeline (SKILL.md Procedure B). Note the creation date, follower and post counts, verification, bio and website.
3. Compare the copy against the real product's site and docs. Accurate, polished copy does not mean the account is legitimate: impersonators lift the tagline and docs word for word and link the real site to borrow credibility.
4. Look for the tell. The decisive evidence is usually a few off-pattern posts: "dev burn supply", contract addresses, block-explorer links, airdrops, presales, replies to "burn more" or "wen" accounts. Follow every chain link.
5. Verify on-chain claims from the explorer page itself. Etherscan-family explorers (etherscan.io, basescan.org and similar) serve full HTML to curl: strip the tags and grep for `From:`, `Interacted With (To):`, `ERC-20 Tokens Transferred` and `Timestamp`. The token page `/token/<contract>` gives the name and ticker, `Max Total Supply` and `Holders`. Record the contract address, the deployer wallet, amounts and UTC times as evidence.
6. Give the verdict with the evidence, then ask one question: is the account theirs or not? Don't assume.

## When it isn't theirs

- Keep a note of the handle and its numeric id, that it is unaffiliated, and the token contract and wallet, so future checks recognize it immediately.
- Draft, don't post, anything public: a short disclaimer for their real channels, a one-line README or site disclaimer, and the platform impersonation report. The report cites the account age, the copied branding, the link to the real site and the token contract or wallet.
- Public notices should never name, link or @-mention the impersonator, its handle or its token contract, so it gets no extra traffic. Use generic wording ("<Project> has no token or coin. Any token or coin using the <Project> name has nothing to do with this project."). The same applies to PR titles, PR bodies and commit messages that ship the notice. Only the private platform report names the account.
- Impersonation reports carry more weight when they come from an account clearly tied to the brand. If the impersonator took the obvious handle, suggest securing an official one.
