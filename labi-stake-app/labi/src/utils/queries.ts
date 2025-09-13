import {gql} from 'graphql-request';
import subgraph from './graphql';

const fetchTranfers = async (address: string) => {
      const queryTransfer = gql `{
        transfers(first: 5) { 
          id,
         _to,
         _from,
         amount
     }

    }`;

    const transfers = await subgraph(queryTransfer);
    return transfers;
      
}