// Database layer: Sequelize. PostgreSQL in production (DATABASE_URL), SQLite file for local development.
import { Sequelize, DataTypes } from "sequelize";

const url = process.env.DATABASE_URL;
export const sequelize = url
  ? new Sequelize(url, { dialect: "postgres", logging: false,
      dialectOptions: process.env.DB_SSL === "false" ? {} : { ssl: { require: true, rejectUnauthorized: false } } })
  : new Sequelize({ dialect: "sqlite", storage: "./server/donors.sqlite", logging: false });

export const Donor = sequelize.define("Donor", {
  name:       { type: DataTypes.STRING, allowNull: false, validate: { len: [3, 60] } },
  age:        { type: DataTypes.INTEGER, allowNull: false, validate: { min: 18, max: 65 } },
  bloodGroup: { type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"), allowNull: false },
  city:       { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  phone:      { type: DataTypes.STRING, allowNull: false, validate: { is: /^[6-9]\d{9}$/ } },
});
