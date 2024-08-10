import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingSystem } from "../target/types/voting_system";
import { expect } from "chai";

describe("voting_system", () => {

   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);

  const program = anchor.workspace.VotingDapp as Program<VotingSystem>;

  it("should create a proposal correctly", async () => {
    const proposal = anchor.web3.Keypair.generate();
    const description = "Test proposal";
    const expiration = new anchor.BN(Date.now() / 1000 + 300); // Expires in 5 minutes

    await program.methods.createProposal(description, expiration)
      .accounts({
        proposal: proposal.publicKey,
        authority: provider.wallet.publicKey
      })
      .signers([proposal])
      .rpc(); 

    const proposalAccount = await program.account.proposal.fetch(proposal.publicKey);
    expect(proposalAccount.description).to.equal(description);
    expect(proposalAccount.expiration.toNumber()).to.be.closeTo(expiration.toNumber(), 2);
    expect(proposalAccount.yesVotes.toNumber()).to.equal(0);
    expect(proposalAccount.noVotes.toNumber()).to.equal(0);
  });

});