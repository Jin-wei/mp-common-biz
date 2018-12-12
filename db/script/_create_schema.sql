drop schema if exists `common_biz`;
CREATE SCHEMA `common_biz` ;
CREATE USER 'biz'@'localhost' IDENTIFIED BY 'wise';

GRANT ALL privileges ON common_biz.* TO 'biz'@'%'IDENTIFIED BY 'wise';