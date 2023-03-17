/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
    appId: 'cn.kxlove.zheli',
    productName: '浙里学习',
    directories: {
        output: 'dist/electron',
    },
    publish: null,
    npmRebuild: true,
    files: [
        'dist/main/**/*',
        'dist/preload/**/*',
        'dist/render/**/*',
    ],
    mac: {
        icon: 'src/common/icon.png',
    },
    win: {
        target: [{
            target: 'nsis',
            arch: [
                // 'x64',
                'ia32',
            ],
        }],
        icon: 'src/common/icon.png',
    },
    nsis: {
        shortcutName: '浙里学习',
        oneClick: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        deleteAppDataOnUninstall: true,
        perMachine: true,
    },
}

module.exports = config
