
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
  const ipfsMatch = matchIpfsURI(uri);
  if(ipfsMatch) {
    return await fetch(await ipfsPathToURI(`/ipfs/${ipfsMatch[2]}`)).then(res => res.json());
  }

  throw new Error("Could not recognize URI format...");
}

export const normalizeImageURI = async (uri: string) => {
  const ipfsMatch = matchIpfsURI(uri);
  if(ipfsMatch) {
    return await ipfsPathToURI(`/ipfs/${ipfsMatch[2]}`);
  } else {
    return uri;
  }
}

const matchIpfsURI = (uri: string) => {
  return uri.match(/^(\/ipfs\/|ipfs\:\/\/)(.+)/);
};

// IPFS Path to URI (uses service worker if available, otherwise a public gateway)
const ipfsPathToURI = async (path: string) => {
  if((location.pathname || "/") === "/" && "serviceWorker" in navigator && await navigator.serviceWorker.ready) {
    return path;
  } else {
    return gatewayURL(path);
  }
};

// IPFS Public gateway rotator:
let gatewayIndex = 0;
const publicGateways = [
  'https://ipfs.io',
  'https://dweb.link'
];
function gatewayURL(path: string) {
  const url = publicGateways[gatewayIndex++] + path;
  if(gatewayIndex >= publicGateways.length) gatewayIndex = 0;
  return url;
}