import {request} from 'graphql-request';
// import 'dotenv/config';

const url = "";
const headers = {
     Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}`
};

const subgraph = async(query) => {
    try { 
    const data = await request ('url', query, {}, headers);
    return JSON.stringify(data);
} catch (error) {
    console.error(error);
   }  
}

export default subgraph;