-- MySQL Script generated by MySQL Workbench
-- Sat Nov 16 18:21:52 2019
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema STMA
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Table `permissions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `permissions` ;

CREATE TABLE IF NOT EXISTS `permissions` (
  `idpermissions` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idpermissions`),
  UNIQUE INDEX `idpermissions_UNIQUE` (`idpermissions` ASC))
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

-- -----------------------------------------------------
-- Table `positions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `positions` ;

CREATE TABLE IF NOT EXISTS `positions` (
  `idpositions` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `position_title` VARCHAR(45) NOT NULL,
  `permissions` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`idpositions`),
  UNIQUE INDEX `idpositions_UNIQUE` (`idpositions` ASC),
  UNIQUE INDEX `position_title_UNIQUE` (`position_title` ASC),
  INDEX `permissions_idx` (`permissions` ASC),
  CONSTRAINT `permissions`
    FOREIGN KEY (`permissions`)
    REFERENCES `permissions` (`idpermissions`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

-- -----------------------------------------------------
-- Table `personnel`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `personnel` ;

CREATE TABLE IF NOT EXISTS `personnel` (
  `idpersonnel` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `password` VARCHAR(45) NOT NULL,
  `position` INT UNSIGNED NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  `pto_accumulation_rate` FLOAT UNSIGNED NOT NULL,
  `pto_available` FLOAT UNSIGNED NULL DEFAULT 0,
  `sto_available` FLOAT UNSIGNED NULL DEFAULT 0,
  `email_address` VARCHAR(45) NULL,
  `phone_num` INT UNSIGNED NULL,
  PRIMARY KEY (`idpersonnel`),
  UNIQUE INDEX `idstaff` (`idpersonnel` ASC),
  INDEX `position_idx` (`position` ASC),
  UNIQUE INDEX `email_address_UNIQUE` (`email_address` ASC),
  CONSTRAINT `position`
    FOREIGN KEY (`position`)
    REFERENCES `positions` (`idpositions`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;


-- -----------------------------------------------------
-- Table `daily_schedule`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `daily_schedule` ;

CREATE TABLE IF NOT EXISTS `daily_schedule` (
  `idpersonnel` INT UNSIGNED NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  INDEX `personnel_idx` (`idpersonnel` ASC),
  PRIMARY KEY (`idpersonnel`, `start_time`),
  CONSTRAINT `personnel_sched`
    FOREIGN KEY (`idpersonnel`)
    REFERENCES `personnel` (`idpersonnel`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

-- -----------------------------------------------------
-- Table `presence_status`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `presence_status` ;

CREATE TABLE IF NOT EXISTS `presence_status` (
  `idpresense` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_personnel` INT UNSIGNED NOT NULL,
  `clock_in` DATETIME NOT NULL,
  `clock_out` DATETIME NULL,
  PRIMARY KEY (`idpresense`),
  UNIQUE INDEX `idpresense_UNIQUE` (`idpresense` ASC),
  CONSTRAINT `personnel_status`
    FOREIGN KEY (`id_personnel`)
    REFERENCES `personnel` (`idpersonnel`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

-- -----------------------------------------------------
-- Table `pto_sto_request`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `pto_sto_request` ;

CREATE TABLE IF NOT EXISTS `pto_sto_request` (
  `idpersonnel` INT UNSIGNED NOT NULL,
  `request_date` DATE NOT NULL,
  `req_type` TINYINT NOT NULL,
  `req_description` VARCHAR(255) NULL,
  `approval_status` TINYINT NOT NULL DEFAULT 0,
  `admin_note` VARCHAR(255) NULL,
  PRIMARY KEY (`idpersonnel`, `request_date`),
  CONSTRAINT `personnel_to`
    FOREIGN KEY (`idpersonnel`)
    REFERENCES `personnel` (`idpersonnel`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

-- -----------------------------------------------------
-- Table `timestamp_edits`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `timestamp_edits` ;

CREATE TABLE IF NOT EXISTS `timestamp_edits` (
  `id_editor` INT UNSIGNED NOT NULL,
  `edit_time` DATETIME NOT NULL,
  `id_record_edited` INT UNSIGNED NOT NULL,
  `prev_clock_in` DATETIME NOT NULL,
  `prev_clock_out` DATETIME NOT NULL,
  `edit_note` VARCHAR(255) NULL,
  PRIMARY KEY (`edit_time`, `id_editor`),
  UNIQUE INDEX `edit_time_UNIQUE` (`edit_time` ASC),
  INDEX `id_record_edited_idx` (`id_record_edited` ASC),
  CONSTRAINT `id_editor`
    FOREIGN KEY (`id_editor`)
    REFERENCES `personnel` (`idpersonnel`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `id_record_edited`
    FOREIGN KEY (`id_record_edited`)
    REFERENCES `presence_status` (`idpresense`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

-- -----------------------------------------------------
-- Table `admin_settings`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `admin_settings` ;

CREATE TABLE IF NOT EXISTS `admin_settings` (
  `idadmin_settings` INT UNSIGNED NOT NULL,
  `idpersonnel` INT UNSIGNED NOT NULL,
  `notifications_on` TINYINT NOT NULL DEFAULT 1,
  `notification_type` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`idadmin_settings`),
  UNIQUE INDEX `idadmin_settings_UNIQUE` (`idadmin_settings` ASC),
  UNIQUE INDEX `id_personnel_UNIQUE` (`idpersonnel` ASC),
  CONSTRAINT `id_personnel`
    FOREIGN KEY (`idpersonnel`)
    REFERENCES `personnel` (`idpersonnel`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET utf8;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

LOCK TABLES `permissions` WRITE;
INSERT INTO `permissions` (level) VALUES ('gatekeeper'), ('admin'), ('base');
UNLOCK TABLES;

LOCK TABLES `positions` WRITE;
INSERT INTO `positions` (position_title, permissions) VALUES ('IT', '1'), ('Supervisor','2'), ('Common Staff', '3'), ('Peripheral Staff', '3');
UNLOCK TABLES;

LOCK TABLES `personnel` WRITE;
INSERT INTO `personnel` (password, position, first_name, last_name, start_date, pto_accumulation_rate) VALUES ('0000', '1', 'no', 'no', '1970-01-01', '0');
UNLOCK TABLES;