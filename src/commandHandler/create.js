const inquirer = require('inquirer')
const ora = require('ora')
const download = require('download-git-repo')
const fse = require('fs-extra')
const { errLog, successLog } = require('../utils/log')
const path = require('path')
const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const cwd = process.cwd()
const projectGitInit = require('../utils/gitInit')

// 文件操作相关
const store = memFs.create()
const memFsEditor = editor.create(store)
const INJECT_FILES = ['package.json']
const PROMPTS = 'meta.js'
const getDirFileName = (dir) => {
  try {
    const files = fse.readdirSync(dir)
    const fileToCopy = []
    files.forEach(file => {
      if (file.indexOf(INJECT_FILES) > -1 || file.indexOf(PROMPTS) > -1) return
      fileToCopy.push(file)
    })
    return fileToCopy
  } catch (e) {
    return []
  }
}
const injectTemplate = (source, dest, data) => {
  memFsEditor.copyTpl(source, dest, data)
}

const create = (projectName, options) => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'frameTemplate',
      message: '请选择框架类型',
      choices: ['Vue2', 'Vue3']
    }
  ]).then((answer) => {
    const spinner = ora()
    spinner.text = '正在下载模版...'
    spinner.start()

    const projectPath = path.join(cwd, projectName)
    const downloadPath = path.join(projectPath, '__download__')
    download('github:Eyes22798/vue-component-template#main', downloadPath, { clone: true }, function (err) {
      if (err) {
        spinner.fail('模版下载失败')
        errLog(err)
      } else {
        spinner.succeed('模版下载成功，请填写组件基本信息⬇️')
        const prompts = require(path.join(downloadPath, PROMPTS))
        inquirer.prompt(prompts).then((answer) => {
          const templateData = Object.assign({
            name: '',
            version: '',
            description: '',
            author: '',
            license: ''
          }, answer)
          // 提取文件，替换模版
          const copyFiles = getDirFileName(downloadPath) // 要复制的文件
          copyFiles.forEach((file) => {
            fse.copySync(path.join(downloadPath, file), path.join(projectPath, file))
          })

          INJECT_FILES.forEach(file => {
            injectTemplate(path.join(downloadPath, file), path.join(projectName, file), {
              ...templateData
            })
          })

          // 将内存中的文件操作，全部提交到磁盘
          memFsEditor.commit(() => {
            INJECT_FILES.forEach((file) => {
              successLog(`${projectName}项目初始化完成`)

              projectGitInit(projectName)
            })
          })

          // 删除临时文件
          fse.remove(downloadPath)
          process.chdir(projectPath)
        })
      }
    })
  })
}

module.exports = create