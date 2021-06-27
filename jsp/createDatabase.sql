-- 创建数据库
CREATE DATABASE wwb;
use wwb;

-- 创建用户表
CREATE TABLE Users (
    ID VARCHAR(30) PRIMARY KEY NOT NULL,
    name VARCHAR(20),
    password VARCHAR(30) NOT NULL,
    introduction VARCHAR(100) DEFAULT "hello world!",
    createTime bigint NOT NULL,
    changeTime bigint,
    bkgImage MEDIUMTEXT,
    avatar MEDIUMTEXT,
    following INT NOT NULL DEFAULT 0,
    followed INT NOT NULL DEFAULT 0
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建动态表
CREATE TABLE Postings (
    ID VARCHAR(30) PRIMARY KEY NOT NULL,
    userId VARCHAR(30) NOT NULL,
    createTime bigint NOT NULL,
    contents TEXT NOT NULL,
    image MEDIUMTEXT,
    likes INT DEFAULT 0 NOT NULL,
    comments INT DEFAULT 0 NOT NULL,
    FOREIGN KEY(userId) REFERENCES Users(ID) 
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建关注表
CREATE TABLE Followers (
    userId VARCHAR(30) NOT NULL,
    userFollowedId VARCHAR(30) NOT NULL,
    createTime bigINT NOT NULL,
    PRIMARY KEY(userId,userFollowedId),
    FOREIGN KEY(userId) REFERENCES Users(ID),
    FOREIGN KEY(userFollowedId) REFERENCES Users(ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建评论表
CREATE TABLE Comments (
    ID VARCHAR(30) PRIMARY KEY NOT NULL,
    userId VARCHAR(30) NOT NULL,
    postId VARCHAR(30) NOT NULL,
    contents TEXT NOT NULL,
    createTime bigint NOT NULL,
    FOREIGN KEY(userId) REFERENCES Users(ID),
    FOREIGN KEY(postId) REFERENCES Postings(ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建点赞表
CREATE TABLE Likes (
    userId VARCHAR(30) NOT NULL,
    postId VARCHAR(30) NOT NULL,
    createTime bigint NOT NULL,
    PRIMARY KEY (userId,postId),
    FOREIGN KEY(userId) REFERENCES Users(ID),
    FOREIGN KEY(postId) REFERENCES Postings(ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* show tables; */

/* DESC Users;
DESC Postings;
DESC Followers;
DESC Likes;
DESC Comments; */

INSERT INTO Users(ID,name,password,createTime,avatar,following,followed) VALUES ("jonson","中大刘德华","jonsonI$theBEST",1624340575,"https://avatars.githubusercontent.com/u/47637319?v=4",1,2);
INSERT INTO Users(ID,name,password,createTime,avatar,following,followed) VALUES ("user","不配拥有姓名的测试账号","123",1624340575,"https://avatars.githubusercontent.com/u/84268956?v=4",2,0);
INSERT INTO Users(ID,name,password,createTime,avatar,following,followed) VALUES ("yess","好耶","gOOOOOOOOd!",1624340575,"https://storage.googleapis.com/kaggle-avatars/images/6995825-kg.png",1,2);


INSERT INTO Postings(ID,userId,createTime,contents,likes) VALUES ("p_1","jonson",1623340575,"太棒了，我们的微微博跑起来了😀",2);
INSERT INTO Postings(ID,userId,createTime,contents) VALUES ("p_2","user",1624240575,"👏那我也来测试一下");
INSERT INTO Postings(ID,userId,createTime,contents,image) VALUES ("p_3","yess",1624340575,"好耶！","https://storage.googleapis.com/kaggle-avatars/images/6995825-kg.png");

INSERT INTO Likes(userId,postId,createTime) VALUES ("user","p_1",1624340575);
INSERT INTO Likes(userId,postId,createTime) VALUES ("yess","p_1",1624340575);

INSERT INTO Followers(userId,userFollowedId,createTime) VALUES ("user","jonson",1624340571);
INSERT INTO Followers(userId,userFollowedId,createTime) VALUES ("yess","jonson",1624340572);
INSERT INTO Followers(userId,userFollowedId,createTime) VALUES ("jonson","yess",1624340573);
INSERT INTO Followers(userId,userFollowedId,createTime) VALUES ("user","yess",1624340574);
