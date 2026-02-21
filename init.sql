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

-- 广告表
CREATE TABLE IF NOT EXISTS `ads` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `ad_id`        VARCHAR(64)  NOT NULL UNIQUE COMMENT '业务唯一标识（埋点用）',
  `title`        VARCHAR(255) NOT NULL        COMMENT '广告标题',
  `description`  TEXT DEFAULT NULL            COMMENT '广告描述',
  `icon_url`     VARCHAR(512) DEFAULT NULL    COMMENT '图标/素材 URL',
  `landing_page` VARCHAR(512) NOT NULL        COMMENT '落地页链接',
  `ad_type`      VARCHAR(32)  DEFAULT 'banner' COMMENT '类型: banner/popup/splash',
  `style`        JSON DEFAULT NULL            COMMENT '样式配置（主题色等）',
  `starts_at`    DATETIME DEFAULT NULL        COMMENT '生效时间（NULL=立即生效）',
  `expires_at`   DATETIME DEFAULT NULL        COMMENT '过期时间（NULL=永不过期）',
  `is_active`    TINYINT(1)   DEFAULT 1       COMMENT '手动开关 1=启用 0=禁用',
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
