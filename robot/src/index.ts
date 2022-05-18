import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import createSdk from './tinkoff/client'
import AccountsService from './tinkoff/service/accounts'
import PortfolioService from './tinkoff/service/portfolio'
import Robots from './robot/robots'
import { v4 } from 'uuid'

dotenv.config()

const authSecret = process.env.AUTH_SECRET
if (!authSecret) {
  throw new Error('AUTH_SECRET env is not set')
}

const authPassword = process.env.AUTH_PASSWORD
if (!authPassword) {
  throw new Error('AUTH_PASSWORD env is not set')
}

const tinkoffToken = process.env.TINKOFF_TOKEN
if (!tinkoffToken) {
  throw new Error('TINKOFF_TOKEN env is not set')
}

const client = createSdk('invest-public-api.tinkoff.ru:443', tinkoffToken, 'ElisDN')

const accountsService = new AccountsService(client)
const portfolioService = new PortfolioService(client)

const robots = new Robots()

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
  try {
    next()
  } catch (e) {
    console.error(e)
    if (e instanceof Error) {
      res.status(500).json({ message: e.message })
    }
    res.status(500).json(e)
  }
})

app.post('/auth', (req, res) => {
  if (req.body.password === authPassword) {
    return res.status(200).json({
      token: jwt.sign({ id: 0 }, authSecret, { expiresIn: 3600 }),
      expires: 3600,
    })
  }
  return res.status(409).json({ message: 'Incorrect password' })
})

app.use('/api', (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).json({ message: 'Not authorized' })
    return
  }
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, authSecret, (err) => {
    if (err) {
      res.status(401).json({ message: 'Not authorized' })
    } else {
      next()
    }
  })
})

app.get('/api', function (req, res) {
  res.json('API')
})

app.get('/api/accounts', async function (req, res) {
  const accounts = await accountsService.getAll()
  res.json(accounts)
})

app.post('/api/accounts/open-sandbox', async function (req, res) {
  await accountsService.openSandboxAccount()
  res.json()
})

app.get('/api/accounts/:account', async function (req, res) {
  const account = await accountsService.get(req.params.account)
  res.json(account)
})

app.post('/api/accounts/:account/close-sandbox', async function (req, res) {
  await accountsService.closeSandboxAccount(req.params.account)
  res.json()
})

app.get('/api/accounts/:account/portfolio', async function (req, res) {
  const account = await accountsService.get(req.params.account)
  const positions = await portfolioService.getPositions(account)
  res.json(positions)
})

app.get('/api/accounts/:account/robots', async function (req, res) {
  res.json(
    robots.getAll(req.params.account).map((robot) => ({
      id: robot.getId(),
      figi: robot.getFigi(),
    }))
  )
})

app.post('/api/accounts/:account/robots/create', async function (req, res) {
  if (!req.body.figi) {
    res.status(422).json({ message: 'Property figi is empty' })
  }
  robots.create(req.params.account, v4(), req.body.figi)
  res.json()
})

app.get('/api/accounts/:account/robots/:robot', async function (req, res) {
  const robot = robots.get(req.params.account, req.params.robot)
  res.json({
    id: robot.getId(),
    figi: robot.getFigi(),
  })
})

app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT)
})
