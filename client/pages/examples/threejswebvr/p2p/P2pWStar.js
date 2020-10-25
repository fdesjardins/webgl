import WStar  from 'libp2p-webrtc-star'
import multiaddr  from 'multiaddr'
import pipe  from 'it-pipe'
import { collect }  from 'streaming-iterables'

const P2pWStar = () => {
const init = async () =>{
  console.log("launching wstar p2p")
  const addr = multiaddr('/ip4/188.166.203.82/tcp/20000/wss/p2p-webrtc-star/p2p/QmcgpsyWgH8Y8ajJz1Cu72KnS5uo2Aa2LpzU7kinSooo2a')
  const ws = new WStar({ upgrader })

  const listener = ws.createListener((socket) => {
    console.log('new connection opened')
    pipe(
      ['hello'],
      socket
    )
  })

  await listener.listen(addr)
  console.log('listening')

  const socket = await ws.dial(addr)
  const values = await pipe(
    socket,
    collect
  )

  console.log(`Value: ${values.toString()}`)

  // Close connection after reading
  await listener.close()
}
init()
}

export default P2pWStar
