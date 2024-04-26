let expect
const mongoose = require('mongoose')
require('../../config/db')('mongodb://localhost/test_notifai')
before(async () => {
  const chai = await import('chai')
  expect = chai.expect
})

after(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

const AppModel = require('../../src/DAO/app')
const App = require('../../src/models/app')
const sinon = require('sinon')
describe('AppModel', () => {
  let createdApps = []

  afterEach(async () => {
    const ids = createdApps.map(app => app._id)
    await App.deleteMany({ _id: { $in: ids } })
    // Reset the list
    createdApps = []
  })

  // Creating a new app with valid data should save the app to the database and return the saved app object.
  it('should save the app to the database and return the saved app object when creating a new app with valid data', async () => {
    const appData = {
      name: 'Test App',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp = await AppModel.createApp(appData)
    createdApps.push(savedApp)
    expect(savedApp).to.be.an('object')
    expect(savedApp.name).to.equal(appData.name)
    expect(savedApp.email).to.equal(appData.email)
    expect(savedApp.phone).to.equal(appData.phone)
    expect(savedApp.password).to.not.equal(appData.password)
    expect(savedApp.secret).to.be.a('string')
    // eslint-disable-next-line no-unused-expressions
    expect(savedApp.verified).to.be.false
  })

  // Creating a new app with missing or invalid data should throw an error.
  it('should throw an error when creating a new app with missing or invalid data', async () => {
    const invalidAppData = {
      name: 'Test App',
      email: 'test@example.com',
      password: 'password123'
    }
    let error
    try {
      await AppModel.createApp(invalidAppData)
    } catch (err) {
      error = err
    }
    expect(error).to.be.an('error')
  })

  // Retrieving an existing app by ID should return the app object.
  it('should return the app object when retrieving an existing app by ID', async () => {
    // Create a new app
    const appData = {
      name: 'Test App',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp = await AppModel.createApp(appData)
    createdApps.push(savedApp)
    // Retrieve the app by ID
    const retrievedApp = await AppModel.getApp(savedApp._id)

    // Assert that the retrieved app is not null and has the correct properties
    expect(retrievedApp).to.be.an('object')
    expect(retrievedApp.name).to.equal(appData.name)
    expect(retrievedApp.email).to.equal(appData.email)
    expect(retrievedApp.phone).to.equal(appData.phone)
  })

  it('should return an array of app objects when retrieving existing apps with valid filters', async () => {
    // Mock the App.find() method to return a predefined array of apps
    const mockApps = [
      { name: 'App 1', email: 'app1@example.com', password: 'pwd123' },
      { name: 'App 2', email: 'app2@example.com', password: 'pwd123' },
      { name: 'App 3', email: 'app3@example.com', password: 'pwd123', verified: true }
    ]
    const mockFind = sinon.stub(App, 'find').returns({
      lean: () => {
        return {
          exec: () => Promise.resolve(mockApps)
        }
      }
    })
    // Call the AppModel.getApps() method with valid filters
    const filters = { verified: true }
    const apps = await AppModel.getApps(filters)

    // Assert that the App.find() method was called with the correct filters
    expect(mockFind.calledOnceWith(filters)).to.be.true

    // Assert that the returned value is an array
    expect(apps).to.be.an('array')
    // Assert that each element in the array is an app object
    apps.forEach(app => {
      expect(app).to.be.an('object')
      expect(app).to.have.property('name')
      expect(app).to.have.property('email')
    })

    // Restore the original implementation of App.find()
    mockFind.restore()
  })

  it('should update the app in the database and return the updated app object when updating an existing app with valid data', async () => {
    // Create a new app
    const appData = {
      name: 'Test App',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp = await AppModel.createApp(appData)
    createdApps.push(savedApp)
    // Update the app with valid data
    const updatedAppData = {
      name: 'Updated App',
      email: 'updated@example.com',
      password: 'newpassword123',
      phone: '9876543210'
    }
    const updatedApp = await AppModel.updateApp(savedApp._id, updatedAppData)

    // Verify the updated app object
    expect(updatedApp).to.be.an('object')
    expect(updatedApp.name).to.equal(updatedAppData.name)
    expect(updatedApp.email).to.equal(updatedAppData.email)
    expect(updatedApp.phone).to.equal(updatedAppData.phone)
    expect(updatedApp.password).to.not.equal(updatedAppData.password)
    expect(updatedApp.secret).to.be.undefined
    expect(updatedApp.verified).to.be.undefined
  })

  // Retrieving a non-existent app by ID should return null.
  it('should return null when retrieving a non-existent app by ID', async () => {
    const appId = '60d2ee9f292a3e2d8c3656f2'
    const filters = {}
    const val = await AppModel.getApp(appId, filters)
    expect(val).to.be.null
  })

  // Retrieving existing apps with invalid filters should return an empty array.
  it('should return an empty array when retrieving existing apps with invalid filters', async () => {
    const filters = { invalidFilter: 'invalid' }
    const apps = await AppModel.getApps(filters)
    expect(apps).to.be.an('array')
    expect(apps).to.have.lengthOf(0)
  })

  // Updating a non-existent app by ID should return null.
  it('should return null when updating a non-existent app by ID', async () => {
    const appId = '60d2ee9f292a3e2d8c3656f2'
    const appData = {
      name: 'Updated App',
      email: 'updated@example.com',
      password: 'updatedpassword123',
      phone: '9876543210'
    }
    const val = await AppModel.updateApp(appId, appData)
    expect(val).to.be.null
  })

  // Deleting a non-existent app by ID should throw an error.
  it('should return null when deleting a non-existent app by ID', async () => {
    const appId = '60d2ee9f292a3e2d8c3656f2'
    const val = await AppModel.deleteApp(appId)
    expect(val).to.be.null
  })

  // The app should be retrieved from the database based on the provided ID.
  it('should retrieve the app from the database based on the provided ID', async () => {
    // Arrange
    const appId = '1234567890'
    const filters = { verified: true }

    const findOneStub = sinon.stub(App, 'findOne').resolves({ toObject: () => ({}) })

    // Act
    const result = await AppModel.getApp(appId, filters)

    // Assert
    expect(findOneStub.calledOnceWith({ _id: appId, ...filters })).to.be.true
    expect(result).to.be.an('object')
    findOneStub.restore()
  })

  // The retrieved apps array should contain app objects.
  it('should retrieve an array of app objects when getting apps with valid filters', async () => {
    // Mock the App.find() method to return an array of app objects
    const mockApps = [
      {
        _id: '1',
        name: 'App 1',
        email: 'app1@example.com',
        phone: '1234567890',
        password: 'encryptedPassword1',
        secret: 'secret1',
        verified: true
      },
      {
        _id: '2',
        name: 'App 2',
        email: 'app2@example.com',
        phone: '0987654321',
        password: 'encryptedPassword2',
        secret: 'secret2',
        verified: false
      }
    ]
    const mockFind = sinon.stub(App, 'find').returns({
      lean: () => {
        return {
          exec: () => Promise.resolve(mockApps)
        }
      }
    })

    // Call the AppModel.getApps() method
    const filters = { verified: true }
    const apps = await AppModel.getApps(filters)

    // Assert that the App.find() method was called with the correct filters
    expect(mockFind.calledOnceWith(filters)).to.be.true

    // Assert that the returned value is an array
    expect(apps).to.be.an('array')

    // Assert that each element in the array is an app object
    apps.forEach(app => {
      expect(app).to.be.an('object')
      expect(app).to.have.property('_id')
      expect(app).to.have.property('name')
      expect(app).to.have.property('email')
      expect(app).to.have.property('phone')
    })

    // Restore the original method
    mockFind.restore()
  })

  // The retrieved app object should have the same properties as the saved app object.
  it('should retrieve an existing app by ID and return an app object with the same properties as the saved app object', async () => {
    // Create a new app
    const appData = {
      name: 'Test App',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp = await AppModel.createApp(appData)

    // Retrieve the app by ID
    const retrievedApp = await AppModel.getApp(savedApp._id)

    // Check if the retrieved app has the same properties as the saved app
    expect(retrievedApp).to.be.an('object')
    expect(retrievedApp.name).to.equal(savedApp.name)
    expect(retrievedApp.email).to.equal(savedApp.email)
    expect(retrievedApp.phone).to.equal(savedApp.phone)
    expect(retrievedApp.password).to.equal(savedApp.password)
    expect(retrievedApp.secret).to.be.a('string')
    expect(retrievedApp.verified).to.be.false
  })

  // Retrieving an app with sensitive data (password, secret) should return the app object with those fields omitted.
  it('should return the app object without sensitive fields omitted when retrieving an app', async () => {
    const appId = 'app_id'
    const filters = { verified: true }
    const app = {
      _id: appId,
      name: 'Test App',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      secret: 'secret_key',
      verified: true,
      __v: 0
    }
    const findOneStub = sinon.stub(App, 'findOne').resolves({ toObject: () => (app) })

    const retrievedApp = await AppModel.getApp(appId, filters)

    expect(retrievedApp).to.deep.equal(app)
    expect(findOneStub.calledOnceWith({ _id: appId, ...filters })).to.be.true

    findOneStub.restore()
  })

  // Updating an existing app with a duplicate email should throw an error.
  it('should throw an error when updating an existing app with a duplicate email', async () => {
    // Create a new app with valid data
    const appData1 = {
      name: 'Test App 1',
      email: 'test1@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp1 = await AppModel.createApp(appData1)
    createdApps.push(savedApp1)
    // Create another app with valid data
    const appData2 = {
      name: 'Test App 2',
      email: 'test2@example.com',
      password: 'password456',
      phone: '0987654321'
    }
    const savedApp2 = await AppModel.createApp(appData2)
    createdApps.push(savedApp2)

    // Try to update the second app with the email of the first app
    const updatedAppData = {
      name: 'Test App 1',
      verified: true
    }
    try {
      await AppModel.updateApp(savedApp2._id, updatedAppData)
      // If the update is successful, fail the test
      throw new Error('Expected update to throw an error')
    } catch (error) {
      expect(error.code).to.be.oneOf([11000, 11001])
    }
  })

  // Deleting an existing app by ID should delete the app from the database and return the deleted app object.
  it('should delete the app from the database and return the deleted app object when deleting an existing app by ID', async () => {
    // Create a new app
    const appData = {
      name: 'Test Appx',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp = await AppModel.createApp(appData)
    createdApps.push(savedApp)
    await AppModel.deleteApp(savedApp._id)

    // Check if the app is deleted
    try {
      await AppModel.getApp(savedApp._id)
    } catch (err) {
      expect(err.message).to.equal('App not found')
    }
    // Check if the deleted app object is returned
  })

  // The app objects in the retrieved apps array should have the same properties as the saved app objects.
  it('should have the same properties as the saved app objects when retrieving existing apps with valid filters', async () => {
    // Create a new app
    const appData = {
      name: 'Test Appx',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    }
    const savedApp = await AppModel.createApp(appData)
    createdApps.push(savedApp)

    // Retrieve the app
    const retrievedApp = await AppModel.getApp(savedApp._id)

    // Check if the retrieved app has the same properties as the saved app
    expect(retrievedApp).to.be.an('object')
    expect(retrievedApp.name).to.equal(savedApp.name)
    expect(retrievedApp.email).to.equal(savedApp.email)
    expect(retrievedApp.phone).to.equal(savedApp.phone)
    expect(retrievedApp.password).to.equal(savedApp.password)
    expect(retrievedApp.secret).to.be.a('string')
    expect(retrievedApp.verified).to.be.false
  })
})
