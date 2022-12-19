import { ipfsClient, IPFS_GATEWAY } from "./ipfs";

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
    const gatewayURI = `${IPFS_GATEWAY}${ipfsMatch[2]}`;
    return await Promise.race([
      fetchContentFromIPFS(uri).then(ipfsContent => {
        const decoder = new TextDecoder();
        let content = "";
        for(let i = 0; i < ipfsContent.length; i++) {
          content += decoder.decode(ipfsContent[i]);
        }
        return JSON.parse(content);
      }),
      fetch(gatewayURI).then(res => res.json())
    ]);
  }

  throw new Error("Could not recognize URI format...");
}

export const normalizeImageURI = async (uri: string, mime: string, { ipfsUriType = <"blob" | "data">"data" } = { }) => {
  const ipfsMatch = matchIpfsUri(uri);
  if(ipfsMatch) {
    const gatewayURI = `${IPFS_GATEWAY}${ipfsMatch[2]}`;
    return await Promise.race([
      fetchContentFromIPFS(uri).then(ipfsContent => {
        if(ipfsUriType === "blob") {
          return URL.createObjectURL(new Blob(ipfsContent, {type: mime}));
        } else {
          let content = "";
          const decoder= new TextDecoder();
          for(let i = 0; i < ipfsContent.length; i++) {
            content += decoder.decode(ipfsContent[i]);
          }
          return `data:${mime};base64,${window.btoa(content)}`;
        }
      }),
      fetch(gatewayURI).then(() => gatewayURI)
    ]);
  } else {
    return uri;
  }
}

const matchIpfsUri = (uri: string) => {
  return uri.match(/^(\/ipfs\/|ipfs\:\/\/)(.+)/);
};

const fetchContentFromIPFS = async (uri: string): Promise<Uint8Array[]> => {
  const ipfsMatch = matchIpfsUri(uri);
  if(ipfsMatch) {
    const path = ipfsMatch[2];
    const ipfs = await ipfsClient();
    const content = [];
    let num = 0;
    for await (const chunk of ipfs.cat(path)) {
      console.log(`Loaded chunk for ${path}: #${num++}`);
      content.push(chunk);
    }
    return content;
  } else {
    throw new Error("URI is not compatible with IPFS");
  }
};