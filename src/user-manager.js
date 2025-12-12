import { allPath } from "./static.js"
import { loadJson, saveJson } from "./helper.js"
import { jidDecode } from "baileys"

export default class User {
  blockedJids = new Map()
  trustedJids = new Map()
  groupsWhitelist = new Map()
  groupChatListenMode = GroupListenMode.SELF
  privateChatListenMode = PrivateListenMode.SELF

  constructor() {
    const bjJson = loadJson(allPath.blockedJidsPath)
    this.blockedJids = new Map(Object.entries(bjJson))

    const tjJson = loadJson(allPath.trustedJidsPath);
    this.trustedJids = new Map(Object.entries(tjJson));

    const gwJson = loadJson(allPath.groupsWhitelist);
    this.groupsWhitelist = new Map(Object.entries(gwJson));

    const cmJson = loadJson(allPath.chatListenMode)
    this.groupChatListenMode = cmJson.group
    this.privateChatListenMode = cmJson.private
  }

  isAuth(key) {
    // blocked
    const qsfs = key?.participant || key.remoteJid //quick serialize find senderId

    if (this.blockedJids.get(qsfs)) {
      return crs(Permission.BLOCKED, 'jid blocked', qsfs)
    }

    const { server } = jidDecode(key?.remoteJid)
    const isPrivateChat = server === "s.whatsapp.net" || server === "lid"
    if (isPrivateChat) {
      if (this.privateChatListenMode === PrivateListenMode.SELF) {
        return this.trustedJids.has(key.remoteJid) ? crs(Permission.ALLOWED, 'trusted jid', qsfs) : crs(Permission.NOT_ALLOWED, 'untrusted jid', qsfs)
      } else {
        return crs(Permission.ALLOWED, 'private chat public', qsfs)
      }
    } else {
      if (this.groupChatListenMode === GroupListenMode.SELF) {
        return this.trustedJids.has(key?.participant) ? crs(Permission.ALLOWED, 'trusted jid in group self', qsfs) : crs(Permission.NOT_ALLOWED, 'not trusted jid, self group', qsfs)
      } else if (this.groupChatListenMode === GroupListenMode.DEFAULT) {
        if (this.trustedJids.has(key?.participant)) {
          return crs(Permission.ALLOWED, 'trusted jid in group default', qsfs)
        }
        const gwl = this.groupsWhitelist.has(key?.remoteJid)
        return gwl ? crs(Permission.ALLOWED, 'group in whitelist', qsfs) : crs(Permission.NOT_ALLOWED, 'grup is not in whitelist', qsfs)
      } else {
        return crs(Permission.ALLOWED, 'grup public', qsfs)
      }
    }
  }

  getStatus(jid) {
    return {
      groupChatListenMode: this.groupChatListenMode,
      listen: this.groupsWhitelist.get(jid) ? true : false,
      privateChatListenMode: this.privateChatListenMode

    }
  }

  groupChatToggle(chatMode) {
    this.groupChatListenMode = chatMode
    this.saveChatMode()
  }

  privateChatToggle(chatMode) {
    this.privateChatListenMode = chatMode
    this.saveChatMode()
  }

  manageTrustedJids(trustOrRemove, lid, note = "(lupa di kasih note)") {
    let result = null
    if (trustOrRemove === "trust") {
      if (!this.trustedJids.has(lid)) {
        this.trustedJids.set(lid, note)
        result = true
      } else {
        result = false
      }
    } else if (trustOrRemove === "untrust") {
      // resolve num
      if (!(isNaN(parseInt(lid)))) {
        lid = Array.from(this.trustedJids)[lid-1]?.[0]
      }

      if (this.trustedJids.has(lid)) {
        const snapshot = this.trustedJids.get(lid)
        this.trustedJids.delete(lid)
        result = snapshot
      } else {
        result = false
      }
    } else {
      throw Error('param 1 "userOption" is invalid.')
    }
    const json = Object.fromEntries(this.trustedJids.entries())
    saveJson(json, allPath.trustedJidsPath)
    return result
  }
  manageBlockedJids(addOrRemove, lid, note = "(lupa di kasih note)") {
    let result = null
    if (addOrRemove === "add") {
      if (!this.blockedJids.has(lid)) {
        this.blockedJids.set(lid, note)
        result = true
      } else {
        result = false
      }
    } else if (addOrRemove === "remove") {
      // resolve num
      if (!(isNaN(parseInt(lid)))) {
        lid = Array.from(this.blockedJids)[lid-1]?.[0]
      }

      if (this.blockedJids.has(lid)) {
        const snapshot = this.blockedJids.get(lid)
        this.blockedJids.delete(lid)
        result = snapshot
      } else {
        result = false
      }
    } else {
      throw Error('param 1 "userOption" is invalid.')
    }
    const json = Object.fromEntries(this.blockedJids.entries())
    saveJson(json, allPath.blockedJidsPath)
    return result
  }

  manageGroupsWhitelist(removeOrAdd, groupJid, note = null) {
    if (removeOrAdd === "remove") {
      if (this.groupsWhitelist.has(groupJid)) {
        this.groupsWhitelist.delete(groupJid);
        this.saveGroupWhiteList()
        return true
      } return false
    } else if (removeOrAdd === "add") {
      if (this.groupsWhitelist.has(groupJid)) {
        this.groupsWhitelist.set(groupJid, note);
        this.saveGroupWhiteList()
        return false
      }
      this.groupsWhitelist.set(groupJid, note);
      this.saveGroupWhiteList()
      return true
    } else {
      throw Error('param 1 "removeOrAdd" is invalid.')
    }

  }

  saveGroupWhiteList() {
    const json = Object.fromEntries(this.groupsWhitelist.entries());
    saveJson(json, allPath.groupsWhitelist)
  }

  saveChatMode() {
    const json = { group: this.groupChatListenMode, private: this.privateChatListenMode }
    saveJson(json, allPath.chatListenMode)
  }
}



export class GroupListenMode {
  static SELF = 0
  static PUBLIC = 1
  static DEFAULT = 2
}

export class PrivateListenMode {
  static SELF = 0
  static PUBLIC = 1
}

export class Permission {
  static ALLOWED = 'allow_and_serialize'
  static NOT_ALLOWED = 'not_allow_but_serialize'
  static BLOCKED = 'buang'
}

const crs = (permission, message, jid) => ({ permission, message, jid })