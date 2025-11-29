const ERROR_TYPES = {
  VALUE_EXISTS: 'value_exists', 
  INVALID_FORMAT: 'invalid_format'
};

const ERROR_MESSAGES = {
  [ERROR_TYPES.VALUE_EXISTS]: "Данная запись уже существует в базе данных",
  [ERROR_TYPES.INVALID_FORMAT]: "Некорретный ввод"
};

module.exports = {
  ERROR_TYPES,
  ERROR_MESSAGES
};