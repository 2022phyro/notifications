const OrgModel = require('../models/org')
const AppModel = require('../models/app')
const { BLAccessTokenModel, BLRefreshTokenModel } = require('../models/token')
const { encryptPassword, generateSecret, encrypt, decrypt } = require('../../utils/encrypt')
const Org = {
  async new (orgData) {
    delete orgData.secret
    delete orgData.vapidKeys

    const orgSecret = generateSecret(32)
    if (orgData.password) orgData.password = encryptPassword(orgData.password)
    orgData.secret = orgSecret
    const org = new OrgModel(orgData)
    await org.save()
    return org
  },
  async get (id, filters) {
    let query = {}
    if (id) {
      query._id = id
    }
    if (filters) {
      query = { ...query, ...filters }
    }
    const org = await OrgModel.findOne(query)
    if (!org) return null
    return org
  },
  async patch (id, orgData) {
    if (orgData.password) orgData.password = encryptPassword(orgData.password)
    const org = await OrgModel.findByIdAndUpdate(id, orgData, { new: true, runValidators: true })
    // const org = await OrgModel.findById(id)
    if (!org) return null
    const { secret, password, __v, verified, ...result } = org.toObject()
    return result
  },
  async delete (orgId) {
    const deletedOrg = await OrgModel.findByIdAndDelete(orgId)
    if (!deletedOrg) return null
    await AppModel.deleteMany({ orgId })
    await BLAccessTokenModel.deleteMany({ orgId })
    await BLRefreshTokenModel.deleteMany({ orgId })

    return deletedOrg
  },
  async reEncrypt (org) {
    const secret = org.secret
    const newSecret = generateSecret(32)
    const apps = await AppModel.find({ orgId: org._id })

    await Promise.all(apps.map(async (app) => {
      const { publicKey, privateKey } = app.vapidKeys
      const spublicKey = decrypt(publicKey, secret)
      const sprivateKey = decrypt(privateKey, secret)
      app.vapidKeys = {
        publicKey: encrypt(spublicKey, newSecret),
        privateKey: encrypt(sprivateKey, newSecret)
      }
      await app.save()
    }))
    org.secret = newSecret
    await org.save()
    return newSecret
  }
}
module.exports = Org
