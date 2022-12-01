const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const download = require('download-git-repo')
const fse = require('fs-extra')
const { errLog, successLog } = require('../utils/log')
const path = require('path')
const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const cwd = process.cwd()

// 文件操作相关
const store = memFs.create()
const memFsEditor = editor.create(store)
const INJECT_FILES = ['package.json']
const getDirFileName = (dir) => {
  try {
    const files = fse.readdirSync(dir)
    const fileToCopy = []
    files. forEach(file => {
      if (file.indexOf(INJECT_FILES) > -1) return
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
    download('github:Eyes22798/vue-component-template', downloadPath, function (err) {
      if (err) {
        spinner.fail('模版下载失败')
        errLog(err)
      } else {
        spinner.succeed('模版下载成功')
        // 提取文件，替换模版
        const copyFiles = getDirFileName(downloadPath) // 要复制的文件
        const templateData = {
          name: '@eyes22798/test-component',
          author: 'Eyes22798',
          description: 'this is a test!',
          version: '0.0.1',
        }
        copyFiles.forEach((file) => {
          fse.copySync(path.join(downloadPath, file), path.join(projectPath, file))
          console.log(`${chalk.green('✔ ')}${chalk.green(`创建${projectName}/${file}`)}`)
        })

        INJECT_FILES.forEach(file => {
          injectTemplate(path.join(downloadPath, file), path.join(projectName, file), {
            ...templateData
          })
        })

        // 将内存中的文件操作，全部提交到磁盘
        memFsEditor.commit(() => {
          INJECT_FILES.forEach((file) => {
            console.log(`${chalk.green('✔ ')}${chalk.green(`创建${projectName}/${file}`)}`)
          })
        })

        // 删除临时文件
        fse.remove(downloadPath)
        process.chdir(projectPath)

        successLog('项目初始化完成')
      }
    })
  })
}

module.exports = create