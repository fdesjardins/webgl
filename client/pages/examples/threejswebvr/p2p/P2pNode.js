import Libp2p from 'libp2p'
import WebSockets from 'libp2p-websockets'
import {NOISE} from 'libp2p-noise'
import Bootstrap from 'libp2p-bootstrap'
import MPLEX from 'libp2p-mplex'


const P2pNode = () => {
  //following this https://github.com/libp2p/js-libp2p/blob/master/doc/GETTING_STARTED.md
  let node = null


   const init = async () =>{
     // Known peers addresses
     const bootstrapMultiaddrs = [
       '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
       '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3'
     ]

    node = await Libp2p.create({
     modules: {
       transport: [WebSockets],
       connEncryption: [NOISE],
       streamMuxer: [MPLEX],
       peerDiscovery: [Bootstrap],
     },
    config: {
      peerDiscovery: {
        autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minConnections)
        // The `tag` property will be searched when creating the instance of your Peer Discovery service.
        // The associated object, will be passed to the service when it is instantiated.
        [Bootstrap.tag]: {
          enabled: true,
          list: bootstrapMultiaddrs // provide array of multiaddrs
        }
      }
    }
   })
   node.on('peer:discovery', (peer) => {
     console.log('Discovered %s', peer.id.toB58String()) // Log discovered peer
   })

   node.connectionManager.on('peer:connect', (connection) => {
     console.log('Connected to %s', connection.remotePeer.toB58String()) // Log connected peer
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
