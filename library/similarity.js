'use strict';

class Similarity {

  calculateSimilarityScoreOne(stringOne, stringTwo) {
    const lengthOne = stringOne.length;
    const lengthTwo = stringTwo.length;
    const maxLength = Math.max(lengthOne, lengthTwo);
    let commonChars = 0;
    for (let i = 0; i < maxLength; i++) {
      if (stringOne[i] && stringTwo[i] && stringOne[i] === stringTwo[i]) {
        commonChars++;
      }
    }
    const result = (commonChars / maxLength) * 100;
    return parseFloat(result);
  }

  calculateSimilarityScoreTwo(inputOne, inputTwo) {
    const stringOne = inputOne.length;
    const stringTwo = inputTwo.length;
    const chunk = [];
    for (let i = 0; i <= stringOne; i++) {
      chunk[i] = [];
      chunk[i][0] = i;
    }
    for (let index = 0; index <= stringTwo; index++) {
      chunk[0][index] = index;
    }
    for (let i = 1; i <= stringOne; i++) {
      for (let index = 1; index <= stringTwo; index++) {
        if (inputOne[i - 1] === inputTwo[index - 1]) {
          chunk[i][index] = chunk[i - 1][index - 1];
        } else {
          chunk[i][index] = Math.min(
            chunk[i - 1][index] + 1,
            chunk[i][index - 1] + 1,
            chunk[i - 1][index - 1] + 1
          );
        }
      }
    }
    const checkScore = 1 - chunk[stringOne][stringTwo] / Math.max(stringOne, stringTwo);
    const parse = parseFloat(checkScore.toFixed(2));
    const serializeScore = parse.toString().replace('.', '').split('').reverse().join('');
    return parseFloat(serializeScore);
  }

  matched(array, keyword, similarity) {
    const matches = [];
    for (const item of array) {
      const name = item.toLowerCase();
      const checkScoreOne = this.calculateSimilarityScoreOne(name, keyword.toLowerCase());
      const checkScoreTwo = this.calculateSimilarityScoreTwo(name, keyword.toLowerCase());

      if (checkScoreOne >= similarity || name.includes(keyword.toLowerCase())) {
        const score = checkScoreOne.toString() === '100' ? checkScoreOne : checkScoreOne.toFixed(2);
        matches.push({ index: name, score });
      }
      if (checkScoreTwo >= similarity || name.includes(keyword.toLowerCase())) {
        matches.concat({ index: name, score: checkScoreTwo });
      }
    }
    return matches;
  }

  exec(array, string, score) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      const currentString = array[i];
      let matchCount = 0;
      for (let index = 0; index < currentString.length; index++) {
        if (string.includes(currentString[index])) {
          matchCount++;
        }
      }
      const similarityScore = (matchCount / currentString.length) * 100;
      if (similarityScore >= score && similarityScore != 100) {
        result.push({ index: currentString, score: similarityScore });
      }
    }
    return result;
  }
}
export default new Similarity();