const { exec } = require('child_process')
const chalk = require('chalk')
const ora = require('ora')

const projectGitInit = (projectName) => {
  // git 初始化
  const gitInitSpinner = ora(`cd ${chalk.green.bold(projectName)} 目录, 执行 ${chalk.green.bold('git init')}`)
  gitInitSpinner.start()

  const gitInit = exec('git init')

  gitInit.on('close', code => {
    if (code === 0) {
      gitInitSpinner.color = 'red'
      gitInitSpinner.succeed(gitInit.stdout.read())
    } else {
      gitInitSpinner.color = 'red'
      gitInitSpinner.fail(gitInit.stderr.read())
    }
    // 安装依赖
    const installSpinner =  ora(`安装项目依赖 ${chalk.green.bold('yarn')}, 请稍后...`)
    installSpinner.start()
    exec('yarn', (error, stdout, stderr) => {
      if (error) {
        installSpinner.color = 'red'
        installSpinner.fail(chalk.red('安装项目依赖失败，请自行重新安装！'))
        console.log(error)
      } else {
        installSpinner.color = 'green'
        installSpinner.succeed('安装成功')
        console.log(`${stderr}${stdout}`)
        console.log(chalk.green('创建项目成功！'))
        console.log(chalk.green('输入yarn serve启动项目'))
      }
    })
  })
}

module.exports = projectGitInit