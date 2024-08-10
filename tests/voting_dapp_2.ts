import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingSystem } from "../target/types/voting_system";
import { expect } from "chai";

describe("voting_system", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.VotingSystem as Program<VotingSystem>;

    it("should cast a vote correctly", async () => {
        // First, create a proposal to vote on
        const proposal = anchor.web3.Keypair.generate();
        const description = "Vote Test Proposal";
        const expiration = new anchor.BN(Date.now() / 1000 + 3600); // 1 hour from now

        await program.methods.createProposal(description, expiration)
            .accounts({
                proposal: proposal.publicKey,
                authority: provider.wallet.publicKey
            })
            .signers([proposal])
            .rpc();

        // Now, cast a vote
        const voterInfo = anchor.web3.Keypair.generate();
        const vote = true; // Voting "yes"

        await program.methods.castVote(vote)
            .accounts({
                proposal: proposal.publicKey,
                voterInfo: voterInfo.publicKey,
                // authority: provider.wallet.publicKey,
                // systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([voterInfo])
            .rpc();

        // Fetch the updated proposal to check the vote count
        const proposalAccount = await program.account.proposal.fetch(proposal.publicKey);
        expect(proposalAccount.yesVotes.toNumber()).to.equal(1);
        expect(proposalAccount.noVotes.toNumber()).to.equal(0);

        // Optionally, check the voterInfo to ensure the vote is recorded
        const voterInfoAccount = await program.account.voterInfo.fetch(voterInfo.publicKey);
        expect(voterInfoAccount.voted).to.be.true;
    });
});
