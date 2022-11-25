const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const download = require('download-git-repo')
const { errLog, successLog } = require('../utils/log')

const create = (projectName, options) => {
  if (projectName.indexOf('@eyes22798/') !== 0) {
    console.log('Please start the package name with ' + chalk.cyan('@eyes22798/'))
    console.log('Example: ' + chalk.cyan('@eyes22798/custom-button'))
    return
  }

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

    download('Eyes22798/vue3-mini-state-manager', projectName, function (err) {
      if (err) {
        spinner.fail('模版下载失败')
        errLog(err)
      } else {
        spinner.succeed('模版下载成功')
        successLog('项目初始化完成')
      }
    })
  })
}

module.exports = create