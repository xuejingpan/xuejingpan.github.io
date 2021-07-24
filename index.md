# 临近预报无网络环境centos系统部署

1.使用root用户登录或切换到root用户

2.确保服务器的时间为北京时间

3.创建目录， 实际部署按情况调整

```
mkdir -p /data/nowcast/docker  
在测试机40.117测试时，
创建路径调整到 /run/media/em/74a8acf1-cf07-4b88-8644-70ac7c8883d6/nowcast/docker，
账号密码 root asdf1234?
实际部署按情况调整
```

3.将公网上的包下载到刚才创建目录下

```
url: http://data.ai-weather.com.cn:8510/static/nowcast/
```



## 一、docker的安装

```
1.切换目录  （看部署路径）
cd /data/nowcast/docker
2.解压
tar xzvf docker-20.10.2.tgz
3.把解压后的文件复制到/usr/bin目录下
cp docker/* /usr/bin/
4.将docker.service文件复制到/etc/systemd/system/目录下
5.赋权
chmod +x /etc/systemd/system/docker.service
6.使配置生效
systemctl daemon-reload

systemctl start docker.service
7.设置开机自启
systemctl enable docker.service
8.docker info查看docker安装信息
```

***************************



## 二、load算法镜像，并调试更新

1. load临近预报算法镜像

   ```
   cd /run/media/em/74a8acf1-cf07-4b88-8644-70ac7c8883d6/nowcast   具体物理机地址按情况修改
   mkdir nowcasting_lk
   docker load < ./docker/nowcasting_lksp.tar
   ```

   ```
   docker images 查看
   ```

2. 修改调试代码, 算法代码在docker image nowcasting_lkspv1里

   **由于雷达数据不确定，肯定需要调代码，所以先启动容器，进入终端调试, 先不用作端口映射等操作**

   ```
   docker run -it conda_base:nowcasting_lkspv1 /bin/bash  先启动容器，进入终端调试
   cd /data/nowcasting_lk/meteorology_api/  在容器内，进入工程代码，目录见下
   ```

   ```
   -rw-r--r-- 1 root root  1151 Jul  5 11:23 README.md
   drwxr-xr-x 3 root root  4096 Jul  5 11:34 lk               （lk-sprog）
   drwxr-xr-x 3 root root  4096 Jul  5 11:34 trec
   drwxr-xr-x 3 root root  4096 Jul  5 11:34 read_ppi
   drwxr-xr-x 3 root root  4096 Jul  5 11:49 cr
   drwxr-xr-x 3 root root  4096 Jul  5 11:49 util
   drwxr-xr-x 3 root root  4096 Jul  5 11:49 metrics
   drwxr-xr-x 1 root root  4096 Jul  6 01:27 logs
   -rw-r--r-- 1 root root 25081 Jul  6 05:02 now.py            （起flask服务）
   drwxr-xr-x 3 root root  4096 Jul  6 05:02 read_source       （读取雷达基数据并返回cr）
   drwxr-xr-x 1 root root  4096 Jul  6 05:13 test              （测试代码）
   -rw-r--r-- 1 root root  3484 Jul  6 05:18 接口请求说明read_source.md
   -rw-r--r-- 1 root root   871 Jul  6 05:18 接口请求说明lk_sprog.md
   ```

算法提供主要接口是2个，起falsk服务代码now.py, 其中读取雷达基数据接口见“接口请求说明read_source.md”，lk预测接口见"接口请求说明lk_sprog.md"
**主要解决新数据能不能读取,可能涉及代码部分：**

   ```
meteorology_api/read_source/               主要的解析代码，从now.py接口引入
meteorology_api/read_source/config.json    配置文件，看下目前支持的站点、data_type、radar_type，见接口请求说明read_source.md， 把新的加进去， 以ZSNJ为例说明：
"ZSNJ": {
"data_type": ["RAW_PPI"],
"radar_type": "GLC_18F",
"radar_code": "ZSNJ"
},
ZSNJ：站点station，机场雷达使用机场四字码如南京机场ZSNJ，气象台雷达使用拼音如NanJing
data_type：数据类型，理论上不唯一，形式为list，理解一个站点的雷达型号只有一个，但可以传输的数据类型可以多种。每次调用接口入参给唯一的data_type即可
radar_type：雷达类型，目前兼容的雷达类型
radar_code：暂时规定机场雷达使用机场四字码，气象台雷达使用雷达编号
   
meteorology_api/test/radar_data_terminal/    放入新数据 [station]/[file]
meteorology_api/test/read_source_radar_test.py  测试代码
说明：由于没法用postman接口测试，就不用手动起服务python now.py调postman接口了，就直接调用上面测试代码调试跑通
   ```

3. 在容器中调完代码测试通过后，需要保存修改，commit到新的镜像，这样下次可以从保存后的最新状态运行该容器

   ```
   apt-get updateexitdocker commit -m "has update" [docker_id] conda_base:nowcasting_lkv2   其中docker_id参考exit前终端显示，例子如下(base) root@5fc6f37a2d38:/data# apt-get updateIgn:1 http://deb.debian.org/debian stretch InReleaseGet:2 http://deb.debian.org/debian stretch-updates InRelease [93.6 kB]Get:3 http://security.debian.org/debian-security stretch/updates InRelease [53.0 kB]Get:4 http://security.debian.org/debian-security stretch/updates/main amd64 Packages [700 kB]Hit:5 http://deb.debian.org/debian stretch Release Fetched 847 kB in 0s (849 kB/s)                    Reading package lists... Done(base) root@5fc6f37a2d38:/data# exitexitchenmeng@B-CHENMENG:/data_1/nowcast_lk$ sudo docker commit -m "has update" 5fc6f37a2d38 conda_base:nowcasting_lkspv1此时 ID 为 5fc6f37a2d38 的容器，是按我们的需求更改的容器
   ```

4. 最后才正式启动容器命令

   ```
   docker images  查看新保存的镜像conda_base:nowcasting_lkv2的 [image_id]docker run -dit  -p 8888:8888  -v /run/media/em/74a8acf1-cf07-4b88-8644-70ac7c8883d6/nowcast/nowcasting_lk:/data/nowcasting_lk/meteorology_api/logs  --name nowcasting_lk [image_id] /bin/bash /data/run.sh-v 是把镜像里的log日志映射到物理机上,外部地址要对应修改的-p 端口映射 端口号用8888可以不改-d 后台运行--name 容器名/data/run.sh 是镜像里的可执行文件 内容就是启动flask程序，cd /data/nowcasting_lk/meteorology_api/ python now.py这样的
   ```

************



## 三、mysql的安装

### 1.创建目录与文件

```
mkdir -p /data/nowcast/mysql/data /data/nowcast/mysql/logs /data/nowcast/mysql/conf /data/nowcast/mysql/init
```

```
touch /data/nowcast/mysql/conf/my.cnfr
```

将init.sql拷贝到/data/nowcast/mysql/init目录下

### 2.导入镜像

切换到镜像mysql.tar所在目录

```
docker load -i mysql.tar
```

### 3.启动容器

```
docker run --name mysql_nowcast -p 3308:3306 -v /data/nowcast/mysql/conf:/etc/mysql/conf.d -v /data/nowcast/mysql/logs:/logs -v /data/nowcast/mysql/data:/var/lib/mysql -v /data/nowcast/mysql/init:/docker-entrypoint-initdb.d -v /etc/localtime:/etc/localtime -e MYSQL_ROOT_PASSWORD=root -d --restart=always mysql:v1
```

### 4.后续检查

1.进入容器

```
docker exec -it mysql_nowcast bash
```

2.连接mysql

```
mysql -uroot -p
```

提示Enter password，输入密码root

3.查询数据库

```
show databases;
```

如果查询出来的Database中有meteorology_nearprediction_service_test，则数据库初始化成功

先exit退出mysql数据库，再exit退出容器

## 四、minio的安装

### 1.创建目录

```
mkdir -p /data/nowcast/minio/data /data/nowcast/minio/config
```

### 2.导入镜像

切换到镜像minio.tar所在目录

```
docker load -i minio.tar
```

### 3.启动容器

```
docker run --name minio_nowcast -p 9000:9000 -e "MINIO_ACCESS_KEY=emdata" -e "MINIO_SECRET_KEY=emdata123" -v /data/nowcast/minio/data:/data -v /data/nowcast/minio/config:/root/.minio -v /etc/localtime:/etc/localtime -d --restart=always minio:v1
```

### 4.后续设置

浏览器打开http://IP:9000，进入minio登录界面

登录minio，账号：emdata，密码：emdata123

点击右下角+号，Create bucket，添加设置桶：oss-radar-v1

![image-20210715112018791](C:\Users\jamesxue\AppData\Roaming\Typora\typora-user-images\image-20210715112018791.png)

![image-20210715112112581](C:\Users\jamesxue\AppData\Roaming\Typora\typora-user-images\image-20210715112112581.png)

设置桶公开

![image-20210715111723734](C:\Users\jamesxue\AppData\Roaming\Typora\typora-user-images\image-20210715111723734.png)

![image-20210715111925702](C:\Users\jamesxue\AppData\Roaming\Typora\typora-user-images\image-20210715111925702.png)

## 五、activemq的安装

### 1.创建目录

```
mkdir -p /data/nowcast/activemq/log
```

### 2.导入镜像

切换到镜像activemq.tar所在目录

```
docker load -i activemq.tar
```

### 3.启动容器

```
docker run --name activemq_nowcast -p 8161:8161 -p 61616:61616 -itd -e ACTIVEMQ_ADMIN_LOGIN=admin -e ACTIVEMQ_ADMIN_PASSWORD=admin -v /data/nowcast/activemq:/data/activemq -v /data/nowcast/activemq/log:/var/log/activemq -v /etc/localtime:/etc/localtime -d --restart=always activemq:v1
```

### 4.后续检查

浏览器打开http://IP:8161，进入activemq界面，则安装成功

## 六、ftp的安装

### 1.创建目录

```
mkdir -p /data/nowcast/ftp/zsss
```

### 2.导入镜像

切换到镜像ftp.tar所在目录

```
docker load -i ftp.tar
```

### 3.启动容器

**注意：请先将下面命令中 PASV_ADDRESS=192.168.40.117 中的 192.168.40.117 改为该服务器的IP地址，再执行命令**

```
docker run --name ftp_nowcast -p 20:20 -p 21:21 -p 21100-21104:21100-21104 -v /data/nowcast/ftp:/home/vsftpd/ykftp -v /etc/localtime:/etc/localtime -e FTP_USER=ykftp -e FTP_PASS=em2019 -e PASV_ADDRESS=192.168.40.117 -e PASV_MIN_PORT=21100 -e PASV_MAX_PORT=21104 -d --restart=always ftp:v1
```

### 4.后续检查

用ftp登录该服务器，账号：ykftp，密码：em2019

如果登录成功，且目录下有ZSSS文件夹，则安装成功

## 七、java的安装

### 1.创建目录

```
mkdir -p /data/nowcast/project/logs
```

### 2.导入后端代码包

将nearprediction-platform-system-near-1.0.0.jar和java.sh拷贝到/data/nowcast/project目录下

其中java.sh是后端代码启动脚本，需要修改里面的部分配置，java.sh的内容如下：

```
nohup java -Dfile.encoding=utf-8 -jar nearprediction-platform-system-near-1.0.0.jar --host=192.168.40.117 --alg.ip=192.168.40.117 --alg.station=ZSSS --alg.dataType=RAW_VOL &
```

将host的值修改为该服务器的IP地址，alg.station的值修改为对应的机场四字码，alg.dataType的值修改为对应的雷达数据类型

```
cd /data/nowcast/project
```

```
chmod +x nearprediction-platform-system-near-1.0.0.jar java.sh
```

### 2.导入镜像

切换到镜像java.tar所在目录

```
docker load -i java.tar
```

### 3.启动容器

```
docker run --name java_nowcast -p 8522:8522 -v /data/nowcast/project:/data/nowcast/project -v /data/nowcast/project/logs:/data/nowcast/project/logs -it -d -v /etc/localtime:/etc/localtime --restart=always java:v1
```

### 4.启动java程序

```
docker exec -it java_nowcast /bin/bash
```

```
cd /data/nowcast/project
```

```
./java.sh
```

Ctrl+c结束，exit退出容器

### 5.后续检查

后端代码的日志位于/data/nowcast/project/logs

## 八、nginx的安装

### 1.创建目录

```
mkdir -p /data/nowcast/html
```

### 2.导入前端代码包

复制dist.tar.gz文件到/data/nowcast/html目录

```
tar xzvf dist.tar.gz
```

### 3.导入镜像

切换到镜像nginx.tar所在目录

```
docker load -i nginx.tar
```

### 4.启动容器

```
docker run --name nginx_nowcast -p 80:80 -v /data/nowcast/html/:/usr/share/nginx/html -v /etc/localtime:/etc/localtime -d --restart=always nginx:v1
```

### 5.后续检查

浏览器打开http://IP，查看页面展示是否正常

## 九、雷达数据的格式与路径

### 1.雷达数据的命名

（1）一个一组的情况

目前后端可以识别的是年月日时分秒加后缀的文件名，时间格式是yyyyMMddHHmmss的UTC时间，即北京时间减8小时，如20210715090159.xxx，后缀名没有要求，没有也可以

（2）两个一组的情况

两个一组的与虹桥雷达文件格式一样

### 2.推送的路径

用ftp推送，账号：ykftp，密码：em2019，推送的地址为该用户登录后的/zsss目录下（该路径对应服务器的路径为/data/nowcast/ftp/zsss/）
