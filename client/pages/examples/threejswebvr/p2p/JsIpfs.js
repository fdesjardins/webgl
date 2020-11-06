async function IpfsNode() {
  const node = await window.Ipfs.create()
  // Ready to use!
  // See https://github.com/ipfs/js-ipfs#core-api
  console.log('ipfs node created')
  return node
}

export default IpfsNode
