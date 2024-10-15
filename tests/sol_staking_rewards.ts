import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolStakingRewards } from "../target/types/sol_staking_rewards";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

describe("sol_staking_rewards", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  // const mintKeypair = Keypair.generate();
  const mintKeypair = Keypair.fromSecretKey(new Uint8Array(
    [
      175, 127, 120, 225, 97, 13, 108, 166, 145, 23, 85,
      220, 206, 176, 11, 157, 156, 175, 58, 202, 126, 119,
      206, 204, 242, 27, 253, 96, 40, 204, 146, 103, 10,
      5, 175, 122, 148, 5, 50, 6, 14, 9, 250, 134,
      254, 229, 117, 29, 216, 70, 118, 69, 1, 123, 232,
      145, 224, 10, 84, 243, 143, 47, 197, 32
    ]
  ));
  // console.log(mintKeypair);

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
    // await createMintToken();
  
    let [vaultAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );
  
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: payer.publicKey,
        tokenVaultAccount: vaultAccount, 
        mint: mintKeypair.publicKey,
      })
      .rpc();
  
    console.log("Your transaction signature", tx);
  });

  it("stake", async () => {
    let userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey
    );

    await mintTo(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      userTokenAccount.address,
      payer.payer,
      1e11
    );

    let [stakeInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), payer.publicKey.toBuffer()],
      program.programId
    );

    let [stakeAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token"), payer.publicKey.toBuffer()],
      program.programId
    );

    await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey,
    );

    const tx = await program.methods
      .stake(new anchor.BN(1))
      .signers([payer.payer])
      .accounts({
        stakeInfoAccount: stakeInfo,
        stakeAccount: stakeAccount,
        userTokenAccount: userTokenAccount.address,
        mint: mintKeypair.publicKey,
        signer: payer.publicKey
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

  it("destake", async () => {
    let userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey
    );

    let [vaultAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );
  

    let [stakeInfo] = PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), payer.publicKey.toBuffer()],
      program.programId
    );

    let [stakeAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("token"), payer.publicKey.toBuffer()],
      program.programId
    );

    await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      payer.publicKey,
    );

    await mintTo(
      connection,
      payer.payer,
      mintKeypair.publicKey,
      vaultAccount,
      payer.payer,
      1e21
    );

    const tx = await program.methods
      .destake()
      .signers([payer.payer])
      .accounts({
        stakeAccount: stakeAccount,
        stakeInfoAccount: stakeInfo,
        userTokenAccount: userTokenAccount.address,
        tokenVaultAccount: vaultAccount,
        signer: payer.publicKey,
        mint: mintKeypair.publicKey
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

});
