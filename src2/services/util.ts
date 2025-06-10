export function getRandomLetters(number: number) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < number; i++) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}
