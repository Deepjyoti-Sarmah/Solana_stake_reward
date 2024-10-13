import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolStakingRewards } from "../target/types/sol_staking_rewards";
import { Connection, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

describe("sol_staking_rewards", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const mintKeypair = Keypair.generate();
  console.log(mintKeypair);

  const program = anchor.workspace.SolStakingRewards as Program<SolStakingRewards>;

  async function createMintToken() {
    const mint = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      payer.publicKey,
      9,
      mintKeypair
    );
    console.log(mint);
  }

  it("Is initialized!", async () => {
    
    await createMintToken();

    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
