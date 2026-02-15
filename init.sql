-- ============================================
-- 一言 API 初始化 SQL
-- 用法: mysql -u root -p < init.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS open_api
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE open_api;

-- 用户（按需修改密码）
CREATE USER IF NOT EXISTS 'open_api'@'%' IDENTIFIED BY 'rsjLITL8PkdZ6oX8';
GRANT SELECT, INSERT, UPDATE ON open_api.* TO 'open_api'@'%';
FLUSH PRIVILEGES;

-- 一言数据表
CREATE TABLE IF NOT EXISTS `Data_love` (
  `id`   INT          NOT NULL,
  `text` TEXT         NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用于高效随机查询：获取 MAX(id) 走索引，避免全表 ORDER BY RAND()
-- PK 自带索引，无需额外创建
