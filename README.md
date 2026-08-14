# Gym Verifier
The GymProof contract is currently deployed on the Midnight Preview Testnet.

## Midnight Preview Testnet Configuration

The **GymProof** smart contract is currently deployed on the **Midnight Preview Testnet**.

### Network Details

| Configuration                | Value                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| **Network Name**             | `Midnight Preview Testnet (preview)`                               |
| **Contract Address**         | `73ebc93997086b6b0387c5c99461e893073730af5939a11846042f351f04c04d` |
| **Indexer API Server**       | `https://indexer.preview.midnight.network/api/v4/graphql`          |
| **Indexer WebSocket Server** | `wss://indexer.preview.midnight.network/api/v4/graphql/ws`         |
| **RPC / Node Server**        | `wss://rpc.preview.midnight.network/`                              |

### Local Proof Server

For local development, the application requires a **Proof Server** running locally to generate the Zero-Knowledge Proofs before submitting transactions to the Midnight Preview Testnet.

```text
http://127.0.0.1:6300
```

The application flow is:

```text
Application
    │
    ▼
Local Proof Server
    │
    │ Generates Zero-Knowledge Proof
    ▼
Midnight Preview Testnet
    │
    ├── RPC / Node
    └── Indexer
```

> **Note:** The local Proof Server must be running on port `6300` for proof generation to work correctly.

GYMPROOF — BUILD A PRODUCTION-QUALITY PRIVACY-FIRST FITNESS DAPP ON MIDNIGHT

I have attached a ZIP containing a working/sample Bboard project.

VERY IMPORTANT — READ THE ATTACHED BBOARD PROJECT FIRST

Before writing or modifying any code, inspect the entire attached Bboard ZIP.

Treat the attached Bboard project as the technical reference implementation for the Midnight/Compact environment.

Understand:

- its complete folder structure

- package.json

- installed dependencies

- scripts

- Compact contract structure

- Compact compiler configuration

- Midnight SDK configuration

- wallet/DApp connector configuration

- frontend architecture

- contract deployment structure

- transaction flow

- network configuration

- environment variables

- generated files

- build process

- test process

- how the frontend communicates with the Compact contract

- how wallet connectivity is implemented

- how the Bboard example handles state and transactions

DO NOT GUESS THE MIDNIGHT ARCHITECTURE.

If the attached Bboard project contains a working implementation for something, reuse/adapt that approach instead of inventing a new implementation.

Use the ZIP as the source of truth for:

- compatible dependency versions

- project configuration

- Compact syntax

- Midnight SDK usage

- contract integration

- transaction flow

- build/deployment conventions

Do NOT unnecessarily upgrade dependencies.

Do NOT replace working Midnight packages with random alternatives.

Do NOT invent Compact APIs.

Do NOT invent Midnight APIs.

Do NOT invent wallet APIs.

First understand how the supplied Bboard project works, then transform it into GymProof.

---

PRODUCT

Build a complete, polished, production-quality decentralized fitness application called:

GymProof

Tagline

Prove your progress. Protect your privacy.

GymProof is a privacy-first fitness tracking DApp built on the Midnight blockchain using Compact smart contracts.

Users privately track workouts, participate in fitness challenges, and generate verifiable proofs of fitness achievements without publicly revealing their detailed workout history.

The core concept is:

Private Fitness Data

        ↓

Compact / Privacy Logic

        ↓

Zero-Knowledge Proof

        ↓

Midnight Verification

        ↓

Verified Fitness Achievement

This must NOT be a generic CRUD fitness tracker with a blockchain button added to it.

The privacy-preserving Midnight functionality must be a central part of the product.

---

1. FIRST TASK — ANALYZE THE ATTACHED BBOARD ZIP

Before implementing GymProof:

1. Extract/read the attached Bboard project.

2. Inspect all important source files.

3. Identify the exact Midnight/Compact versions.

4. Identify how the contract is compiled.

5. Identify how the contract is deployed.

6. Identify how the frontend connects to the contract.

7. Identify how wallet connectivity works.

8. Identify the current network configuration.

9. Identify all required environment variables.

10. Identify the correct development/build/test commands.

Then create GymProof using the same proven technical foundation wherever appropriate.

Important:

Do not simply copy the Bboard application.

Use it as the technical foundation/reference, then replace the guestbook functionality with the GymProof product described below.

---

2. TECHNOLOGY

Use the technologies already established by the attached Bboard project wherever possible.

The target stack is:

- React

- TypeScript

- Vite

- Tailwind CSS

- Midnight blockchain

- Compact smart contracts

- Midnight-compatible wallet/DApp connector

- Lace Wallet

- 1AM Wallet

Do not unnecessarily introduce another framework.

Do not replace the working Bboard architecture unless there is a strong technical reason.

---

3. CRITICAL RULE — NO FAKE BLOCKCHAIN FUNCTIONALITY

This is extremely important.

DO NOT create fake:

- wallet connections

- transaction confirmations

- blockchain data

- proof generation

- Compact contracts

- Midnight transactions

- achievement verification

For example, clicking:

Generate Proof

must NOT simply change the UI to:

Achievement Verified ✓

unless the underlying verification actually occurred.

If something cannot be implemented because the attached Bboard project or currently available SDK does not support it:

1. Keep the architecture correct.

2. Isolate the missing functionality.

3. Clearly document it.

4. Never fake success.

The final application should be structured for real Midnight testnet deployment.

---

4. MIDNIGHT ARCHITECTURE

Use the architecture established by the attached Bboard project.

Conceptually:

                    GymProof Frontend

                           │

                           ▼

                    Wallet Layer

                    /           \

                   /             \

              Lace               1AM

                   \             /

                    \           /

                     ▼         ▼

                    Midnight

                 DApp Connector

                        │

                        ▼

                 Compact Contract

                        │

                        ▼

                Midnight Network

                        │

                        ▼

             Proof / Verification

Keep wallet-specific implementation isolated.

Keep contract-specific implementation isolated.

Keep UI independent from blockchain implementation.

---

5. WALLET SUPPORT — LACE + 1AM

GymProof must support TWO wallet options:

Lace Wallet

1AM Wallet

Both must be real integrations.

Do not make one wallet the default in a way that prevents the other from working.

---

6. WALLET SELECTION

When the user clicks:

Connect Wallet

show:

Connect your Midnight wallet

Options:

Lace

"Connect using Lace Wallet"

1AM

"Connect using 1AM Wallet"

Each option should display:

- official wallet logo

- wallet name

- availability

- connection button

Example:

┌─────────────────────────────┐

│ Lace                        │

│ Midnight-compatible wallet │

│                             │

│ [ Connect Lace ]            │

└─────────────────────────────┘

┌─────────────────────────────┐

│ 1AM                         │

│ Midnight-compatible wallet │

│                             │

│ [ Connect 1AM ]             │

└─────────────────────────────┘

Do not automatically connect without user permission.

---

7. LACE WALLET

Implement actual Lace connectivity using the compatible Midnight wallet/DApp connector APIs identified from the Bboard project and current supported Lace integration.

Requirements:

- detect Lace availability

- connect

- request permissions

- retrieve account/address

- retrieve network

- track connection state

- handle account changes

- handle network changes

- handle disconnect

- handle rejected connection

- handle unavailable wallet

- sign supported transactions

Never hardcode wallet addresses.

Display:

Lace Connected

1abc...xyz9

The address must come from the connected wallet.

---

8. 1AM WALLET

Implement actual 1AM Wallet integration.

Official reference:

https://1am.xyz

Use the currently supported 1AM/Midnight API/connector.

Requirements:

- detect 1AM availability

- connect

- request permissions

- retrieve account/address

- retrieve network

- track connection state

- account change handling

- network change handling

- disconnect

- rejected connection handling

- unavailable wallet handling

- transaction signing

Do NOT invent the 1AM API.

If the 1AM integration is not directly represented in the supplied Bboard project, inspect the currently supported 1AM integration/API and isolate it behind the same wallet interface used for Lace.

---

9. WALLET ABSTRACTION

Create a clean wallet abstraction.

Suggested structure:

src/

└── wallet/

    ├── WalletProvider.tsx

    ├── walletTypes.ts

    ├── LaceWalletAdapter.ts

    ├── OneAMWalletAdapter.ts

    └── walletUtils.ts

Use a common interface conceptually similar to:

interface MidnightWalletAdapter {

    connect(): Promise<WalletConnection>;

    disconnect(): Promise<void>;

    getAddress(): Promise<string>;

    getNetwork(): Promise<string>;

    isAvailable(): boolean;

    isConnected(): boolean;

    signTransaction(transaction: unknown): Promise<unknown>;

}

Adapt this to the actual APIs found in the Bboard project/current Midnight ecosystem.

The UI must never need to know the internal differences between Lace and 1AM.

---

10. GLOBAL WALLET STATE

Expose:

wallet

walletType

address

network

isConnected

isConnecting

connect()

disconnect()

switchWallet()

Wallet types:

LACE

1AM

Header:

Disconnected:

Connect Wallet

Connected:

[Wallet Icon] Lace

1abc...xyz9

or:

[Wallet Icon] 1AM

1abc...xyz9

---

11. NETWORK

Use the network configuration from the attached Bboard project as the initial reference.

Make network configuration environment-driven.

Display:

Midnight Testnet

when appropriate.

If the connected wallet is on the wrong network:

Wrong Network

Please switch your wallet to the required Midnight network.

Never falsely claim a network switch succeeded.

---

12. PRODUCT FLOW

The primary flow must be:

Landing Page

      ↓

Connect Lace OR 1AM

      ↓

Create Athlete Profile

      ↓

Dashboard

      ↓

Log Workouts

      ↓

Track Progress

      ↓

Join Challenge

      ↓

Complete Challenge

      ↓

Generate Proof

      ↓

Midnight Verification

      ↓

Achievement Unlocked

      ↓

Anonymous Leaderboard

      ↓

Public Verification

---

13. LANDING PAGE

Create a premium landing page.

Hero:

Prove your progress. Protect your privacy.

Subheading:

"Track your workouts privately and prove your fitness achievements without exposing your complete fitness history."

Buttons:

Connect Wallet

Explore Features

Include sections:

Private Fitness Tracking

Track workouts without publicly exposing detailed fitness information.

Zero-Knowledge Achievements

Prove that you satisfied a fitness requirement without revealing the underlying private data.

Private Challenges

Complete challenges and cryptographically verify completion.

Anonymous Competition

Compete without exposing your full fitness history.

Verifiable Achievements

Create achievements that others can verify independently.

---

14. HOW IT WORKS

Create a visual process:

1. TRACK

Privately record workouts.

        ↓

2. COMPLETE

Meet a challenge requirement.

        ↓

3. PROVE

Generate a privacy-preserving proof.

        ↓

4. VERIFY

Midnight verifies the achievement.

        ↓

5. EARN

Receive a verifiable achievement.

---

15. ATHLETE PROFILE

After wallet connection:

Create athlete profile.

Fields:

- username

- display name

- avatar

- fitness goal

- training experience

- preferred training style

Privacy:

- Private

- Public

- Anonymous

Never automatically expose the wallet address as the user's identity.

---

16. DASHBOARD

Create a premium fitness dashboard.

Today's Workout

- workout name

- exercises

- duration

- completion status

Statistics

- total workouts

- current streak

- longest streak

- personal records

- completed challenges

- achievements

Weekly Activity

Interactive chart.

Training Volume

Interactive chart.

Recent Achievements

Achievement cards.

Active Challenges

Example:

30-Day Consistency

17 / 20 workouts

85%

3 workouts remaining

[View Challenge]

---

17. WORKOUT TRACKER

Create a full workout tracking system.

Users can:

- create workout

- edit workout

- delete workout

- duplicate workout

- complete workout

Workout:

- workout name

- date

- duration

- muscle groups

- notes

Exercise:

- exercise name

- sets

- reps

- weight

- rest time

- notes

Example:

Bench Press

Set 1

80 kg × 8

Set 2

80 kg × 7

Set 3

75 kg × 10

Buttons:

Add Exercise

Add Set

Save Workout

Complete Workout

Treat detailed workout data as private.

---

18. EXERCISE LIBRARY

Create searchable exercise library.

Categories:

- Chest

- Back

- Shoulders

- Biceps

- Triceps

- Legs

- Core

- Full Body

Each exercise:

- name

- muscle group

- equipment

- difficulty

---

19. PROGRESS

Create a detailed analytics page.

Workout Frequency

Weekly/monthly chart.

Training Volume

Training volume chart.

Personal Records

Example:

Bench Press

Previous PR

75 kg

Current PR

80 kg

+6.7%

Muscle Distribution

Training distribution by muscle group.

Streak History

Training consistency.

Detailed personal workout history remains private.

---

20. FITNESS CHALLENGES

Create a Challenges page.

Include:

7-Day Warrior

Complete 7 workouts in 7 days.

30-Day Consistency

Complete at least 20 workouts within 30 days.

100 Workout Club

Complete 100 workouts.

Strength Challenge

Reach a specified strength milestone.

90-Day Discipline

Maintain required training frequency.

Each challenge:

- title

- description

- requirement

- start date

- end date

- participants

- progress

- reward

- verification status

Buttons:

Join Challenge

View Challenge

Prove Achievement

---

21. CORE FEATURE — ZERO-KNOWLEDGE ACHIEVEMENT PROOF

This is the most important part of GymProof.

Suppose the user's private data contains:

June 1 — Chest — Bench 80kg × 8

June 3 — Back — Deadlift 120kg × 5

June 5 — Legs — Squat 100kg × 6

...

The user should be able to prove:

«"I completed at least 20 workouts within the required 30-day period."»

without revealing:

- workout dates

- exercises

- weights

- reps

- notes

- complete workout history

Create:

Generate Proof

Flow:

Generate Proof

      ↓

Validate private data

      ↓

Execute Compact privacy logic

      ↓

Generate proof

      ↓

Wallet confirmation

      ↓

Submit verification

      ↓

Midnight

      ↓

Verification result

UI:

Preparing private data...

Generating proof...

Waiting for wallet confirmation...

Submitting to Midnight...

Verifying...

Achievement Verified ✓

Failure:

Verification Failed

The required conditions were not satisfied.

Do not fake the proof.

---

22. COMPACT SMART CONTRACT

Use the attached Bboard Compact contract as the technical reference.

Do not blindly copy it.

Transform its functionality into GymProof.

The contract should support the appropriate concepts for:

Athlete

- registration

- workout count

- streak information

- achievement state

Challenges

- challenge ID

- requirement

- start/end

- active status

- reward

Achievements

- achievement ID

- verification status

- timestamp

- challenge association

Potential contract operations:

registerAthlete()

recordWorkout()

joinChallenge()

proveWorkoutCount()

proveWorkoutStreak()

proveChallengeCompletion()

verifyAchievement()

Use the actual Compact syntax and patterns from the supplied Bboard project.

If the current Compact version requires different syntax or APIs, follow the version actually used by the Bboard project/current compatible environment.

---

23. PRIVACY MODEL

Explicitly separate:

PRIVATE

- workout history

- exercises

- weights

- reps

- dates

- notes

- detailed statistics

PUBLIC / VERIFIABLE

- achievement status

- challenge status

- verification result

- proof reference

- optional public username

- anonymous leaderboard result

Do not unnecessarily expose private fitness data on-chain.

---

24. ANONYMOUS LEADERBOARD

Create:

Leaderboard

Example:

30-Day Consistency

#1

Anonymous Athlete

27 verified workouts

#2

Anonymous Athlete

25 verified workouts

#3

Anonymous Athlete

23 verified workouts

Users may optionally choose a public username.

Leaderboard values must be based on verifiable data, not simply client-side numbers.

Do not expose workout history.

---

25. ACHIEVEMENTS

Create premium achievement badges.

Examples:

7-Day Warrior

7 consecutive workouts.

Consistency Master

20 verified workouts in 30 days.

100 Workout Club

100 verified workouts.

Strength Beast

Verified strength milestone.

Elite Discipline

Long-term consistency.

Each badge:

- icon

- title

- requirement

- date

- verification status

- proof/transaction reference

---

26. PUBLIC VERIFICATION

Create:

/verify/:achievementId

Anyone can verify an achievement.

Display:

Achievement Verified ✓

Achievement:

30-Day Consistency

Status:

Cryptographically Verified

Athlete:

Anonymous Athlete

Network:

Midnight

Verified:

August 2026

Verification details:

- proof status

- challenge ID

- transaction reference

- timestamp

- network

Never reveal private workout information.

---

27. PRIVACY CENTER

Create a dedicated Privacy page.

Explain:

What remains private?

- workout history

- exercises

- weights

- reps

- notes

- detailed statistics

What can be proven?

- workout count

- streak

- challenge completion

- achievement requirements

- strength milestones

Visual:

PRIVATE DATA

     ↓

COMPACT

     ↓

ZERO-KNOWLEDGE PROOF

     ↓

MIDNIGHT

     ↓

VERIFIED ACHIEVEMENT

Explain this simply.

---

28. TRANSACTION UX

For blockchain transactions:

Confirm Transaction

Wallet:

Lace

Network:

Midnight Testnet

Action:

Verify 30-Day Consistency

[Cancel]

[Confirm in Wallet]

If using 1AM:

Wallet:

1AM

The wallet name must dynamically reflect the selected wallet.

---

29. WALLET SWITCHING

Provide:

Switch Wallet

Options:

- Lace

- 1AM

When switching:

1. disconnect current wallet

2. clear wallet-specific state

3. connect selected wallet

4. update address

5. update network

6. refresh application state

Never mix accounts.

---

30. ERROR HANDLING

Handle:

- wallet not installed

- wallet unavailable

- connection rejected

- connection cancelled

- wrong network

- account changed

- wallet disconnected

- transaction rejected

- transaction failed

- insufficient fees

- proof generation failure

- proof verification failure

- network unavailable

- contract error

- invalid challenge

- invalid workout data

Use clear messages.

Never silently fail.

---

31. DESIGN

Make GymProof look like a real startup product.

Style:

- premium dark fitness aesthetic

- clean typography

- subtle gradients

- modern cards

- strong visual hierarchy

- smooth animations

- responsive layouts

- mobile-first

- professional charts

- polished loading states

- skeleton loaders

- toast notifications

- confirmation dialogs

Avoid:

- excessive neon

- generic crypto imagery

- random gradients

- clutter

- amateur UI

- unnecessary blockchain jargon

The application should look significantly better than the original Bboard UI while preserving its proven technical foundation.

---

32. NAVIGATION

Desktop sidebar:

Dashboard

Workouts

Progress

Challenges

Achievements

Leaderboard

Privacy

Profile

Top bar:

- wallet

- notifications

- profile

Mobile:

Use bottom navigation for the most important sections.

---

33. RESPONSIVENESS

Fully support:

- mobile

- tablet

- desktop

Prioritize mobile for:

- workout logging

- wallet connection

- challenges

- progress

---

34. CODE STRUCTURE

Use clean separation.

Suggested structure:

src/

├── components/

│   ├── dashboard/

│   ├── workout/

│   ├── challenges/

│   ├── achievements/

│   ├── leaderboard/

│   ├── wallet/

│   ├── privacy/

│   └── common/

│

├── pages/

│   ├── Landing.tsx

│   ├── Dashboard.tsx

│   ├── Workouts.tsx

│   ├── Progress.tsx

│   ├── Challenges.tsx

│   ├── Achievements.tsx

│   ├── Leaderboard.tsx

│   ├── Privacy.tsx

│   ├── Profile.tsx

│   └── VerifyAchievement.tsx

│

├── wallet/

│   ├── WalletProvider.tsx

│   ├── walletTypes.ts

│   ├── LaceWalletAdapter.ts

│   ├── OneAMWalletAdapter.ts

│   └── walletUtils.ts

│

├── hooks/

│   ├── useWallet.ts

│   ├── useWorkout.ts

│   ├── useChallenges.ts

│   ├── useAchievements.ts

│   └── useAchievementProof.ts

│

├── services/

│   ├── midnightService.ts

│   ├── proofService.ts

│   ├── achievementService.ts

│   └── challengeService.ts

│

├── contracts/

│   └── gymproof.compact

│

├── types/

├── utils/

├── config/

└── assets/

However, if the Bboard project uses a better established structure, follow that structure instead of blindly forcing this one.

The supplied Bboard project is the reference.

---

35. ENVIRONMENT VARIABLES

Follow the Bboard project's existing environment-variable approach.

Create/update:

.env.example

Include configuration for:

- Midnight network

- contract address

- indexer

- proof configuration

- wallet/DApp connector configuration

Never commit secrets.

Never request or store seed phrases/private keys.

---

36. DEMO MODE

Provide optional mock data only for development/UI demonstration.

Clearly indicate:

DEMO MODE

Never make mock transactions look like real transactions.

Never show fake blockchain confirmation in production mode.

---

37. SECURITY

Never request:

- seed phrase

- private key

- wallet password

Never store private keys.

Never log sensitive wallet data.

Never unnecessarily expose private workout data.

Validate user input.

Protect against:

- fake achievement claims

- duplicate submissions

- client-side leaderboard manipulation

- invalid challenge IDs

- unauthorized actions

- malformed workout data

---

38. README

Create a professional README.

Include:

GymProof

Overview

Why Midnight?

Privacy model

Architecture

Bboard reference

Explain that the supplied Bboard project was used as the technical foundation/reference for the Midnight/Compact implementation.

Wallets

- Lace

- 1AM

Compact contracts

Installation

Environment variables

Running locally

Building

Testing

Midnight testnet

Contract deployment

Wallet configuration

Proof generation

Production deployment

Known limitations

If any feature cannot currently be fully implemented, document it honestly.

---

39. TESTING

Create tests for:

Frontend

- wallet state

- workout creation

- workout editing

- challenge joining

- achievement UI

Contract

- athlete registration

- workout recording

- challenge participation

- achievement verification

- invalid conditions

- duplicate actions

Wallet

- Lace connection

- 1AM connection

- disconnect

- account change

- network mismatch

Use the testing conventions already present in the supplied Bboard project wherever possible.

---

40. BUILD / DEPLOYMENT

The application must successfully:

npm install

npm run build

using the actual project scripts and dependency versions established by the Bboard reference project.

Do not break the existing Compact/build pipeline.

Ensure there are no:

- TypeScript errors

- missing imports

- broken routes

- fake dependencies

- unused critical integrations

- placeholder blockchain calls

---

41. PRIMARY DEMO

The strongest demonstration must be:

OPEN GYMPROOF

       ↓

CONNECT WALLET

       ↓

Choose:

Lace OR 1AM

       ↓

CREATE PROFILE

       ↓

LOG WORKOUTS

       ↓

JOIN 30-DAY CONSISTENCY

       ↓

COMPLETE REQUIRED WORKOUTS

       ↓

GENERATE PROOF

       ↓

COMPACT / MIDNIGHT VERIFICATION

       ↓

WALLET CONFIRMATION

       ↓

ACHIEVEMENT VERIFIED

       ↓

🏆 30-DAY CONSISTENCY

       ↓

ANONYMOUS LEADERBOARD

       ↓

PUBLIC VERIFICATION PAGE

This is the core product demonstration.

---

42. FINAL QUALITY BAR

Do NOT deliver a simple student CRUD application.

Build GymProof as a production-quality Web3 startup MVP.

The priorities are:

1. Use the supplied Bboard project as the technical reference.

2. Preserve its working Midnight/Compact foundation.

3. Build a polished GymProof product on top of it.

4. Real Lace wallet integration.

5. Real 1AM wallet integration.

6. Real Midnight architecture.

7. Real Compact contract architecture.

8. Meaningful privacy-preserving functionality.

9. Zero-knowledge achievement verification.

10. Anonymous competition.

11. Excellent UX.

12. Mobile responsiveness.

13. Clean TypeScript architecture.

14. Honest error handling.

15. Complete documentation.

16. Testnet-ready deployment.

The central reason this application uses Midnight must be clear:

«GymProof lets users prove fitness achievements without revealing the private workout data used to prove them.»

Do not reduce this to "store workouts on blockchain."

---

FINAL INSTRUCTION

FIRST inspect the attached Bboard ZIP completely.

Understand how its Midnight/Compact implementation works.

Then build GymProof by adapting that proven implementation.

Do not delete useful working infrastructure until you understand what it does.

Do not invent Midnight APIs when the Bboard project already demonstrates the correct approach.

Do not fake any wallet, transaction, proof, or blockchain functionality.

Build the complete application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b6c2a5ea-85e1-4863-a825-0a52ca5acc7d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
