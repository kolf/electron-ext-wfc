# electron开发者插件, 支持打印所有ipcRenderer发的消息

#### 开发
启动
```cronexp
yarn start 
```
打包
```cronexp
yarn build
```

#### 使用
```cronexp
 session.defaultSession.loadExtension(`.../electron-ext-wfc/build`)
```
