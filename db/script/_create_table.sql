DROP TABLE IF EXISTS `business`;
CREATE TABLE `     ` (
  `biz_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `biz_type` varchar(32) NOT NULL,
  `tenant` varchar(32) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_lang` varchar(100) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `address` varchar(100) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `province` varchar(10) DEFAULT NULL,
  `zipcode` varchar(10) DEFAULT NULL,
  `latitude` float(10,6) DEFAULT NULL,
  `longitude` float(10,6) DEFAULT NULL,
  `phone_no` varchar(100) DEFAULT NULL,
  `opened_date` date DEFAULT NULL,
  `owner_name` varchar(45) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  `img_url` varchar(100) DEFAULT NULL,
  `chain_name` varchar(100) DEFAULT NULL,
  `services` varchar(500) DEFAULT NULL,
  `options` varchar(500) DEFAULT NULL,
  `price_level` int(11) DEFAULT NULL,
  `reservations` tinyint(1) DEFAULT '1',
  `website` varchar(255) DEFAULT NULL,
  `wifi` tinyint(1) DEFAULT '0',
  `fax` varchar(50) DEFAULT NULL,
  `hours` varchar(500) DEFAULT NULL,
  `hours_display` varchar(500) DEFAULT NULL,
  `open_24hrs` tinyint(1) DEFAULT '0',
  `rating` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `smoking` tinyint(1) DEFAULT '0',
  `seating_outdoor` tinyint(1) DEFAULT '0',
  `accessible_wheelchair` tinyint(1) DEFAULT '1',
  `room_private` tinyint(1) DEFAULT '0',
  `description` varchar(1000) DEFAULT NULL,
  `order_status` tinyint(1) DEFAULT '0',
  `printer_lang` tinyint(1) DEFAULT '1' COMMENT '1:name (name_lang) 2: name_lang (name)3: name4: name_lang',
  `parking` tinyint(1) DEFAULT '0',
  `parent_id` bigint(11) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`biz_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business information.';

ALTER TABLE business ADD UNIQUE (tenant,name);
ALTER TABLE business ADD `biz_code` varchar(32) DEFAULT NULL;
ALTER TABLE business ADD UNIQUE (tenant,biz_code);

DROP TABLE IF EXISTS `biz_customer`;
CREATE TABLE `biz_customer` (
  `relation_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `cust_id` bigint(11) unsigned DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `biz_id` bigint(11) unsigned NOT NULL,
  `tenant` varchar(32) NOT NULL,
  `phone_no` varchar(100) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `address` varchar(100) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `province` varchar(10) DEFAULT NULL,
  `zipcode` varchar(10) DEFAULT NULL,
  `latitude` float(10,6) DEFAULT NULL,
  `longitude` float(10,6) DEFAULT NULL,
  `cust_type` varchar(32) DEFAULT NULL,
  `note` varchar(100) DEFAULT NULL,
  `owner_name` varchar(45) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`relation_id`),
  CONSTRAINT `biz_customer_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business to customer relationship.';
Alter table biz_customer add column owner_phone varchar(20) DEFAULT NULL;
Alter table biz_customer add column contact_name varchar(20) DEFAULT NULL;
Alter table biz_customer add column cust_since DATE DEFAULT NULL;
Alter table biz_customer add column chain_name varchar(100) DEFAULT NULL;
Alter table biz_customer add column support_paylater tinyint(1) NOT NULL DEFAULT '1';
Alter table biz_customer add column email varchar(100) DEFAULT NULL;
ALTER TABLE biz_customer ADD UNIQUE (tenant,cust_id);
ALTER TABLE biz_customer ADD UNIQUE (tenant,phone_no);
ALTER TABLE biz_customer ADD UNIQUE (tenant,email);


DROP TABLE IF EXISTS `biz_comment`;
CREATE TABLE `biz_comment` (
      `tenant` varchar(32) NOT NULL,
      `comment_id` bigint(11) NOT NULL AUTO_INCREMENT,
      `biz_id` bigint(11) NOT NULL,
      `user_id` bigint(11) NOT NULL,
      `user_name` varchar(500) NOT NULL,
      `city` varchar(500) NOT NULL,
      `comment` varchar(500) NOT NULL,
      `rating` smallint(1) NOT NULL,
      `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `active` tinyint(1) NOT NULL DEFAULT '1',
      PRIMARY KEY (`comment_id`)
    ) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `biz_image`;
CREATE TABLE `biz_image` (
  `tenant` varchar(32) NOT NULL,
  `img_id` bigint(11) unsigned AUTO_INCREMENT NOT NULL,
  `biz_id` bigint(11) unsigned NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint(11)  DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `primary_flag` int(4) unsigned NULL DEFAULT '0',
  PRIMARY KEY (`img_id`),
  CONSTRAINT `business_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE Cascade ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business and image one to many information.';

ALTER TABLE biz_image ADD UNIQUE (tenant,biz_id,img_url);

DROP TABLE IF EXISTS `biz_customer_price`;
CREATE TABLE `biz_customer_price` (
  `price_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) unsigned NOT NULL,
  `relation_id` bigint(11) unsigned NOT NULL,
  `tenant` varchar(32) NOT NULL,
  `prod_id` bigint(11) NOT NULL,
  `prod_name` varchar(250) ,
  `prod_code` varchar(100) ,
  `start_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` DATETIME,
  `price` decimal(10,2) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`price_id`),
  CONSTRAINT `biz_customer_price_biz_id` FOREIGN KEY (`biz_id`) REFERENCES `business` (`biz_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `biz_customer_price_relation_id` FOREIGN KEY (`relation_id`) REFERENCES `biz_customer` (`relation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT= 'This is the table to save biz customer price';

ALTER TABLE biz_customer_price ADD UNIQUE (tenant,biz_id,relation_id,prod_id);

DROP TABLE IF EXISTS `biz_payment`;
CREATE TABLE `biz_payment` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `biz_id` bigint(11) unsigned NOT NULL,
  `tenant` varchar(32) NOT NULL,
  `type` varchar(100) NOT NULL,
  `partner` varchar(32) NOT NULL,
  `key` varchar(32) NOT NULL,
  `seller_email` varchar(100) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint(11) unsigned NOT NULL,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` bigint(11) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business payment method parameters.';

ALTER TABLE biz_payment ADD UNIQUE (tenant,biz_id,type);


/*==============================================================*/
/* Table: biz_purchaseorder                                     */
/*==============================================================*/
DROP TABLE IF EXISTS `biz_po_item`;
DROP TABLE IF EXISTS `biz_po`;
CREATE TABLE `biz_po` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `tenant` varchar(32) NOT NULL,
  `biz_id` bigint(11) NOT NULL,
  `supplier_id` bigint(11) NOT NULL,
  `note` varchar(128) DEFAULT NULL,
  `status` varchar(32) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` bigint(11) NOT NULL,
  `updated_by` bigint(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business purchase orders.';



CREATE TABLE `biz_po_item` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `po_id` bigint(11) NOT NULL,
  `tenant` varchar(32) NOT NULL,
  `prod_id` bigint(11) NOT NULL,
  `prod_type` varchar(256) DEFAULT NULL,
  `prod_parent_type` varchar(256) DEFAULT NULL,
  `prod_name` varchar(256) NOT NULL,
  `prod_code` varchar(256) NOT NULL,
  `quantity` decimal(10,2)  NOT NULL DEFAULT 0,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0,
  `unit_of_measure` varchar(100) DEFAULT NULL,
  `commission_rate` decimal(10,2) NOT NULL DEFAULT 0,
  `commission` decimal(10,2)  NOT NULL DEFAULT 0,
  `amount` decimal(10,2)  NOT NULL DEFAULT 0,
  `note` varchar(128) DEFAULT NULL,
  `status` varchar(32) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` bigint(11) NOT NULL,
  `updated_by` bigint(11) NOT NULL,
  `pay_status` varchar(32) DEFAULT NULL,
  `receive_status` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `biz_po_item_po_id` FOREIGN KEY (`po_id`) REFERENCES `biz_po` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='This is the table to hold business purchase order items.';



