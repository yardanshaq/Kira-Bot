import { store } from "../index.js";

const socketPatch = (sock) => {
  // [display log]
  // const gfap_ori = sock.groupFetchAllParticipating
  // sock.groupFetchAllParticipating = () => {
  //     console.log('execute groupFetchAllParticipating')
  //     return gfap_ori.apply(sock)
  // }
  const gm_ori = sock.groupMetadata
  sock.groupMetadata = (...params) => {
    console.log('↘️ download groupMetadata. jid: ' + params)
    return gm_ori.apply(sock, params)
  }

  //[emepheral duration]
  // const sendMessage_ori = sock.sendMessage
  // sock.sendMessage = async (jid, content, options = {}) => {
  //   const ephemeralExpiration = store.chats.get(jid)?.ed
  //   if (ephemeralExpiration) Object.assign(options, { ephemeralExpiration })
  //   const payload = [jid, content, options]
  //   return await sendMessage_ori.apply(sock, payload)
  // }
  //   const relayMessage_ori = sock.relayMessage
  //   sock.relayMessage = async (jid, message, others = {}) => {
  //       const ephemeralExpiration = store.chats.get(jid)?.ed
  //       if (ephemeralExpiration) {
  //           const type = getContentType(message)
  //           message[type].contextInfo ??= {};
  //           message[type].contextInfo.expiration = ephemeralExpiration
  //       }
  //       const payload = [jid, message, others]
  //       return await relayMessage_ori.apply(sock, payload)
  //   }
};

export default socketPatch;
