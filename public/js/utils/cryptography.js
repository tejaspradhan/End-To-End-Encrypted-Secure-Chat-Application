const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotalySecretKey");

test = "hi tejas";
function encrypt(msg) {
  const encryptedString = cryptr.encrypt(msg);
  console.log(encryptedString);
  return encryptedString;
}

function decrypt(encryptedString) {
  console.log(encryptedString);
  const decryptedString = cryptr.decrypt(encryptedString);
  console.log(decryptedString);
  return decryptedString;
}

module.exports = { encrypt, decrypt };
