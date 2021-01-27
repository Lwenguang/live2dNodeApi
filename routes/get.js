/*
 * @Author: HCLonely
 * @Date: 2021-01-26 11:34:11
 * @LastEditTime: 2021-01-26 16:23:24
 * @LastEditors: Please set LastEditors
 * @Description: 返回模型信息
 * @FilePath: \live2dNodeApi\route\get.js
 */

const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const createError = require('http-errors')
const { id2name } = require('../tools/modelList')
const { getName } = require('../tools/modelTextures')

let json = {}
router.get('/', function (req, res, next) {
  if (!req.query.id) return next(createError(400, 'id不能为空'))
  const id = req.query.id.split('-')
  const modelId = parseInt(id[0])
  const modelTexturesId = id[1] ? parseInt(id[1]) : 0
  let modelName = id2name(modelId)
  if (Array.isArray(modelName)) {
    modelName = modelTexturesId > 0 ? modelName[modelTexturesId - 1] : modelName[0]
    const fileName = fs.existsSync('models/' + modelName + '/index.json') ? ('models/' + modelName + '/index.json') : ('models/' + modelName + '/model.json')
    json = fs.readJSONSync(fileName)
  } else if (fs.existsSync('models/' + modelName + '/texturesModel.cache')) {
    modelName = fs.readJsonSync('models/' + modelName + '/texturesModel.cache')[modelTexturesId]
    const fileName = fs.existsSync('models/' + modelName + '/index.json') ? ('models/' + modelName + '/index.json') : ('models/' + modelName + '/model.json')
    json = fs.readJSONSync(fileName)
  } else {
    const fileName = fs.existsSync('models/' + modelName + '/index.json') ? ('models/' + modelName + '/index.json') : ('models/' + modelName + '/model.json')
    json = fs.readJSONSync(fileName)

    if (modelTexturesId > 0) {
      const modelTexturesName = getName(modelName, modelTexturesId)
      if (modelTexturesName) {
        json.textures = Array.isArray(modelTexturesName) ? modelTexturesName : [modelTexturesName]
      }
    }
  }

  json.textures = json.textures.map(e => completePath(e))
  json.model = completePath(json.model)
  if (json.pose) json.pose = completePath(json.pose)
  if (json.physics) json.physics = completePath(json.physics)
  if (json.voice) json.voice = completePath(json.voice)
  if (json.motions) {
    for (const v of Object.values(json.motions)) {
      for (const i in v) {
        if (v[i].file) v[i].file = completePath(v[i].file)
        if (v[i].sound) v[i].sound = completePath(v[i].sound)
      }
    }
  }
  if (json.expressions) {
    for (const i in json.expressions) {
      if (json.expressions[i].file) json.expressions[i].file = completePath(json.expressions[i].file)
    }
  }

  if (!json.layout) {
    json.layout = {
      center_x: 0.0,
      center_y: 0.0
    }
  }
  if (!json.hit_areas_custom) {
    json.hit_areas_custom = {
      head_x: [0.0, 0.0],
      head_y: [0.0, 0.0],
      body_x: [0.0, 0.0],
      body_y: [0.0, 0.0]
    }
  }

  function completePath (e) {
    return '../' + modelName + '/' + e
  }

  res.json(json)
})

module.exports = router
