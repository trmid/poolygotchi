
export const fetchJSON = async (uri: string): Promise<any> => {

  // HTTP Data URIs:
  if(uri.startsWith('http')) {
    return await (await fetch(uri)).json();
  }

  // Decoding Base64 Data:
  let base64match = uri.match(/^(?:rawData|data)\:application\/json;base64(?:\s|,)/);
  if(base64match) {
    return JSON.parse(window.atob(uri.slice(base64match[0].length)));
  }
  
  // IPFS Data URIs:
  const ipfsMatch = matchIpfsUri(uri);
  if(ipfsMatch) {
    return await fetch(`/ipfs/${ipfsMatch[2]}`).then(res => res.json());
  }

  throw new Error("Could not recognize URI format...");
}

export const normalizeImageURI = async (uri: string) => {
  const ipfsMatch = matchIpfsUri(uri);
  if(ipfsMatch) {
    return `/ipfs/${ipfsMatch[2]}`;
  } else {
    return uri;
  }
}

const matchIpfsUri = (uri: string) => {
  return uri.match(/^(\/ipfs\/|ipfs\:\/\/)(.+)/);
};