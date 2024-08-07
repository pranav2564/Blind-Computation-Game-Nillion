import React, { useEffect, useState } from 'react';
import GenerateUserKey from './nillion/components/GenerateUserKey';
import CreateClient from './nillion/components/CreateClient';
import * as nillion from '@nillion/client-web';

import { NillionClient, NadaValues } from '@nillion/client-web';
import StoreSecretForm from './nillion/components/StoreSecretForm';
import StoreProgram from './nillion/components/StoreProgramForm';
import ComputeForm from './nillion/components/ComputeForm';
import ConnectionInfo from './nillion/components/ConnectionInfo';

export default function Main() {
  const programName = 'rock_paper_scissors';
  const outputName = 'winning_player_number'
  const player1 = 'Player_1';
  const player2 = 'Player_2';
  const [userkey, setUserKey] = useState<string | null>(null);
  const [client, setClient] = useState<NillionClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [player1Choice, setPlayer1Choice] = useState<string | null>(null);
  const [player2Choice, setPlayer2Choice] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [additionalComputeValues, setAdditionalComputeValues] = useState<NadaValues | null>(null);
  const [computeResult, setComputeResult] = useState<string | null>(null);

  useEffect(() => {
    if (userkey && client) {
      setUserId(client.user_id);
      setPartyId(client.party_id);
      const additionalComputeValues = new nillion.NadaValues();
      setAdditionalComputeValues(additionalComputeValues);
    }
  }, [userkey, client]);

  const interpretResult = (result: string) => {
    switch (result) {
      case '0':
        return "It's a tie!";
      case '1':
        return "Player 1 wins!";
      case '2':
        return "Player 2 wins!";
      default:
        return "Invalid result";
    }
  };

  return (
    <div>
      <h1>Rock Paper Scissors on Nillion</h1>
      <p>Connect to Nillion with a user key, then follow the steps to play rock, paper, scissors.</p>
      <ConnectionInfo client={client} userkey={userkey} />

      <h1>1. Connect to Nillion Client {client && ' ✅'}</h1>
      <GenerateUserKey setUserKey={setUserKey} />
      {userkey && <CreateClient userKey={userkey} setClient={setClient} />}
      
      <h1>2. Store Program {programId && ' ✅'}</h1>
      {client && (
        <StoreProgram
          nillionClient={client}
          defaultProgram={programName}
          onNewStoredProgram={(program) => setProgramId(program.program_id)}
        />
      )}
      
      <h1>3. Store Player Choices {player1Choice && player2Choice && ' ✅'}</h1>
      {userId && programId && (
        <>
          <h2>Player 1's Choice {player1Choice && ' ✅'}</h2>
          <StoreSecretForm
            secretName={'choice_player_1'}
            onNewStoredSecret={(secret) => setPlayer1Choice(secret.storeId)}
            nillionClient={client}
            secretType="SecretInteger"
            isLoading={false}
            itemName=""
            hidePermissions
            defaultUserWithComputePermissions={userId}
            defaultProgramIdForComputePermissions={programId}
          />

          <h2>Player 2's Choice {player2Choice && ' ✅'}</h2>
          <StoreSecretForm
            secretName={'choice_player_2'}
            onNewStoredSecret={(secret) => setPlayer2Choice(secret.storeId)}
            nillionClient={client}
            secretType="SecretInteger"
            isLoading={false}
            itemName=""
            hidePermissions
            defaultUserWithComputePermissions={userId}
            defaultProgramIdForComputePermissions={programId}
          />
        </>
      )}
      
      <h1>4. Compute Result {computeResult && ' ✅'}</h1>
      {client && programId && player1Choice && player2Choice && partyId && additionalComputeValues && (
        <>
          <ComputeForm
            nillionClient={client}
            programId={programId}
            additionalComputeValues={additionalComputeValues}
            storeIds={[player1Choice, player2Choice]}
            inputParties={[
              { partyName: player1, partyId: partyId },
              { partyName: player2, partyId: partyId }
            ]}
            outputParties={[
              { partyName: player1, partyId: partyId }
            ]}
            outputName={outputName}
            onComputeProgram={(result) => {
              if (result.error) {
                console.error("Computation error:", result.error);
                setComputeResult("Error: " + result.error.message);
              } else {
                setComputeResult(result.value);
              }
            }}
          />
          {computeResult && (
            <div>
              <h2>Game Result:</h2>
              <p>{interpretResult(computeResult)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}