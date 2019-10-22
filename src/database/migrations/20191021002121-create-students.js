module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('students', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      email: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      weight: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      height: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('students');
  }
};