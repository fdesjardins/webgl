import Libp2p from 'libp2p'
import WebSockets from 'libp2p-websockets'
import {NOISE} from 'libp2p-noise'
const MPLEX = require('libp2p-mplex')

const P2pNode = () => {
  //following this https://github.com/libp2p/js-libp2p/blob/master/doc/GETTING_STARTED.md
  let node = null

   const init = async () =>{

    node = await Libp2p.create({
     modules: {
       transport: [WebSockets],
       connEncryption: [NOISE],
       streamMuxer: [MPLEX]
     }
   })

    // start libp2p
    await node.start()
    console.log('libp2p has started')

    const listenAddrs = node.transportManager.getAddrs()
    console.log('libp2p is listening on the following addresses: ', listenAddrs)

    const advertiseAddrs = node.multiaddrs
    console.log('libp2p is advertising the following addresses: ', advertiseAddrs)

    // stop libp2p
    await node.stop()
    console.log('libp2p has stopped')
    }
    init()
}

export default P2pNode
