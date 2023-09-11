function generateUniqueUserID() {
  // Logic to generate a unique ID (e.g., timestamp + random characters)
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomChars}`;
}

module.exports = generateUniqueUserID;
