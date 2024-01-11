let passwords = [];

export function generateOneTimePassword() {
  // Array of 10 random words
  const words = [
    "apple",
    "banana",
    "cherry",
    "dog",
    "elephant",
    "fox",
    "grape",
    "hedgehog",
    "icecream",
    "jupiter",
  ];

  // Choose three random words from the array
  const selectedWords = Array.from(
    { length: 2 },
    () => words[Math.floor(Math.random() * words.length)]
  );

  // Generate a random number between 0 and 100
  const randomNumber = Math.floor(Math.random() * 101);

  // Create the one-time password format
  const oneTimePassword = `${selectedWords.join("-")}-${randomNumber}`;

  passwords.push(oneTimePassword);

  return oneTimePassword;
}

export function useOneTimePassword(otp) {
  if (passwords.includes(otp)) {
    passwords = passwords.filter((password) => password !== otp);
    return true;
  }
  return false;
}
